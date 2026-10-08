import type { ArticleSummary, EditionSummary, EditorialPlan, EditorialPlanEntry, PlanDate } from "@/types/content";

/** Years descending, then issue order descending, with a stable slug tie-breaker. */
export function compareEditionsNewestFirst(a: EditionSummary, b: EditionSummary) {
  return b.year - a.year || b.order - a.order || a.magazineKey.localeCompare(b.magazineKey) || a.slug.localeCompare(b.slug);
}

/** Publication date descending with a stable slug tie-breaker. */
export function compareArticlesNewestFirst(a: ArticleSummary, b: ArticleSummary) {
  return b.publishedOn.localeCompare(a.publishedOn) || a.slug.localeCompare(b.slug);
}

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 48;

export function clampLimit(limit: number | undefined, fallback = DEFAULT_PAGE_SIZE) {
  if (!limit || !Number.isFinite(limit)) return fallback;
  return Math.min(Math.max(1, Math.floor(limit)), MAX_PAGE_SIZE);
}

/** Offset cursors are opaque to callers; invalid cursors restart at 0. */
export function decodeCursor(cursor: string | undefined) {
  const value = cursor ? Number.parseInt(cursor, 10) : 0;
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function paginate<T>(items: T[], cursor: string | undefined, limit: number | undefined) {
  const start = decodeCursor(cursor);
  const size = clampLimit(limit);
  const page = items.slice(start, start + size);
  const next = start + size < items.length ? String(start + size) : null;
  return { items: page, nextCursor: next };
}

/**
 * Default editorial-plan year: the current Europe/Bratislava year when a plan
 * exists, otherwise the nearest future year, otherwise the latest past year.
 */
export function pickDefaultPlanYear(years: number[], currentYear: number): number | null {
  if (years.length === 0) return null;
  if (years.includes(currentYear)) return currentYear;
  const future = years.filter((year) => year > currentYear).sort((a, b) => a - b);
  if (future.length > 0) return future[0];
  return Math.max(...years);
}

/** True when a planned date has not passed yet (month precision compares by month). */
export function isPlanDateUpcoming(date: PlanDate, today: string) {
  return date.precision === "month" ? date.value >= today.slice(0, 7) : date.value >= today;
}

/** First planned issue that is still upcoming and not yet published as an edition. */
export function findNextPlanEntry(plans: EditorialPlan[], today: string): EditorialPlanEntry | null {
  const entries = [...plans]
    .sort((a, b) => a.year - b.year)
    .flatMap((plan) => [...plan.entries].sort((a, b) => a.order - b.order));
  return entries.find((entry) => !entry.editionSlug && isPlanDateUpcoming(entry.distribution, today)) ?? null;
}

/** First planned issue whose submission deadline (or, without one, distribution) has not passed. */
export function findNextDeadlineEntry(plans: EditorialPlan[], today: string): EditorialPlanEntry | null {
  const entries = [...plans]
    .sort((a, b) => a.year - b.year)
    .flatMap((plan) => [...plan.entries].sort((a, b) => a.order - b.order));
  return (
    entries.find(
      (entry) => !entry.editionSlug && isPlanDateUpcoming(entry.submissionDeadline ?? entry.distribution, today),
    ) ?? null
  );
}
