"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
} from "react";
import PageTurn, { type PageTurnSpec } from "@/components/pdf-reader/PageTurn";
import PdfPage, { COVER_SIZES } from "@/components/pdf-reader/PdfPage";
import ReaderBar, { type ReaderIdentity } from "@/components/pdf-reader/ReaderBar";
import { PdfOpenError, PdfSession, type OpenErrorKind, type RenderRequest } from "@/components/pdf-reader/pdf-session";
import {
  JUMP_STEP,
  adjacentViews,
  chooseLayout,
  clampPage,
  jumpPage,
  nextPage,
  previousPage,
  viewForPage,
  viewLabel,
} from "@/lib/pdf-reader/navigation";
import { canZoom, fitScale, renderScale, stepZoom, type PageSize } from "@/lib/pdf-reader/zoom";
import type { ContentImage, EditionInsert, PdfAsset } from "@/types/content";
import "./reader.css";

interface PdfReaderProps {
  /** Absent for print-only editions: the cover and an order action are shown instead. */
  pdf?: PdfAsset;
  cover: ContentImage;
  identity: ReaderIdentity;
  /** Magazine + issue, used in accessible names. */
  title: string;
  inserts: EditionInsert[];
  orderHref: string;
  subscribeHref: string;
}

/**
 * Full-screen magazine reader: the stage fills everything between the banner
 * and the bottom bar. Owns which document is open — the issue or one of its
 * digital inserts — and remembers the issue page while an insert is open.
 */
export default function PdfReader({ pdf, cover, identity, title, inserts, orderHref, subscribeHref }: PdfReaderProps) {
  const [insertKey, setInsertKey] = useState<string | null>(null);
  // The issue page to return to after viewing an insert.
  const [issuePage, setIssuePage] = useState(1);
  const insert = inserts.find((item) => item.key === insertKey && item.digital);
  const barProps = {
    identity,
    inserts,
    onOpenInsert: setInsertKey,
    viewingInsert: insert?.title,
    onCloseInsert: () => setInsertKey(null),
  };

  if (insert?.digital) {
    return <ReaderDocument key={insert.digital.url} pdf={insert.digital} title={insert.title} initialPage={1} barProps={barProps} />;
  }
  if (!pdf) {
    return <CoverOnly cover={cover} title={title} orderHref={orderHref} subscribeHref={subscribeHref} barProps={barProps} />;
  }
  return (
    <ReaderDocument
      key={pdf.url}
      pdf={pdf}
      cover={cover}
      title={title}
      initialPage={issuePage}
      onPageChange={setIssuePage}
      barProps={barProps}
    />
  );
}

type BarProps = Omit<Parameters<typeof ReaderBar>[0], "navigation">;

type Status =
  | { kind: "loading" }
  | { kind: "ready"; session: PdfSession }
  | { kind: "error"; error: OpenErrorKind };

/** Padding around the pages inside the stage. */
const STAGE_PADDING = 16;
/** Room kept on each side of a spread for the side arrows. */
const ARROW_GUTTER = 88;
/** Side arrows never sit further than this from the pages. */
const ARROW_MAX_DISTANCE = 120;
/** Delay before re-rendering at a new scale (zoom clicks, window resizing). */
const SETTLE_MS = 140;

const noSubscribe = () => () => {};
const zero = () => 0;

interface ReaderDocumentProps {
  pdf: PdfAsset;
  cover?: ContentImage;
  title: string;
  initialPage: number;
  onPageChange?: (page: number) => void;
  barProps: BarProps;
}

/**
 * One open PDF: whole spreads on wide screens (1, 2–3, 4–5 …), single pages on
 * narrow ones; side arrows, keyboard, swipe and the bar's controls; a page
 * turn drawn from prepared bitmaps. Rendering, caching and cancellation live
 * in PdfSession; page turns and zoom never query content.
 */
