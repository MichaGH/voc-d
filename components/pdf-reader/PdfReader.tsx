"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import PdfPage, { COVER_SIZES } from "@/components/pdf-reader/PdfPage";
import ReaderControls from "@/components/pdf-reader/ReaderControls";
import { PdfOpenError, PdfSession, type OpenErrorKind, type RenderRequest } from "@/components/pdf-reader/pdf-session";
import {
  adjacentViews,
  chooseLayout,
  clampPage,
  nextPage,
  previousPage,
  viewForPage,
  viewLabel,
} from "@/lib/pdf-reader/navigation";
import { MIN_STAGE_HEIGHT, canZoom, fitScale, renderScale, stepZoom, type PageSize } from "@/lib/pdf-reader/zoom";
import type { ContentImage, PdfAsset } from "@/types/content";
import "./reader.css";

interface PdfReaderProps {
  pdf: PdfAsset;
  cover: ContentImage;
  /** Magazine + issue, used in accessible names. */
  title: string;
  backHref: string;
}

type Status =
  | { kind: "loading" }
  | { kind: "ready"; session: PdfSession }
  | { kind: "error"; error: OpenErrorKind };

/** Fixed site header height. */
const HEADER_HEIGHT = 76;
/** Vertical padding inside the stage, per side. */
const STAGE_PADDING = 16;
/** Room kept for the edge arrows beside a spread. */
const EDGE_GUTTER = 64;
/** Delay before re-rendering at a new scale (zoom clicks, window resizing). */
const SETTLE_MS = 140;

const noSubscribe = () => () => {};
const zero = () => 0;

/**
 * The on-site magazine reader: whole spreads on wide screens (1, 2–3, 4–5 …),
 * single pages on narrow ones, bottom controls, keyboard and swipe turns.
 * Owns view state only; rendering, caching and cancellation live in PdfSession.
 * Page turns, zoom and resizing never query content.
 */
