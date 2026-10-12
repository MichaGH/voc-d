import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PdfReader from "@/components/pdf-reader/PdfReader";
import ReaderAdBanner from "@/components/pdf-reader/ReaderAdBanner";
import { mailto } from "@/constants";
import { editionsPath, subscriptionPath } from "@/constants/routes";
import { getEditions, getMagazines, getReaderPageData } from "@/lib/content";

export const dynamicParams = false;

/** Bounded read, matching the edition archive. */
const ARCHIVE_LIMIT = 48;

/** Every known edition has its page; print-only editions show the cover with an order action. */
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
    title: `${magazine.title} ${edition.label}`,
    description: edition.pdf
      ? `Čítajte číslo ${edition.label} časopisu ${magazine.title} online.`
      : `Číslo ${edition.label} časopisu ${magazine.title}.`,
    openGraph: { images: [{ url: edition.cover.src, width: edition.cover.width, height: edition.cover.height }] },
  };
}

/** The edition page: the magazine opened full screen, without the site navigation. */
export default async function EditionReaderPage({ params }: PageProps<"/[magazineSlug]/citat/[editionSlug]">) {
  const data = await getReaderPageData(await params);
  if (!data) notFound();
  const { magazine, edition, ad } = data;
  const title = `${magazine.title} ${edition.label}`;

  return (
    <main id="obsah" className="flex h-[100dvh] flex-col overflow-hidden bg-white">
      <h1 className="sr-only">{title}</h1>
      <div className="shrink-0 px-3 pt-3 sm:px-5 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,970px)_minmax(0,1fr)] xl:items-center xl:gap-6">
        <div className="flex items-center justify-between gap-3 xl:contents">
          <Link
            href={editionsPath(magazine.key)}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] pr-3 pl-2 text-[15px] font-semibold text-[var(--color-navy)] no-underline transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)] xl:order-1 xl:justify-self-start"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Všetky vydania
          </Link>
          <Link
            href={subscriptionPath(magazine.key)}
            className="inline-flex h-10 items-center rounded-[10px] bg-[var(--color-primary)] px-4 text-[15px] font-semibold text-white no-underline transition-colors hover:bg-[var(--color-navy)] hover:text-white xl:order-3 xl:justify-self-end"
          >
            Predplatiť<span className="sr-only"> {magazine.title}</span>
          </Link>
        </div>
        <div className="mt-2 xl:order-2 xl:mt-0">
          <ReaderAdBanner ad={ad} magazineTitle={magazine.title} />
        </div>
      </div>

      <PdfReader
        pdf={edition.pdf}
        cover={edition.cover}
        identity={{ magazineTitle: magazine.title, abbreviation: magazine.abbreviation, label: edition.label }}
        title={title}
        inserts={edition.inserts}
        orderHref={mailto(`Objednávka výtlačku – ${title}`)}
        subscribeHref={subscriptionPath(magazine.key)}
      />
    </main>
  );
}
