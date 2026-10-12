# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 01 — iterative design and website structure: **active, first complete prototype implemented and in review.** Not approved; not complete.
- Feature 02 — PDF reader and advertising: **units 1–5 implemented with fixtures; Part B owner revision applied (full-screen reader, page turn, edition page = reader, Čítať/Predplatiť under covers, primary blue); Part C applied (reading modes, transparent top bar, hideable bottom bar), awaiting review.** Unit 6 (Sanity) not started. Not approved; not complete.

## Current Goal

- Owner/user visual review of the hero prototype and the new page family, then iterate on their feedback.
- Owner review of the reader (default whole-spread fit, side arrows, banner geometry) and real issue PDFs for measurement.

## Completed

- Nothing is marked complete — feature 01 completes only after user acceptance (see feature spec).

## In Progress (implemented, awaiting review)

- **Content layer:** `types/content.ts`, server-only facade `lib/content/index.ts` (explicit `CONTENT_SOURCE`, defaults to `mock`, unknown values throw), provider contract, mock provider, pure ordering/pagination/plan rules (`lib/content/rules.ts`), typed fixtures in `data/mock/`. Pages read through the facade only.
- **Hero prototype (unit 1):** two-magazine selector hero (`components/hero/MagazineHeroStage.tsx`, GSAP + `@gsap/react`). Hover-intent/tap/keyboard selection, tabs semantics, inert hidden panel, latest-selection-wins motion, PVK video loaded only on activation, SBD honest still poster, pause control, off-screen/hidden-tab pause, reduced-motion and data-saver handling.
- **Homepage label/copy changes:** `Partneri`, `Vždy o krok vpred`, TopicsSection removed (its topics moved to magazine pages, its subscription CTA preserved as `SubscribeBand`), internal links for magazines/editions/education, education posts preview.
- **Navigation:** navbar/footer in root layout; overlay header only on routes with a navy hero (`hasOverlayHeader`), solid elsewhere; accessible `Časopisy` disclosure with per-magazine links; expanded footer.
- **Pages (units 2–5):** `/casopisy`, both magazine landings, `/[magazine]/vydania`, edition detail with Vkladačky, `/[magazine]/edicny-plan` with year tabs, `/vzdelavanie` listing and article detail, styled `not-found`. Unknown and cross-magazine slugs return 404 (`dynamicParams = false`).
- **Verification done:** `tsc`, `eslint`, `next build` (all routes static/SSG), Playwright checks at 1440px and 390px (no overflow, no broken images, 404s), hero interaction/video/reduced-motion checks.

## Feature 02 — Part C revision (applied, awaiting review)

- Top bar transparent (no background, no visible `Inzercia` label); spreads fitted below it, overview/continuous views scroll under it and under the bottom bar.
- Three modes in the bar: Listovanie (book; pages are click targets — ring while the page renders, then continuous reading at that page; no text selection), Náhľad strán (fixed-size 282 px pages, 4/3/1 columns, spacing-only resize then brief shrink), Strany pod sebou (≈87 % width, no gaps, selectable text/links, arrow keys in small steps, zoom 50–200 %). Phone bar: single mode button with a menu, compact inserts button and page field.
- Bottom bar hide tab (slides to a 4 px line). New pure modules `lib/pdf-reader/grid.ts`, `scroll.ts` (+ tests), views `GridView.tsx`, `ScrollView.tsx`.

## Feature 02 — Part B revision (applied, awaiting review)

- Routes split into `app/(site)` (SiteChrome: navbar/footer) and `app/(reader)`; edition detail page removed with a redirect to the reader; `editionPath()` = reader.
- `EditionActions` (Čítať/Objednať + Predplatiť) under covers in gallery, homepage rail, landing; hero/landing lead with `Čítať číslo …`; `O časopise` naming.
- Reader rebuilt full screen: top back/Predplatiť, banner, contained stage, side arrows, blue bottom bar (`ReaderBar`: home, VOC / title issue, zoom, « ‹ input › »), `PageTurn` 3D animation, inserts panel with in-reader insert PDFs (sample `pvk-4-2026-pozvanka.pdf`), ±10 jumps (`jumpPage`).
- `--color-primary` applied site-wide to primary surfaces/buttons. Sample mobile creatives for all ad fixtures.

## Feature 02 — Reader (implemented, awaiting review)

