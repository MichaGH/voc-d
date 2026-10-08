# 02 — PDF Reader and Magazine Advertising

## Status and Agreed Approach

Specification ready for implementation; reader not implemented. Design refinements can precede feature 02 without requiring their own detailed feature spec. Writing this specification does not change progress-tracker.md.

Use React-PDF (the existing-PDF display package, react-pdf) backed by PDF.js, inside a VOC page. Display the original PDF directly, with two-page desktop spreads, one page on narrow screens, bottom controls and an independent advertisement above the reader. No page-turn animation or flipbook library.

Implement with typed local fixtures and public assets first. Sanity remains the final integration stage. This task does not install dependencies, implement routes or change the current website design.

## Confirmed Owner Decisions

- **Spread turn, like a printed magazine (decision A):** cover alone, then 2–3 → 4–5 → 6–7; one click on "next" replaces both pages. A one-page slide (2–3 → 3–4) was considered and rejected.
- No page-turn animation; navigation by arrows (previous/next) plus keyboard.
- Banner is HTML above the reader, never inside the PDF; until Sanity is connected a local placeholder/house banner from `public/` is used.
- Legacy voc.sk material (PDFs, covers, copy) may be downloaded and reused as source/fixture data. The new website must still never *link* to the legacy site.

Still open (see review `.ai/reviews/02-pdf-reader-and-advertising/spec/R01.md`): default zoom that fits the whole spread on screen, arrow placement (sides/bottom), banner strip size, download button, real PDF sizes and host behaviour.

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
- Zoom controls: Zmenšiť, Zväčšiť and Prispôsobiť šírke.
- Initial zoom is fit-to-width. Working bounds are 100–250% of the fit scale, in 25% steps; indicate the current level and disable unavailable actions.
- Keep zoom through page navigation, reset the page viewport's scroll to its top, and retain focus on the activated control. Fit resets zoom to 100%.
- At enlarged zoom, support ordinary horizontal/vertical scrolling within the PDF viewport without making the whole website wider than the screen.
- Rerender sharply at settled zoom/resize values instead of only stretching a low-resolution bitmap. Briefly retaining the previous render while replacement loads is acceptable.

No custom swipe/pinch engine is required initially. Preserve normal browser touch scrolling and accessibility zoom; test control usability on mobile.

## Rendering Architecture

Keep route composition and metadata on the server. Load the browser renderer in a small client boundary. The reader receives only serializable edition/PDF data; it does not fetch content from Sanity.

Suggested responsibilities:

| Module | Responsibility |
| --- | --- |
| app/(magazines)/[magazineSlug]/citat/[editionSlug]/page.tsx | Identity resolution, metadata, not-found and reader-page composition |
| components/pdf-reader/PdfReaderLoader.tsx | Client-side lazy import/loading boundary |
| components/pdf-reader/PdfReader.tsx | React-PDF document lifecycle and navigation/zoom state |
| components/pdf-reader/PdfSpread.tsx | One/two visible Page instances, text and link layers |
| components/pdf-reader/ReaderControls.tsx | Accessible controls and validation |
| components/pdf-reader/ReaderAdBanner.tsx | Banner display and browser image-error fallback |
| lib/pdf-reader/navigation.ts | Pure page pairing, bounds and resize/jump rules |
| lib/content/ | Server-only facade and provider adapters |
| lib/advertising/ | Pure selection/fallback policy |

These are planned responsibilities, not a mandate to create empty modules.

Select/pin a compatible stable React-PDF version at implementation and verify its React, Node, browser and bundler requirements against its matching documentation. Configure the exact matching PDF.js worker in the renderer module, package it locally and load required text/annotation styles there. Include needed font/CMap/decoder assets according to representative PDFs; do not import unrelated packages or rely on a mismatched third-party worker.

Follow the installed Next.js lazy-loading guide: browser-only dynamic import with ssr: false belongs inside a Client Component. Avoid eagerly importing PDF code from root layout/homepage modules. Do not fetch the PDF into an additional full-file Blob/base64 copy before passing it to the renderer.

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

Start with only the current one/two page canvases mounted. No off-screen canvas buffer by default. An optional bounded next-spread preparation can be added only when measurements justify it; never render the entire issue.

Use a stable document source/options identity so changing page/zoom does not reopen or download the document unnecessarily. Release abandoned canvases and cancel pending work through the renderer lifecycle. Temporary replacement canvases during zoom are allowed, but canvas count/memory must settle back to the current view rather than accumulate.

Working density cap is devicePixelRatio 2, with an additional measured bitmap-size limit to prevent oversized mobile canvases. Record final limits in implementation after testing zoomed small text/diagrams; do not silently compromise readability or claim pixel limits equal total browser memory. Preserve text/vector detail available in the source; embedded photos/scans cannot gain missing detail.

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
2. React-PDF/worker integration check on the installed Next.js version; verify real text/link rendering.
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

- [React-PDF](https://github.com/wojtekmaj/react-pdf) — package/version-specific integration and worker setup.
- [PDF.js API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html) — file transport options; verify against the selected installed version.
- [PDF.js FAQ](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions) — visible-page rendering, range loading and compatibility.
- Installed Next.js docs: node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md and 01-getting-started/05-server-and-client-components.md; caching guides listed in delivery-and-costs.md.
