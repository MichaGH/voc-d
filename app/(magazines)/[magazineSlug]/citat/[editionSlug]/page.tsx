import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PdfReader from "@/components/pdf-reader/PdfReader";
import ReaderAdBanner from "@/components/pdf-reader/ReaderAdBanner";
import { buttonPrimary, buttonSecondary, inner, sectionX } from "@/components/shared/ui";
import { mailto } from "@/constants";
import { editionPath, editionsPath } from "@/constants/routes";
import { getEditions, getMagazines, getReaderPageData } from "@/lib/content";
import { bindDashes } from "@/lib/format/text";

export const dynamicParams = false;

/** Bounded read, matching the edition detail route. */
const ARCHIVE_LIMIT = 48;

/** Every known edition has a reader route; cover-only editions render the unavailable state. */
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

export async function generateMetadata({ params }: PageProps<"/[magazineSlug]/citat/[editionSlug]">): Promise<Metadata> {
  const data = await getReaderPageData(await params);
  if (!data) return {};
  const { magazine, edition } = data;
  return {
    title: `Čítať ${magazine.title} ${edition.label}`,
    description: `Vydanie ${edition.label} časopisu ${magazine.title} na čítanie online.`,
    // The edition detail page is the indexable, canonical page; the reader is canvas-only.
    alternates: { canonical: editionPath(magazine.key, edition.slug) },
    robots: { index: false, follow: true },
  };
}

export default async function ReaderPage({ params }: PageProps<"/[magazineSlug]/citat/[editionSlug]">) {
  const data = await getReaderPageData(await params);
  if (!data) notFound();
  const { magazine, edition, ad } = data;
  const backHref = editionPath(magazine.key, edition.slug);
  const title = `${magazine.title} ${edition.label}`;

  return (
    <main id="obsah" className="bg-[var(--color-surface)] pt-[76px]">
      <div className={sectionX}>
        <div className={inner}>
          {/* Identity and back navigation stay visible in every reader state. */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-5 pb-4">
            <h1 className="min-w-0 text-[clamp(19px,1.8vw,24px)] leading-[1.2] font-bold tracking-[-.02em] text-balance">
              <Link href={`/${magazine.slug}`} className="font-semibold text-[var(--color-copy)] no-underline hover:text-[var(--color-blue)]">
                {bindDashes(magazine.title)}
              </Link>{" "}
              <span className="whitespace-nowrap">{edition.label}</span>
            </h1>
            <Link
              href={backHref}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-[var(--color-line-button)] bg-white px-4 text-[14px] font-semibold text-[var(--color-navy)] no-underline transition-colors hover:border-[var(--color-navy)]"
            >
              <span aria-hidden="true">←</span> Späť na vydanie
            </Link>
          </div>

          <ReaderAdBanner ad={ad} magazineTitle={magazine.title} />

          <div className="pt-2">
            {edition.pdf ? (
              <PdfReader pdf={edition.pdf} cover={edition.cover} title={title} backHref={backHref} />
            ) : (
              <ReaderUnavailable
                cover={edition.cover}
                magazineTitle={magazine.title}
                label={edition.label}
                backHref={backHref}
                editionsHref={editionsPath(magazine.key)}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

interface ReaderUnavailableProps {
  cover: { src: string; alt: string; width: number; height: number };
  magazineTitle: string;
  label: string;
  backHref: string;
  editionsHref: string;
}

/** Cover-only edition: valid route, honest state, and no PDF code or worker is loaded. */
function ReaderUnavailable({ cover, magazineTitle, label, backHref, editionsHref }: ReaderUnavailableProps) {
  return (
    <section className="my-6 grid items-center gap-10 rounded-[28px] bg-white p-[clamp(28px,4vw,56px)] md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
      <Image
        src={cover.src}
        alt={cover.alt}
        width={cover.width}
        height={cover.height}
        sizes="260px"
        className="mx-auto aspect-[595/842] h-auto w-full max-w-[260px] rounded-[5px] shadow-[0_30px_50px_-28px_rgba(4,23,58,.6)]"
      />
      <div>
        <h2 className="text-[clamp(24px,2.2vw,32px)] leading-[1.1] font-bold tracking-[-.025em] text-balance">
          Elektronická verzia zatiaľ nie je dostupná.
        </h2>
        <p className="mt-4 max-w-[48ch] text-base leading-[1.6] text-[var(--color-copy)] text-pretty">
          Číslo {label} časopisu {magazineTitle} si môžete objednať v tlačenej podobe.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={backHref} className={buttonPrimary}>
            ← Späť na vydanie
          </Link>
          <Link href={editionsHref} className={buttonSecondary}>
            Všetky vydania
          </Link>
          <a href={mailto(`Objednávka výtlačku – ${magazineTitle} ${label}`)} className={buttonSecondary}>
            Objednať číslo <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
