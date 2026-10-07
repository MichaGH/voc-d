import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditorialPlanView, { type PlanYearView } from "@/components/magazine/EditorialPlanView";
import PageIntro from "@/components/shared/PageIntro";
import { buttonOnDark, eyebrowOnDark, inner, meta, sectionX, textLinkOnDark } from "@/components/shared/ui";
import { CONTACT } from "@/constants";
import { ROUTES, editionPath, magazinePath } from "@/constants/routes";
import { getEditorialPlan, getEditorialPlanYears, getMagazineBySlug, getMagazines } from "@/lib/content";
import { findNextPlanEntry, pickDefaultPlanYear } from "@/lib/content/rules";
import { todayInSiteZone } from "@/lib/format/dates";

export const dynamicParams = false;
/** The default year and "next issue" marker follow today's date. */
export const revalidate = 86400;

export async function generateStaticParams() {
  const magazines = await getMagazines();
  return magazines.map((magazine) => ({ magazineSlug: magazine.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[magazineSlug]/edicny-plan">): Promise<Metadata> {
  const magazine = await getMagazineBySlug((await params).magazineSlug);
  if (!magazine) return {};
  return {
    title: `Edičný plán – ${magazine.title}`,
    description: `Termíny vydaní a uzávierok podkladov časopisu ${magazine.title}.`,
  };
}

export default async function EditorialPlanPage({ params }: PageProps<"/[magazineSlug]/edicny-plan">) {
  const magazine = await getMagazineBySlug((await params).magazineSlug);
  if (!magazine) notFound();
  const { key } = magazine;

  const years = await getEditorialPlanYears(key);
  const plans = (await Promise.all(years.map((year) => getEditorialPlan(key, year)))).filter((plan) => plan !== null);
  const today = todayInSiteZone();
  const defaultYear = pickDefaultPlanYear(years, Number(today.slice(0, 4)));
  const nextEntry = findNextPlanEntry(plans, today);

  const views: PlanYearView[] = plans.map((plan) => ({
    year: plan.year,
    entries: plan.entries.map((entry) => ({
      ...entry,
      editionHref: entry.editionSlug ? editionPath(key, entry.editionSlug) : undefined,
    })),
  }));

  const adSubject = encodeURIComponent(`Inzercia – ${magazine.title}`);

  return (
    <main id="obsah">
      <PageIntro
        breadcrumbs={[
          { label: "Časopisy", href: ROUTES.magazines },
          { label: magazine.shortTitle, href: magazinePath(key) },
          { label: "Edičný plán" },
        ]}
        eyebrow={magazine.title}
        title="Edičný plán"
        lead="Termíny vydaní a uzávierky podkladov pre inzerciu a odborné články."
      />

      <div className={`${sectionX} pt-[clamp(56px,6vw,88px)]`}>
        <div className={inner}>
          {defaultYear === null ? (
            <p className="rounded-3xl bg-[var(--color-surface)] p-10 text-lg text-[var(--color-copy)]">Edičný plán pripravujeme. Termíny vám radi povieme e-mailom.</p>
          ) : (
            <EditorialPlanView plans={views} defaultYear={defaultYear} nextEntryKey={nextEntry?.key ?? null} />
          )}

          <p className={`mt-6 max-w-[70ch] ${meta} text-pretty`}>
            Termíny uvedené mesiacom upresníme. Presný dátum uzávierky vám potvrdíme pri objednávke inzercie.
          </p>

          <div className="mt-[clamp(80px,9vw,128px)] flex flex-wrap items-center justify-between gap-6 rounded-[28px] bg-[linear-gradient(135deg,var(--color-navy-light)_0%,var(--color-navy)_75%)] px-[clamp(28px,4vw,56px)] py-[clamp(32px,4vw,52px)] text-white">
            <div className="min-w-0 flex-[1_1_420px]">
              <p className={eyebrowOnDark}>Inzercia</p>
              <p className="mt-3 text-[clamp(26px,2.6vw,38px)] leading-[1.1] font-bold tracking-[-.025em] text-balance">Rezervujte si miesto v ďalšom čísle.</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link href={`mailto:${CONTACT.email}?subject=${adSubject}`} className={buttonOnDark}>
                Dohodnúť inzerciu ↗
              </Link>
              <Link href={magazine.advertisingInfoUrl} className={textLinkOnDark}>
                Cenník a formáty ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
