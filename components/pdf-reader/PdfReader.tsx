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
import GridView from "@/components/pdf-reader/GridView";
import PageTurn, { type PageTurnSpec } from "@/components/pdf-reader/PageTurn";
import PdfPage, { COVER_SIZES } from "@/components/pdf-reader/PdfPage";
import ReaderBar, { HIDDEN_BAR_LINE, type ReaderIdentity, type ReaderNavigation } from "@/components/pdf-reader/ReaderBar";
import ScrollView, { scrollBoxHeight } from "@/components/pdf-reader/ScrollView";
import { PdfOpenError, PdfSession, type OpenErrorKind, type RenderRequest } from "@/components/pdf-reader/pdf-session";
import { GRID_GAP, gridLayout, gridRow, gridRowPages, gridVisibleRows, type GridLayout } from "@/lib/pdf-reader/grid";
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
  type ReaderMode,
} from "@/lib/pdf-reader/navigation";
import { ARROW_SCROLL_STEP, SCROLL_ZOOM_LEVELS, pageAt, pageOffsets, scrollPageWidth, scrollSideMargin, visiblePages } from "@/lib/pdf-reader/scroll";
import { ZOOM_LEVELS, canZoom, fitScale, needsRerender, renderScale, stepZoom, type PageSize } from "@/lib/pdf-reader/zoom";
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
 * Full-screen magazine reader below the transparent top bar (back link,
 * banner, Predplatiť). Owns which document is open — the issue or one of its
 * digital inserts — the view mode and whether the bottom bar is hidden, and
 * remembers the issue page while an insert is open.
 */
export default function PdfReader({ pdf, cover, identity, title, inserts, orderHref, subscribeHref }: PdfReaderProps) {
  const [insertKey, setInsertKey] = useState<string | null>(null);
  // The issue page to return to after viewing an insert.
  const [issuePage, setIssuePage] = useState(1);
  // Until the reader picks a view, phones get continuous reading and larger screens the book.
  const [chosenMode, setMode] = useState<ReaderMode | null>(null);
  const phone = useSyncExternalStore(subscribePhone, isPhone, notPhone);
  const mode = chosenMode ?? (phone ? "scroll" : "book");
  const [barHidden, setBarHidden] = useState(false);
  const insert = inserts.find((item) => item.key === insertKey && item.digital);
  const barProps = {
    identity,
    inserts,
    onOpenInsert: setInsertKey,
    viewingInsert: insert?.title,
    onCloseInsert: () => setInsertKey(null),
  };
  const view = { mode, onModeChange: setMode, barHidden, onToggleBar: () => setBarHidden((value) => !value) };

  if (insert?.digital) {
    return <ReaderDocument key={insert.digital.url} pdf={insert.digital} title={insert.title} initialPage={1} barProps={barProps} {...view} />;
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
      {...view}
    />
  );
}

type BarProps = Omit<Parameters<typeof ReaderBar>[0], "navigation" | "modes" | "hidden" | "onToggleHidden">;

type Status =
  | { kind: "loading" }
  | { kind: "ready"; session: PdfSession }
  | { kind: "error"; error: OpenErrorKind };

/** Measured stage: the scroll box extends under the top bar and the bottom bar. */
interface StageBox {
  /** Scroll box client size (without scrollbars). */
  width: number;
  height: number;
  /** Height of the top bar, which the stage runs beneath. */
  top: number;
  /** Area from the top bar to the bottom of the screen. */
  below: number;
  /** Bottom bar height when shown (including the safe-area inset). */
  bar: number;
}

