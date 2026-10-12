# Architecture Context

## Stack and Status

| Layer | Technology | Status and role |
| --- | --- | --- |
| Framework | Next.js 16.3.6 App Router, React 19.2.8 | Installed; public website with server/client boundaries |
| Language | TypeScript 5, strict mode | Installed; `@/` resolves to repository root |
| Styling | Tailwind CSS 4, CSS custom properties | Existing VOC design in `app/globals.css` |
| Content now | Typed fixtures in `data/mock/` behind `lib/content` | Implemented: server-only facade, provider contract, mock provider; presentational homepage arrays remain in `data/homepage.ts` |
| Content later | Sanity Content Lake and Studio | Planned; install/connect last |
| Complex UI motion | gsap and @gsap/react | Installed; used by the homepage hero (`components/hero/`); simple motion uses CSS |
| PDF rendering | `pdfjs-dist` 6.3.289 (legacy build), used directly | Implemented (feature 02): on-demand import on reader routes only; worker/CMaps/fonts/decoders self-hosted in `public/pdfjs/<version>/` by `scripts/copy-pdfjs-assets.mjs` |
| Delivery | Cached server reads, direct asset delivery | Planned; policy depends on installed Next.js and chosen host |
| Authentication | Sanity editor authentication | Future Studio only; no visitor accounts |

No Prisma/PostgreSQL, Clerk, Liveblocks, React Flow, Trigger.dev or Vercel Blob. shadcn/ui and Lucide are not installed or required.

## System Boundaries

