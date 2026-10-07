import type {
  Article,
  ArticleKind,
  ArticlePage,
  ArticleSection,
  Edition,
  EditionPage,
  EditionSummary,
  EditorialPlan,
  EducationOffer,
  Magazine,
  MagazineKey,
  MagazineSummary,
  Partner,
} from "@/types/content";

export interface EditionsQuery {
  magazineKey: MagazineKey;
  year?: number;
  cursor?: string;
  limit?: number;
}

export interface ArticlesQuery {
  section: ArticleSection;
  magazineKey?: MagazineKey;
  kind?: ArticleKind;
  cursor?: string;
  limit?: number;
}

/**
 * Asynchronous read contract implemented by every content source.
 * Null means "absent"; empty arrays mean "no matches". Source failures throw.
 */
export interface ContentProvider {
  getPartners(limit?: number): Promise<Partner[]>;
  getMagazines(): Promise<MagazineSummary[]>;
  getMagazineBySlug(slug: string): Promise<Magazine | null>;
  getMagazine(key: MagazineKey): Promise<Magazine | null>;
  getEditionYears(magazineKey: MagazineKey): Promise<number[]>;
  getEditions(query: EditionsQuery): Promise<EditionPage>;
  getEdition(magazineKey: MagazineKey, editionSlug: string): Promise<Edition | null>;
  getLatestEditions(options?: { magazineKey?: MagazineKey; limit?: number }): Promise<EditionSummary[]>;
  getEditorialPlanYears(magazineKey: MagazineKey): Promise<number[]>;
  getEditorialPlan(magazineKey: MagazineKey, year: number): Promise<EditorialPlan | null>;
  getArticles(query: ArticlesQuery): Promise<ArticlePage>;
  getArticleBySlug(section: ArticleSection, slug: string): Promise<Article | null>;
  getEducationOffers(): Promise<EducationOffer[]>;
}