function ReaderDocument({ pdf, cover, title, initialPage, onPageChange, barProps }: ReaderDocumentProps) {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [focused, setFocused] = useState(initialPage);
  const [zoom, setZoom] = useState(1);
  const [stage, setStage] = useState<{ width: number; height: number } | null>(null);
  const [renderCss, setRenderCss] = useState<number | null>(null);
  const [turn, setTurn] = useState<PageTurnSpec | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const pendingSlide = useRef<1 | -1 | null>(null);
  const turnId = useRef(0);

  const session = status.kind === "ready" ? status.session : null;
  const version = useSyncExternalStore(session?.subscribe ?? noSubscribe, session?.getVersion ?? zero, zero);
  const ready = session !== null;
  const pageCount = session?.pageCount ?? Math.max(1, pdf.pageCount ?? 1);

  /* Document lifecycle: one session per URL/attempt; abandoned sessions are destroyed. */
  useEffect(() => {
    const controller = new AbortController();
    let opened: PdfSession | null = null;
    PdfSession.open(pdf.url, controller.signal).then(
      (next) => {
        opened = next;
        setFocused((page) => clampPage(page, next.pageCount));
        setStatus({ kind: "ready", session: next });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setStatus({ kind: "error", error: error instanceof PdfOpenError ? error.kind : "network" });
      },
    );
    return () => {
      controller.abort();
      opened?.destroy();
    };
  }, [pdf.url, attempt]);

  useEffect(() => {
    onPageChange?.(focused);
  }, [focused, onPageChange]);

  /* The stage is a fixed box between banner and bar: measure it directly. */
  useLayoutEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const measure = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      setStage((previous) =>
        previous && Math.abs(previous.width - width) < 1 && Math.abs(previous.height - height) < 1 ? previous : { width, height },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [status.kind]);

  const layout = stage ? chooseLayout(stage.width) : "single";
  const reference: PageSize = session?.pageSize(1) ?? (cover ? { width: cover.width, height: cover.height } : { width: 595, height: 842 });
  const gutter = layout === "spread" ? ARROW_GUTTER : 0;
  const fit = stage
    ? fitScale({
        layout,
        stageWidth: stage.width - 2 * gutter - 2 * STAGE_PADDING,
        stageHeight: stage.height - 2 * STAGE_PADDING,
        page: reference,
      })
    : 0;
  const cssScale = fit * zoom;
  const view = viewForPage(focused, pageCount, layout);
  const viewKey = view.join("-");
  const sizeOf = (page: number) => session?.pageSize(page) ?? reference;
  const bookWidth = view.reduce((sum, page) => sum + Math.round(sizeOf(page).width * cssScale), 0);

  /* Re-render sharply only once zoom/size has settled; CSS stretches the old bitmap meanwhile. */
  useEffect(() => {
    if (!cssScale) return;
    const timer = window.setTimeout(() => setRenderCss(cssScale), renderCss === null ? 0 : SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [cssScale, renderCss]);

  /*
   * Render plan: visible pages first, then the next view and the previous one
   * (skipped with Data Saver). A layout effect, so it follows the pages' own
   * canvas swaps within the same commit.
   */
  useLayoutEffect(() => {
    if (!session || renderCss === null) return;
    const dpr = window.devicePixelRatio || 1;
    const scaleFor = (page: number) =>
      renderScale({
        cssScale: renderCss,
        devicePixelRatio: dpr,
        page: session.pageSize(page) ?? session.pageSize(1)!,
        maxCanvasPixels: session.budget.maxCanvasPixels,
      });
    const visible = viewKey.split("-").map(Number);
    const requests: RenderRequest[] = visible.map((page) => ({ page, scale: scaleFor(page), visible: true }));
    if (!prefersReducedData()) {
      const { next, previous } = adjacentViews(visible[0], session.pageCount, layout);
      for (const page of [...(next ?? []), ...(previous ?? [])]) requests.push({ page, scale: scaleFor(page), visible: false });
    }
    session.schedule(requests);
  }, [session, renderCss, viewKey, layout]);

  /* Keep the centre when zooming. */
  const previousScale = useRef(cssScale);
  useLayoutEffect(() => {
    const element = stageRef.current;
    const previous = previousScale.current;
    previousScale.current = cssScale;
    if (!element || !previous || previous === cssScale) return;
    const ratio = cssScale / previous;
    element.scrollLeft = (element.scrollLeft + element.clientWidth / 2) * ratio - element.clientWidth / 2;
    element.scrollTop = (element.scrollTop + element.clientHeight / 2) * ratio - element.clientHeight / 2;
  }, [cssScale]);

  /* After a turn: start at the top-left of the new view; play the slide for non-spread turns. */
  const previousView = useRef(viewKey);
  useLayoutEffect(() => {
    if (previousView.current === viewKey) return;
    previousView.current = viewKey;
    stageRef.current?.scrollTo({ left: 0, top: 0 });
    const direction = pendingSlide.current;
    pendingSlide.current = null;
    if (direction && bookRef.current) {
      bookRef.current.animate(
        [
          { transform: `translateX(${direction * 40}px)`, opacity: 0.25 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 280, easing: "cubic-bezier(.2,.7,.2,1)" },
      );
    }
  }, [viewKey]);

  const next = nextPage(focused, pageCount, layout);
  const previous = previousPage(focused, pageCount, layout);

  /** Next/previous with the page-turn animation when the target view is prepared. */
  const turnTo = (direction: 1 | -1) => {
    const target = direction === 1 ? next : previous;
    if (target === null) return;
    const to = viewForPage(target, pageCount, layout);
    let spec: PageTurnSpec | null = null;
    if (session && zoom === 1 && !prefersReducedMotion()) {
      const fromBitmaps = view.map((page) => session.bitmap(page)?.canvas);
      const toBitmaps = to.map((page) => session.bitmap(page)?.canvas);
      if (layout === "spread" && view.length === 2 && to.length === 2 && [...fromBitmaps, ...toBitmaps].every(Boolean)) {
        const size = sizeOf(view[0]);
        spec = {
          id: ++turnId.current,
          direction,
          pageWidth: Math.round(size.width * cssScale),
          pageHeight: Math.round(size.height * cssScale),
          from: fromBitmaps as [HTMLCanvasElement, HTMLCanvasElement],
          to: toBitmaps as [HTMLCanvasElement, HTMLCanvasElement],
        };
      } else if (toBitmaps.every(Boolean)) {
        // Cover, last page and single-page layouts: a short slide instead of a leaf.
        pendingSlide.current = direction;
      }
    }
    setTurn(spec);
    setFocused(target);
  };

  const goTo = useCallback(
    (page: number) => {
      setTurn(null);
      setFocused(clampPage(page, pageCount));
    },
    [pageCount],
  );
  const finishTurn = useCallback((id: number) => setTurn((current) => (current?.id === id ? null : current)), []);

  /* Keyboard: the reader is the whole page. Never while typing; at a zoomed edge arrows scroll first. */
  const turnRef = useRef(turnTo);
  const goToRef = useRef(goTo);
  useLayoutEffect(() => {
    turnRef.current = turnTo;
    goToRef.current = goTo;
  });
  useEffect(() => {
    if (!ready) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || isEditable(event.target)) return;
      const element = stageRef.current;
      const forward = event.key === "ArrowRight" || event.key === "PageDown";
      const backward = event.key === "ArrowLeft" || event.key === "PageUp";
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        goToRef.current(event.key === "Home" ? 1 : Number.MAX_SAFE_INTEGER);
        return;
      }
      if (!forward && !backward) return;
      if (element && event.key.startsWith("Arrow")) {
        const max = element.scrollWidth - element.clientWidth;
        const canScroll = forward ? element.scrollLeft < max - 1 : element.scrollLeft > 1;
        if (max > 1 && canScroll) return;
      }
      event.preventDefault();
      turnRef.current(forward ? 1 : -1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ready]);

  /* Horizontal swipe on touch screens, only when nothing is zoomed or selected. */
  const swipe = useRef<{ x: number; y: number; time: number } | null>(null);
  const onPointerDown = (event: PointerEvent) => {
    swipe.current = event.pointerType === "touch" && event.isPrimary ? { x: event.clientX, y: event.clientY, time: event.timeStamp } : null;
  };
  const onPointerUp = (event: PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    const element = stageRef.current;
    if (!start || !element || !ready) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const pinched = (window.visualViewport?.scale ?? 1) > 1.01;
    const zoomed = element.scrollWidth > element.clientWidth + 1;
    const selecting = Boolean(window.getSelection()?.toString());
    if (pinched || zoomed || selecting || Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.5 || event.timeStamp - start.time > 700) return;
    turnTo(dx < 0 ? 1 : -1);
  };

  const navigation = {
    ready,
    current: view.length === 2 ? `${view[0]}–${view[1]}` : String(view[0]),
    pageCount,
    canPrevious: previous !== null,
    canNext: next !== null,
    onFirstJump: () => goTo(jumpPage(focused, pageCount, layout, -JUMP_STEP)),
    onPrevious: () => turnTo(-1),
    onNext: () => turnTo(1),
    onLastJump: () => goTo(jumpPage(focused, pageCount, layout, JUMP_STEP)),
    onGoTo: goTo,
    zoom,
    canZoomIn: canZoom(zoom, 1),
    canZoomOut: canZoom(zoom, -1),
    onZoomIn: () => {
      setTurn(null);
      setZoom((value) => stepZoom(value, 1));
    },
    onZoomOut: () => {
      setTurn(null);
      setZoom((value) => stepZoom(value, -1));
    },
  };

  if (status.kind === "error") {
    return (
      <>
        <ReaderError error={status.error} onRetry={() => {
          setStatus({ kind: "loading" });
          setAttempt((value) => value + 1);
        }} />
        <ReaderBar {...barProps} />
      </>
    );
  }

  // Side arrows: just outside the pages, drifting towards the screen edges on wide screens.
  const arrowSize = layout === "spread" ? 56 : 44;
  const contentLeft = stage ? Math.max(STAGE_PADDING, (stage.width - bookWidth) / 2) : 0;
  const arrowOffset = Math.max(10, contentLeft - arrowSize - Math.min(ARROW_MAX_DISTANCE, Math.max(0, contentLeft - arrowSize - 10)));

  return (
    <>
      <section aria-label={`Čítačka: ${title}`} className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={stageRef}
          tabIndex={0}
          aria-label="Strany časopisu – listujte šípkami doľava a doprava"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipe.current = null)}
          className={`relative min-h-0 flex-1 overflow-auto outline-offset-[-3px] [overscroll-behavior:contain] ${zoom === 1 ? "touch-pan-y" : ""}`}
        >
          <div className="flex min-h-full w-max min-w-full items-center justify-center" style={{ padding: STAGE_PADDING }}>
            {stage ? (
              <div ref={bookRef} className="relative flex shadow-[0_24px_60px_-28px_rgba(4,23,58,.45)]">
                {view.map((page, index) => (
                  <PdfPage
                    key={page}
                    session={session}
                    page={page}
                    size={sizeOf(page)}
                    cssScale={cssScale}
                    side={view.length === 2 ? (index === 0 ? "left" : "right") : "single"}
                    cover={page === 1 ? cover : undefined}
                    version={version}
                    onNavigate={goTo}
                  />
                ))}
                {turn && <PageTurn key={turn.id} spec={turn} onDone={finishTurn} />}
              </div>
            ) : (
              cover && <CoverSkeleton cover={cover} />
            )}
          </div>
        </div>

        {!ready && (
          <p className="reader-delayed pointer-events-none absolute inset-x-0 bottom-6 mx-auto w-fit rounded-full bg-[var(--color-navy)] px-5 py-2.5 text-[15px] font-semibold text-white shadow-lg">
            Načítavam časopis…
          </p>
        )}

        {ready && stage && (
          <>
            <SideArrow direction="previous" hidden={previous === null} offset={arrowOffset} size={arrowSize} onClick={() => turnTo(-1)} />
            <SideArrow direction="next" hidden={next === null} offset={arrowOffset} size={arrowSize} onClick={() => turnTo(1)} />
          </>
        )}

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {ready ? viewLabel(view, pageCount) : ""}
        </p>
      </section>
      <ReaderBar {...barProps} navigation={navigation} />
    </>
  );
}

