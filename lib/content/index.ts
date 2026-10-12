import "server-only";

import type { ContentProvider } from "@/lib/content/provider";
import { mockProvider } from "@/lib/content/providers/mock";
import { getReaderPageDataFrom, type ReaderPageQuery } from "@/lib/content/reader";

/**
 * Server-only content facade. Pages call these operations; they never import
 * fixtures or CMS queries directly. Provider selection is explicit — the
 * Sanity adapter will be added here at final integration, and a missing
 * production configuration must fail loudly instead of serving fixtures.
 */
function selectProvider(): ContentProvider {
  const source = process.env.CONTENT_SOURCE ?? "mock";
  if (source === "mock") return mockProvider;
  throw new Error(`Unsupported CONTENT_SOURCE "${source}".`);
}

const provider = selectProvider();

export const getPartners = provider.getPartners;
export const getMagazines = provider.getMagazines;
export const getMagazineBySlug = provider.getMagazineBySlug;
export const getMagazine = provider.getMagazine;
export const getEditionYears = provider.getEditionYears;
export const getEditions = provider.getEditions;
export const getEdition = provider.getEdition;
export const getLatestEditions = provider.getLatestEditions;
export const getEditorialPlanYears = provider.getEditorialPlanYears;
export const getEditorialPlan = provider.getEditorialPlan;
export const getArticles = provider.getArticles;
export const getArticleBySlug = provider.getArticleBySlug;
export const getEducationOffers = provider.getEducationOffers;
export const getReaderAdPlacement = provider.getReaderAdPlacement;

/** Reader route data: magazine → its edition → that magazine's resolved banner. */
export function getReaderPageData(query: ReaderPageQuery) {
  return getReaderPageDataFrom(provider, query);
}
