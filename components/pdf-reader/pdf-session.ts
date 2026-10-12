import type { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy, RenderTask, TextLayer } from "pdfjs-dist";
import { toSafeHref } from "@/lib/url/safe-href";
import { needsRerender, type PageSize } from "@/lib/pdf-reader/zoom";

/**
 * Browser-only PDF session for one edition, built directly on PDF.js.
 *
 * - The library (legacy build, for current Safari/Android) is imported on
 *   demand, so no other route ships PDF code. Worker, fonts, CMaps and
 *   decoders come from our own origin in the exact installed version.
 * - Data is fetched with range requests on demand (no streaming, no
 *   auto-fetch): opening a long issue downloads what the visible pages need.
 * - Pages render into detached canvases kept in a pixel-budgeted cache. The
 *   React view moves a ready canvas into place, so a prepared spread appears
 *   instantly on a turn, with no page-turn animation to hide latency.
 * - A prioritised queue renders visible pages first, then (budget allowing)
 *   the neighbouring view. Superseded work is cancelled; late results from an
 *   abandoned session are ignored.
 */

type Pdfjs = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

export function pdfjsAssetBase(version: string) {
  return `/pdfjs/${version}/`;
}

let pdfjsPromise: Promise<Pdfjs> | null = null;

function loadPdfjs(): Promise<Pdfjs> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = `${pdfjsAssetBase(lib.version)}pdf.worker.min.mjs`;
      return lib;
    });
    // A failed chunk load must not poison later retries.
    pdfjsPromise.catch(() => {
      pdfjsPromise = null;
    });
  }
  return pdfjsPromise;
}

export type OpenErrorKind = "network" | "password" | "invalid";

export class PdfOpenError extends Error {
  constructor(
    readonly kind: OpenErrorKind,
    options?: { cause?: unknown },
  ) {
    super(`PDF could not be opened (${kind})`, options);
    this.name = "PdfOpenError";
  }
}

/** Memory limits; constrained (touch / low-memory) devices get smaller ones. */
export interface RenderBudget {
  /** Largest single page bitmap, in pixels. */
  maxCanvasPixels: number;
  /** All cached page bitmaps together, in pixels (4 bytes each). */
  cachePixels: number;
}

export function detectRenderBudget(): RenderBudget {
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const constrained = coarse || (memory !== undefined && memory <= 4);
  return constrained
    ? { maxCanvasPixels: 4_194_304, cachePixels: 10_000_000 } // ≤16 MB per page, ~40 MB in total
    : { maxCanvasPixels: 8_388_608, cachePixels: 20_000_000 }; // ≤32 MB per page, ~80 MB in total
}

export interface PageBitmap {
  page: number;
  /** Device pixels per PDF unit. */
  scale: number;
  canvas: HTMLCanvasElement;
  pixels: number;
  lastUsed: number;
}

export interface RenderRequest {
  page: number;
  scale: number;
  /** Visible pages render first and are never evicted. */
  visible: boolean;
}

/** Link hotspot in fractions of the page box (0–1), independent of zoom. */
export interface LinkRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type PdfLink =
  | { kind: "external"; href: string; label: string; rect: LinkRect }
  | { kind: "internal"; page: number; rect: LinkRect };

interface RenderJob {
  page: number;
  scale: number;
  cancelled: boolean;
  task: RenderTask | null;
}

const MAX_CONCURRENT_RENDERS = 2;
const RANGE_CHUNK_SIZE = 8192;
const MAX_TEXT_LAYERS = 6;

export class PdfSession {
  readonly pageCount: number;
  /** Increments whenever bitmaps or errors change (useSyncExternalStore snapshot). */
  version = 0;

  private readonly pages = new Map<number, Promise<PDFPageProxy>>();
  private readonly sizes = new Map<number, PageSize>();
  private readonly bitmaps = new Map<number, PageBitmap>();
  private readonly jobs = new Map<number, RenderJob>();
  private readonly errors = new Map<number, unknown>();
  private readonly textLayers = new Map<number, { promise: Promise<HTMLDivElement>; layer?: TextLayer; used: number }>();
  private readonly links = new Map<number, Promise<PdfLink[]>>();
  private readonly listeners = new Set<() => void>();
  private requests: RenderRequest[] = [];
  private destroyed = false;
  private clock = 0;

