import { HOUSE_AD, resolveReaderAd } from "@/lib/advertising/resolve-reader-ad";
import type { ContentProvider } from "@/lib/content/provider";
import type { MagazineKey, ReaderAd, ReaderPageData } from "@/types/content";

export interface ReaderPageQuery {
  magazineSlug: string;
  editionSlug: string;
}

/**
 * Reader composition: magazine first, then its own edition (a matching slug
 * in another magazine never substitutes), then that magazine's banner.
 * Null means unknown identities (route 404). Edition read failures throw;
 * the optional ad read degrades to the house banner and is logged.
 */
export async function getReaderPageDataFrom(
  provider: ContentProvider,
  { magazineSlug, editionSlug }: ReaderPageQuery,
): Promise<ReaderPageData | null> {
  const magazine = await provider.getMagazineBySlug(magazineSlug);
  if (!magazine) return null;
  const edition = await provider.getEdition(magazine.key, editionSlug);
  if (!edition) return null;

  const ad = await resolveMagazineAd(provider, magazine.key);
  const { key, slug, title, shortTitle, abbreviation, audience, description, readers } = magazine;
  return {
    magazine: { key, slug, title, shortTitle, abbreviation, audience, description, readers },
    edition: {
      magazineKey: edition.magazineKey,
      slug: edition.slug,
      label: edition.label,
      year: edition.year,
      cover: edition.cover,
      ...(edition.pdf ? { pdf: edition.pdf } : {}),
    },
    ad,
  };
}

async function resolveMagazineAd(provider: ContentProvider, magazineKey: MagazineKey): Promise<ReaderAd> {
  try {
    return resolveReaderAd(await provider.getReaderAdPlacement(magazineKey));
  } catch (error) {
    console.error(`[reader-ad] Placement read failed for "${magazineKey}"; using the house banner.`, error);
    return HOUSE_AD;
  }
}