export default function PdfReader({ pdf, cover, title, backHref }: PdfReaderProps) {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [focused, setFocused] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [stage, setStage] = useState<{ width: number; height: number } | null>(null);
  const [renderCss, setRenderCss] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

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

  const retry = () => {
    setStatus({ kind: "loading" });
    setAttempt((value) => value + 1);
  };

  /* Stage measurement: width from the container, height from the viewport below the stage's top. */
  useLayoutEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const measure = () => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      const controls = controlsRef.current?.offsetHeight ?? 72;
      const width = element.clientWidth;
      const height = document.documentElement.clientHeight - top - controls - 2 * STAGE_PADDING;
      setStage((previous) =>
        previous && Math.abs(previous.width - width) < 1 && Math.abs(previous.height - height) < 1 ? previous : { width, height },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [status.kind]);

  const layout = stage ? chooseLayout(stage.width) : "single";
  const reference: PageSize = session?.pageSize(1) ?? { width: cover.width, height: cover.height };
  const fit = stage
    ? fitScale({
        layout,
        stageWidth: stage.width - (layout === "spread" ? 2 * EDGE_GUTTER : 0),
        stageHeight: stage.height,
        page: reference,
      })
    : 0;
  const cssScale = fit * zoom;
  const view = viewForPage(focused, pageCount, layout);
  const viewKey = view.join("-");
  const label = viewLabel(view, pageCount);

  /* Re-render sharply only once zoom/size has settled; CSS stretches the old bitmap meanwhile. */
  useEffect(() => {
    if (!cssScale) return;
    const timer = window.setTimeout(() => setRenderCss(cssScale), renderCss === null ? 0 : SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [cssScale, renderCss]);

  /*
   * Render plan: visible pages first, then the next view and the previous one
   * (skipped with Data Saver). Runs in a layout effect so it follows the
   * pages' own canvas swaps within the same commit.
   */
  useLayoutEffect(() => {
    if (!session || renderCss === null) return;
    const dpr = window.devicePixelRatio || 1;
    const scaleFor = (page: number) =>
      renderScale({
        cssScale: renderCss,
        devicePixelRatio: dpr,
        page: session.pageSize(page) ?? reference,
        maxCanvasPixels: session.budget.maxCanvasPixels,
      });
    const visible = viewKey.split("-").map(Number);
    const requests: RenderRequest[] = visible.map((page) => ({ page, scale: scaleFor(page), visible: true }));
    if (!prefersReducedData()) {
      const { next, previous } = adjacentViews(visible[0], session.pageCount, layout);
      for (const page of [...(next ?? []), ...(previous ?? [])]) requests.push({ page, scale: scaleFor(page), visible: false });
    }
    session.schedule(requests);
    // `reference` derives from session; listing it would reschedule on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, renderCss, viewKey, layout]);

  /* Keep the horizontal centre when zooming. */
  const previousScale = useRef(cssScale);
  useLayoutEffect(() => {
    const element = stageRef.current;
    const previous = previousScale.current;
    previousScale.current = cssScale;
    if (!element || !previous || previous === cssScale) return;
    const centre = element.scrollLeft + element.clientWidth / 2;
    element.scrollLeft = centre * (cssScale / previous) - element.clientWidth / 2;
  }, [cssScale]);

  /* After a page turn: start at the top-left of the new view, keeping the reader in sight. */
  const previousView = useRef(viewKey);
  useLayoutEffect(() => {
    if (previousView.current === viewKey) return;
    previousView.current = viewKey;
    const element = stageRef.current;
    if (!element) return;
    element.scrollLeft = 0;
    const top = element.getBoundingClientRect().top;
    if (top < HEADER_HEIGHT) window.scrollTo({ top: window.scrollY + top - HEADER_HEIGHT - 8 });
  }, [viewKey]);

  const goTo = useCallback((page: number) => setFocused(clampPage(page, pageCount)), [pageCount]);
  const next = nextPage(focused, pageCount, layout);
  const previous = previousPage(focused, pageCount, layout);
  const goNext = () => next !== null && setFocused(next);
  const goPrevious = () => previous !== null && setFocused(previous);

  /* Arrow keys while the reader has focus; never inside the page field. At a zoomed edge they scroll first. */
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!ready || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (isEditable(event.target)) return;
    const element = stageRef.current;
    const forward = event.key === "ArrowRight" || event.key === "PageDown";
    const backward = event.key === "ArrowLeft" || event.key === "PageUp";
    if (!forward && !backward) {
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        goTo(event.key === "Home" ? 1 : pageCount);
      }
      return;
    }
    if (element && event.key.startsWith("Arrow")) {
      const max = element.scrollWidth - element.clientWidth;
      const canScroll = forward ? element.scrollLeft < max - 1 : element.scrollLeft > 1;
      if (max > 1 && canScroll) return; // let the browser scroll the zoomed spread
    }
    event.preventDefault();
    if (forward) goNext();
    else goPrevious();
  };

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
    if (dx < 0) goNext();
    else goPrevious();
  };

  if (status.kind === "error") {
    return <ReaderError error={status.error} onRetry={retry} backHref={backHref} />;
  }

  const minHeight = stage && layout === "spread" ? Math.max(stage.height, MIN_STAGE_HEIGHT) + 2 * STAGE_PADDING : undefined;
  const showEdgeArrows = ready && layout === "spread" && zoom === 1;

  return (
    <section aria-label={`Čítačka: ${title}`} onKeyDown={onKeyDown} className="relative">
      <div className="relative">
        <div
          ref={stageRef}
          tabIndex={0}
          aria-label="Strany časopisu – listujte šípkami doľava a doprava"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipe.current = null)}
          className={`overflow-x-auto overflow-y-hidden rounded-[20px] outline-offset-[-3px] ${zoom === 1 ? "touch-pan-y" : ""}`}
        >
          <div
            className="flex w-max min-w-full items-center justify-center"
            style={{ minHeight, paddingBlock: STAGE_PADDING, paddingInline: layout === "spread" ? EDGE_GUTTER : 0 }}
          >
            {stage ? (
              view.map((page, index) => (
                <PdfPage
                  key={page}
                  session={session}
                  page={page}
                  size={session?.pageSize(page) ?? reference}
                  cssScale={cssScale}
                  side={view.length === 2 ? (index === 0 ? "left" : "right") : "single"}
                  cover={page === 1 ? cover : undefined}
                  version={version}
                  onNavigate={goTo}
                />
              ))
            ) : (
              <CoverSkeleton cover={cover} />
            )}
          </div>
        </div>

        {!ready && (
          <p className="reader-delayed pointer-events-none absolute inset-x-0 bottom-8 mx-auto w-fit rounded-full bg-[var(--color-navy)] px-5 py-2.5 text-[15px] font-semibold text-white shadow-lg">
            Načítavam časopis…
          </p>
        )}

        {showEdgeArrows && (
          <>
            <EdgeArrow direction="previous" onClick={goPrevious} hidden={previous === null} />
            <EdgeArrow direction="next" onClick={goNext} hidden={next === null} />
          </>
        )}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {ready ? label : ""}
      </p>

      <ReaderControls
        ref={controlsRef}
        ready={ready}
        label={label}
        pageCount={pageCount}
        canPrevious={previous !== null}
        canNext={next !== null}
        onPrevious={goPrevious}
        onNext={goNext}
        onGoTo={goTo}
        zoom={zoom}
        canZoomIn={canZoom(zoom, 1)}
        canZoomOut={canZoom(zoom, -1)}
        onZoomIn={() => setZoom((value) => stepZoom(value, 1))}
        onZoomOut={() => setZoom((value) => stepZoom(value, -1))}
        onFit={() => setZoom(1)}
      />
    </section>
  );
}

