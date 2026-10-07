import { mockArticles, mockEducationOffers } from "@/data/mock/articles";
import { mockEditions } from "@/data/mock/editions";
import { mockEditorialPlans } from "@/data/mock/editorial-plans";
import { mockMagazines } from "@/data/mock/magazines";
import { mockPartners } from "@/data/mock/partners";
import type { ContentProvider } from "@/lib/content/provider";
import {
  clampLimit,
  compareArticlesNewestFirst,
  compareEditionsNewestFirst,
  paginate,
} from "@/lib/content/rules";
import type {
  Article,
  ArticleSummary,
  Edition,
  EditionSummary,
  Magazine,
  MagazineSummary,
} from "@/types/content";

function toMagazineSummary(magazine: Magazine): MagazineSummary {
  const { key, slug, title, shortTitle, abbreviation, audience, description, readers } = magazine;
  return { key, slug, title, shortTitle, abbreviation, audience, description, readers };
}

function toEditionSummary(edition: Edition): EditionSummary {
  const { magazineKey, slug, label, year, order, cover, hasDigitalVersion, insertCount } = edition;
  return { magazineKey, slug, label, year, order, cover, hasDigitalVersion, insertCount };
}

function toArticleSummary(article: Article): ArticleSummary {
  const { section, slug, kind, title, excerpt, image, publishedOn, event, magazines } = article;
  return { section, slug, kind, title, excerpt, image, publishedOn, event, magazines };
}

const sortedEditions = [...mockEditions].sort(compareEditionsNewestFirst);
const sortedArticles = [...mockArticles].sort(compareArticlesNewestFirst);

/** Immutable fixture reads with production-equivalent filtering and ordering. */
export const mockProvider: ContentProvider = {
  async getPartners(limit) {
    return limit ? mockPartners.slice(0, clampLimit(limit)) : mockPartners;
  },

  async getMagazines() {
    return mockMagazines.map(toMagazineSummary);
  },

  async getMagazineBySlug(slug) {
    return mockMagazines.find((magazine) => magazine.slug === slug) ?? null;
  },

  async getMagazine(key) {
    return mockMagazines.find((magazine) => magazine.key === key) ?? null;
  },

  async getEditionYears(magazineKey) {
    const years = new Set(sortedEditions.filter((e) => e.magazineKey === magazineKey).map((e) => e.year));
    return [...years].sort((a, b) => b - a);
  },

  async getEditions({ magazineKey, year, cursor, limit }) {
    const items = sortedEditions
      .filter((e) => e.magazineKey === magazineKey && (year === undefined || e.year === year))
      .map(toEditionSummary);
    return paginate(items, cursor, limit);
  },

  async getEdition(magazineKey, editionSlug) {
    return mockEditions.find((e) => e.magazineKey === magazineKey && e.slug === editionSlug) ?? null;
  },

  async getLatestEditions({ magazineKey, limit } = {}) {
    return sortedEditions
      .filter((e) => !magazineKey || e.magazineKey === magazineKey)
      .slice(0, clampLimit(limit, 8))
      .map(toEditionSummary);
  },

  async getEditorialPlanYears(magazineKey) {
    return mockEditorialPlans
      .filter((plan) => plan.magazineKey === magazineKey)
      .map((plan) => plan.year)
      .sort((a, b) => b - a);
  },

  async getEditorialPlan(magazineKey, year) {
    const plan = mockEditorialPlans.find((p) => p.magazineKey === magazineKey && p.year === year);
    if (!plan) return null;
    return { ...plan, entries: [...plan.entries].sort((a, b) => a.order - b.order || a.key.localeCompare(b.key)) };
  },

  async getArticles({ section, magazineKey, kind, cursor, limit }) {
    const items = sortedArticles
      .filter(
        (a) =>
          a.section === section &&
          (!magazineKey || a.magazines.includes(magazineKey)) &&
          (!kind || a.kind === kind),
      )
      .map(toArticleSummary);
    return paginate(items, cursor, limit);
  },

  async getArticleBySlug(section, slug) {
    return mockArticles.find((a) => a.section === section && a.slug === slug) ?? null;
  },

  async getEducationOffers() {
    return mockEducationOffers;
  },
};
