# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 01 — iterative design and website structure: **active, first complete prototype implemented and in review.** Not approved; not complete.

## Current Goal

- Owner/user visual review of the hero prototype and the new page family, then iterate on their feedback.

## Completed

- Nothing is marked complete — feature 01 completes only after user acceptance (see feature spec).

## In Progress (implemented, awaiting review)

- **Content layer:** `types/content.ts`, server-only facade `lib/content/index.ts` (explicit `CONTENT_SOURCE`, defaults to `mock`, unknown values throw), provider contract, mock provider, pure ordering/pagination/plan rules (`lib/content/rules.ts`), typed fixtures in `data/mock/`. Pages read through the facade only.
- **Hero prototype (unit 1):** two-magazine selector hero (`components/hero/MagazineHeroStage.tsx`, GSAP + `@gsap/react`). Hover-intent/tap/keyboard selection, tabs semantics, inert hidden panel, latest-selection-wins motion, PVK video loaded only on activation, SBD honest still poster, pause control, off-screen/hidden-tab pause, reduced-motion and data-saver handling.
- **Homepage label/copy changes:** `Partneri`, `Vždy o krok vpred`, TopicsSection removed (its topics moved to magazine pages, its subscription CTA preserved as `SubscribeBand`), internal links for magazines/editions/education, education posts preview.
- **Navigation:** navbar/footer in root layout; overlay header only on routes with a navy hero (`hasOverlayHeader`), solid elsewhere; accessible `Časopisy` disclosure with per-magazine links; expanded footer.
- **Pages (units 2–5):** `/casopisy`, both magazine landings, `/[magazine]/vydania`, edition detail with Vkladačky, `/[magazine]/edicny-plan` with year tabs, `/vzdelavanie` listing and article detail, styled `not-found`. Unknown and cross-magazine slugs return 404 (`dynamicParams = false`).
- **Verification done:** `tsc`, `eslint`, `next build` (all routes static/SSG), Playwright checks at 1440px and 390px (no overflow, no broken images, 404s), hero interaction/video/reduced-motion checks.

## Review Round 1 (applied, awaiting review)

- Shared type/spacing/button scale; unified eyebrows; aligned containers.
- Magazine landing rebuilt as a presentation page (removed latest-issue contents and next-issue card).
- Navbar magazines menu rebuilt as a two-item cover list; `Porovnať oba časopisy` and the `/casopisy` comparison block removed.
- Homepage: removed the duplicate `Novinky a pozvánky` list; simplified magazine cards and the latest-issues rail.

## Review Round 2 (applied, awaiting review)

- New pages `/o-nas` and `/inzercia`; navigation and CTAs point to them. The homepage "Pre tých, ktorí budovy…" section moved to `/o-nas` (component kept).
- Edition `highlights` ("V tomto čísle nájdete") removed from the content model, fixtures and UI; no vkladačka counts on edition cards.
- Magazine landing rebuilt (light cover hero, photographic audience band, topic explorer); edition detail rebuilt around one obvious order action; gallery/plan headers use a magazine switcher; plan shown as issue cards.
- Topic images restored (two new stills extracted from the PVK footage: `topic-pvk-voda.jpg`, `topic-pvk-klima.jpg`).

## Next Up

- Collect review feedback on the hero (composition, copy, motion intensity, optional auto-cycling) and the page templates.
- Replace fixture placeholders with owner-approved content: editorial-plan dates, vkladačky, education copy, partner roster, magazine copy.
- Owner content for `/o-nas` (history, team, company details) and `/inzercia` (formats, price list) to replace links to the old website.
- Unit 6: cross-page consistency pass, sitemap/robots once the production origin is known, homepage copy migration into `getHomePageContent`/`getSiteSettings`.
- Feature 02 (reader) after feature 01 acceptance.

## Open Questions

- **SBD hero footage:** no SBD-specific video exists; the SBD slide uses a still poster (`public/images/hero-sbd.jpg`, cropped from the former hero image). Approved footage needed.
- **Fixtures needing owner data:** editorial-plan dates/themes are illustrative; the two vkladačky records are illustrative; education article bodies are neutral drafts; partner names are unverified.
- Hero headlines per magazine (`Technika budov, ktorá obstojí v praxi.` / `Spravujte bytové domy s istotou.`) are working copy.
- Production origin (`NEXT_PUBLIC_SITE_ORIGIN`, defaults to `https://voc.sk`) and hero video hosting.
- Public SBD/SPD abbreviation (UI currently shows `SBD` on subscription buttons as before).

## Architecture Decisions

- Magazine routes live in the `app/(magazines)/[magazineSlug]` group with `generateStaticParams` + `dynamicParams = false`; the reader route `/[magazineSlug]/citat/...` stays unimplemented (404) until feature 02.
- Date-dependent pages (landing next-issue teaser, plans, education) use `revalidate = 86400`; everything else is static. Caching for Sanity is decided at integration.
- Edition detail pages show PDF availability as a label only (`Čítanie na webe pripravujeme` / `Zatiaľ nie je dostupná`); no reading links.

## Session Notes

- `next dev` rewrites the managed block in `AGENTS.md`; commit it with the work.
- Playwright's bundled Chromium cannot decode H.264, so the hero shows its poster there; video logic was verified with a temporary WebM copy (removed).