- **Unit 1 — contracts/rules/fixtures:** `AdCreative`, `ReaderAdPlacement`, `ReaderAd` chain and `ReaderPageData` in `types/content.ts`; pure `lib/pdf-reader/navigation.ts` (pairing 1, 2–3, 4–5…, bounds, jumps, page input), `lib/pdf-reader/zoom.ts` (fit, zoom steps, density cap), `lib/advertising/resolve-reader-ad.ts`, `lib/url/safe-href.ts`; `getReaderAdPlacement` (provider) and `getReaderPageData` (facade); fixtures `data/mock/advertising.ts`, PDFs in `public/pdfs/` (now the original issues PVK 1–4/2026 and SBD 1–2/2026; PVK editions share one ad); sample creatives in `public/images/ads/`. Legacy voc.sk PDF URLs removed. 40 unit tests (`npm test`).
- **Unit 2 — engine:** PDF.js 6.3.289 used directly (legacy build), self-hosted worker/CMaps/fonts/decoders (`scripts/copy-pdfjs-assets.mjs`, immutable cache header), range loading with 8 KB chunks, prioritised render queue with cancellation, render-ahead of the next/previous view into a pixel-budgeted cache, text layer, safe link hotspots. Works in `next build`/`next start` and Turbopack `next dev`.
- **Unit 3 — reader route:** `/[magazine]/citat/[edition]` (SSG, `dynamicParams = false`, noindex with the edition page canonical), spreads/single layout by stage width, whole-spread fit, zoom 100–250 %, sticky bottom controls, side arrows, keyboard, swipe, page input validation, loading/error/unsupported/cover-only states, retry.
- **Unit 4 — banner:** magazine placement → paid → fallback → built-in house banner chain, browser image-error fallback with fixed slot geometry.
- **Unit 5 — entry/verification:** `Čítať online` on edition detail pages with a PDF; Playwright checks at 1440×900 and 390×844 (layout fit, instant prepared turns, keyboard, links, text layer, zoom re-render, bounded memory, 1/2/6/7-page files, password/corrupt/network failures, ad fallbacks, 404s, no PDF code/bytes on other pages); throttled measurements recorded in the feature 02 Implementation Record and `delivery-and-costs.md`.

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

## Review Round 3 (applied, awaiting review)

- All links to the legacy voc.sk removed (constants pruned; conference/course offers open their article pages; publication, price list and registration are pre-filled e-mails). Footer GDPR, História and Služby links removed until those pages exist.
- Magazine page: covers without panel, new current-issue caption, cinematic scroll statement, photographic topic cards.
- `/inzercia` rebuilt: centred hero, three cards, one section per medium, offer band.

## Next Up

- Collect review feedback on the hero (composition, copy, motion intensity, optional auto-cycling) and the page templates.
- Replace fixture placeholders with owner-approved content: editorial-plan dates, vkladačky, education copy, partner roster, magazine copy.
- Owner content for `/o-nas` (history, team, company details) and `/inzercia` (formats, price list) to replace links to the old website.
- Unit 6: cross-page consistency pass, sitemap/robots once the production origin is known, homepage copy migration into `getHomePageContent`/`getSiteSettings`.
- Feature 02: owner review of the reader (Part C modes: grid breakpoints/sizes, reading width, ring feel, hide tab); re-measure with the original issues now in `public/pdfs/`; Safari/Firefox checks; then unit 6 (Sanity: PDF file uploads, placements/creatives, published reads, invalidation of all readers of a magazine on placement change).

## Open Questions

- **Feature 02 reader (implemented, in review):** owner confirmed the magazine spread turn (2–3 → 4–5), no animation. Working choices to confirm: whole spread fits the screen at 100 %, side arrows plus bottom controls, banner 970×90 / 320×100, no download button. The owner supplied the original 2026 issues (PVK 1–4, SBD 1–2), now used as fixtures; throttled measurements still need repeating with them. The PVK 4/2026 insert PDF is still a generated sample.
- **Reader asset host:** production PDF URLs (Sanity file CDN or other) must support byte ranges and CORS for the site origin; verify, and check whether the host counts each range request against a request quota (~40–100 per reading session).
- **Reading export:** confirm the publisher can supply web/screen exports (single pages, ~150–200 ppi images); print-resolution files are slow on mobile.

- **GDPR / privacy policy page** is needed (the footer link to the old site was removed); owner must supply the text.

- **SBD hero footage:** no SBD-specific video exists; the SBD slide uses a still poster (`public/images/hero-sbd.jpg`, cropped from the former hero image). Approved footage needed.
- **Fixtures needing owner data:** editorial-plan dates/themes are illustrative; the two vkladačky records are illustrative; education article bodies are neutral drafts; partner names are unverified.
- Hero headlines per magazine (`Technika budov, ktorá obstojí v praxi.` / `Spravujte bytové domy s istotou.`) are working copy.
- Production origin (`NEXT_PUBLIC_SITE_ORIGIN`, defaults to `https://voc.sk`) and hero video hosting.
- Public SBD/SPD abbreviation (UI currently shows `SBD` on subscription buttons as before).

## Architecture Decisions

- Magazine routes live in the `app/(magazines)/[magazineSlug]` group with `generateStaticParams` + `dynamicParams = false`; the reader route `/[magazineSlug]/citat/...` stays unimplemented (404) until feature 02.
- Date-dependent pages (landing next-issue teaser, plans, education) use `revalidate = 86400`; everything else is static. Caching for Sanity is decided at integration.
- Reader routes are static per edition; at Sanity integration a placement/creative change must revalidate every reader route of that magazine (tag per magazine placement).
- PDF rendering uses `pdfjs-dist` directly (not React-PDF) for render-ahead and memory control; see feature 02 spec.
- Edition detail pages show `Čítať online` (reader link, no prefetch) when the edition has a PDF; cover-only editions show no reading action.

## Session Notes

- `next dev` rewrites the managed block in `AGENTS.md`; commit it with the work.
- `next start` serves only `public/` files present at startup; restart after adding QA files. QA PDFs/E2E scripts lived in the session scratchpad and are not committed.
- `pdfjs-dist` pulls an optional Node-only `@napi-rs/canvas` (~35 MB in `node_modules`); it is never bundled for browsers.
- Playwright's bundled Chromium cannot decode H.264, so the hero shows its poster there; video logic was verified with a temporary WebM copy (removed).
