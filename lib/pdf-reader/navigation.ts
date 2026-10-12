/**
 * Pure page/spread rules for the magazine reader. All numbers are one-based
 * physical PDF pages; printed page labels inside the magazine are ignored.
 *
 * Spread layout pairs pages like an opened printed magazine:
 * 1 alone, then 2–3, 4–5, 6–7 … A final even page without a partner stands
 * alone. The reader keeps one stable "focused" page; views are derived from
 * it, so switching layouts never loses the reading position.
 */

export type ReaderLayout = "single" | "spread";

/**
 * Two pages side by side need a reasonably wide stage. Measured on the
 * reader's own container (not the device type); tune during visual QA
 * without touching the pairing rules.
 */
export const SPREAD_MIN_STAGE_WIDTH = 960;

export function chooseLayout(stageWidth: number): ReaderLayout {
  return stageWidth >= SPREAD_MIN_STAGE_WIDTH ? "spread" : "single";
}

export function clampPage(page: number, pageCount: number): number {
  const last = Math.max(1, Math.floor(pageCount));
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(1, Math.floor(page)), last);
}

/** Pages visible for a focused page, ascending (one or two entries). */
export function viewForPage(page: number, pageCount: number, layout: ReaderLayout): number[] {
  const focused = clampPage(page, pageCount);
  if (layout === "single" || focused === 1) return [focused];
  const left = focused % 2 === 0 ? focused : focused - 1;
  return left + 1 <= pageCount ? [left, left + 1] : [left];
}

/** Focused page after "next", or null on the last view. */
export function nextPage(page: number, pageCount: number, layout: ReaderLayout): number | null {
  const view = viewForPage(page, pageCount, layout);
  const after = view[view.length - 1] + 1;
  return after <= pageCount ? after : null;
}

/** Focused page after "previous" (the first page of that view), or null on the first view. */
export function previousPage(page: number, pageCount: number, layout: ReaderLayout): number | null {
  const before = viewForPage(page, pageCount, layout)[0] - 1;
  return before >= 1 ? viewForPage(before, pageCount, layout)[0] : null;
}

/** Views next to the current one, used to prepare pages ahead of a turn. */
export function adjacentViews(page: number, pageCount: number, layout: ReaderLayout) {
  const next = nextPage(page, pageCount, layout);
  const previous = previousPage(page, pageCount, layout);
  return {
    next: next === null ? null : viewForPage(next, pageCount, layout),
    previous: previous === null ? null : viewForPage(previous, pageCount, layout),
  };
}

/** "Strana 5 z 36" or "Strany 4–5 z 36". */
export function viewLabel(view: number[], pageCount: number): string {
  return view.length === 2
    ? `Strany ${view[0]}–${view[1]} z ${pageCount}`
    : `Strana ${view[0]} z ${pageCount}`;
}

export type PageInputResult = { ok: true; page: number } | { ok: false; error: string };

/** Validates the "Prejsť na stranu" field against the loaded page count. */
export function parsePageInput(raw: string, pageCount: number): PageInputResult {
  const value = raw.trim();
  if (!value) return { ok: false, error: "Zadajte číslo strany." };
  const page = /^\d{1,6}$/.test(value) ? Number(value) : Number.NaN;
  if (!Number.isInteger(page) || page < 1 || page > pageCount) {
    return { ok: false, error: pageCount === 1 ? "Časopis má iba 1 stranu." : `Zadajte číslo od 1 do ${pageCount}.` };
  }
  return { ok: true, page };
}

/** Pages skipped by the fast back/forward controls (« »). */
export const JUMP_STEP = 10;

/** Focused page after jumping `delta` pages from the current view, clamped to the issue. */
export function jumpPage(page: number, pageCount: number, layout: ReaderLayout, delta: number): number {
  const start = viewForPage(page, pageCount, layout)[0];
  return viewForPage(clampPage(start + delta, pageCount), pageCount, layout)[0];
}
