import type { AdCreative, ReaderAdPlacement } from "@/types/content";

/**
 * FIXTURE reader advertising. Creatives are clearly marked samples
 * ("Ukážková firma …") in the proposed leaderboard geometry: desktop
 * 970×90 and mobile 320×100, supplied at 2× density. Replace with real
 * creatives through Sanity; editions never carry an ad copy.
 */

const firmaA: AdCreative = {
  id: "ad-ukazka-firma-a",
  title: "Ukážka – firma A (PVK)",
  advertiser: "Ukážková firma A",
  image: {
    src: "/images/ads/ukazka-firma-a-970x90.jpg",
    alt: "Ukážková firma A – vykurovacia technika pre bytové domy",
    width: 1940,
    height: 180,
  },
  mobileImage: {
    src: "/images/ads/ukazka-firma-a-320x100.jpg",
    alt: "Ukážková firma A – vykurovacia technika",
    width: 640,
    height: 200,
  },
  href: "https://www.tzbportal.sk/",
};

const firmaB: AdCreative = {
  id: "ad-ukazka-firma-b",
  title: "Ukážka – firma B (SBD)",
  advertiser: "Ukážková firma B",
  image: {
    src: "/images/ads/ukazka-firma-b-970x90.jpg",
    alt: "Ukážková firma B – správa a údržba bytových domov",
    width: 1940,
    height: 180,
  },
  mobileImage: {
    src: "/images/ads/ukazka-firma-b-320x100.jpg",
    alt: "Ukážková firma B – správa bytových domov",
    width: 640,
    height: 200,
  },
  // No destination: the banner is shown but not clickable.
};

const firmaC: AdCreative = {
  id: "ad-ukazka-firma-c",
  title: "Ukážka – firma C",
  advertiser: "Ukážková firma C",
  image: {
    src: "/images/ads/ukazka-firma-c-970x90.jpg",
    alt: "Ukážková firma C – meranie a rozúčtovanie tepla",
    width: 1940,
    height: 180,
  },
  mobileImage: {
    src: "/images/ads/ukazka-firma-c-320x100.jpg",
    alt: "Ukážková firma C – rozúčtovanie tepla",
    width: 640,
    height: 200,
  },
  href: "https://www.tzbportal.sk/",
};

/** Published placements: PVK shows firm A on every PVK edition, SBD independently shows firm B. */
export const mockReaderAdPlacements: ReaderAdPlacement[] = [
  { magazineKey: "pvk", enabled: true, candidates: [firmaA, firmaC], selectedId: firmaA.id },
  { magazineKey: "sbd", enabled: true, candidates: [firmaB, firmaC], selectedId: firmaB.id, fallback: firmaC },
];

/** Failure scenarios exercised by tests (one live placement per magazine cannot show them all). */
export const mockAdPlacementCases = {
  disabled: { magazineKey: "pvk", enabled: false, candidates: [firmaA], selectedId: firmaA.id, fallback: firmaC },
  selectionNotInCandidates: { magazineKey: "pvk", enabled: true, candidates: [firmaA], selectedId: firmaB.id, fallback: firmaC },
  brokenSelectedNoFallback: {
    magazineKey: "sbd",
    enabled: true,
    candidates: [{ ...firmaB, image: { ...firmaB.image, alt: "" } }],
    selectedId: firmaB.id,
  },
  missing: null,
} satisfies Record<string, ReaderAdPlacement | null>;
