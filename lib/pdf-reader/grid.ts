/**
 * Pure layout rules for the page overview ("Náhľad strán").
 *
 * Pages keep one fixed size while the window is resized; only the space
 * between the columns changes. When that space has shrunk to the row gap,
 * the pages give way a little until the next breakpoint drops a column,
 * after which they are back at full size: 4 columns on large screens,
 * 3 on medium ones and a single column of small pages on phones.
 */

/** Page width in CSS pixels at full size. */
export const GRID_PAGE_WIDTH = 282;
/** Space between rows, and the smallest space between columns. */
export const GRID_GAP = 30;
/** Smallest page width while the columns are squeezed. */
const GRID_MIN_PAGE_WIDTH = 60;

/** Stage widths (CSS px) from which a column count applies, widest first. */
export const GRID_BREAKPOINTS = [
  { minWidth: 1200, columns: 4 },
  { minWidth: 768, columns: 3 },
] as const;

export function gridColumns(stageWidth: number): number {
  return GRID_BREAKPOINTS.find((breakpoint) => stageWidth >= breakpoint.minWidth)?.columns ?? 1;
}

export interface GridLayout {
  columns: number;
  /** Page box size in CSS pixels (for the reference page proportions). */
  pageWidth: number;
  pageHeight: number;
  /** Distance from one row's top to the next. */
  rowStride: number;
  rows: number;
}

/**
 * Columns share the stage equally and each page is centred in its column,
 * so the space between pages is the column width minus the page width.
 * Once that space reaches GRID_GAP the page shrinks instead.
 */
export function gridLayout(stageWidth: number, pageCount: number, page: { width: number; height: number }): GridLayout {
  const columns = gridColumns(stageWidth);
  const column = Math.max(stageWidth, 0) / columns;
  const pageWidth = Math.max(GRID_MIN_PAGE_WIDTH, Math.floor(Math.min(GRID_PAGE_WIDTH, column - GRID_GAP)));
  const ratio = page.width > 0 && page.height > 0 ? page.height / page.width : Math.SQRT2;
  const pageHeight = Math.round(pageWidth * ratio);
  return {
    columns,
    pageWidth,
    pageHeight,
    rowStride: pageHeight + GRID_GAP,
    rows: Math.ceil(Math.max(1, pageCount) / columns),
  };
}

/** Zero-based row of a one-based page. */
export function gridRow(page: number, columns: number): number {
  return Math.floor((Math.max(1, page) - 1) / Math.max(1, columns));
}

/** One-based pages of a zero-based row. */
export function gridRowPages(row: number, columns: number, pageCount: number): number[] {
  const first = row * columns + 1;
  const pages: number[] = [];
  for (let page = first; page < first + columns && page <= pageCount; page++) pages.push(page);
  return pages;
}

/**
 * Rows intersecting a scroll window. `top`/`bottom` are measured from the
 * first row's top edge; the result is clamped to existing rows.
 */
export function gridVisibleRows(layout: GridLayout, top: number, bottom: number): { first: number; last: number } {
  const lastRow = layout.rows - 1;
  const first = Math.min(lastRow, Math.max(0, Math.floor(top / layout.rowStride)));
  const last = Math.min(lastRow, Math.max(first, Math.floor(bottom / layout.rowStride)));
  return { first, last };
}
