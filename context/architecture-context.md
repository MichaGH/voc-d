# Architecture Context

## Stack and Status

| Layer | Technology | Status and role |
| --- | --- | --- |
| Framework | Next.js 16.3.6 App Router, React 19.2.8 | Installed; public website with server/client boundaries |
| Language | TypeScript 5, strict mode | Installed; `@/` resolves to repository root |
| Styling | Tailwind CSS 4, CSS custom properties | Existing VOC design in `app/globals.css` |
| Content now | Local TypeScript arrays and public assets | Homepage fixtures exist; domain provider boundary planned |
| Content later | Sanity Content Lake and Studio | Planned; install/connect last |
| Complex UI motion | gsap and @gsap/react when needed | Requested for feature 01; not installed, simple motion may use CSS |
| PDF rendering | React-PDF backed by PDF.js | Selected for feature 02; implementation and version/worker compatibility check pending |
| Delivery | Cached server reads, direct asset delivery | Planned; policy depends on installed Next.js and chosen host |
| Authentication | Sanity editor authentication | Future Studio only; no visitor accounts |

No Prisma/PostgreSQL, Clerk, Liveblocks, React Flow, Trigger.dev or Vercel Blob. shadcn/ui and Lucide are not installed or required.

## System Boundaries

- `app/` — public routes, metadata, layouts and server-side composition; homepage only today.
- `components/layout/`, `components/homepage/` — current presentation; future magazine/editorial/reader folders group feature UI.
- `data/` — existing homepage/navigation arrays. Future `data/mock/` holds domain fixtures.
- `types/content.ts` — planned provider-independent interfaces.
- `lib/content/` — planned server-only asynchronous read facade, provider contract and mock/Sanity adapters.
- `lib/advertising/` — planned pure ad selection/fallback rules.
- `public/` — current assets and future local PDF/banner fixtures; never a runtime CMS upload directory.
- `sanity/` — future schemas, queries, configuration and generated query types, added at final integration; Studio hosting/route chosen then.
- `app/api/` — only justified integration handlers such as a verified publication webhook; Server Components normally read content directly.
- `constants/` — current links/contact configuration and future shared route construction.

Planned paths are documentation, not evidence that those modules exist.

## Content and Storage

Initially use one Sanity project/dataset for both titles. Every edition and annual plan belongs to exactly one magazine. Each magazine has a reader placement referencing reusable creatives. Editions never store a snapshot of the current paid ad.

See [content-model.md](domain/content-model.md), [operations.md](domain/operations.md), [advertising.md](domain/advertising.md) and [delivery-and-costs.md](domain/delivery-and-costs.md) for contracts and rules.

[Feature 01](feature-spec/01-design-and-website-structure.md) defines the directory, magazine landing/gallery/detail, editorial-plan and education route family. It is an iterative design phase; feature 02's reader is separate. Edition-specific vkladačky are embedded supplement records, and education posts use the article publishing model. The [editorial-content contract](domain/editorial-content.md) adds homepage/site/partner content and the agreed editing inventory while keeping styling/technical behavior in code.

Upload PDFs as Sanity file assets and covers/banners as separate image assets. The application receives normalized asset URLs and dimensions. A provider-independent PDF asset contract allows a later explicit delivery change without reshaping reader UI.

Hero videos have per-magazine source references and posters. Use local fixtures now; select production video delivery independently of Sanity raw file assets. Edit assignment/copy/reference in the future CMS without storing layout classes or forcing both videos to download/play at once.

## Replaceable Data Access

Intended flow: Server Component -> content operation -> selected provider -> normalized domain result -> UI props.

Implement the same asynchronous contracts using fixtures first. Then add a Sanity adapter that queries published documents, resolves references/assets and maps them into those contracts. Pages import the facade, never fixtures or GROQ queries. Production provider selection is explicit; a CMS outage must not silently display demo content.

Query types, rich-text mapping, caching and provider errors stay behind the boundary. The current homepage imports fixtures directly; migrating these imports is later implementation work, not completed by this context change.

## Server and Client Responsibilities

Server Components load magazine, edition, plan, article and ad metadata. Small client components handle controls, tabs, scrolling and PDF rendering. Reader code/worker load only on reader routes. Page/zoom changes do not query Sanity.

The ad is separate HTML above the PDF surface. PDF errors must not remove the banner, edition identity or navigation. Use direct PDF rendering with a single cover, two-page desktop spreads and single-page narrow layouts; no page-turn animation or image conversion pipeline in the first release. The detailed contract is in [feature 02](feature-spec/02-pdf-reader-and-advertising.md). Prefer browser-to-asset-host PDF requests; do not proxy each file through a Next.js route by default.

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
