import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import InsertList from "@/components/magazine/InsertList";
import { magazineAccent } from "@/components/magazine/identity";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { CONTACT } from "@/constants";
import { ROUTES, editionPath, editionsPath, magazinePath, subscriptionPath } from "@/constants/routes";
import { getEdition, getEditions, getMagazineBySlug, getMagazines } from "@/lib/content";
import { formatLongDate } from "@/lib/format/dates";
import { INSERT_FORMS, plural } from "@/lib/format/plural";

export const dynamicParams = false;

/** Bounded read used for static params and previous/next navigation. */
const ARCHIVE_LIMIT = 48;

export async function generateStaticParams() {
  const magazines = await getMagazines();
  const params = await Promise.all(
    magazines.map(async (magazine) => {
      const { items } = await getEditions({ magazineKey: magazine.key, limit: ARCHIVE_LIMIT });
      return items.map((edition) => ({ magazineSlug: magazine.slug, editionSlug: edition.slug }));
    }),
  );
  return params.flat();
}

async function load(magazineSlug: string, editionSlug: string) {
  const magazine = await getMagazineBySlug(magazineSlug);
  if (!magazine) return null;
  // Resolve the edition within this magazine only — never substitute another title's edition.
  const edition = await getEdition(magazine.key, editionSlug);
  return edition ? { magazine, edition } : null;
}

export async function generateMetadata({ params }: PageProps<"/[magazineSlug]/vydania/[editionSlug]">): Promise<Metadata> {
  const { magazineSlug, editionSlug } = await params;
  const data = await load(magazineSlug, editionSlug);
  if (!data) return {};
  const { magazine, edition } = data;
  return {
    title: `${magazine.title} ${edition.label}`,
    description: edition.highlights.length
      ? `V čísle ${edition.label}: ${edition.highlights.map((h) => h.title).join(" · ")}`
      : `Vydanie ${edition.label} časopisu ${magazine.title}.`,
    openGraph: { images: [{ url: edition.cover.src, width: edition.cover.width, height: edition.cover.height }] },
  };
}

