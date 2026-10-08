"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { formatPlanDate } from "@/lib/format/dates";
import type { EditorialPlanEntry } from "@/types/content";

export interface PlanYearView {
  year: number;
  entries: (EditorialPlanEntry & { editionHref?: string })[];
}

interface EditorialPlanViewProps {
  plans: PlanYearView[];
  defaultYear: number;
  /** Key of the next upcoming entry (computed on the server). */
  nextEntryKey: string | null;
}

export default function EditorialPlanView({ plans, defaultYear, nextEntryKey }: EditorialPlanViewProps) {
  const [year, setYear] = useState(defaultYear);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ordered = [...plans].sort((a, b) => a.year - b.year);
  const activeIndex = Math.max(0, ordered.findIndex((plan) => plan.year === year));
  const plan = ordered[activeIndex];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = ordered.length - 1;
    const next =
      event.key === "ArrowRight" ? Math.min(last, activeIndex + 1)
      : event.key === "ArrowLeft" ? Math.max(0, activeIndex - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    setYear(ordered[next].year);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <p id="plan-rok-label" className="text-[15px] font-medium text-[var(--color-muted)]">Rok</p>
        <div
          role="tablist"
          aria-labelledby="plan-rok-label"
          onKeyDown={onKeyDown}
          className="flex max-w-full flex-wrap gap-1.5 rounded-[28px] bg-[var(--color-surface)] p-1.5 sm:rounded-full"
        >
          {ordered.map((item, index) => {
            const selected = item.year === plan.year;
            return (
              <button
                key={item.year}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                id={`plan-tab-${item.year}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="plan-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setYear(item.year)}
                className={`h-11 cursor-pointer rounded-full border-0 px-5 text-[15px] font-semibold transition-colors ${
                  selected ? "bg-[var(--color-navy)] text-white shadow-[0_6px_16px_-8px_rgba(4,23,58,.5)]" : "bg-transparent text-[var(--color-navy)] hover:bg-white"
                }`}
              >
                {item.year}
              </button>
            );
          })}
        </div>
      </div>

      <div id="plan-panel" role="tabpanel" aria-labelledby={`plan-tab-${plan.year}`} className="mt-10">
        <h2 className="sr-only">Edičný plán {plan.year}</h2>
        {plan.entries.length === 0 ? (
          <p className="rounded-[28px] bg-[var(--color-surface)] p-10 text-lg text-[var(--color-copy)]">Edičný plán na rok {plan.year} pripravujeme.</p>
        ) : (
          <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {plan.entries.map((entry) => {
              const isNext = entry.key === nextEntryKey;
              return (
                <li
                  key={entry.key}
                  className={`flex flex-col rounded-[28px] p-7 ${
                    isNext ? "bg-[linear-gradient(135deg,var(--color-navy-light)_0%,var(--color-navy)_75%)] text-white" : "bg-[var(--color-surface)]"
                  }`}
                >
                  <div className="flex min-h-8 items-start justify-between gap-3">
                    <p className="text-[clamp(36px,3vw,44px)] leading-none font-bold tracking-[-.04em]">{entry.issueLabel}</p>
                    {isNext && (
                      <span className="inline-flex h-8 items-center rounded-full bg-white/14 px-3 text-sm font-semibold whitespace-nowrap">
                        Najbližšie
                      </span>
                    )}
                  </div>
                  <dl className="mt-8 grid gap-4">
                    <div>
                      <dt className={`text-sm ${isNext ? "text-[var(--color-stat-copy)]" : "text-[var(--color-muted)]"}`}>Vychádza</dt>
                      <dd className="mt-0.5 text-lg font-semibold">{formatPlanDate(entry.distribution)}</dd>
                    </div>
                    <div>
                      <dt className={`text-sm ${isNext ? "text-[var(--color-stat-copy)]" : "text-[var(--color-muted)]"}`}>Uzávierka podkladov</dt>
                      <dd className="mt-0.5 text-lg font-semibold">
                        {entry.submissionDeadline ? formatPlanDate(entry.submissionDeadline) : "upresníme"}
                      </dd>
                    </div>
                    {(entry.theme || entry.note) && (
                      <div>
                        <dt className={`text-sm ${isNext ? "text-[var(--color-stat-copy)]" : "text-[var(--color-muted)]"}`}>Téma</dt>
                        <dd className={`mt-0.5 text-base leading-snug ${isNext ? "text-[var(--color-card-copy)]" : "text-[var(--color-copy)]"}`}>
                          {[entry.theme, entry.note].filter(Boolean).join(". ")}
                        </dd>
                      </div>
                    )}
                  </dl>
                  {entry.editionHref && (
                    <Link
                      href={entry.editionHref}
                      className="mt-auto inline-flex items-center gap-1.5 pt-8 text-[15px] font-semibold text-[var(--color-blue)] no-underline hover:text-[var(--color-navy)]"
                    >
                      Pozrieť vydanie →
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
