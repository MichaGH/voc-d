import type { AdCreative, ContentImage, ReaderAd, ReaderAdCreative, ReaderAdPlacement } from "@/types/content";
import { toSafeHref } from "../url/safe-href.ts";

/**
 * Deterministic reader-banner policy (context/domain/advertising.md):
 *
 * 1. The selected creative of an enabled placement, when it belongs to the
 *    placement's candidates and its artwork/accessible text are usable.
 * 2. Otherwise the placement's valid magazine fallback.
 * 3. Otherwise the built-in VOC house banner.
 *
 * The result is that order as a chain, so a paid image failing in the
 * browser can still fall back to the magazine default and then the house
 * banner without another content read. Another paid candidate is never
 * substituted implicitly. Unsafe or missing destinations produce a
 * non-clickable banner. Pure and synchronous so a later rotation spec can
 * reuse it per candidate.
 */
export function resolveReaderAd(placement: ReaderAdPlacement | null | undefined): ReaderAd {
  if (!placement) return HOUSE_AD;
  const creatives: ReaderAdCreative[] = [];

  if (placement.enabled && placement.selectedId) {
    const selected = placement.candidates.find((candidate) => candidate?.id === placement.selectedId);
    const paid = selected ? toBanner(selected, "paid") : null;
    if (paid) creatives.push(paid);
  }

  const fallback = placement.fallback ? toBanner(placement.fallback, "fallback") : null;
  if (fallback) creatives.push(fallback);
  return { creatives };
}

/** No usable creative: the reader shows its built-in house banner. */
export const HOUSE_AD: ReaderAd = { creatives: [] };

function toBanner(creative: AdCreative, kind: "paid" | "fallback"): ReaderAdCreative | null {
  const image = usableImage(creative.image);
  const advertiser = typeof creative.advertiser === "string" ? creative.advertiser.trim() : "";
  if (!image || !advertiser) return null;

  const mobileImage = usableImage(creative.mobileImage) ?? undefined;
  const href = toSafeHref(creative.href) ?? undefined;
  return { kind, advertiser, image, ...(mobileImage ? { mobileImage } : {}), ...(href ? { href } : {}) };
}

/** Artwork needs a source, intrinsic dimensions and accessible text. */
function usableImage(image: ContentImage | undefined): ContentImage | null {
  if (!image || typeof image.src !== "string" || !image.src.trim()) return null;
  if (typeof image.alt !== "string" || !image.alt.trim()) return null;
  if (!isPositive(image.width) || !isPositive(image.height)) return null;
  if (!toSafeHref(image.src)) return null;
  return { src: image.src, alt: image.alt.trim(), width: image.width, height: image.height };
}

function isPositive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
