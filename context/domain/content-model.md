# Content Model

## Status

Domain model implemented as TypeScript contracts (`types/content.ts`) with local fixtures; no Sanity schemas yet. This replaces a relational database map. Working keys are `pvk`/`sbd`; SPD wording from the brief awaits editorial confirmation. Magazine identity is independent of hostname.

## Documents

| Entity | Fields | Relationships |
| --- | --- | --- |
| magazine | ID, key, title, slug, description/audience, ordered benefits/topics, hero presentation/media, optional confirmed publication identifiers | Independent reusable magazine identity; presentation behavior stays in code |
| edition | ID, slug, issue label/title, year, numeric order, description, optional actual publication date, cover, ordered highlights (`V tomto čísle nájdete`: title + optional page), optional PDF, ordered inserts, verified print/inquiry information | Required reference to one magazine |
| editorialPlan | ID, year, ordered entries | Required magazine reference; one published plan per magazine/year |
| advertisement | ID, internal title, advertiser name, desktop image, optional mobile image, accessible text, optional destination | Reusable creative |
| readerAdPlacement | ID, enabled, ordered creative references, selected creative reference, optional fallback | One published reader placement per magazine |
| article | ID, slug, title, excerpt, body, optional image, publication date, section, kind, optional event details | Feature 01 publishes education conference/course/article posts; optional magazine associations, other sections later |
| partner | ID, name, logo/alt text, optional destination, display order | Reusable partner record; verified roster |
| educationOffer | Key, kind (conference/course), label, title, description, image, destination | Evergreen offers linking to their existing pages; dated posts are separate articles |
| siteSettings | Company/contact data, shared links and default metadata | Deliberately managed shared singleton |
| homePageContent | Section text/actions and references to featured editions, articles/magazines, partner selection | Homepage template content; no arbitrary layout/code fields |

Use Sanity-generated IDs for ordinary documents and references for relationships. Stable keys/slugs are business identity, not deterministic CMS ID instructions. Explicit singleton IDs are appropriate only for deliberately managed Studio singletons.

Candidate ad references enable future rotation without copying ads into editions. Implement manual selection first; no weights, scheduling fields or rotation policy until agreed.

See [editorial-content.md](editorial-content.md) for the editable field inventory, hero media and education contracts. Optional page-specific copy may differ intentionally; canonical identity/contact/topic records should not be independently duplicated for home and subpages.

## Assets

- ContentImage: URL, alt text, intrinsic width/height and optional responsive/placeholder data.
- PdfAsset: URL, display filename and optional byte size/page count. Local/Sanity providers return the same shape.
- Actual page count comes from the loaded renderer; fixture metadata is not authoritative.
- Upload covers separately from PDFs. Resolve Sanity references/crop/hotspot in the adapter.
- Keep layout, classes and brand styling in presentation code.
- Sanity article bodies should use Portable Text; define compatible fixture representation before article implementation. Never trust arbitrary raw HTML.

## Editions

Slugs are unique within a magazine; reader resolution requires both identities. Require cover/identity for archive publication but allow no PDF so historical covers remain visible. Show an explicit reading-unavailable state rather than constructing nonexistent URLs.

Order years descending and issues by numeric order with a stable tie-breaker. Labels may be combined/special issues; lexical order is insufficient. Planned issues do not automatically become published edition records.

## Vkladačky

Embed an ordered optional insert list in an edition: stable entry key, title, optional description/preview, paper format, physical sheet count, sponsor credit and optional digital PdfAsset. Each record is scoped to its parent edition. Printed presence does not imply a digital file; multiple sheets and digital page counts are distinct. Feature 01 displays metadata/previews without PDF reading, file merging or inferred standalone sales. Detailed digital viewing needs a future reader-spec extension.

## Editorial Plan Entries

Embed entries in annual plans: stable entry key, issue label, numeric order, optional theme/note, planned distribution/publication timing (exact `YYYY-MM-DD` or month precision `YYYY-MM`), optional submission deadline and optional reference to a published edition.

Do not invent a day for month-only timing. Validate precision choices and year consistency; review combined/cross-year special issues explicitly. Submission deadlines and distribution dates are distinct.

Support past/current/future years without deriving cadence from the homepage's `4×` marketing statistic. Default to current Europe/Bratislava year if available, otherwise next available future year, otherwise latest past year, always showing the chosen year. Empty availability gets a clear state.

The [legacy PVK plan](https://voc.sk/plynar-vodar-kurenar-klimatizacia/media-plan/) provides structural inspiration. Historical values require review and must not be treated as validated dates.

## Publication and Validation

Public reads include published documents only. Validate magazine references, unique scoped edition slugs, one annual plan per title/year and one placement per title. A selected creative must be in that placement's candidate list; cross-magazine creative reuse requires explicit placement configuration.

Validate PDF type, image dimensions, accessible labels and link protocols; allow suitable internal paths/HTTP(S), reject script URLs. Public assets are delivery files, not protected documents. Studio authentication does not secure raw PDF URLs. Keep contracts/commercial negotiations and private information outside public content documents.

Before integration confirm article associations, actual publication records, full cover inventory and approved schedules, then map schema/query results into stable domain contracts.
