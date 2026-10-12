import type { ReaderLayout } from "./navigation.ts";

/**
 * Pure sizing rules for the reader stage.
 *
 * "Fit" (zoom 100 %) shows the whole view — both pages of a spread, or the
 * single page — inside the full-screen stage. Zoom multiplies that fit scale;
 * the stage then scrolls.
 */

export const ZOOM_LEVELS = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5] as const;
export const MIN_ZOOM = ZOOM_LEVELS[0];
export const MAX_ZOOM = ZOOM_LEVELS[ZOOM_LEVELS.length - 1];

/** Gap between the two pages of a spread, in CSS pixels. */
export const SPREAD_GAP = 0;
/** Smallest stage height used for fitting, so short landscape windows stay usable. */
export const MIN_STAGE_HEIGHT = 360;

export interface PageSize {
  /** PDF user-space units at scale 1 (rotation applied). */
  width: number;
  height: number;
}

/** Next zoom level in a direction; `levels` ascending (the spread levels by default). */
export function stepZoom(zoom: number, direction: 1 | -1, levels: readonly number[] = ZOOM_LEVELS): number {
  if (direction === 1) return levels.find((level) => level > zoom + 1e-6) ?? levels[levels.length - 1];
  return [...levels].reverse().find((level) => level < zoom - 1e-6) ?? levels[0];
}

export function canZoom(zoom: number, direction: 1 | -1, levels: readonly number[] = ZOOM_LEVELS) {
  return direction === 1 ? zoom < levels[levels.length - 1] - 1e-6 : zoom > levels[0] + 1e-6;
}

export function formatZoom(zoom: number) {
  return `${Math.round(zoom * 100)} %`;
}

export interface FitInput {
  layout: ReaderLayout;
  stageWidth: number;
  stageHeight: number;
  /** Reference page (the focused page, or page 1 before it is known). */
  page: PageSize;
}

/** CSS pixels per PDF unit at zoom 100 %. */
export function fitScale({ layout, stageWidth, stageHeight, page }: FitInput): number {
  if (!(page.width > 0 && page.height > 0) || !(stageWidth > 0)) return 1;
  const height = Math.max(stageHeight, MIN_STAGE_HEIGHT);
  const pagesWide = layout === "spread" ? 2 * page.width + SPREAD_GAP : page.width;
  const scale = Math.min(stageWidth / pagesWide, height / page.height);
  return Math.max(scale, 0.05);
}

export interface RenderScaleInput {
  cssScale: number;
  devicePixelRatio: number;
  page: PageSize;
  /** Upper bound for one page bitmap, in pixels (width × height). */
  maxCanvasPixels: number;
}

/** Density cap: devicePixelRatio 2. */
export const MAX_DENSITY = 2;

/**
 * Bitmap scale (device pixels per PDF unit) for a page: sharp up to a
 * device-pixel ratio of 2, never larger than the per-canvas pixel budget.
 */
export function renderScale({ cssScale, devicePixelRatio, page, maxCanvasPixels }: RenderScaleInput): number {
  const density = Math.min(Math.max(devicePixelRatio || 1, 1), MAX_DENSITY);
  const wanted = cssScale * density;
  const byBudget = Math.sqrt(maxCanvasPixels / Math.max(page.width * page.height, 1));
  return Math.max(Math.min(wanted, byBudget), 0.05);
}

/**
 * Whether an existing bitmap is too far from the wanted scale. Small
 * differences are stretched by CSS (invisible) instead of re-rendered.
 */
export function needsRerender(existingScale: number, wantedScale: number) {
  return existingScale < wantedScale * 0.92 || existingScale > wantedScale * 1.6;
}
