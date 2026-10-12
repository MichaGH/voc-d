import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditionCard from "@/components/magazine/EditionCard";
import MagazineSwitcher from "@/components/magazine/MagazineSwitcher";
import PageIntro from "@/components/shared/PageIntro";
import { buttonPrimary, inner, meta, sectionTop, sectionX } from "@/components/shared/ui";
import { ROUTES, editionsPath, editorialPlanPath, magazinePath } from "@/constants/routes";
import { getEditionYears, getEditions, getMagazineBySlug, getMagazines } from "@/lib/content";
import { getSwitcherItems } from "@/lib/content/switcher";
import { EDITION_FORMS, plural } from "@/lib/format/plural";

export const dynamicParams = false;

export async function generateStaticParams() {
  const magazines = await getMagazines();
  return magazines.map((magazine) => ({ magazineSlug: magazine.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[magazineSlug]/vydania">): Promise<Metadata> {
  const magazine = await getMagazineBySlug((await params).magazineSlug);
  if (!magazine) return {};
  return {
    title: `Vydania – ${magazine.title}`,
    description: `Obálky všetkých vydaní časopisu ${magazine.title} podľa ročníkov.`,
  };
}

/** Upper bound per year; a year never realistically exceeds this many issues. */
const YEAR_LIMIT = 48;

export default async function EditionsPage({ params }: PageProps<"/[magazineSlug]/vydania">) {
  const magazine = await getMagazineBySlug((await params).magazineSlug);
  if (!magazine) notFound();
  const { key } = magazine;

  const [years, switcher] = await Promise.all([getEditionYears(key), getSwitcherItems(editionsPath)]);
  const groups = await Promise.all(
    years.map(async (year) => ({ year, editions: (await getEditions({ magazineKey: key, year, limit: YEAR_LIMIT })).items })),
  );

  return (
    <main id="obsah">
      <PageIntro
        breadcrumbs={[
          { label: "Časopisy", href: ROUTES.magazines },
          { label: magazine.shortTitle, href: magazinePath(key) },
          { label: "Vydania" },
        ]}
        title={
          <>
            Vydania<span className="sr-only"> časopisu {magazine.title}</span>
          </>
        }
      >
        <MagazineSwitcher items={switcher} current={key} label="Vydania časopisu" />
      </PageIntro>

      <div className={sectionX}>
        <div className={inner}>
          {years.length > 1 && (
            <nav aria-label="Ročníky" className="mt-[clamp(48px,5vw,72px)] flex flex-wrap items-center gap-2">
              <span className="mr-2 text-[15px] font-medium text-[var(--color-muted)]">Ročník</span>
              {years.map((year) => (
                <Link
                  key={year}
                  href={`#rok-${year}`}
                  className="inline-flex h-10 items-center rounded-full border border-[var(--color-line-button)] px-4 text-[15px] font-semibold text-[var(--color-navy)] no-underline transition-colors hover:border-[var(--color-navy)] hover:text-[var(--color-navy)]"
                >
                  {year}
                </Link>
              ))}
            </nav>
          )}

          {groups.length === 0 && (
            <p className="mt-16 rounded-[28px] bg-[var(--color-surface)] p-10 text-lg text-[var(--color-copy)]">Vydania tohto časopisu pripravujeme.</p>
          )}

          {groups.map(({ year, editions }, index) => (
            <section
              key={year}
              id={`rok-${year}`}
              aria-labelledby={`rok-${year}-nadpis`}
              className={`${index === 0 ? "mt-[clamp(40px,4vw,56px)]" : "mt-[clamp(80px,8vw,120px)]"} scroll-mt-[100px]`}
            >
              <div className="flex items-baseline gap-4">
                <h2 id={`rok-${year}-nadpis`} className="text-[clamp(32px,3vw,44px)] leading-none font-bold tracking-[-.035em]">
                  {year}
                </h2>
                <p className={meta}>
                  {editions.length} {plural(editions.length, EDITION_FORMS)}
                </p>
              </div>
              <ul className="mt-8 grid list-none grid-cols-2 gap-x-[clamp(16px,2vw,28px)] gap-y-12 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {editions.map((edition) => (
                  <li key={edition.slug}>
                    <EditionCard edition={edition} magazineTitle={magazine.title} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <div className={`${sectionTop} flex flex-wrap items-center justify-between gap-6`}>
            <p className="max-w-[40ch] text-lg text-[var(--color-copy)] text-pretty">
              Pripravujete inzerciu alebo odborný článok? Pozrite si termíny ďalších čísel.
            </p>
            <Link href={editorialPlanPath(key)} className={buttonPrimary}>
              Edičný plán →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
