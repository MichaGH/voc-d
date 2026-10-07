import Link from "next/link";
import { editorialPlanPath } from "@/constants/routes";
import { formatPlanDate } from "@/lib/format/dates";
import type { EditorialPlanEntry, MagazineKey } from "@/types/content";

/** Teaser for the next planned issue, linking to the full editorial plan. */
export default function NextIssueCard({ magazineKey, entry }: { magazineKey: MagazineKey; entry: EditorialPlanEntry | null }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8 rounded-[28px] bg-[var(--color-surface)] p-[clamp(28px,4vw,56px)]">
      <div className="min-w-0 flex-[1_1_420px]">
        <p className="text-[15px] font-semibold text-[var(--color-blue)]">Edičný plán</p>
        {entry ? (
          <>
            <h2 className="mt-2 text-[clamp(28px,3vw,44px)] leading-[1.05] font-bold tracking-[-.03em] text-balance">
              Najbližšie vydanie {entry.issueLabel}
            </h2>
            <dl className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-[var(--color-muted)]">Vychádza</dt>
                <dd className="mt-1 text-lg font-semibold">{formatPlanDate(entry.distribution)}</dd>
              </div>
              <div>
                <dt className="text-sm text-[var(--color-muted)]">Uzávierka podkladov</dt>
                <dd className="mt-1 text-lg font-semibold">{entry.submissionDeadline ? formatPlanDate(entry.submissionDeadline) : "upresníme"}</dd>
              </div>
              {entry.theme && (
                <div>
                  <dt className="text-sm text-[var(--color-muted)]">Téma</dt>
                  <dd className="mt-1 text-lg font-semibold text-balance">{entry.theme}</dd>
                </div>
              )}
            </dl>
          </>
        ) : (
          <h2 className="mt-2 text-[clamp(28px,3vw,44px)] leading-[1.05] font-bold tracking-[-.03em] text-balance">
            Termíny vydaní a uzávierok
          </h2>
        )}
      </div>
      <Link
        href={editorialPlanPath(magazineKey)}
        className="inline-flex h-[52px] items-center rounded-full bg-[var(--color-navy)] px-6 text-[15px] font-semibold whitespace-nowrap text-white no-underline transition-colors hover:bg-[var(--color-blue)] hover:text-white"
      >
        Celý edičný plán →
      </Link>
    </div>
  );
}
