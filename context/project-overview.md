# VOC.SK

## Overview

VOC.SK is the public website of V.O.Č. SLOVAKIA s.r.o., a specialist publisher for professionals in building management and technical building services. This project develops the selected design at https://voc-d.thegrandpoints.com into the replacement for https://voc.sk.

Two distinct magazines share one publisher and content system:

| Magazine | Audience | Working key |
| --- | --- | --- |
| Plynár – Vodár – Kúrenár + Klimatizácia (PVK) | Heating, water, gas, air conditioning, ventilation and related professions | `pvk` |
| Správca bytových domov | Building managers, owners' associations and housing cooperatives | `sbd` |

The brief calls the second title SPD; existing website assets/code use SBD. Keep `sbd` as the technical key and confirm the preferred public abbreviation before final copy approval. Each title needs its own page, full cover archive, editions, editorial schedule and advertising context.

## Goals

1. Preserve the chosen VOC design while developing explicitly requested content/layout changes.
2. Give each magazine a distinct subpage displaying the front cover of every supplied edition, organized by year.
3. Support the publisher's stated identifier application requirement, described in the brief as ISBN: separate magazine pages and edition covers. These are publisher-supplied project requirements, not verified eligibility criteria or a guarantee of approval.
4. Provide on-site PDF reading with a magazine-specific advertising rectangle above the reader.
5. Let the owner manage agreed site text/media, magazine content, editions and vkladačky, PDF uploads, advertisements, editorial schedules and education posts through Sanity.
6. Keep operating costs as low as practical through cached content, efficient assets and on-demand PDF rendering. Free-tier suitability depends on measured usage.
7. Continue presenting the publisher, publications, education, services and contact information already represented in the chosen homepage.

## Visitor and Owner Flows

Visitors discover a magazine, open its page, browse covers by year and open an available edition in the site's reader. Old and new editions display the current advertisement for that magazine. Visitors can view its Edičný plán for current/future years and read published editorial content.

Sanity is integrated last. The intended owner flow is to upload a PDF and separate cover, associate the edition with a magazine, complete metadata and publish. The owner independently updates annual schedules and articles. Selecting/replacing a reader ad once for a magazine changes all of that magazine's reader pages after cache refresh.

Subscriptions, advertising arrangements and payment continue outside the website through the agreed contact links. There is no current requirement for a checkout.

## Scope

### In Scope

- Existing VOC homepage and expressly requested future visual refinements.
- Dedicated PVK and Správca bytových domov pages with all supplied edition covers.
- Magazine directory, per-magazine galleries/edition details and optional printed/digital supplement metadata.
- Iterative magazine-specific homepage hero and content hierarchy, reviewed by the user.
- Responsive PDF reader, magazine-specific ad area and default/error states.
- One manually selected active reader banner per magazine initially.
- Placement/creative separation that supports a later rotation policy.
- Sanity-editable Edičný plán per magazine/year, including future years.
- Vzdelávanie listing/detail pages for education articles and conference/course announcements; broader editorial sections remain future decisions.
- Typed local fixtures/public assets first, with reusable read operations that Sanity can replace later.
- Accessible controls, useful metadata and measured performance/cost checks.

### Outside the Current Scope

- Public sign-in, reader accounts, paywalls, Prisma, Clerk and Vercel Blob.
- Automated ad networks, advertiser accounts, targeting, ad sales/payment or impression billing.
- Automatic rotation and scheduled campaigns until specified.
- Subdomain separation now; keep magazine identity independent of hostname for a possible later split.
- Rebuilding TZBportal.sk or introducing a new visual identity.

## Implementation Approach and Baseline

[Feature 01 — design and website structure](feature-spec/01-design-and-website-structure.md) is an iterative phase covering the hero, homepage hierarchy, magazine pages/galleries, edition supplements, education and editorial plans. Expect many visual-review prompts. Track implemented page/subsystem milestones, not every cosmetic adjustment; preserve major accepted design/data decisions in context. Feature 01 is complete only after user acceptance and structural verification.

[Feature 02 — PDF reader and advertising](feature-spec/02-pdf-reader-and-advertising.md) owns on-site PDF rendering. Feature 01 prepares content and navigation without implementing PDF reading. The [editable-content inventory](domain/editorial-content.md) defines planned Sanity editing within designed templates; Sanity is still integrated last.

The unchanged [AI workflow rules](ai-workflow-rules.md) apply. This context-only task does not change implementation progress; its open decisions stay in these documents. Later implementation work updates the tracker as required.

Currently the repository has the styled homepage, navigation/footer, local images/video and static arrays in `data/homepage.ts` and `data/navigation.ts`. Some links still lead to the existing VOC website/PDFs. Dedicated magazine routes, the reader, provider boundary and Sanity are planned, not implemented. Sample issues/marketing statistics do not establish a complete archive or authoritative publication schedule.

## Success Criteria

1. Each magazine has a distinct page with all supplied covers; absent PDFs do not hide covers.
2. Available editions open with their magazine's current paid banner or fallback above the PDF.
3. One ad update affects that magazine's historical/new editions within the agreed refresh window and does not affect the other title.
4. Editorial plans support independently edited years without assuming a fixed number of issues.
5. Sanity replaces fixtures through stable domain operations without redesigning pages.
6. Representative PDFs, traffic assumptions and service usage are checked before launch.

## Open Decisions

- Public abbreviation for Správca bytových domov; final education labels and any broader editorial classification.
- Complete archive, approved copy, edition metadata and actual editorial schedules.
- Banner dimensions, mobile artwork, default creative and future rotation.
- Reader options beyond its baseline, including download links and sticky/fullscreen ad behavior.
- Production host, expected traffic, PDF sizes and acceptable update delay.
- Publisher confirmation of the identifier process and further requirements.

## References

- [Existing VOC website](https://voc.sk/) — source content/current destinations.
- [Chosen design](https://voc-d.thegrandpoints.com/) — visual reference; local code defines exact styling.
- [PVK Edičný plán](https://voc.sk/plynar-vodar-kurenar-klimatizacia/media-plan/) — schedule structure; historical dates require review.
