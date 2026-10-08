import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import InsertList from "@/components/magazine/InsertList";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { h3, inner, sectionX } from "@/components/shared/ui";
import { CONTACT } from "@/constants";
import { ROUTES, editionPath, editionsPath, magazinePath, subscriptionPath } from "@/constants/routes";
import { getEdition, getEditions, getMagazineBySlug, getMagazines } from "@/lib/content";
import { bindDashes } from "@/lib/format/text";
import type { EditionSummary, MagazineKey } from "@/types/content";

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
    description: edition.description ?? `Vydanie ${edition.label} časopisu ${magazine.title}.`,
    openGraph: { images: [{ url: edition.cover.src, width: edition.cover.width, height: edition.cover.height }] },
  };
}

function NeighbourCard({ magazineKey, edition, direction }: { magazineKey: MagazineKey; edition: EditionSummary; direction: "older" | "newer" }) {
  return (
    <Link
      href={editionPath(magazineKey, edition.slug)}
      className={`group flex items-center gap-5 rounded-[24px] bg-[var(--color-surface)] p-4 pr-6 text-[var(--color-navy)] no-underline transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-navy)] ${
        direction === "newer" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <Image
        src={edition.cover.src}
        alt=""
        width={edition.cover.width}
        height={edition.cover.height}
        sizes="64px"
        className="h-auto w-16 shrink-0 rounded-[3px] shadow-[0_10px_18px_-10px_rgba(4,23,58,.5)]"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-[var(--color-muted)]">{direction === "older" ? "← Staršie číslo" : "Novšie číslo →"}</span>
        <span className="mt-1 block text-lg font-semibold">{edition.label}</span>
      </span>
    </Link>
  );
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
    <main id="obsah" className="pt-[76px]">
      <div className={sectionX}>
        <div className={`${inner} pt-[clamp(28px,3vw,40px)]`}>
          <Breadcrumbs
            items={[
              { label: "Časopisy", href: ROUTES.magazines },
              { label: magazine.shortTitle, href: magazinePath(key) },
              { label: "Vydania", href: editionsPath(key) },
              { label: edition.label },
            ]}
          />

          <article className="mt-[clamp(28px,3.5vw,48px)] grid items-center gap-x-[clamp(40px,6vw,104px)] gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {/* Cover stage */}
            <div className="grid place-items-center rounded-[36px] bg-[var(--color-surface)] px-[clamp(40px,8vw,120px)] py-[clamp(40px,6vw,88px)]">
              <Image
                src={edition.cover.src}
                alt={edition.cover.alt}
                width={edition.cover.width}
                height={edition.cover.height}
                sizes="(max-width: 1024px) 70vw, 420px"
                preload
                className="aspect-[595/842] h-auto w-full max-w-[420px] rounded-[6px] shadow-[0_50px_80px_-34px_rgba(4,23,58,.7)]"
              />
            </div>

            <div className="min-w-0">
              <Link
                href={magazinePath(key)}
                className="inline-flex items-center gap-2 text-lg font-semibold text-[var(--color-navy)] no-underline hover:text-[var(--color-blue)]"
              >
                {bindDashes(magazine.title)}
              </Link>
              <h1 className="mt-3 text-[clamp(56px,7.5vw,120px)] leading-[.9] font-bold tracking-[-.05em]">
                <span className="sr-only">{magazine.title} – </span>
                {edition.label}
              </h1>
              {edition.description && (
                <p className="mt-6 max-w-[48ch] text-[clamp(17px,1.4vw,20px)] leading-[1.55] text-[var(--color-copy)] text-pretty">{edition.description}</p>
              )}

              {/* The one obvious action */}
              <div className="mt-10 rounded-[28px] bg-[linear-gradient(135deg,var(--color-navy-light)_0%,var(--color-navy)_75%)] p-[clamp(28px,3.5vw,44px)] text-white">
                <h2 className="text-[clamp(24px,2.2vw,32px)] leading-[1.1] font-bold tracking-[-.025em] text-balance">Chcete toto číslo?</h2>
                <p className="mt-3 max-w-[44ch] text-base leading-[1.6] text-[var(--color-card-copy)] text-pretty">
                  Pošleme vám tlačený výtlačok. Stačí nám napísať — dostupnosť staršieho čísla potvrdíme.
                </p>
                <Link
                  href={`mailto:${CONTACT.email}?subject=${orderSubject}`}
                  className="mt-8 flex h-16 w-full items-center justify-center gap-3 rounded-full bg-white px-8 text-lg font-semibold text-[var(--color-navy)] no-underline transition-colors hover:bg-[var(--color-cyan)] hover:text-[var(--color-navy)]"
                >
                  Objednať číslo {edition.label} <span aria-hidden="true">↗</span>
                </Link>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[15px]">
                  <Link href={subscriptionPath(key)} className="font-semibold text-white no-underline hover:text-[var(--color-blue-pale)]">
                    Radšej predplatné →
                  </Link>
                  <span className="text-[var(--color-stat-copy)]">
                    {edition.pdf ? "Čítanie online pripravujeme" : `Telefón ${CONTACT.phoneDisplay}`}
                  </span>
                </div>
              </div>
            </div>
          </article>

          {edition.inserts.length > 0 && (
            <section aria-labelledby="vkladacky" className="mt-[clamp(72px,8vw,120px)]">
              <h2 id="vkladacky" className={h3}>Súčasťou čísla</h2>
              <div className="mt-6">
                <InsertList inserts={edition.inserts} />
              </div>
            </section>
          )}

          {(older || newer) && (
            <nav aria-label="Ďalšie vydania" className="mt-[clamp(72px,8vw,120px)] grid gap-4 sm:grid-cols-2">
              <div>{older && <NeighbourCard magazineKey={key} edition={older} direction="older" />}</div>
              <div>{newer && <NeighbourCard magazineKey={key} edition={newer} direction="newer" />}</div>
            </nav>
          )}
        </div>
      </div>
    </main>
  );
}
