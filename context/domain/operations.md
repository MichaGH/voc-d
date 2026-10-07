# Content Operations

## Boundary and Status

Implemented for fixtures: domain interfaces in `types/content.ts`, provider interface in `lib/content/provider.ts`, public server-only exports in `lib/content/index.ts` and the mock adapter in `lib/content/providers/mock.ts` using `data/mock/`. Not yet implemented: getSiteSettings, getHomePageContent, getReaderAdPlacement, getReaderPageData. Add Sanity last.

Every read is asynchronous from day one. Pages use the facade; adapters normalize source data. UI never selects the provider.

## Public Read Contracts

| Operation | Input | Result |
| --- | --- | --- |
| getSiteSettings | None | Shared publisher/contact/metadata content |
| getHomePageContent | None | Homepage copy/actions and bounded featured records; no styling classes |
| getPartners | Optional bounded selection | Published names/logos/destinations in display order |
| getMagazines | None | Published summaries in stable order |
| getMagazineBySlug | Full magazine slug | Magazine or null |
| getMagazine | Magazine key | Magazine or null |
| getEditionYears | Magazine key | Descending years with public cover records |
| getEditions | magazineKey, optional year/cursor, bounded limit | Summary page and next cursor |
| getEdition | magazineKey, editionSlug | Matching detail or null |
| getLatestEditions | Optional magazineKey, bounded limit | Homepage summaries |
| getEditorialPlanYears | Magazine key | Published plan years, including future years |
| getEditorialPlan | magazineKey, explicit year | Plan or null; no silent year substitution |
| getReaderAdPlacement | Magazine key | Placement/candidate data or null |
| getReaderPageData | magazineSlug, editionSlug | Matching magazine/edition and resolved ad, or null |
| getArticles | section, optional magazine/kind filter, cursor, bounded limit | Published summaries; initial section is education |
| getArticleBySlug | section, article slug | Scoped published detail or null; feature 01 uses education |
| getEducationOffers | None | Evergreen conference/course offers in display order |

Use object interfaces and a narrow magazine-key union. Keep summaries/detail types distinct and exclude PDF bytes/article bodies from lists. Defaults: page size 12, maximum 48, opaque offset cursors (invalid cursors restart at the first page).

Feature 01 defines education as the initial article section. getArticles takes a section filter plus optional magazine/kind filter and bounded pagination; getArticleBySlug verifies that section so education URLs cannot display unrelated posts. Event occurrence and article publication dates are separate. Homepage reads reuse featured records rather than copying whole article bodies into cards.

Magazine details include their own topic/benefit and hero content. Edition details expose ordered insert metadata and optional asset availability without fetching file bytes; the initial gallery/detail pages never initialize a reader. Site settings/navigation labels are content while supported route construction remains centralized frontend configuration.

## Reader Composition

Resolve the magazine, then its edition; never substitute an edition from another title with the same slug. Load/resolve that magazine's ad using [advertising.md](advertising.md). Pass minimal page/PDF/banner props to UI. A known cover-only edition is valid without a PDF; unknown/mismatched identities return null for the route's not-found response.

No visitor-facing content mutations. Sanity Studio handles editing.

## Provider Replacement

- Mock: immutable fixture reads, local asset URLs and production-equivalent filtering/order/empty states.
- Sanity: bounded parameterized GROQ projections of published content; resolve/validate/map references/assets; generated query types stay internal.
- Selection: explicit server configuration; missing production configuration is an error, never silent demo fallback.
- Current fixture styling fields such as eyebrowClass stay out of domain contracts. Map semantic identity to existing classes in components.

## Errors and Caching

Null means absent; empty arrays mean no matches. CMS failure is distinct and must not become a false 404/empty archive. Serve previously valid cache where supported or show retry/error handling. Optional placement failures use the built-in banner while recording the failure server-side.

Cache policy belongs at the read boundary with scoped magazine/edition/plan/article/placement keys/tags. Validate inputs before queries/cache keys. Server Components call operations directly without unnecessary internal HTTP routes.

## Verification

Check both magazines, duplicate issue labels across titles, mismatched routes, numeric/combined issue ordering, pagination, future plans, absent PDFs and placements. Sanity must preserve these cases and consumer contracts.
