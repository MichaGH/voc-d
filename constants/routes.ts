import type { MagazineKey } from "@/types/content";

/**
 * Central public route registry. Magazine slugs are business identity and
 * belong here, not in editable labels, so copy edits cannot break routing.
 */
export const MAGAZINE_SLUGS: Record<MagazineKey, string> = {
  pvk: "plynar-vodar-kurenar-klimatizacia",
  sbd: "spravca-bytovych-domov",
};

/** Public origin of this website (not the legacy WordPress SITE_URL). Override per deployment. */
export const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://voc.sk";

export const ROUTES = {
  home: "/",
  magazines: "/casopisy",
  education: "/vzdelavanie",
  advertising: "/inzercia",
  about: "/o-nas",
  /** Homepage anchors must be absolute so they work from subpages. */
  contact: "/#kontakt",
} as const;

export function magazinePath(key: MagazineKey) {
  return `/${MAGAZINE_SLUGS[key]}`;
}

export function editionsPath(key: MagazineKey) {
  return `${magazinePath(key)}/vydania`;
}

export function editionPath(key: MagazineKey, editionSlug: string) {
  return `${editionsPath(key)}/${editionSlug}`;
}

export function editorialPlanPath(key: MagazineKey) {
  return `${magazinePath(key)}/edicny-plan`;
}

export function subscriptionPath(key: MagazineKey) {
  return `${magazinePath(key)}#predplatne`;
}

export function articlePath(slug: string) {
  return `${ROUTES.education}/${slug}`;
}

export function magazineKeyFromSlug(slug: string): MagazineKey | null {
  const entry = (Object.entries(MAGAZINE_SLUGS) as [MagazineKey, string][]).find(
    ([, value]) => value === slug,
  );
  return entry ? entry[0] : null;
}

/** Only the homepage opens with a full-bleed navy hero, where the header starts transparent. */
export function hasOverlayHeader(pathname: string) {
  return pathname === ROUTES.home;
}