/** Light translucent squares at the sides; pointer/touch convenience duplicating the bar's labelled controls. */
function SideArrow({ direction, hidden, offset, size, onClick }: { direction: "previous" | "next"; hidden: boolean; offset: number; size: number; onClick: () => void }) {
  if (hidden) return null;
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={onClick}
      className="absolute top-1/2 z-20 grid -translate-y-1/2 place-items-center rounded-[14px] bg-[rgba(15,30,60,.16)] text-white/95 backdrop-blur-[2px] transition-colors hover:bg-[rgba(15,30,60,.32)] active:bg-[rgba(15,30,60,.42)]"
      style={{ width: size, height: size * 1.25, [direction === "previous" ? "left" : "right"]: offset }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="drop-shadow-[0_1px_2px_rgba(4,23,58,.35)]">
        <path d={direction === "previous" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
      </svg>
    </button>
  );
}

/** Server-rendered placeholder before the stage is measured: the cover, contained. */
function CoverSkeleton({ cover }: { cover: ContentImage }) {
  return (
    <div className="relative aspect-[595/842] h-[calc(100%-1px)] max-h-full max-w-full bg-white shadow-[0_24px_60px_-28px_rgba(4,23,58,.45)]">
      <Image src={cover.src} alt="" fill sizes={COVER_SIZES} className="object-fill" loading="eager" />
    </div>
  );
}

/** Print-only edition: the cover, an honest message and the two actions. No PDF code runs. */
function CoverOnly({ cover, title, orderHref, subscribeHref, barProps }: { cover: ContentImage; title: string; orderHref: string; subscribeHref: string; barProps: BarProps }) {
  return (
    <>
      <section aria-label={title} className="flex min-h-0 flex-1 items-center justify-center gap-[clamp(24px,5vw,72px)] overflow-auto p-6 max-md:flex-col">
        <Image
          src={cover.src}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          sizes="(max-width: 768px) 50vw, 420px"
          className="h-auto max-h-[min(62vh,560px)] w-auto max-w-[min(70vw,420px)] rounded-[4px] shadow-[0_30px_60px_-28px_rgba(4,23,58,.6)]"
        />
        <div className="max-w-[40ch] max-md:text-center">
          <h2 className="text-[clamp(24px,2.4vw,34px)] leading-[1.1] font-bold tracking-[-.025em] text-balance">
            Elektronická verzia zatiaľ nie je dostupná.
          </h2>
          <p className="mt-4 text-base leading-[1.6] text-[var(--color-copy)] text-pretty">Toto číslo vám radi pošleme v tlačenej podobe.</p>
          <div className="mt-7 flex flex-wrap gap-2.5 max-md:justify-center">
            <a href={orderHref} className="inline-flex h-12 items-center rounded-[12px] bg-[var(--color-primary)] px-6 text-[15px] font-semibold text-white no-underline hover:bg-[var(--color-navy)] hover:text-white">
              Objednať výtlačok
            </a>
            <a href={subscribeHref} className="inline-flex h-12 items-center rounded-[12px] border border-[var(--color-line-button)] px-6 text-[15px] font-semibold text-[var(--color-navy)] no-underline hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
              Predplatiť
            </a>
          </div>
        </div>
      </section>
      <ReaderBar {...barProps} />
    </>
  );
}

const ERROR_COPY: Record<OpenErrorKind, { title: string; text: string; retry: boolean }> = {
  network: {
    title: "Časopis sa nepodarilo načítať.",
    text: "Skontrolujte pripojenie na internet a skúste to znova.",
    retry: true,
  },
  password: {
    title: "Tento časopis sa na webe nedá zobraziť.",
    text: "Súbor je chránený heslom. Ospravedlňujeme sa – ozveme sa, keď bude vydanie dostupné.",
    retry: false,
  },
  invalid: {
    title: "Tento časopis sa na webe nedá zobraziť.",
    text: "Súbor je poškodený alebo nemá podporovaný formát.",
    retry: false,
  },
};

function ReaderError({ error, onRetry }: { error: OpenErrorKind; onRetry: () => void }) {
  const copy = ERROR_COPY[error];
  return (
    <section role="alert" className="grid min-h-0 flex-1 place-items-center px-6 text-center">
      <div className="max-w-[46ch]">
        <h2 className="text-[clamp(24px,2.2vw,32px)] leading-[1.1] font-bold tracking-[-.025em] text-balance">{copy.title}</h2>
        <p className="mt-4 text-base leading-[1.6] text-[var(--color-copy)] text-pretty">{copy.text}</p>
        {copy.retry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-8 inline-flex h-12 items-center rounded-[12px] bg-[var(--color-primary)] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-navy)]"
          >
            Skúsiť znova
          </button>
        )}
      </div>
    </section>
  );
}

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

function prefersReducedData() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
