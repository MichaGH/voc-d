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

function Status({ entry, isNext }: { entry: PlanYearView["entries"][number]; isNext: boolean }) {
  if (entry.editionHref) {
    return (
      <Link href={entry.editionHref} className="text-[15px] font-semibold whitespace-nowrap text-[var(--color-blue)]">
        Vyšlo – zobraziť →
      </Link>
    );
  }
  if (isNext) {
    return (
      <span className="inline-flex h-8 items-center rounded-full bg-[var(--color-blue-wash)] px-3.5 text-sm font-semibold whitespace-nowrap text-[var(--color-blue)]">
        Najbližšie vydanie
      </span>
    );
  }
  return null;
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
        <p id="plan-rok-label" className="text-sm font-medium text-[var(--color-muted)]">Rok</p>
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
          <p className="rounded-3xl bg-[var(--color-surface)] p-10 text-lg text-[var(--color-copy)]">Edičný plán na rok {plan.year} pripravujeme.</p>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full border-collapse text-left md:table">
              <caption className="sr-only">Vydania, termíny a uzávierky v roku {plan.year}</caption>
              <thead>
                <tr className="border-b border-[var(--color-line-dark)] text-sm text-[var(--color-muted)]">
                  <th scope="col" className="py-4 pr-6 font-semibold">Číslo</th>
                  <th scope="col" className="py-4 pr-6 font-semibold">Vychádza</th>
                  <th scope="col" className="py-4 pr-6 font-semibold">Uzávierka podkladov</th>
                  <th scope="col" className="py-4 pr-6 font-semibold">Téma</th>
                  <th scope="col" className="py-4 font-semibold"><span className="sr-only">Stav</span></th>
                </tr>
              </thead>
              <tbody>
                {plan.entries.map((entry) => (
                  <tr key={entry.key} className="border-b border-[var(--color-line)] align-top">
                    <th scope="row" className="py-6 pr-6 text-[clamp(22px,2vw,28px)] leading-none font-bold tracking-[-.02em] whitespace-nowrap">{entry.issueLabel}</th>
                    <td className="py-6 pr-6 text-[17px] font-semibold whitespace-nowrap">{formatPlanDate(entry.distribution)}</td>
                    <td className="py-6 pr-6 text-[17px] whitespace-nowrap text-[var(--color-copy)]">
                      {entry.submissionDeadline ? formatPlanDate(entry.submissionDeadline) : "upresníme"}
                    </td>
                    <td className="py-6 pr-6 text-[17px] text-[var(--color-copy)]">
                      {entry.theme ?? "—"}
                      {entry.note && <span className="mt-1 block text-[15px] text-[var(--color-muted)]">{entry.note}</span>}
                    </td>
                    <td className="py-6 text-right"><Status entry={entry} isNext={entry.key === nextEntryKey} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards keep every label visible */}
            <ul className="grid list-none gap-3 md:hidden">
              {plan.entries.map((entry) => (
                <li key={entry.key} className="rounded-3xl bg-[var(--color-surface)] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[26px] leading-none font-bold tracking-[-.02em]">{entry.issueLabel}</p>
                    <Status entry={entry} isNext={entry.key === nextEntryKey} />
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-[15px]">
                    <div>
                      <dt className="text-sm text-[var(--color-muted)]">Vychádza</dt>
                      <dd className="font-semibold">{formatPlanDate(entry.distribution)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-[var(--color-muted)]">Uzávierka</dt>
                      <dd className="font-semibold">{entry.submissionDeadline ? formatPlanDate(entry.submissionDeadline) : "upresníme"}</dd>
                    </div>
                    {(entry.theme || entry.note) && (
                      <div className="col-span-2">
                        <dt className="text-sm text-[var(--color-muted)]">Téma</dt>
                        <dd className="text-[var(--color-copy)]">
                          {entry.theme}
                          {entry.note && <span className="block text-[var(--color-muted)]">{entry.note}</span>}
                        </dd>
                      </div>
                    )}
                  </dl>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