- `app/` — public routes, metadata, layouts and server-side composition. `app/(site)/layout.tsx` wraps ordinary pages in `SiteChrome` (navbar/footer, also used by the root 404); `app/(reader)/[magazineSlug]/citat/[editionSlug]` is the full-screen edition page/reader without site chrome. Site routes: homepage, `casopisy`, `o-nas`, `inzercia`, `(magazines)/[magazineSlug]` (landing, `vydania`, `vydania/[editionSlug]`, `edicny-plan`), `vzdelavanie` and `vzdelavanie/[postSlug]`. Root layout renders the navbar/footer.
- `components/layout/`, `components/homepage/`, `components/hero/`, `components/magazine/`, `components/education/`, `components/shared/` — presentation grouped by feature; `components/pdf-reader/` holds the reader (client: book spreads, `GridView` overview, `ScrollView` continuous reading) and its browser-only PDF session.
- `data/` — presentational homepage/navigation arrays; `data/mock/` holds domain fixtures.
- `types/content.ts` — provider-independent interfaces (implemented).
- `lib/content/` — server-only read facade, provider contract, mock adapter and pure rules (implemented); Sanity adapter later. `lib/format/` — pure Slovak date/plural/text helpers.
- `lib/advertising/` — pure reader-ad selection/fallback (`resolveReaderAd`). `lib/pdf-reader/` — pure page pairing, fit/zoom, render-density, overview-grid and continuous-reading layout rules. `lib/url/` — destination validation for untrusted links (ads, PDF links). Pure modules have `*.test.ts` files run by `npm test` (Node test runner).
- `public/` — current assets and local fixtures (`public/pdfs/` the publisher's original 2026 issues, `public/images/ads/` sample creatives); generated `public/pdfjs/` (git-ignored); never a runtime CMS upload directory.
- `scripts/` — build helpers (`copy-pdfjs-assets.mjs`, run by `predev`/`prebuild`).
- `sanity/` — future schemas, queries, configuration and generated query types, added at final integration; Studio hosting/route chosen then.
- `app/api/` — only justified integration handlers such as a verified publication webhook; Server Components normally read content directly.
- `constants/` — links/contact configuration; `constants/routes.ts` is the central route registry and `SITE_ORIGIN` (`NEXT_PUBLIC_SITE_ORIGIN`).

Paths described as planned/future are documentation, not evidence that those modules exist.

## Content and Storage

Initially use one Sanity project/dataset for both titles. Every edition and annual plan belongs to exactly one magazine. Each magazine has a reader placement referencing reusable creatives. Editions never store a snapshot of the current paid ad.

See [content-model.md](domain/content-model.md), [operations.md](domain/operations.md), [advertising.md](domain/advertising.md) and [delivery-and-costs.md](domain/delivery-and-costs.md) for contracts and rules.

[Feature 01](feature-spec/01-design-and-website-structure.md) defines the directory, magazine landing/gallery/detail, editorial-plan and education route family. It is an iterative design phase; feature 02's reader is separate. Edition-specific vkladačky are embedded supplement records, and education posts use the article publishing model. The [editorial-content contract](domain/editorial-content.md) adds homepage/site/partner content and the agreed editing inventory while keeping styling/technical behavior in code.

Upload PDFs as Sanity file assets and covers/banners as separate image assets. The application receives normalized asset URLs and dimensions. A provider-independent PDF asset contract allows a later explicit delivery change without reshaping reader UI.

Hero videos have per-magazine source references and posters. Use local fixtures now; select production video delivery independently of Sanity raw file assets. Edit assignment/copy/reference in the future CMS without storing layout classes or forcing both videos to download/play at once.

## Replaceable Data Access

Intended flow: Server Component -> content operation -> selected provider -> normalized domain result -> UI props.

Implement the same asynchronous contracts using fixtures first. Then add a Sanity adapter that queries published documents, resolves references/assets and maps them into those contracts. Pages import the facade, never fixtures or GROQ queries. Production provider selection is explicit; a CMS outage must not silently display demo content.

Query types, rich-text mapping, caching and provider errors stay behind the boundary. Homepage domain sections (hero, partners, magazines, education, latest editions) read through the facade; remaining presentational homepage arrays (stats, audience tabs, advertising, FAQ) migrate with `getHomePageContent` later.

## Server and Client Responsibilities

Server Components load magazine, edition, plan, article and ad metadata. Small client components handle controls, tabs, scrolling and PDF rendering. Reader code/worker load only on reader routes. Page/zoom changes do not query Sanity.

The ad is separate HTML above the PDF surface. PDF errors must not remove the banner, edition identity or navigation. Use direct PDF rendering with a single cover, two-page desktop spreads and single-page narrow layouts; no page-turn animation or image conversion pipeline in the first release. The detailed contract and implementation record are in [feature 02](feature-spec/02-pdf-reader-and-advertising.md). The browser requests PDF byte ranges directly from the asset host; no Next.js proxy.

Reader route data flow: Server Component → `getReaderPageData` (magazine → its edition → that magazine's resolved ad chain) → serializable props → `PdfReader` (client). The client never queries content; page turns and zoom only request PDF byte ranges.

## Caching and Publishing

Set explicit caching policies; do not assume CMS SDK calls or fetches are cached. Current `next.config.ts` does not enable Cache Components. Read the installed guides for the selected caching model before implementation.

Cache edition metadata separately from magazine placements. Placement changes invalidate that magazine's ad data and cached route output containing it, including historical readers. New loads reflect published changes within the agreed delay. Open sessions retain their initial banner until reload; no visitor polling initially.

Public reads exclude drafts. Preview, if later needed, is a separate authenticated uncached path. A publication webhook validates its signature/secret and payload before narrow invalidation. Verify both Next.js and upstream CDN freshness on the selected host.

## Invariants

1. Preserve existing VOC styling unless a visual change is explicitly requested.
2. Magazine identity scopes editions, plans and reader advertising.
3. Resolve the ad through the magazine's current placement, never an edition-specific copy.
4. Missing/unusable ads fall back without blocking reading.
5. Fixtures and Sanity expose the same asynchronous domain operations.
6. Editorial mutations happen in authenticated Studio; visitors do not sign in.
7. CMS credentials/private information never enter browser props.
8. Covers do not trigger PDF downloads, renderer loading or CMS polling.
9. Planned schedule entries/marketing samples do not establish published editions.
10. Low operating cost is measured, not guaranteed.
