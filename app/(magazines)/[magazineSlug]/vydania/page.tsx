import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditionCard from "@/components/magazine/EditionCard";
import { magazineAccent } from "@/components/magazine/identity";
import PageIntro from "@/components/shared/PageIntro";
import { ROUTES, editorialPlanPath, magazinePath } from "@/constants/routes";
import { getEditionYears, getEditions, getMagazineBySlug, getMagazines } from "@/lib/content";
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
    description: `Obálky a obsah všetkých vydaní časopisu ${magazine.title} podľa ročníkov.`,
  };
}

/** Upper bound per year; a year never realistically exceeds this many issues. */
const YEAR_LIMIT = 48;

export default async function EditionsPage({ params }: PageProps<"/[magazineSlug]/vydania">) {
  const magazine = await getMagazineBySlug((await params).magazineSlug);
  if (!magazine) notFound();
  const { key } = magazine;

  const years = await getEditionYears(key);
  const groups = await Promise.all(
    years.map(async (year) => ({ year, editions: (await getEditions({ magazineKey: key, year, limit: YEAR_LIMIT })).items })),
  );
  const total = groups.reduce((sum, group) => sum + group.editions.length, 0);

  return (
    <main id="obsah">
      <PageIntro
        breadcrumbs={[
          { label: "Časopisy", href: ROUTES.magazines },
          { label: magazine.shortTitle, href: magazinePath(key) },
          { label: "Vydania" },
        ]}
        eyebrow={magazine.title}
        eyebrowClass={magazineAccent[key].text}
        title="Všetky vydania"
        lead={`${total} ${plural(total, EDITION_FORMS)} podľa ročníkov. Otvorte číslo a pozrite si jeho obsah, vkladačky a možnosti objednania.`}
      >
        {years.length > 1 && (
          <nav aria-label="Ročníky">
            <ul className="flex list-none flex-wrap gap-1.5 rounded-[28px] bg-[var(--color-surface)] p-1.5 sm:inline-flex sm:rounded-full">
              {years.map((year) => (
                <li key={year}>
                  <Link
                    href={`#rok-${year}`}
                    className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-semibold text-[var(--color-navy)] no-underline transition-colors hover:bg-white"
                  >
                    {year}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </PageIntro>

      <div className="px-5 md:px-8 xl:px-12">
        <div className="mx-auto max-w-[1400px]">
          {groups.length === 0 && (
            <p className="mt-16 rounded-3xl bg-[var(--color-surface)] p-10 text-lg text-[var(--color-copy)]">Vydania tohto časopisu pripravujeme.</p>
          )}
          {groups.map(({ year, editions }) => (
            <section key={year} id={`rok-${year}`} aria-labelledby={`rok-${year}-nadpis`} className="mt-[clamp(56px,6vw,96px)] scroll-mt-[100px]">
              <div className="flex items-baseline justify-between gap-6 border-b border-[var(--color-line)] pb-4">
                <h2 id={`rok-${year}-nadpis`} className="text-[clamp(32px,3.4vw,48px)] leading-none font-bold tracking-[-.035em]">
                  {year}
                </h2>
                <p className="text-[15px] text-[var(--color-muted)]">
                  {editions.length} {plural(editions.length, EDITION_FORMS)}
                </p>
              </div>
              <ul className="mt-8 grid list-none grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
                {editions.map((edition) => (
                  <li key={edition.slug}>
                    <EditionCard edition={edition} magazineTitle={magazine.title} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <div className="mt-[clamp(72px,8vw,120px)] flex flex-wrap items-center justify-between gap-6 rounded-[28px] bg-[var(--color-surface)] p-[clamp(28px,4vw,48px)]">
            <p className="max-w-[44ch] text-lg text-[var(--color-copy)] text-pretty">
              Pripravujete inzerciu alebo odborný článok? Pozrite si termíny ďalších čísel.
            </p>
            <Link
              href={editorialPlanPath(key)}
              className="inline-flex h-[52px] items-center rounded-full bg-[var(--color-navy)] px-6 text-[15px] font-semibold whitespace-nowrap text-white no-underline transition-colors hover:bg-[var(--color-blue)] hover:text-white"
            >
              Edičný plán →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
