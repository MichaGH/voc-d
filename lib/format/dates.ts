import type { EventDetails, PlanDate } from "@/types/content";

export const SITE_TIME_ZONE = "Europe/Bratislava";

/** Non-breaking space: Slovak dates never wrap between day, month and year parts. */
const NB = "\u00a0";

const MONTHS_NOMINATIVE = [
  "január", "február", "marec", "apríl", "máj", "jún",
  "júl", "august", "september", "október", "november", "december",
];

const MONTHS_GENITIVE = [
  "januára", "februára", "marca", "apríla", "mája", "júna",
  "júla", "augusta", "septembra", "októbra", "novembra", "decembra",
];

function parts(value: string) {
  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  return { year, month, day };
}

/** "2026-11-05" → "5. novembra 2026" */
export function formatLongDate(value: string) {
  const { year, month, day } = parts(value);
  return `${day}.${NB}${MONTHS_GENITIVE[month - 1]}${NB}${year}`;
}

/** "2026-11-05" → "5. 11. 2026" */
export function formatShortDate(value: string) {
  const { year, month, day } = parts(value);
  return `${day}.${NB}${month}.${NB}${year}`;
}

/** Month precision never invents a day: "2026-10" → "október 2026". */
export function formatPlanDate(date: PlanDate) {
  if (date.precision === "day") return formatShortDate(date.value);
  const { year, month } = parts(date.value);
  return `${MONTHS_NOMINATIVE[month - 1]}${NB}${year}`;
}

/** "5. – 6. novembra 2026", "28. apríla – 2. mája 2026" or a single day. */
export function formatEventRange(event: Pick<EventDetails, "start" | "end">) {
  const start = parts(event.start.date);
  const time = event.start.time ? `, ${event.start.time}` : "";
  if (!event.end || event.end.date === event.start.date) {
    return `${formatLongDate(event.start.date)}${time}`;
  }
  const end = parts(event.end.date);
  if (start.year === end.year && start.month === end.month) {
    return `${start.day}.${NB}–${NB}${end.day}.${NB}${MONTHS_GENITIVE[end.month - 1]}${NB}${end.year}`;
  }
  if (start.year === end.year) {
    return `${start.day}.${NB}${MONTHS_GENITIVE[start.month - 1]} – ${formatLongDate(event.end.date)}`;
  }
  return `${formatLongDate(event.start.date)} – ${formatLongDate(event.end.date)}`;
}

/** Today's date (YYYY-MM-DD) in the site's time zone. */
export function todayInSiteZone(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function currentYearInSiteZone(now = new Date()) {
  return Number.parseInt(todayInSiteZone(now).slice(0, 4), 10);
}