export default async function EditionPage({ params }: PageProps<"/[magazineSlug]/vydania/[editionSlug]">) {
  const { magazineSlug, editionSlug } = await params;
  const data = await load(magazineSlug, editionSlug);
  if (!data) notFound();
  const { magazine, edition } = data;
  const { key } = magazine;

  const { items: all } = await getEditions({ magazineKey: key, limit: ARCHIVE_LIMIT });
  const index = all.findIndex((item) => item.slug === edition.slug);
  const newer = index > 0 ? all[index - 1] : null;
  const older = index >= 0 && index < all.length - 1 ? all[index + 1] : null;
  const orderSubject = encodeURIComponent(`Objednávka výtlačku – ${magazine.title} ${edition.label}`);

  return (
    <main id="obsah" className="px-5 pt-[calc(76px+clamp(32px,4vw,56px))] md:px-8 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        <Breadcrumbs
          items={[
            { label: "Časopisy", href: ROUTES.magazines },
            { label: magazine.shortTitle, href: magazinePath(key) },
            { label: "Vydania", href: editionsPath(key) },
            { label: edition.label },
          ]}
        />

        <article className="mt-[clamp(32px,4vw,56px)] grid items-start gap-x-[clamp(40px,7vw,120px)] gap-y-12 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
          <div className="lg:sticky lg:top-[108px]">
            <Image
              src={edition.cover.src}
              alt={edition.cover.alt}
              width={edition.cover.width}
              height={edition.cover.height}
              sizes="(max-width: 1024px) 80vw, 460px"
              preload
              className="mx-auto aspect-[595/842] h-auto w-full max-w-[280px] rounded-md sm:max-w-[400px] lg:max-w-[460px] shadow-[0_44px_70px_-30px_rgba(4,23,58,.6)] lg:mx-0"
            />
          </div>

          <div className="min-w-0">
            <h1>
              <span className={`block text-[15px] font-semibold ${magazineAccent[key].text}`}>{magazine.title}</span>
              <span className="mt-3 block text-[clamp(44px,5.6vw,88px)] leading-[.98] font-bold tracking-[-.04em]">Číslo {edition.label}</span>
            </h1>
            {edition.description && <p className="mt-6 max-w-[56ch] text-[clamp(17px,1.5vw,20px)] text-[var(--color-copy)] text-pretty">{edition.description}</p>}

            <dl className="mt-9 grid grid-cols-2 gap-x-10 gap-y-5 border-y border-[var(--color-line)] py-6 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-[var(--color-muted)]">Ročník</dt>
                <dd className="mt-1 text-[17px] font-semibold">{edition.year}</dd>
              </div>
              <div>
                <dt className="text-sm text-[var(--color-muted)]">{edition.publishedOn ? "Vyšlo" : "Vkladačky"}</dt>
                <dd className="mt-1 text-[17px] font-semibold">
                  {edition.publishedOn
                    ? formatLongDate(edition.publishedOn)
                    : edition.inserts.length > 0
                      ? `${edition.inserts.length} ${plural(edition.inserts.length, INSERT_FORMS)}`
                      : "Bez vkladačiek"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-[var(--color-muted)]">Elektronická verzia</dt>
                <dd className="mt-1 text-[17px] font-semibold">
                  {edition.pdf ? "Čítanie na webe pripravujeme" : "Zatiaľ nie je dostupná"}
                </dd>
              </div>
            </dl>

            {edition.highlights.length > 0 && (
              <section aria-labelledby="obsah-cisla" className="mt-12">
                <h2 id="obsah-cisla" className="text-[clamp(26px,2.4vw,34px)] leading-tight font-bold tracking-[-.025em]">V tomto čísle nájdete</h2>
                <ol className="mt-4 list-none border-t border-[var(--color-line)]">
                  {edition.highlights.map((highlight) => (
                    <li key={highlight.title} className="flex items-baseline justify-between gap-6 border-b border-[var(--color-line)] py-5">
                      <span className="text-[clamp(17px,1.4vw,20px)] leading-snug font-semibold text-balance">{highlight.title}</span>
                      {highlight.page && <span className="shrink-0 text-[15px] text-[var(--color-muted)]">str. {highlight.page}</span>}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {edition.inserts.length > 0 && (
              <section aria-labelledby="vkladacky" className="mt-12">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 id="vkladacky" className="text-[clamp(26px,2.4vw,34px)] leading-tight font-bold tracking-[-.025em]">Vkladačky</h2>
                  <p className="text-[15px] text-[var(--color-muted)]">
                    {edition.inserts.length} {plural(edition.inserts.length, INSERT_FORMS)}
                  </p>
                </div>
                <div className="mt-5">
                  <InsertList inserts={edition.inserts} />
                </div>
              </section>
            )}

            <section aria-labelledby="objednat" className="mt-12 rounded-[28px] bg-[var(--color-surface)] p-[clamp(24px,3vw,40px)]">
              <h2 id="objednat" className="text-[clamp(22px,2vw,28px)] leading-tight font-bold tracking-[-.02em]">Chcete tlačené vydanie?</h2>
              <p className="mt-3 max-w-[52ch] text-[17px] text-[var(--color-copy)] text-pretty">
                Výtlačky aj predplatné vybavujeme e-mailom alebo telefonicky na{" "}
                <span className="whitespace-nowrap">{CONTACT.phoneDisplay}</span>. Dostupnosť staršieho čísla vám potvrdíme.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href={`mailto:${CONTACT.email}?subject=${orderSubject}`}
                  className="inline-flex h-[52px] items-center rounded-full bg-[var(--color-navy)] px-6 text-[15px] font-semibold whitespace-nowrap text-white no-underline transition-colors hover:bg-[var(--color-blue)] hover:text-white"
                >
                  Objednať výtlačok ↗
                </Link>
                <Link href={subscriptionPath(key)} className="text-[15px] font-semibold text-[var(--color-blue)]">
                  Predplatné časopisu →
                </Link>
              </div>
            </section>

            <nav aria-label="Ďalšie vydania" className="mt-12 grid grid-cols-2 gap-4 border-t border-[var(--color-line)] pt-6">
              <div>
                {older && (
                  <Link href={editionPath(key, older.slug)} className="group inline-flex flex-col text-[var(--color-navy)] no-underline">
                    <span className="text-sm text-[var(--color-muted)]">← Staršie</span>
                    <span className="text-[17px] font-semibold group-hover:text-[var(--color-blue)]">Číslo {older.label}</span>
                  </Link>
                )}
              </div>
              <div className="text-right">
                {newer && (
                  <Link href={editionPath(key, newer.slug)} className="group inline-flex flex-col items-end text-[var(--color-navy)] no-underline">
                    <span className="text-sm text-[var(--color-muted)]">Novšie →</span>
                    <span className="text-[17px] font-semibold group-hover:text-[var(--color-blue)]">Číslo {newer.label}</span>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </article>
      </div>
    </main>
  );
}