  private constructor(
    private readonly pdfjs: Pdfjs,
    private readonly loadingTask: PDFDocumentLoadingTask,
    private readonly doc: PDFDocumentProxy,
    firstPage: PDFPageProxy,
    readonly budget: RenderBudget,
  ) {
    this.pageCount = doc.numPages;
    this.pages.set(1, Promise.resolve(firstPage));
    this.sizes.set(1, sizeOf(firstPage));
  }

  /** Opens a document and its first page. Rejects with PdfOpenError, or AbortError when aborted. */
  static async open(url: string, signal: AbortSignal, budget = detectRenderBudget()): Promise<PdfSession> {
    let pdfjs: Pdfjs;
    try {
      pdfjs = await loadPdfjs();
    } catch (error) {
      throw new PdfOpenError("network", { cause: error });
    }
    throwIfAborted(signal);

    const base = pdfjsAssetBase(pdfjs.version);
    const task = pdfjs.getDocument({
      url,
      // Fetch only the byte ranges needed for the pages we actually render.
      disableStream: true,
      disableAutoFetch: true,
      // PDF.js walks the page tree object by object on open (one small object
      // per page in flat trees). Small chunks avoid downloading 64 KB of
      // neighbouring image data for each; contiguous chunks are still merged
      // into one request for large images. Measured: ~2.5× faster first page
      // on slow mobile links than the 64 KB default.
      rangeChunkSize: RANGE_CHUNK_SIZE,
      cMapUrl: `${base}cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `${base}standard_fonts/`,
      wasmUrl: `${base}wasm/`,
      iccUrl: `${base}iccs/`,
      enableXfa: false,
      verbosity: pdfjs.VerbosityLevel.ERRORS,
    });
    const abort = () => void task.destroy();
    signal.addEventListener("abort", abort, { once: true });

    try {
      const doc = await task.promise;
      const first = await doc.getPage(1);
      throwIfAborted(signal);
      return new PdfSession(pdfjs, task, doc, first, budget);
    } catch (error) {
      void task.destroy();
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      throw classifyOpenError(error);
    } finally {
      signal.removeEventListener("abort", abort);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Store API                                                         */
  /* ---------------------------------------------------------------- */

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getVersion = () => this.version;

  /** Known page size (PDF units), or undefined until that page has loaded. */
  pageSize(page: number): PageSize | undefined {
    return this.sizes.get(page);
  }

  /** Best bitmap available for a page (possibly at an older scale). */
  bitmap(page: number): PageBitmap | undefined {
    return this.bitmaps.get(page);
  }

  pageError(page: number): boolean {
    return this.errors.has(page);
  }

  retryPage(page: number) {
    if (this.errors.delete(page)) {
      this.changed();
      this.pump();
    }
  }

  /**
   * Declares what should be rendered now, in priority order. Work that is no
   * longer wanted is cancelled; visible pages are protected from eviction.
   */
  schedule(requests: RenderRequest[]) {
    if (this.destroyed) return;
    this.requests = requests.filter((r) => r.page >= 1 && r.page <= this.pageCount);
    const now = ++this.clock;
    for (const request of this.requests) {
      const bitmap = this.bitmaps.get(request.page);
      if (bitmap && request.visible) bitmap.lastUsed = now;
    }
    for (const job of this.jobs.values()) {
      const wanted = this.requests.find((r) => r.page === job.page);
      if (!wanted || Math.abs(job.scale / wanted.scale - 1) > 0.08) this.cancelJob(job);
    }
    this.evict();
    this.pump();
  }

  /** Text layer for selection/accessibility; built once at scale 1 and rescaled through CSS. */
  textLayer(page: number): Promise<HTMLDivElement> {
    const cached = this.textLayers.get(page);
    if (cached) {
      cached.used = ++this.clock;
      return cached.promise;
    }
    const entry: { promise: Promise<HTMLDivElement>; layer?: TextLayer; used: number } = {
      promise: Promise.resolve(document.createElement("div")),
      used: ++this.clock,
    };
    entry.promise = this.getPage(page).then(async (proxy) => {
      const container = document.createElement("div");
      container.className = "textLayer";
      const layer = new this.pdfjs.TextLayer({
        textContentSource: proxy.streamTextContent(),
        container,
        viewport: proxy.getViewport({ scale: 1 }),
      });
      entry.layer = layer;
      await layer.render();
      return container;
    });
    entry.promise.catch(() => this.textLayers.delete(page));
    this.textLayers.set(page, entry);
    this.trimTextLayers();
    return entry.promise;
  }

  /** Link annotations as safe, zoom-independent hotspots. */
  pageLinks(page: number): Promise<PdfLink[]> {
    let promise = this.links.get(page);
    if (!promise) {
      promise = this.loadLinks(page).catch(() => []);
      this.links.set(page, promise);
    }
    return promise;
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const job of this.jobs.values()) this.cancelJob(job);
    for (const bitmap of this.bitmaps.values()) releaseCanvas(bitmap.canvas);
    for (const entry of this.textLayers.values()) entry.layer?.cancel();
    this.bitmaps.clear();
    this.textLayers.clear();
    this.listeners.clear();
    // Aborts pending range requests and terminates the worker.
    void this.loadingTask.destroy();
    this.pdfjs.TextLayer.cleanup();
  }

  /* ---------------------------------------------------------------- */
  /* Internals                                                         */
  /* ---------------------------------------------------------------- */

  private getPage(page: number): Promise<PDFPageProxy> {
    let promise = this.pages.get(page);
    if (!promise) {
      promise = this.doc.getPage(page).then((proxy) => {
        this.sizes.set(page, sizeOf(proxy));
        return proxy;
      });
      promise.catch(() => this.pages.delete(page));
      this.pages.set(page, promise);
    }
    return promise;
  }

  private pump() {
    if (this.destroyed) return;
    const pending = this.requests.filter((request) => {
      if (this.errors.has(request.page)) return false;
      const existing = this.bitmaps.get(request.page);
      return !existing || needsRerender(existing.scale, request.scale);
    });
    // Preparing the next view must never compete with the visible pages for
    // bandwidth or main-thread time: it starts only once they are all drawn.
    const visibleBusy = pending.some((request) => request.visible);
    for (const request of pending) {
      if (this.jobs.size >= MAX_CONCURRENT_RENDERS) return;
      if (this.jobs.has(request.page)) continue;
      if (!request.visible && (visibleBusy || !this.fitsBudget(request))) continue;
      this.start(request);
    }
  }

  private start({ page, scale }: RenderRequest) {
    const job: RenderJob = { page, scale, cancelled: false, task: null };
    this.jobs.set(page, job);

    const run = async () => {
      const proxy = await this.getPage(page);
      if (job.cancelled || this.destroyed) return null;
      const viewport = proxy.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      job.task = proxy.render({ canvas, viewport });
      try {
        await job.task.promise;
      } catch (error) {
        releaseCanvas(canvas);
        throw error;
      }
      if (job.cancelled || this.destroyed) {
        releaseCanvas(canvas);
        return null;
      }
      return canvas;
    };

    run()
      .then((canvas) => {
        if (!canvas) return;
        const previous = this.bitmaps.get(page);
        this.bitmaps.set(page, {
          page,
          scale,
          canvas,
          pixels: canvas.width * canvas.height,
          lastUsed: previous?.lastUsed ?? ++this.clock,
        });
        if (previous) retireCanvas(previous.canvas);
        this.errors.delete(page);
        this.evict();
        this.changed();
      })
      .catch((error: unknown) => {
        if (job.cancelled || this.destroyed || isCancellation(error)) return;
        this.errors.set(page, error);
        this.changed();
      })
      .finally(() => {
        if (this.jobs.get(page) === job) this.jobs.delete(page);
        this.pump();
      });
  }

  private cancelJob(job: RenderJob) {
    job.cancelled = true;
    job.task?.cancel();
    if (this.jobs.get(job.page) === job) this.jobs.delete(job.page);
  }

  private visiblePages() {
    return new Set(this.requests.filter((r) => r.visible).map((r) => r.page));
  }

  /** A prepared (non-visible) page is rendered only if it fits after evicting unwanted bitmaps. */
  private fitsBudget(request: RenderRequest) {
    const size = this.sizes.get(request.page) ?? this.sizes.get(1)!;
    const needed = size.width * request.scale * size.height * request.scale;
    const wanted = new Set(this.requests.map((r) => r.page));
    let kept = 0;
    for (const bitmap of this.bitmaps.values()) {
      if (bitmap.page !== request.page && wanted.has(bitmap.page)) kept += bitmap.pixels;
    }
    return kept + needed <= this.budget.cachePixels;
  }

  /** Least recently used non-visible bitmaps go first; unwanted before prepared ones. */
  private evict() {
    let total = 0;
    for (const bitmap of this.bitmaps.values()) total += bitmap.pixels;
    if (total <= this.budget.cachePixels) return;

    const visible = this.visiblePages();
    const wanted = new Set(this.requests.map((r) => r.page));
    const candidates = [...this.bitmaps.values()]
      .filter((bitmap) => !visible.has(bitmap.page))
      .sort((a, b) => Number(wanted.has(a.page)) - Number(wanted.has(b.page)) || a.lastUsed - b.lastUsed);

    for (const bitmap of candidates) {
      if (total <= this.budget.cachePixels) break;
      this.bitmaps.delete(bitmap.page);
      retireCanvas(bitmap.canvas);
      total -= bitmap.pixels;
      if (!wanted.has(bitmap.page)) void this.pages.get(bitmap.page)?.then((proxy) => proxy.cleanup());
    }
  }

  private trimTextLayers() {
    if (this.textLayers.size <= MAX_TEXT_LAYERS) return;
    const visible = this.visiblePages();
    const oldest = [...this.textLayers.entries()]
      .filter(([page]) => !visible.has(page))
      .sort((a, b) => a[1].used - b[1].used);
    for (const [page, entry] of oldest.slice(0, this.textLayers.size - MAX_TEXT_LAYERS)) {
      entry.layer?.cancel();
      this.textLayers.delete(page);
    }
  }

  private async loadLinks(page: number): Promise<PdfLink[]> {
    const proxy = await this.getPage(page);
    const annotations: unknown[] = await proxy.getAnnotations({ intent: "display" });
    const viewport = proxy.getViewport({ scale: 1 });
    const links: PdfLink[] = [];

    for (const raw of annotations) {
      const annotation = raw as { annotationType?: number; rect?: number[]; url?: string; dest?: unknown };
      if (annotation.annotationType !== this.pdfjs.AnnotationType.LINK || !annotation.rect) continue;
      const [x1, y1] = viewport.convertToViewportPoint(annotation.rect[0], annotation.rect[1]);
      const [x2, y2] = viewport.convertToViewportPoint(annotation.rect[2], annotation.rect[3]);
      const rect: LinkRect = {
        left: Math.min(x1, x2) / viewport.width,
        top: Math.min(y1, y2) / viewport.height,
        width: Math.abs(x2 - x1) / viewport.width,
        height: Math.abs(y2 - y1) / viewport.height,
      };
      if (!(rect.width > 0 && rect.height > 0)) continue;

      if (annotation.url) {
        const href = toSafeHref(annotation.url, { allowContact: true });
        if (href) links.push({ kind: "external", href, label: linkLabel(href), rect });
      } else if (annotation.dest) {
        const target = await this.resolveDestination(annotation.dest);
        if (target) links.push({ kind: "internal", page: target, rect });
      }
    }
    return links;
  }

  private async resolveDestination(dest: unknown): Promise<number | null> {
    try {
      const explicit = typeof dest === "string" ? await this.doc.getDestination(dest) : dest;
      if (!Array.isArray(explicit) || explicit.length === 0) return null;
      const ref = explicit[0];
      const index =
        typeof ref === "number"
          ? ref
          : ref && typeof ref === "object"
            ? await this.doc.getPageIndex(ref as { num: number; gen: number })
            : null;
      return index !== null && index >= 0 && index < this.pageCount ? index + 1 : null;
    } catch {
      return null;
    }
  }

  private changed() {
    this.version++;
    for (const listener of this.listeners) listener();
  }
}

function sizeOf(page: PDFPageProxy): PageSize {
  const viewport = page.getViewport({ scale: 1 });
  return { width: viewport.width, height: viewport.height };
}

function classifyOpenError(error: unknown): PdfOpenError {
  const name = error instanceof Error ? error.name : "";
  if (name === "PasswordException") return new PdfOpenError("password", { cause: error });
  if (name === "InvalidPDFException") return new PdfOpenError("invalid", { cause: error });
  return new PdfOpenError("network", { cause: error });
}

function isCancellation(error: unknown) {
  return error instanceof Error && error.name === "RenderingCancelledException";
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
}

function linkLabel(href: string) {
  if (href.startsWith("mailto:")) return href.slice("mailto:".length);
  if (href.startsWith("tel:")) return href.slice("tel:".length);
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

/** Frees canvas backing memory immediately (Safari keeps it otherwise). */
function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}

/**
 * Frees a replaced/evicted canvas once the view has swapped it out. A canvas
 * still attached to the document is left to garbage collection instead.
 */
function retireCanvas(canvas: HTMLCanvasElement) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (!canvas.isConnected) releaseCanvas(canvas);
    }),
  );
}
