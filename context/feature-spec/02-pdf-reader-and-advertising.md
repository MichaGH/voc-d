# 02 — PDF Reader and Magazine Advertising

## Status and Agreed Approach

**Units 1–5 implemented with fixtures (awaiting owner review); unit 6 (Sanity) not started.** See the [Implementation Record](#implementation-record) at the end for what was built, the decisions taken where this spec left a choice, and measurements.

Display the original PDF directly with **PDF.js (`pdfjs-dist`, used directly — not React-PDF)** inside a VOC page: two-page desktop spreads, one page on narrow screens, bottom controls and an independent advertisement above the reader. No page-turn animation or flipbook library.

Why PDF.js directly instead of the React-PDF wrapper (same engine, decided during implementation): without a turn animation the next spread must appear instantly, which needs render-ahead into a bounded, pixel-budgeted bitmap cache with cancellation and immediate canvas swaps. React-PDF renders per mounted `<Page>` and offers no control over that cache, density caps or scheduling; it also adds eight dependencies and lags PDF.js releases. Text selection uses PDF.js `TextLayer`; links are rendered as validated HTML hotspots instead of PDF.js's annotation layer.

Fixtures and public assets are used until Sanity is integrated as the final stage.

## Confirmed Owner Decisions

- **Spread turn, like a printed magazine (decision A):** cover alone, then 2–3 → 4–5 → 6–7; one click on "next" replaces both pages. A one-page slide (2–3 → 3–4) was considered and rejected.
- No page-turn animation; navigation by arrows (previous/next) plus keyboard.
- Banner is HTML above the reader, never inside the PDF; until Sanity is connected a local placeholder/house banner from `public/` is used.
- Legacy voc.sk material (PDFs, covers, copy) may be downloaded and reused as source/fixture data. The new website must still never *link* to the legacy site.

Implemented working choices for the R01 open points (owner review pending; see Implementation Record): the whole spread fits the screen at 100 %, arrows both at the spread's sides (pointer devices) and in the bottom bar, a 970×90 / 320×100 banner strip, no download button. Still open: real PDF sizes and host behaviour.

## Purpose

Visitors read PVK or Správca bytových domov editions without leaving the website. The owner selects an advertisement once for a magazine, and every edition of that title displays it after content refresh.

Example: company A selected for PVK appears above PVK 1/2024 and 4/2026. Selecting B changes both without editing either edition or PDF. SBD retains its own selection.

The [TOP STAVEBNÉ reference](https://www.iflip.sk/uv-group/top-stavebne/top-stavebne-2-2026) informs magazine presentation and readable page quality. Its internal technology is not a requirement.

## Scope

### Included

- Internal reader routes for both magazines.
- Single cover followed by desktop spreads; responsive single-page mode.
- Previous/next controls, page/spread count, page-number input and zoom/fit-to-width.
- Text selection and existing PDF links where supported by the source.
- Magazine-level paid/default HTML banner with image-error fallback.
- Explicit loading, unavailable, unsupported and retry states.
- Reusable provider-independent data operations; local PDFs/covers/ads initially.
- Bounded rendering, direct asset delivery and measured performance/bandwidth.
- Sanity publication and cache invalidation as a later integration unit.

### Excluded from the Initial Release

- Flip animation, StPageFlip, react-pageflip and other flipbook dependencies.
- PDF-to-image conversion services or a generated page-image pipeline.
- Native PDF iframe as the primary renderer or a hosted flipbook subscription.
- Search, thumbnail panel, saved reading position, printing controls and fullscreen.
- A dedicated download/raw-file button until requested; public PDF URLs remain public.
- Password-entry/repair workflows, editing PDFs, annotations or interactive form filling.
- Automated ad rotation, scheduling, networks, tracking and payment.

If performance evidence later justifies image conversion or another delivery model, revise this spec explicitly; do not introduce it silently.

## Related Context

- [Architecture](../architecture-context.md) — server/client and provider boundaries.
- [Content model](../domain/content-model.md) — magazine, edition, PDF and placement relationships.
- [Operations](../domain/operations.md) — reusable public reads.
- [Advertising](../domain/advertising.md) — selection/fallback invariants.
- [Delivery and costs](../domain/delivery-and-costs.md) — caching and service usage.
- [UI](../ui-context.md) — approved VOC visual language.

## Routes and Entry Points

Use these initial routes:

- /plynar-vodar-kurenar-klimatizacia/citat/[editionSlug]
- /spravca-bytovych-domov/citat/[editionSlug]

A shared app/(magazines)/[magazineSlug]/citat/[editionSlug]/page.tsx can implement both. Only known magazine slugs resolve; future magazine landing pages are separate work. Centralize reader/back-link construction instead of hardcoding URLs in every card.

Resolve the magazine before looking up its edition. A matching edition slug in another magazine must never substitute for the requested one. Invalid identities return a proper not-found response. A known cover-only edition is valid but unavailable to read.

Available edition cards and sample-reading links should point to internal reader routes when their routes exist. Cover-only records keep their cover/label and do not advertise a working reading action. A reader can be verified by direct fixture-backed URLs before full archive pages are implemented.

Each reader page has magazine/edition-specific title and description, magazine identity, issue label and back navigation. PDF parsing must not be needed to generate metadata or the cover archive.

## Page Structure and Appearance

Use normal HTML in this order:

1. VOC navigation and magazine/edition identity with back link.
2. Advertisement slot labeled Inzercia.
3. Responsive PDF page/spread surface.
4. Bottom controls.

The banner is outside the PDF canvas and independent of its load/render state. It is a normal non-sticky block for this release. Preserve the existing VOC font, navy/blue palette, light surfaces, rounded controls and responsive spacing. This feature does not authorize a homepage restyle.

Keep PDF pages proportional and uncropped. Allow page/viewport scrolling when needed; do not shrink two pages until text is illegible just to avoid scrolling. Reader controls wrap cleanly on mobile. Reserve space for loading pages and banners to reduce layout shifts.

Banner geometry is a shared responsive layout setting, not derived from whichever advertiser image happens to load. Choose desktop/mobile dimensions with the owner before final visual sign-off. Paid and fallback states use that same geometry; fit artwork without clipping important copy.

## Page and Spread Rules

All controls use one-based physical PDF page numbers. Labels printed inside the magazine may differ; do not infer printed numbering.

| Mode | Initial view | Navigation sequence |
| --- | --- | --- |
| Desktop spread | Page 1 alone, centered | 1 -> 2–3 -> 4–5 -> 6–7, continuing to the end |
| Single page | Page 1 | 1 -> 2 -> 3, continuing to the end |

A final even-numbered page without a partner is shown alone and centered. An odd-length PDF ends with its final even–odd pair. Never request a page beyond the actual loaded page count. One-page and two-page PDFs must work.

Use a stable focused page in state. On entering spread mode, page 1 stands alone; later even pages pair with the next odd page, and odd pages pair with the preceding even page. A jump to page 13 therefore displays 12–13. Changing mode preserves the focused page; returning to single-page mode after that jump shows page 13.

Working responsive default: spread mode when the reader's available container width is at least 1024 CSS pixels, single-page otherwise. Measure the container rather than device type. This engineering threshold can be tuned during visual QA without changing pairing rules.

Resize/orientation changes must not reset the edition or reading position. Recalculate page width; fit-to-width follows available space. Source PDFs must contain individual reading pages. Do not automatically split a print-imposed/double-page PDF; flag it for a suitable reading export before publishing.

## Controls and Zoom

- Bottom buttons: Predchádzajúca and Nasledujúca, with existing VOC arrow styling.
- Indicator: Strana 1 z 80 in single mode; Strany 12–13 z 80 in spread mode.
- Page input labeled Prejsť na stranu; submit with Enter or a labeled action.
- Accept an integer from 1 to actual page count. Invalid input keeps the current view and shows a short inline Slovak validation message.
- Disable previous on the first view and next on the last view.
- Left/right keyboard navigation works while the reader has focus, except inside inputs/editable text. Do not install page-wide shortcuts that interfere with the rest of the site.
- Zoom controls: Zmenšiť, Zväčšiť and Prispôsobiť (back to 100 %).
- Initial zoom ("100 %") fits the whole spread into the available stage in spread layout (resolves R01-F01), and the page width in single-page layout. Working bounds are 100–250% of that fit, in 25% steps; indicate the current level and mark unavailable actions (`aria-disabled`, so focus is kept).
- Keep zoom through page navigation, reset the page viewport's scroll to its top, and retain focus on the activated control. Fit resets zoom to 100%.
- At enlarged zoom, support ordinary horizontal/vertical scrolling within the PDF viewport without making the whole website wider than the screen.
- Rerender sharply at settled zoom/resize values instead of only stretching a low-resolution bitmap. Briefly retaining the previous render while replacement loads is acceptable.

No custom swipe/pinch engine is required initially. Preserve normal browser touch scrolling and accessibility zoom; test control usability on mobile.

## Rendering Architecture

Keep route composition and metadata on the server. Load the browser renderer in a small client boundary. The reader receives only serializable edition/PDF data; it does not fetch content from Sanity.

Suggested responsibilities:

Implemented responsibilities:

| Module | Responsibility |
| --- | --- |
| app/(magazines)/[magazineSlug]/citat/[editionSlug]/page.tsx | Identity resolution, metadata (noindex), not-found, identity row, banner, reader or cover-only state |
| components/pdf-reader/pdf-session.ts | Browser-only PDF.js session: on-demand library import, document lifecycle, prioritised render queue, cancellation, pixel-budgeted bitmap cache, text layers, safe links |
| components/pdf-reader/PdfReader.tsx | View state (focused page, layout, zoom), stage measurement, render plan, keyboard/swipe, loading/error states |
| components/pdf-reader/PdfPage.tsx | One page: swaps in the session's canvas, text layer, link hotspots, page-level error/retry |
| components/pdf-reader/ReaderControls.tsx | Accessible bottom controls and page-input validation |
| components/pdf-reader/ReaderAdBanner.tsx | Banner chain display and browser image-error fallback |
| components/pdf-reader/reader.css | Text-layer CSS subset (loaded only by the reader) |
| lib/pdf-reader/navigation.ts, zoom.ts | Pure page pairing/bounds/jump rules; fit, zoom and render-density rules |
| lib/advertising/resolve-reader-ad.ts | Pure selection/fallback policy |
| lib/url/safe-href.ts | Destination validation for ads and PDF links |
| lib/content/reader.ts | `getReaderPageData` composition behind the facade |
| scripts/copy-pdfjs-assets.mjs | Copies the installed PDF.js worker, CMaps, standard fonts and decoders into `public/pdfjs/<version>/` (predev/prebuild) |

`pdfjs-dist` is pinned exactly (6.3.289). The **legacy build** is used: the modern build relies on very recent JS APIs (`Map.prototype.getOrInsertComputed`, `Uint8Array.prototype.toBase64`) without polyfills, which still-common Safari/Android versions lack. Worker, CMaps, standard fonts and WebAssembly decoders are served from our origin in the exact installed version with an immutable cache header. PDF.js 6 no longer evaluates font code with `eval` (the CVE-2024-4367 vector, fixed in 4.2.67); scripting and XFA stay disabled.

The reader shell is server-rendered (cover placeholder, controls) and the PDF.js library is imported on demand inside the session (the installed lazy-loading guide's "loading external libraries" pattern), so no other route ships PDF code and the cover appears before any script runs. The PDF is never copied into a Blob/base64 buffer.

## Data Flow and Fixtures

Call getReaderPageData({ magazineSlug, editionSlug }) through the server-only content facade. Its result includes magazine identity, edition identity/cover, optional PdfAsset and resolved banner props. Null means unknown identities; a content outage is a distinct failure.

PDF URL, filename and optional byte/page hints come from the provider. Loaded PDF page count is authoritative. Public fixtures map to real files; never fabricate a working URL or silently substitute another edition.

Keep edition and ad reads/cache entries separate behind page composition. If optional ad resolution fails after the edition resolves, use the local house banner and record the failure server-side.

Initial fixtures must cover both magazines, two editions sharing one magazine placement, a different placement for the other title, missing/disabled/broken ad cases, and a cover-only edition. Rendering QA also uses readable small and long PDFs, one/two-page files, even/odd page counts and a deliberately failing URL. Large QA files need not be bundled into production assets.

At Sanity integration, replace the adapter with published-document reads and normalized asset references while retaining operation contracts and renderer props. PDFs become file uploads; covers/creatives remain separate image uploads. There is no public auth or content mutation interface.

## Advertising

Use the deterministic policy in advertising.md:

1. Enabled published placement with a selected usable published creative belonging to its candidate list.
2. Valid configured magazine fallback if paid display is unavailable.
3. Local VOC house treatment with contact-for-advertising action.

Never choose another paid candidate implicitly or copy the ad onto editions. A missing destination gives a non-clickable banner. Validate destinations; use internal/HTTP(S) links, never arbitrary executable advertiser HTML. Links have meaningful accessible names and safe new-tab attributes if applicable.

A paid image that fails in the browser falls back independently from PDF loading. If configured fallback artwork also fails, use the built-in text treatment, avoiding recursive retries. Initial house copy: Inzerujte v našom časopise, with Dohodnúť inzerciu linking to the existing advertising email. Final copy/artwork can be refined without changing policy.

Placements retain candidate references so a later explicit rotation spec can extend selection. No timers, schedules, polling, impression/click persistence or tracking scripts now.

## States and Recovery

| Condition | Required behavior |
| --- | --- |
| Metadata loading | Stable shell; no unrelated PDF requests |
| PDF document/page loading | Načítavam časopis… or Načítavam stranu…; retain identity, ad and navigation |
| Cover-only edition | Elektronická verzia zatiaľ nie je dostupná.; retain cover and back link; do not load worker |
| Missing/disabled/failed placement | Working default; reading unaffected |
| Broken banner | Fallback with unchanged slot geometry |
| PDF network/load error | Časopis sa nepodarilo načítať.; Skúsiť znova and back navigation |
| Page render error | Page-level retry/error; no stale page presented as the requested one |
| Password-protected/unreadable PDF | Clear unsupported state; no password prompt/repair workflow |
| Unknown/mismatched edition | Proper not-found response |
| Later CMS failure | Valid cache/error handling; never demo content or a false missing-record response |

Document retry tears down the failed renderer session and starts one new attempt at the focused page and zoom where valid. No infinite/automatic retry loop. Cancel obsolete work on edition change/unmount and ignore late results from an abandoned session.

## Quality, Performance and Cost Requirements

### Rendering and Memory

Only the current one/two page canvases are mounted. Render-ahead is the default (R01-F03): once the visible pages are drawn, the next and previous views are prepared into a bounded cache; never the whole issue. Limits are recorded in the Implementation Record.

Use a stable document session so changing page/zoom does not reopen or download the document. Cancel pending renders that are no longer wanted and release evicted canvases. Temporary replacement canvases during zoom are allowed, but canvas count/memory settles back within the budget rather than accumulating.

Density cap is devicePixelRatio 2, with a per-page bitmap limit to prevent oversized mobile canvases; pixel limits are not total browser memory. Preserve text/vector detail available in the source; embedded photos/scans cannot gain missing detail.

### File Delivery

Serve a web-optimized reading PDF where supplied, with readable small text/diagrams and suitable image compression. Keep separate cover images; archive visits never load a PDF or its worker. Link prefetch must not initialize the browser renderer or download edition assets.

Use direct browser-to-asset-host URLs. Avoid a Next.js file proxy unless real delivery restrictions require one. Verify content type, CORS, cache headers and byte-range responses on the actual host.

Keep range requests enabled. Test a demand-oriented PDF.js configuration with disableAutoFetch: true and disableStream: true against representative files and hosts; record settings and observed behavior. Revisit settings if they make real PDFs unreliable/slow. Small files or hosts without usable range support may still transfer completely. Rendering only two pages is not a promise of two pages' worth of transferred bytes.

No full-archive prefetch, service-worker PDF storage or automatic browser-side page-image conversion.

### Metadata and Freshness

Page changes, zoom, resizing and retries make zero content/CMS queries. Optional ad state never re-fetches on each page turn. Use explicit server caching of published metadata, independently scoped placement invalidation and no public live subscriptions.

During Sanity integration, establish the owner-approved freshness target and verify it on the production host. Publishing/changing/disabling a placement, or updating/deleting a referenced creative, refreshes affected magazine placement data and all cached reader output including historical editions. Public reads exclude drafts; open sessions keep their initial banner until reload/navigation.

File bandwidth and CMS API request usage are measured separately. CMS/CDN caching does not make asset transfer free. Use delivery-and-costs.md for traffic estimates and current plan verification; do not claim a guaranteed free deployment.

## Accessibility

Use semantic buttons/labels, visible VOC focus treatment, touch-friendly targets and a concise polite page-change announcement. Preserve text selection/link annotations where the PDF supports them. Layer alignment must match zoom and resize.

PDF text layers improve access but do not repair an untagged/scanned source. Keep HTML edition information/back navigation available in every state, and describe unsupported reading clearly. Do not trap focus, suppress browser zoom or allow reader keys to hijack input editing.

## Acceptance and Verification

| Case | Expected result |
| --- | --- |
| PDF with 7 pages in desktop mode | 1, 2–3, 4–5, 6–7; correct end bounds |
| PDF with 6 pages | 1, 2–3, 4–5, 6 alone; no nonexistent page |
| Jump to page 5, change desktop/mobile mode | Spread 4–5; single page 5; focused page preserved |
| Invalid page input | Current view retained, accessible inline validation |
| Zoom/resize/quick navigation | Sharp settled render, correct text/link alignment, no abandoned result overwrite |
| Two PVK editions plus one SBD edition | PVK shares one selected ad; SBD independent |
| Paid/configured image failures | Built-in text fallback; PDF remains usable |
| Missing PDF/unknown route/CMS outage | Distinct unavailable/not-found/failure states |
| Repeated page/zoom changes | No CMS queries or unnecessary document reload |
| Homepage/archive/cover-only reader | No PDF transfer or worker initialization |
| Long issue repeatedly navigated/closed | Bounded canvas count; resources stop/clean up |
| Later Sanity publish/unpublish/creative update | Published-only changes across old/new routes within recorded freshness target |

Unit-test meaningful pure page/spread and ad selection rules. Browser checks cover desktop/mobile, current Safari/Chrome/Firefox where available, keyboard controls, reduced motion, links, failures and narrow/large displays. Verify production build worker loading and absence of reader assets on other pages.

Record PDF byte size/page count, device/browser, time to first usable page, bytes at initial load/after several spreads/after a full read, settled canvas dimensions/count and responsive behavior under zoom. Compare cold/warm sessions and a constrained connection. Launch requires a representative real VOC issue; a tiny fixture alone cannot establish performance or free-tier capacity. Store measurements with later implementation notes, not invented results in this spec.

## Implementation Units

1. Contracts, pure navigation/ad rules, mock provider and fixtures.
2. PDF.js/worker integration on the installed Next.js version (production build and Turbopack dev); real text/link rendering verified.
3. Reader route shell, spreads, responsive state, controls and error recovery.
4. Paid/default banner, central selection and image-failure handling.
5. Available archive/sample entry points, accessibility and production performance verification.
6. Sanity last: upload schemas, adapter, published reads, invalidation and production usage checks.

Finish and verify each unit before marking it complete. No implementation progress is recorded by this documentation task.

## Remaining Launch Inputs

- Owner-approved desktop/mobile banner dimensions, final creative/copy.
- Production website/asset host, representative PDF exports, expected readership and freshness target.
- Browser support target and measured render-density/bitmap limits.
- Additional controls such as downloads/fullscreen only if requested.

These inputs do not reopen the agreed direct-PDF approach or block fixture-backed implementation.

## Technical References

- [PDF.js examples](https://mozilla.github.io/pdf.js/examples/) — direct rendering, text layer and worker setup.
- [PDF.js API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html) — file transport options; verify against the selected installed version.
- [PDF.js FAQ](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions) — visible-page rendering, range loading and compatibility.
- Installed Next.js docs: node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md and 01-getting-started/05-server-and-client-components.md; caching guides listed in delivery-and-costs.md.

## Implementation Record

Implemented with fixtures; awaiting owner review. Verified with `npm test` (40 unit tests), `tsc`, `eslint`, `next build`, and Playwright (Chromium only in this environment; Safari/Firefox still to be checked) at 1440×900 and 390×844.

### Decisions taken where the spec left a choice

| Topic | Implemented working choice |
| --- | --- |
| Engine | PDF.js directly (see Status). Legacy build, exact version, assets self-hosted. |
| Default size | Spread layout fits the whole spread into the stage (banner, spread and controls fit a 1440×900 laptop without scrolling); single-page layout fits the page width (max 900 px). |
| Layout switch | Spread when the reader stage is ≥ 960 px wide (`SPREAD_MIN_STAGE_WIDTH`). |
| Arrows | Labelled bottom controls (sticky); large side arrows beside the spread on pointer devices at 100 % (out of the tab order, they duplicate the bottom controls). On phones only the navigation row is sticky; "Prejsť na stranu" and zoom sit below the page. |
| Turns | Arrow keys/PageUp/PageDown/Home/End while the reader has focus (never inside the page field); at a zoomed edge arrows first scroll. Horizontal swipe on touch screens when not zoomed or selecting. Internal PDF links jump to their page. |
| Render-ahead | Default (R01-F03): after the visible pages are drawn, the next view and then the previous view are prepared; they never compete with the visible pages. Skipped with Data Saver. Prepared spreads appear instantly. |
| Memory | Bitmap density cap devicePixelRatio 2; per page ≤ 8.4 MPx desktop / 4.2 MPx touch or ≤ 4 GB devices; whole cache ≤ 20 MPx (~80 MB) desktop / 10 MPx (~40 MB) touch. Least-recently-used non-visible bitmaps are evicted and their canvases zeroed (Safari). |
| Range loading | `disableStream` + `disableAutoFetch`, `rangeChunkSize` 8 KB (see measurements). |
| Banner geometry | Desktop 970×90 leaderboard, mobile 320×100 below 640 px, artwork contained (never cropped), label "Inzercia". |
| Banner fallback | `resolveReaderAd` returns an ordered chain (selected paid → magazine fallback); a browser image error moves to the next entry, then to the built-in text banner "Inzerujte v časopise …" with "Dohodnúť inzerciu" (pre-filled e-mail). |
| Entry point | Edition detail page shows "Čítať online" above the print-order panel when a PDF exists (link prefetch disabled). Cards keep linking to the edition page. |
| Indexing | Reader routes are `noindex, follow` with the edition page as canonical; local fixture PDFs send `X-Robots-Tag: noindex` (not controllable on the Sanity CDN). |
| Download button | None (unchanged). |

### Fixtures

**Update (owner supplied originals):** `public/pdfs/` now holds the publisher's original issues — PVK 1–4/2026 (44 p each, 5.2–7.9 MB, sharing the PVK placement) and SBD 1/2026 (44 p, 5.0 MB) and 2/2026 (52 p, 5.1 MB) with the SBD placement; all A4 (595×842). SBD 4/2025 stays print-only (cover-only fixture). Only the PVK 4/2026 insert (`pvk-4-2026-pozvanka.pdf`) is still a generated sample. The measurements below were taken with the earlier generated samples (PVK 4/2026 36 p 4.9 MB, PVK 3/2026 28 p 3.1 MB, SBD 2/2026 24 p 2.8 MB) and must be repeated with the originals. QA files (1, 2, 6, 7 pages; 96-page 102 MB print-style file, plain and linearized; password-protected; truncated) were used through request interception and are not committed.

### Measurements (Chromium, `next start`, CDP throttling)

| File | Link | First page drawn | PDF bytes then | Turns after |
| --- | --- | --- | --- | --- |
| Fixture 4.9 MB, 36 p | 9 Mb/s, 60 ms, desktop | 4.2 s | 0.73 MB | instant ×3 |
| Fixture 4.9 MB, 36 p | 1.6 Mb/s, 150 ms, phone | 12.8 s | 0.73 MB | instant, instant, 0.9 s |
| Print 102 MB, 96 p | 9 Mb/s, 60 ms, desktop | 3.8 s | 1.16 MB | instant, 2.1 s, 1.0 s |
| Print 102 MB, 96 p | 1.6 Mb/s, 150 ms, phone | 12.5 s | 1.16 MB | instant, 8.2 s, 17.6 s |

The edition cover (separate JPEG) is visible immediately in every case; the times are for the first PDF-rendered bitmap. Unthrottled localhost: ~0.8 s. Reading 20+ pages of the fixture transfers ~4.8 MB of 4.9 MB; page turns, zoom and resizing make no requests other than PDF ranges. Homepage, archive and edition pages load no PDF code, worker or file; cover-only readers neither.

Findings that shape the reading-export rules (see delivery-and-costs.md):

- On open PDF.js validates the page count by loading the last page, which in a flat page tree fetches every page object **sequentially**. With the 64 KB default chunk each fetch also pulled 64 KB of neighbouring image data (2.0 MB fixture / 5.5 MB print file before page 1). 8 KB chunks cut that to 0.29 / 0.73 MB (first page 16.9 → 12.8 s and 36.9 → 12.5 s on slow 3G). The remaining open time is round trips, i.e. a property of the file.
- Print-resolution images (1–2 MB per page) make later turns slow on mobile; a web reading export is required. Linearization alone did not change the numbers.

### Remaining for launch

Representative real issues measured on the production asset host (range/CORS/cache headers), Safari and Firefox checks, owner sign-off on banner geometry/side arrows/default fit, and unit 6 (Sanity).

## Part B — Owner revision (reader redesign and link structure)

After reviewing Part A the owner asked for a reading-first product. Implemented changes, superseding Part A where they conflict:

- **Edition page = reader.** `/[magazine]/vydania/[edition]` was removed (permanent redirect to `/[magazine]/citat/[edition]`). Every cover links to the reader; `editionPath()` now returns the reader URL. Indexable, canonical to itself.
- **Direct actions under covers.** Shared `EditionActions` (rectangular, cover-width): `Čítať` → reader (or `Objednať` e-mail for print-only issues) and `Predplatiť` → subscription section. Used in the archive gallery, homepage "Posledné čísla" rail and magazine landing; the hero and landing lead with `Čítať číslo X/YYYY`. `Otvoriť časopis` renamed `O časopise`.
- **Full-screen reader without site chrome.** Routes are split into `app/(site)` (navbar/footer via `SiteChrome`) and `app/(reader)`. The reader is a white `100dvh` page: `← Všetky vydania` top-left, `Predplatiť` top-right, the ad banner, the stage (fills the rest; whole spread or page contained), translucent square side arrows positioned just outside the pages (drifting to the screen edge, at most 120 px from the pages), and a primary-blue bottom bar: home icon, `VOC / magazine title issue` left; zoom −/+ (md+), `«` (−10 pages), `‹`, editable `12–13 / 36`, `›`, `»` (+10) right.
- **Page-turn animation** (reverses the earlier "no animation" decision): CSS 3D leaf over the spine using copies of already-prepared bitmaps (no re-render, no download), ~0.7 s; short slide for cover/last-page/single-page turns; off under reduced motion, while zoomed, and for jumps. Zoom re-renders from data already in memory (verified: 0 PDF requests).
- **Vkladačky inside the reader.** Bar button `Súčasťou čísla (n)` opens a panel listing the issue's inserts; an insert with a digital PDF opens in the same reader (`← Späť na časopis` returns to the remembered issue page).
- **Primary colour.** `--color-primary` (#0a3fb5, the contact-panel blue) replaces the navy gradients on navbar, bands, plan/next-issue cards, primary buttons, switchers and the reader bar; navy remains for text and photo/video overlays.
- Verified with 41 unit tests and 22 Playwright checks (desktop/mobile layout, turn overlay, reduced motion, ±10 jumps, input, keyboard, zoom without requests, inserts, print-only state, redirects, no reader code on other pages, failure states, 1/2/6/7-page files).

## Part C — Reading modes and reader chrome (owner revision 2, awaiting review)

Owner feedback on Part B: the reader is right; refine the chrome and add reading modes inspired by the iflip reference (its `listovanie`, `náhľad strán` and `strany pod sebou` modes). Supersedes Part A/B where they conflict; "thumbnail panel" is no longer excluded — the page overview is a requested mode.

**Top bar.** No background of its own and no visible `Inzercia` label (the ad keeps `aria-label="Inzercia"`). The reader never starts under it: spreads are fitted below it, and the overview/continuous views start below it and scroll underneath it. The `Všetky vydania` link has a small translucent white backing so it stays legible over pages. The bottom bar likewise overlays the overview/continuous views (content scrolls beneath it).

**Three modes** (bar buttons with icons; on phones one button opening a small menu). The current page is kept when switching.

| Mode | Icon | Behaviour |
| --- | --- | --- |
| Listovanie (book, default) | open book | Part B spreads/turns/side arrows/swipe/zoom. Text is **not** selectable and links are inactive here: each page is one button. Clicking a page draws a ring around it (gently pulsing) that stays while that page renders at reading size, then switches to continuous reading opened at the top of that page. |
| Náhľad strán (grid) | 2×2 squares | Pages at a fixed 282 px width. Equal columns with each page centred, so resizing changes only the space between columns; once that space equals the 30 px row gap, pages shrink briefly until the next breakpoint drops a column. 4 columns from a 1200 px stage, 3 from 768 px, 1 column of the same small pages below. At 1920×1080 two rows show under the banner, the bar covering part of the second. Clicking a page opens it for reading exactly as in the book. ‹ › move by a row. |
| Strany pod sebou (scroll) | page with folded corner | Pages directly under each other (no gap), ~87 % of the stage width on desktop (≈1660 px at 1920, about a third of a page visible), 8 px margins below 768 px, capped at 1800 px. Selectable text and working links. ↑/↓ scroll in small 64 px steps, PageUp/PageDown by a screen, ←/→ and ‹ › go to the previous/next page top, Home/End to the ends. Zoom 50–200 %. |

**Hideable bottom bar.** A small tab (52×22 px, rounded top corners, chevron) sits above the bar's left end. It slides the bar down to a 4 px line, leaving only the tab (chevron flips); the hidden controls are `inert`. Spreads grow into the freed space.

**Implementation.** Pure rules in `lib/pdf-reader/grid.ts` (columns, page box, rows) and `lib/pdf-reader/scroll.ts` (reading width, page offsets, current/visible pages), tested in `layout-modes.test.ts`. `GridView`/`ScrollView` render live pages only near the screen (other pages are same-size empty boxes); the existing session renders visible pages first and the next row/page ahead, within the same pixel budget. `PdfPage` has `interaction: "read" | "pick"`. Mode and bar visibility live in `PdfReader`, so they persist across inserts; reopening the issue after an insert restores its page in every mode.

Verified: 50 unit tests, `tsc`, `eslint`, `next build`; in-browser checks at 1920×960, 1210×900 and 375×812 (grid geometry identical to the reference at 1920, breakpoints, pick → reading position, ring timing, hide/show, zoom keeps the page, insert round trip, print-only state). Smooth-scroll keys need a manual check in a visible browser window.
