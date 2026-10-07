import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import InsertList from "@/components/magazine/InsertList";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { body, buttonPrimary, display, eyebrow, h3, inner, meta, pageTop, sectionX, textLink } from "@/components/shared/ui";
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
    <main id="obsah" className={`${sectionX} ${pageTop}`}>
      <div className={inner}>
        <Breadcrumbs
          items={[
            { label: "Časopisy", href: ROUTES.magazines },
            { label: magazine.shortTitle, href: magazinePath(key) },
            { label: "Vydania", href: editionsPath(key) },
            { label: edition.label },
          ]}
        />

        <article className="mt-[clamp(40px,5vw,72px)] grid items-start gap-x-[clamp(40px,7vw,120px)] gap-y-12 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
          <div className="lg:sticky lg:top-[116px]">
            <Image
              src={edition.cover.src}
              alt={edition.cover.alt}
              width={edition.cover.width}
              height={edition.cover.height}
              sizes="(max-width: 1024px) 80vw, 460px"
              preload
              className="mx-auto aspect-[595/842] h-auto w-full max-w-[280px] rounded-md shadow-[0_44px_70px_-30px_rgba(4,23,58,.6)] sm:max-w-[380px] lg:mx-0 lg:max-w-[440px]"
            />
          </div>

          <div className="min-w-0">
            <h1>
              <span className={`block ${eyebrow}`}>{magazine.title}</span>
              <span className={`mt-4 block ${display}`}>Číslo {edition.label}</span>
            </h1>
            {edition.description && <p className={`mt-6 max-w-[52ch] ${body}`}>{edition.description}</p>}

            <dl className="mt-10 grid grid-cols-2 gap-x-10 border-y border-[var(--color-line)] py-6">
              <div>
                <dt className={meta}>{edition.publishedOn ? "Vyšlo" : "Ročník"}</dt>
                <dd className="mt-1 text-[17px] font-semibold">{edition.publishedOn ? formatLongDate(edition.publishedOn) : edition.year}</dd>
              </div>
              <div>
                <dt className={meta}>Elektronická verzia</dt>
                <dd className="mt-1 text-[17px] font-semibold">
                  {edition.pdf ? "Čítanie na webe pripravujeme" : "Zatiaľ nie je dostupná"}
                </dd>
              </div>
            </dl>

            {edition.highlights.length > 0 && (
              <section aria-labelledby="obsah-cisla" className="mt-16">
                <h2 id="obsah-cisla" className={h3}>V tomto čísle nájdete</h2>
                <ol className="mt-6 list-none border-t border-[var(--color-line)]">
                  {edition.highlights.map((highlight) => (
                    <li key={highlight.title} className="flex items-baseline justify-between gap-6 border-b border-[var(--color-line)] py-5">
                      <span className="text-[17px] leading-snug font-semibold text-balance">{highlight.title}</span>
                      {highlight.page && <span className={`shrink-0 ${meta}`}>str. {highlight.page}</span>}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {edition.inserts.length > 0 && (
              <section aria-labelledby="vkladacky" className="mt-16">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 id="vkladacky" className={h3}>Vkladačky</h2>
                  <p className={meta}>
                    {edition.inserts.length} {plural(edition.inserts.length, INSERT_FORMS)}
                  </p>
                </div>
                <div className="mt-6">
                  <InsertList inserts={edition.inserts} />
                </div>
              </section>
            )}

            <section aria-labelledby="objednat" className="mt-16 rounded-[28px] bg-[var(--color-surface)] p-[clamp(28px,3.5vw,48px)]">
              <h2 id="objednat" className={h3}>Chcete tlačené vydanie?</h2>
              <p className={`mt-3 max-w-[52ch] ${body}`}>
                Výtlačky aj predplatné vybavujeme e-mailom alebo telefonicky na{" "}
                <span className="whitespace-nowrap">{CONTACT.phoneDisplay}</span>. Dostupnosť staršieho čísla vám potvrdíme.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Link href={`mailto:${CONTACT.email}?subject=${orderSubject}`} className={buttonPrimary}>
                  Objednať výtlačok ↗
                </Link>
                <Link href={subscriptionPath(key)} className={textLink}>
                  Predplatné časopisu →
                </Link>
              </div>
            </section>

            <nav aria-label="Ďalšie vydania" className="mt-16 grid grid-cols-2 gap-4 border-t border-[var(--color-line)] pt-6">
              <div>
                {older && (
                  <Link href={editionPath(key, older.slug)} className="group inline-flex flex-col text-[var(--color-navy)] no-underline">
                    <span className={meta}>← Staršie</span>
                    <span className="text-[17px] font-semibold group-hover:text-[var(--color-blue)]">Číslo {older.label}</span>
                  </Link>
                )}
              </div>
              <div className="text-right">
                {newer && (
                  <Link href={editionPath(key, newer.slug)} className="group inline-flex flex-col items-end text-[var(--color-navy)] no-underline">
                    <span className={meta}>Novšie →</span>
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