/** Server-rendered placeholder before the stage is measured: the edition cover at a sensible size. */
function CoverSkeleton({ cover }: { cover: ContentImage }) {
  return (
    <div className="relative aspect-[595/842] w-full max-w-[900px] bg-white shadow-[0_18px_40px_-24px_rgba(4,23,58,.55)] min-[1056px]:h-[max(360px,calc(100svh-400px))] min-[1056px]:w-auto">
      <Image src={cover.src} alt="" fill sizes={COVER_SIZES} className="object-fill" loading="eager" />
    </div>
  );
}

function EdgeArrow({ direction, onClick, hidden }: { direction: "previous" | "next"; onClick: () => void; hidden: boolean }) {
  if (hidden) return null;
  // Pointer convenience duplicating the labelled bottom controls, so it stays out of the tab order.
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={onClick}
      className={`absolute top-1/2 hidden h-13 w-13 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-line)] bg-white text-[22px] text-[var(--color-navy)] shadow-[0_14px_30px_-18px_rgba(4,23,58,.6)] transition-colors hover:bg-[var(--color-navy)] hover:text-white [@media(hover:hover)]:flex ${
        direction === "previous" ? "left-1" : "right-1"
      }`}
    >
      {direction === "previous" ? "←" : "→"}
    </button>
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

function ReaderError({ error, onRetry, backHref }: { error: OpenErrorKind; onRetry: () => void; backHref: string }) {
  const copy = ERROR_COPY[error];
  return (
    <section
      role="alert"
      className="grid min-h-[min(60svh,560px)] place-items-center rounded-[28px] bg-white px-6 py-16 text-center"
    >
      <div className="max-w-[46ch]">
        <h2 className="text-[clamp(24px,2.2vw,32px)] leading-[1.1] font-bold tracking-[-.025em] text-balance">{copy.title}</h2>
        <p className="mt-4 text-base leading-[1.6] text-[var(--color-copy)] text-pretty">{copy.text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {copy.retry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-[52px] items-center rounded-full bg-[var(--color-navy)] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-blue)]"
            >
              Skúsiť znova
            </button>
          )}
          <Link
            href={backHref}
            className="inline-flex h-[52px] items-center rounded-full border border-[var(--color-line-button)] bg-white px-6 text-[15px] font-semibold text-[var(--color-navy)] no-underline hover:border-[var(--color-navy)]"
          >
            ← Späť na vydanie
          </Link>
        </div>
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
