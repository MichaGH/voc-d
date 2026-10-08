/**
 * Provider-independent content contracts.
 *
 * Fixtures (data/mock) and the future Sanity adapter both map into these
 * shapes. Records carry semantic content only — no Tailwind classes, layout
 * sizes or other presentation decisions.
 */

export type MagazineKey = "pvk" | "sbd";

export interface ContentImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ContentVideo {
  src: string;
  mimeType: string;
}

export interface ContentLink {
  label: string;
  href: string;
}

/* ------------------------------------------------------------------ */
/* Magazines                                                           */
/* ------------------------------------------------------------------ */

export interface MagazineTopic {
  key: string;
  title: string;
  description: string;
  image?: ContentImage;
}

/** Per-magazine homepage hero presentation. Motion/layout stays in code. */
export interface MagazineHeroContent {
  headline: string;
  summary: string;
  poster: ContentImage;
  /** Optional: a magazine without approved footage shows its poster only. */
  video?: ContentVideo;
}

export interface MagazineSummary {
  key: MagazineKey;
  slug: string;
  title: string;
  shortTitle: string;
  abbreviation: string;
  audience: string;
  description: string;
  readers: string;
}

export interface Magazine extends MagazineSummary {
  intro: string;
  /** One-sentence statement of who the magazine is for. */
  audienceStatement: string;
  /** Optional part of the statement to emphasise; must occur in audienceStatement. */
  audienceHighlight?: string;
  readerGroups: string[];
  /** Representative photograph for the magazine page. */
  image: ContentImage;
  topics: MagazineTopic[];
  hero: MagazineHeroContent;
  subscription: {
    title: string;
    text: string;
  };
  /** Existing advertising information on the current VOC website. */
  advertisingInfoUrl: string;
}

/* ------------------------------------------------------------------ */
/* Editions                                                            */
/* ------------------------------------------------------------------ */

export interface PdfAsset {
  url: string;
  filename: string;
  byteSize?: number;
  /** Hint only — the loaded renderer's page count is authoritative. */
  pageCount?: number;
}

export type PaperFormat =
  | { kind: "A4" }
  | { kind: "A5" }
  | { kind: "other"; label: string };

/** Vkladačka — an optional printed/digital insert belonging to one edition. */
export interface EditionInsert {
  key: string;
  title: string;
  description?: string;
  preview?: ContentImage;
  paperFormat?: PaperFormat;
  /** Physical printed sheets — distinct from any digital page count. */
  physicalSheetCount?: number;
  sponsor?: string;
  /** Digital file, when one exists. Printed presence never implies this. */
  digital?: PdfAsset;
}

export interface EditionSummary {
  magazineKey: MagazineKey;
  slug: string;
  /** Printed issue label, e.g. "4/2026" or "5–6/2026". */
  label: string;
  year: number;
  /** Numeric order within the year; combined issues use their first number. */
  order: number;
  cover: ContentImage;
  hasDigitalVersion: boolean;
  insertCount: number;
}

export interface Edition extends EditionSummary {
  description?: string;
  /** Exact publication date (YYYY-MM-DD) when confirmed. */
  publishedOn?: string;
  pdf?: PdfAsset;
  inserts: EditionInsert[];
}

export interface EditionPage {
  items: EditionSummary[];
  nextCursor: string | null;
}

/* ------------------------------------------------------------------ */
/* Editorial plans                                                     */
/* ------------------------------------------------------------------ */

/** Exact day (YYYY-MM-DD) or month-only (YYYY-MM) precision. */
export type PlanDate =
  | { precision: "day"; value: string }
  | { precision: "month"; value: string };

export interface EditorialPlanEntry {
  key: string;
  issueLabel: string;
  order: number;
  distribution: PlanDate;
  submissionDeadline?: PlanDate;
  theme?: string;
  note?: string;
  /** Set once the planned issue exists as a published edition. */
  editionSlug?: string;
}

export interface EditorialPlan {
  magazineKey: MagazineKey;
  year: number;
  entries: EditorialPlanEntry[];
}

/* ------------------------------------------------------------------ */
/* Articles (education section)                                        */
/* ------------------------------------------------------------------ */

export type ArticleSection = "education";
export type ArticleKind = "conference" | "course" | "article";

/** Minimal Portable Text–compatible rich text subset. */
export interface PortableTextSpan {
  _type: "span";
  _key: string;
  text: string;
  marks?: string[];
}

export interface PortableTextLinkDef {
  _type: "link";
  _key: string;
  href: string;
}

export interface PortableTextBlock {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3" | "blockquote";
  listItem?: "bullet" | "number";
  level?: number;
  children: PortableTextSpan[];
  markDefs?: PortableTextLinkDef[];
}

export interface EventDate {
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm in the event timezone, when known. */
  time?: string;
}

export interface EventDetails {
  start: EventDate;
  end?: EventDate;
  timeZone: string;
  location?: string;
  registration?: ContentLink;
}

export interface ArticleSummary {
  section: ArticleSection;
  slug: string;
  kind: ArticleKind;
  title: string;
  excerpt: string;
  image?: ContentImage;
  /** YYYY-MM-DD — distinct from any event date. */
  publishedOn: string;
  event?: EventDetails;
  magazines: MagazineKey[];
}

export interface Article extends ArticleSummary {
  body: PortableTextBlock[];
  /** Evergreen offer this post relates to (e.g. the course page). */
  relatedOffer?: ContentLink;
}

export interface ArticlePage {
  items: ArticleSummary[];
  nextCursor: string | null;
}

/** Evergreen conference/course offers linking to their existing pages. */
export interface EducationOffer {
  key: string;
  kind: Exclude<ArticleKind, "article">;
  label: string;
  title: string;
  description: string;
  image: ContentImage;
  href: string;
}

/* ------------------------------------------------------------------ */
/* Partners                                                            */
/* ------------------------------------------------------------------ */

export interface Partner {
  key: string;
  name: string;
  logo?: ContentImage;
  href?: string;
}