/** Padding around the pages inside the stage (spreads). */
const STAGE_PADDING = 16;
/** Below this width (phones) the reader opens in continuous reading. */
const PHONE_QUERY = "(max-width: 767px)";
/** Room kept on each side of a spread for the side arrows. */
const ARROW_GUTTER = 88;
/** Side arrows never sit further than this from the pages. */
const ARROW_MAX_DISTANCE = 120;
/** Delay before re-rendering at a new scale (zoom clicks, window resizing). */
const SETTLE_MS = 140;
/** Space between the top bar and the first page in continuous reading. */
const SCROLL_TOP_GAP = 16;
/** Bottom bar height before it is measured (h-16). */
const BAR_HEIGHT = 64;
/** A picked page keeps its ring at least this long, so the choice is seen… */
const PICK_MIN_MS = 220;
/** …and switches to reading after this long even if the page is still loading. */
const PICK_TIMEOUT_MS = 10_000;
/** Where the "current" page is read from, as a share of the visible height. */
const CURRENT_LINE = 0.3;

const noSubscribe = () => () => {};

function subscribePhone(onChange: () => void) {
  const query = window.matchMedia?.(PHONE_QUERY);
  query?.addEventListener("change", onChange);
  return () => query?.removeEventListener("change", onChange);
}
const isPhone = () => window.matchMedia?.(PHONE_QUERY).matches ?? false;
const notPhone = () => false;
const zero = () => 0;

interface ReaderDocumentProps {
  pdf: PdfAsset;
  cover?: ContentImage;
  title: string;
  initialPage: number;
  onPageChange?: (page: number) => void;
  barProps: BarProps;
  mode: ReaderMode;
  onModeChange: (mode: ReaderMode) => void;
  barHidden: boolean;
  onToggleBar: () => void;
}

/**
 * One open PDF in three views:
 * - book: whole spreads on wide screens (1, 2–3, 4–5 …), single pages on
 *   narrow ones, page-turn animation, side arrows, swipe; clicking a page
 *   rings it and opens it for reading once it is rendered;
 * - grid: the page overview, pages open for reading the same way;
 * - scroll: pages under each other at reading size, selectable text, links.
 * Rendering, caching and cancellation live in PdfSession; nothing here
 * queries content.
 */
