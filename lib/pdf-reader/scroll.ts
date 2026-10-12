/**
 * Pure layout rules for continuous reading ("Strany pod sebou"): pages
 * stacked directly under each other, wide enough to read the text, with
 * some room left at the sides. On a 1920 px screen a page is ~1670 px
 * wide, so roughly a third of it is visible at once.
 */

/** Side room as a share of the stage width on larger screens… */
const SIDE_RATIO = 0.065;
/** …capped, and a narrow fixed margin on phones/tablets. */
const SIDE_MAX = 140;
const SIDE_NARROW = 8;
const NARROW_STAGE = 768;
/** Very large screens do not make pages wider than this at 100 %. */
export const SCROLL_MAX_PAGE_WIDTH = 1800;

/** Zoom steps of the continuous mode, relative to its reading width. */
export const SCROLL_ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

/** Arrow keys scroll by this many CSS pixels (small steps). */
export const ARROW_SCROLL_STEP = 64;

export function scrollSideMargin(stageWidth: number): number {
  return stageWidth < NARROW_STAGE ? SIDE_NARROW : Math.min(SIDE_MAX, Math.round(stageWidth * SIDE_RATIO));
}

/** Page width in CSS pixels at 100 %. */
export function scrollPageWidth(stageWidth: number): number {
  return Math.max(120, Math.min(stageWidth - 2 * scrollSideMargin(stageWidth), SCROLL_MAX_PAGE_WIDTH));
}

/** Cumulative page tops: `offsets[i]` is the top of page i + 1; the last entry is the total height. */
export function pageOffsets(heights: number[]): number[] {
  const offsets = [0];
  for (const height of heights) offsets.push(offsets[offsets.length - 1] + Math.max(0, height));
  return offsets;
}

/** One-based page containing position `y` (clamped to the document). */
export function pageAt(offsets: number[], y: number): number {
  const pageCount = offsets.length - 1;
  if (pageCount < 1) return 1;
  let low = 0;
  let high = pageCount - 1;
  while (low < high) {
    const middle = (low + high + 1) >> 1;
    if (offsets[middle] <= y) low = middle;
    else high = middle - 1;
  }
  return low + 1;
}

/** First and last one-based pages intersecting [top, bottom). */
export function visiblePages(offsets: number[], top: number, bottom: number): { first: number; last: number } {
  const first = pageAt(offsets, top);
  const last = Math.max(first, pageAt(offsets, Math.max(top, bottom - 1)));
  return { first, last };
}