function ReaderDocument({ pdf, cover, title, initialPage, onPageChange, barProps, mode, onModeChange, barHidden, onToggleBar }: ReaderDocumentProps) {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [focused, setFocused] = useState(initialPage);
  const [bookZoom, setBookZoom] = useState(1);
  const [scrollZoom, setScrollZoom] = useState(1);
  const [stage, setStage] = useState<StageBox | null>(null);
  const [settled, setSettled] = useState<{ mode: ReaderMode; css: number } | null>(null);
  const [turn, setTurn] = useState<PageTurnSpec | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  // Pages intersecting the screen in the grid and scroll views.
  const [visible, setVisible] = useState<{ first: number; last: number }>({ first: 1, last: 1 });
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const pendingSlide = useRef<1 | -1 | null>(null);
  // Where to scroll once a view is laid out (mode switches; reopening the issue after an insert).
  const pendingScroll = useRef<{ mode: ReaderMode; page: number } | null>(mode === "book" ? null : { mode, page: initialPage });
  const pickStarted = useRef(0);
  const lastSwipe = useRef(0);
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

  /* Measure the stage, the top bar above it and the bottom bar over it. */
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const element = stageRef.current;
    if (!section || !element) return;
    const measure = () => {
      const next: StageBox = {
        width: element.clientWidth,
        height: element.clientHeight,
        top: Math.max(0, Math.round(section.getBoundingClientRect().top)),
        below: section.clientHeight,
        bar: barRef.current?.offsetHeight ?? BAR_HEIGHT,
      };
      setStage((previous) =>
        previous && (Object.keys(next) as (keyof StageBox)[]).every((key) => Math.abs(previous[key] - next[key]) < 1) ? previous : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    observer.observe(element);
    if (barRef.current) observer.observe(barRef.current);
    return () => observer.disconnect();
  }, [status.kind]);

  const topInset = stage?.top ?? 0;
  const barInset = barHidden ? HIDDEN_BAR_LINE : (stage?.bar ?? BAR_HEIGHT);

  /* Geometry of every view (cheap; all views share the same page sizes). */
  const layout = stage ? chooseLayout(stage.width) : "single";
  const reference: PageSize = session?.pageSize(1) ?? (cover ? { width: cover.width, height: cover.height } : { width: 595, height: 842 });
  const sizeOf = (page: number) => session?.pageSize(page) ?? reference;
  const gutter = layout === "spread" ? ARROW_GUTTER : 0;
  const fit = stage
    ? fitScale({
        layout,
        stageWidth: stage.width - 2 * gutter - 2 * STAGE_PADDING,
        stageHeight: stage.below - barInset - 2 * STAGE_PADDING,
        page: reference,
      })
    : 0;
  const bookCss = fit * bookZoom;
  const scrollCss = stage ? (scrollPageWidth(stage.width) * scrollZoom) / reference.width : 0;
  const grid: GridLayout | null = stage ? gridLayout(stage.width, pageCount, reference) : null;
  const gridCss = grid ? grid.pageWidth / reference.width : 0;
  const cssScale = mode === "book" ? bookCss : mode === "grid" ? gridCss : scrollCss;

  const view = viewForPage(focused, pageCount, layout);
  const viewKey = view.join("-");
  // The side arrows are placed for a full spread even when the cover or last page stands alone, so they never jump.
  const bookWidth =
    layout === "spread"
      ? 2 * Math.round(reference.width * bookCss)
      : view.reduce((sum, page) => sum + Math.round(sizeOf(page).width * bookCss), 0);

  const scrollPadding = { top: topInset + SCROLL_TOP_GAP, bottom: barInset + SCROLL_TOP_GAP, side: stage ? scrollSideMargin(stage.width) : 0 };
  const gridPadding = { top: topInset + GRID_GAP, bottom: barInset + GRID_GAP };
  const offsets =
    mode === "scroll" ? pageOffsets(Array.from({ length: pageCount }, (_, index) => scrollBoxHeight(sizeOf(index + 1), scrollCss))) : null;

  /* Re-render sharply only once zoom/size has settled; CSS stretches the old bitmap meanwhile. A new mode settles at once. */
  useEffect(() => {
    if (!cssScale || (settled?.mode === mode && settled.css === cssScale)) return;
    const immediate = settled === null || settled.mode !== mode;
    const timer = window.setTimeout(() => setSettled({ mode, css: cssScale }), immediate ? 0 : SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [cssScale, mode, settled]);

  /* Latest geometry for scroll handlers and imperative scrolling. */
  const geometry = useRef({ mode, offsets, grid, gridPadding, scrollPadding, topInset, barInset, pageCount });
  useLayoutEffect(() => {
    geometry.current = { mode, offsets, grid, gridPadding, scrollPadding, topInset, barInset, pageCount };
  });

  /** Scroll position that puts a page (scroll) or its row (grid) right under the top bar. */
  const scrollTargetFor = useCallback((page: number) => {
    const { mode: current, offsets: tops, grid: overview } = geometry.current;
    if (current === "scroll" && tops) return tops[clampPage(page, tops.length - 1) - 1];
    if (current === "grid" && overview) return gridRow(page, overview.columns) * overview.rowStride;
    return 0;
  }, []);

  // While a smooth scroll runs towards a page, that page stays current (bounded, in case it is interrupted).
  const navTarget = useRef<{ page: number; top: number; until: number } | null>(null);
  const scrollToPage = useCallback(
    (page: number, smooth: boolean) => {
      const element = stageRef.current;
      if (!element) return;
      const top = scrollTargetFor(page);
      const animate = smooth && !prefersReducedMotion();
      navTarget.current = animate ? { page, top, until: performance.now() + 900 } : null;
      element.scrollTo({ top, behavior: animate ? "smooth" : "auto" });
    },
    [scrollTargetFor],
  );

  /** Which pages are on screen, and which one is current (grid: first page of the top row). */
  const syncScroll = useCallback(() => {
    const element = stageRef.current;
    const g = geometry.current;
    if (!element || g.mode === "book") return;
    const top = element.scrollTop;
    const height = element.clientHeight;
    const readable = Math.max(1, height - g.topInset - g.barInset);
    const atEnd = top >= element.scrollHeight - height - 2;
    let range: { first: number; last: number };
    let current: number;
    if (g.mode === "scroll" && g.offsets) {
      const local = top - g.scrollPadding.top;
      range = visiblePages(g.offsets, local, local + height);
      current = atEnd && top > 0 ? g.pageCount : pageAt(g.offsets, top - SCROLL_TOP_GAP + readable * CURRENT_LINE);
    } else if (g.mode === "grid" && g.grid) {
      const local = top - g.gridPadding.top;
      const rows = gridVisibleRows(g.grid, local, local + height);
      range = { first: rows.first * g.grid.columns + 1, last: Math.min(g.pageCount, (rows.last + 1) * g.grid.columns) };
      const row = atEnd && top > 0 ? g.grid.rows - 1 : Math.min(g.grid.rows - 1, Math.round(top / g.grid.rowStride));
      current = row * g.grid.columns + 1;
    } else {
      return;
    }
    setVisible((previous) => (previous.first === range.first && previous.last === range.last ? previous : range));
    const target = navTarget.current;
    if (target && Math.abs(top - target.top) > 2 && performance.now() < target.until) return;
    navTarget.current = null;
    setFocused(current);
  }, []);

  /*
   * After every commit: keep the reading position when the scale changes
   * (zoom, resize, scrollbars appearing), apply a pending mode-entry scroll,
   * then refresh what is on screen.
   */
  const anchor = useRef<{ mode: ReaderMode; scale: number } | null>(null);
  useLayoutEffect(() => {
    const element = stageRef.current;
    if (!element || !stage) return;
    const previous = anchor.current;
    anchor.current = { mode, scale: cssScale };

    const pending = pendingScroll.current;
    // Grid and scroll positions depend on the real page count, known once the document is open.
    if (pending && pending.mode === mode && (ready || mode === "book")) {
      pendingScroll.current = null;
      element.scrollTo({ top: scrollTargetFor(pending.page), left: 0 });
      if (mode === "scroll") element.scrollLeft = (element.scrollWidth - element.clientWidth) / 2;
    } else if (previous && previous.mode === mode && previous.scale !== cssScale && previous.scale > 0 && mode !== "grid") {
      const ratio = cssScale / previous.scale;
      const padTop = mode === "scroll" ? scrollPadding.top : topInset + STAGE_PADDING;
      const padSide = mode === "scroll" ? scrollPadding.side : STAGE_PADDING;
      const y = element.scrollTop + element.clientHeight / 2 - padTop;
      const x = element.scrollLeft + element.clientWidth / 2 - padSide;
      element.scrollTop = y * ratio + padTop - element.clientHeight / 2;
      element.scrollLeft = x * ratio + padSide - element.clientWidth / 2;
    }
    syncScroll();
  });

  /* Columns changed (resize across a breakpoint): keep the current page's row at the top. */
  const columns = grid?.columns ?? 0;
  const previousColumns = useRef(columns);
  useLayoutEffect(() => {
    if (previousColumns.current === columns) return;
    previousColumns.current = columns;
    if (mode === "grid") stageRef.current?.scrollTo({ top: scrollTargetFor(focused) });
    // Only the column count matters here; `focused` is read as of that change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  /*
   * Render plan: a page being opened for reading first, then the visible
   * pages, then the next/previous ones (skipped with Data Saver). A layout
   * effect, so it follows the pages' own canvas swaps within the same commit.
   */
  useLayoutEffect(() => {
    if (!session || !settled || settled.mode !== mode) return;
    const dpr = window.devicePixelRatio || 1;
    const scaleFor = (page: number, css: number) =>
      renderScale({
        cssScale: css,
        devicePixelRatio: dpr,
        page: session.pageSize(page) ?? session.pageSize(1)!,
        maxCanvasPixels: session.budget.maxCanvasPixels,
      });

    let shown: number[];
    let ahead: number[];
    if (mode === "book") {
      shown = viewKey.split("-").map(Number);
      const { next, previous } = adjacentViews(shown[0], session.pageCount, layout);
      ahead = [...(next ?? []), ...(previous ?? [])];
    } else if (mode === "scroll") {
      shown = range(visible.first, visible.last);
      ahead = [visible.last + 1, visible.first - 1];
    } else {
      shown = range(visible.first, visible.last);
      ahead = columns > 0 ? gridRowPages(gridRow(visible.last, columns) + 1, columns, session.pageCount) : [];
    }

    const requests: RenderRequest[] = [];
    if (pick !== null && scrollCss) requests.push({ page: pick, scale: scaleFor(pick, scrollCss), visible: true });
    for (const page of shown) if (page !== pick) requests.push({ page, scale: scaleFor(page, settled.css), visible: true });
    if (!prefersReducedData()) {
      for (const page of ahead) if (page !== pick) requests.push({ page, scale: scaleFor(page, settled.css), visible: false });
    }
    session.schedule(requests);
  }, [session, settled, mode, viewKey, layout, visible, columns, pick, scrollCss]);

  /* A picked page opens for reading once it is rendered at reading size (or failed, or took too long). */
  const enterReading = useRef<(page: number) => void>(() => {});
  useLayoutEffect(() => {
    enterReading.current = (page: number) => {
      setPick(null);
      setTurn(null);
      setFocused(page);
      pendingScroll.current = { mode: "scroll", page };
      onModeChange("scroll");
    };
  });
  useEffect(() => {
    if (pick === null || !session || !scrollCss) return;
    const size = session.pageSize(pick) ?? session.pageSize(1)!;
    const wanted = renderScale({
      cssScale: scrollCss,
      devicePixelRatio: window.devicePixelRatio || 1,
      page: size,
      maxCanvasPixels: session.budget.maxCanvasPixels,
    });
    const bitmap = session.bitmap(pick);
    const done = session.pageError(pick) || (bitmap !== undefined && !needsRerender(bitmap.scale, wanted));
    const elapsed = performance.now() - pickStarted.current;
    const timer = window.setTimeout(() => enterReading.current(pick), Math.max(0, (done ? PICK_MIN_MS : PICK_TIMEOUT_MS) - elapsed));
    return () => window.clearTimeout(timer);
  }, [pick, session, version, scrollCss]);

  const openForReading = useCallback((page: number) => {
    // A swipe that ended on a page is a turn, not a click.
    if (performance.now() - lastSwipe.current < 400) return;
    pickStarted.current = performance.now();
    setTurn(null);
    setPick(page);
  }, []);

  /* Book: after a turn start at the top-left of the new view; play the slide for non-spread turns. */
  const previousView = useRef(viewKey);
  useLayoutEffect(() => {
    if (previousView.current === viewKey) return;
    previousView.current = viewKey;
    if (mode !== "book") return;
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
  }, [viewKey, mode]);

  const changeMode = (next: ReaderMode) => {
    if (next === mode) return;
    const page = mode === "book" ? view[0] : focused;
    setPick(null);
    setTurn(null);
    setFocused(page);
    pendingScroll.current = { mode: next, page };
    onModeChange(next);
  };

  /* Navigation targets per view: spreads in the book, rows in the grid, pages when scrolling. */
  const gridRowIndex = grid ? gridRow(focused, grid.columns) : 0;
  const next =
    mode === "book"
      ? nextPage(focused, pageCount, layout)
      : mode === "grid"
        ? grid && gridRowIndex < grid.rows - 1
          ? (gridRowIndex + 1) * grid.columns + 1
          : null
        : focused < pageCount
          ? focused + 1
          : null;
  const previous =
    mode === "book"
      ? previousPage(focused, pageCount, layout)
      : mode === "grid"
        ? grid && gridRowIndex > 0
          ? (gridRowIndex - 1) * grid.columns + 1
          : null
        : focused > 1
          ? focused - 1
          : null;

  /** Book: next/previous with the page-turn animation when the target view is prepared. */
  const turnTo = (direction: 1 | -1) => {
    const target = direction === 1 ? next : previous;
    if (target === null) return;
    if (mode !== "book") {
      setFocused(target);
      scrollToPage(target, true);
      return;
    }
    const to = viewForPage(target, pageCount, layout);
    let spec: PageTurnSpec | null = null;
    if (session && bookZoom === 1 && !prefersReducedMotion()) {
      const fromBitmaps = view.map((page) => session.bitmap(page)?.canvas);
      const toBitmaps = to.map((page) => session.bitmap(page)?.canvas);
      if (layout === "spread" && view.length === 2 && to.length === 2 && [...fromBitmaps, ...toBitmaps].every(Boolean)) {
        const size = sizeOf(view[0]);
        spec = {
          id: ++turnId.current,
          direction,
          pageWidth: Math.round(size.width * bookCss),
          pageHeight: Math.round(size.height * bookCss),
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
      const target = clampPage(page, pageCount);
      setTurn(null);
      setFocused(target);
      if (mode !== "book") scrollToPage(target, false);
    },
    [pageCount, mode, scrollToPage],
  );
  const finishTurn = useCallback((id: number) => setTurn((current) => (current?.id === id ? null : current)), []);

  const jump = (delta: number) => goTo(mode === "book" ? jumpPage(focused, pageCount, layout, delta) : focused + delta);

  /*
   * Keyboard: the reader is the whole page. Never while typing.
   * Book: arrows turn (at a zoomed edge they scroll first).
   * Grid/scroll: up/down scroll in small steps, left/right move by a page (row).
   */
  const keys = useRef({ turnTo, goTo, mode, pick });
  useLayoutEffect(() => {
    keys.current = { turnTo, goTo, mode, pick };
  });
  useEffect(() => {
    if (!ready) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || isEditable(event.target)) return;
      const { turnTo: turn, goTo: go, mode: current, pick: picking } = keys.current;
      const element = stageRef.current;
      if (event.key === "Escape" && picking !== null) {
        setPick(null);
        return;
      }
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        go(event.key === "Home" ? 1 : Number.MAX_SAFE_INTEGER);
        return;
      }
      const forward = event.key === "ArrowRight" || event.key === "PageDown";
      const backward = event.key === "ArrowLeft" || event.key === "PageUp";

      if (current !== "book" && element) {
        const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
        const { topInset: top, barInset: bottom } = geometry.current;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          element.scrollBy({ top: event.key === "ArrowDown" ? ARROW_SCROLL_STEP : -ARROW_SCROLL_STEP, behavior });
        } else if (event.key === "PageDown" || event.key === "PageUp") {
          event.preventDefault();
          const step = Math.max(ARROW_SCROLL_STEP, (element.clientHeight - top - bottom) * 0.9);
          element.scrollBy({ top: event.key === "PageDown" ? step : -step, behavior });
        } else if (forward || backward) {
          event.preventDefault();
          const max = element.scrollWidth - element.clientWidth;
          const canScroll = forward ? element.scrollLeft < max - 1 : element.scrollLeft > 1;
          if (max > 1 && canScroll) element.scrollBy({ left: forward ? ARROW_SCROLL_STEP : -ARROW_SCROLL_STEP, behavior });
          else turn(forward ? 1 : -1);
        }
        return;
      }

      if (!forward && !backward) return;
      if (element && event.key.startsWith("Arrow")) {
        const max = element.scrollWidth - element.clientWidth;
        const canScroll = forward ? element.scrollLeft < max - 1 : element.scrollLeft > 1;
        if (max > 1 && canScroll) return;
      }
      event.preventDefault();
      turn(forward ? 1 : -1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ready]);

  /* Book: horizontal swipe on touch screens, only when nothing is zoomed or selected. */
  const swipe = useRef<{ x: number; y: number; time: number } | null>(null);
  const onPointerDown = (event: PointerEvent) => {
    swipe.current = mode === "book" && event.pointerType === "touch" && event.isPrimary ? { x: event.clientX, y: event.clientY, time: event.timeStamp } : null;
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
    lastSwipe.current = performance.now();
    turnTo(dx < 0 ? 1 : -1);
  };

  const zoomLevels = mode === "scroll" ? SCROLL_ZOOM_LEVELS : ZOOM_LEVELS;
  const zoomValue = mode === "scroll" ? scrollZoom : bookZoom;
  const setZoom = mode === "scroll" ? setScrollZoom : setBookZoom;
  const navigation: ReaderNavigation = {
    ready,
    current: mode === "book" ? (view.length === 2 ? `${view[0]}–${view[1]}` : String(view[0])) : String(focused),
    pageCount,
    canPrevious: previous !== null,
    canNext: next !== null,
    onFirstJump: () => jump(-JUMP_STEP),
    onPrevious: () => turnTo(-1),
    onNext: () => turnTo(1),
    onLastJump: () => jump(JUMP_STEP),
    onGoTo: goTo,
    zoom:
      mode === "grid"
        ? undefined
        : {
            value: zoomValue,
            canZoomIn: canZoom(zoomValue, 1, zoomLevels),
            canZoomOut: canZoom(zoomValue, -1, zoomLevels),
            onZoomIn: () => {
              setTurn(null);
              setZoom((value) => stepZoom(value, 1, zoomLevels));
            },
            onZoomOut: () => {
              setTurn(null);
              setZoom((value) => stepZoom(value, -1, zoomLevels));
            },
          },
  };
  const bar = (
    <ReaderBar
      {...barProps}
      navigation={navigation}
      modes={{ mode, onChange: changeMode }}
      hidden={barHidden}
      onToggleHidden={onToggleBar}
    />
  );

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

  // Book side arrows: just outside the pages, drifting towards the screen edges on wide screens.
  const arrowSize = layout === "spread" ? 56 : 44;
  const contentLeft = stage ? Math.max(STAGE_PADDING, (stage.width - bookWidth) / 2) : 0;
  const arrowOffset = Math.max(10, contentLeft - arrowSize - Math.min(ARROW_MAX_DISTANCE, Math.max(0, contentLeft - arrowSize - 10)));
  const arrowCenter = stage ? (stage.below - barInset) / 2 : 0;
  const mounted = { first: Math.max(1, visible.first - 1), last: Math.min(pageCount, visible.last + 1) };
  const gridMounted = grid
    ? {
        first: Math.max(1, visible.first - grid.columns),
        last: Math.min(pageCount, visible.last + grid.columns),
      }
    : mounted;

  return (
    <section ref={sectionRef} aria-label={`Čítačka: ${title}`} className="relative min-h-0 flex-1">
      <div
        ref={stageRef}
        tabIndex={0}
        aria-label={
          mode === "book"
            ? "Strany časopisu – listujte šípkami doľava a doprava, stranu otvoríte kliknutím"
            : mode === "grid"
              ? "Náhľad strán – stranu otvoríte kliknutím"
              : "Strany pod sebou – posúvajte šípkami hore a dole"
        }
        onScroll={mode === "book" ? undefined : syncScroll}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipe.current = null)}
        className={`absolute inset-x-0 bottom-0 overflow-auto outline-offset-[-3px] [overscroll-behavior:contain] ${mode === "book" && bookZoom === 1 ? "touch-pan-y" : ""}`}
        style={{ top: -topInset }}
      >
        {mode === "book" || !stage ? (
          <div
            className={
              stage
                ? // Clip, so the 3D page turn never makes the stage scrollable for a moment.
                  "flex min-h-full w-max min-w-full items-center justify-center overflow-clip"
                : "flex h-full items-center justify-center p-4 pb-[calc(80px+env(safe-area-inset-bottom))]"
            }
            style={
              stage
                ? { paddingTop: topInset + STAGE_PADDING, paddingBottom: barInset + STAGE_PADDING, paddingLeft: STAGE_PADDING, paddingRight: STAGE_PADDING }
                : undefined
            }
          >
            {stage ? (
              <div ref={bookRef} className="relative flex shadow-[0_24px_60px_-28px_rgba(4,23,58,.45)]">
                {view.map((page, index) => (
                  <PdfPage
                    key={page}
                    session={session}
                    page={page}
                    size={sizeOf(page)}
                    cssScale={bookCss}
                    side={view.length === 2 ? (index === 0 ? "left" : "right") : "single"}
                    interaction="pick"
                    picked={pick === page}
                    onPick={openForReading}
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
        ) : mode === "grid" && grid ? (
          <GridView
            session={session}
            version={version}
            pageCount={pageCount}
            grid={grid}
            cssScale={gridCss}
            sizeOf={sizeOf}
            mounted={gridMounted}
            padding={gridPadding}
            cover={cover}
            picked={pick}
            onPick={openForReading}
            onNavigate={goTo}
          />
        ) : (
          <ScrollView
            session={session}
            version={version}
            pageCount={pageCount}
            cssScale={scrollCss}
            sizeOf={sizeOf}
            mounted={mounted}
            padding={scrollPadding}
            cover={cover}
            onNavigate={goTo}
          />
        )}
      </div>

      {!ready && (
        <p
          className="reader-delayed pointer-events-none absolute inset-x-0 mx-auto w-fit rounded-full bg-[var(--color-navy)] px-5 py-2.5 text-[15px] font-semibold text-white shadow-lg"
          style={{ bottom: barInset + 24 }}
        >
          Načítavam časopis…
        </p>
      )}

      {ready && stage && mode === "book" && (
        <>
          <SideArrow direction="previous" hidden={previous === null} offset={arrowOffset} center={arrowCenter} size={arrowSize} onClick={() => turnTo(-1)} />
          <SideArrow direction="next" hidden={next === null} offset={arrowOffset} center={arrowCenter} size={arrowSize} onClick={() => turnTo(1)} />
        </>
      )}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {!ready ? "" : mode === "book" ? viewLabel(view, pageCount) : mode === "scroll" ? `Strana ${focused} z ${pageCount}` : ""}
      </p>

      <div ref={barRef} className="absolute inset-x-0 bottom-0 z-30">
        {bar}
      </div>
    </section>
  );
}

function range(first: number, last: number) {
  const pages: number[] = [];
  for (let page = first; page <= last; page++) pages.push(page);
  return pages;
}

/** Light translucent squares at the sides; pointer/touch convenience duplicating the bar's labelled controls. */
function SideArrow({ direction, hidden, offset, center, size, onClick }: { direction: "previous" | "next"; hidden: boolean; offset: number; center: number; size: number; onClick: () => void }) {
  if (hidden) return null;
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={onClick}
      className="absolute z-20 grid -translate-y-1/2 place-items-center rounded-[14px] bg-[rgba(15,30,60,.16)] text-white/95 backdrop-blur-[2px] transition-colors hover:bg-[rgba(15,30,60,.32)] active:bg-[rgba(15,30,60,.42)]"
      style={{ width: size, height: size * 1.25, top: center, [direction === "previous" ? "left" : "right"]: offset }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="drop-shadow-[0_1px_2px_rgba(4,23,58,.35)]">
        <path d={direction === "previous" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
      </svg>
    </button>
  );
}

/** Server-rendered placeholder before the stage is measured: the cover, contained where page 1 will appear. */
function CoverSkeleton({ cover }: { cover: ContentImage }) {
  return (
    <div className="relative h-full w-full">
      <Image src={cover.src} alt="" fill sizes={COVER_SIZES} className="object-contain drop-shadow-[0_18px_30px_rgba(4,23,58,.22)]" loading="eager" />
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
