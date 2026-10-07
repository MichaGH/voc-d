# Delivery, Freshness and Operating Costs

## Goal

Optimize for a low-cost/free-tier deployment where measured traffic allows it. No production host is selected. Track metadata requests, storage, transferred bytes and host/function usage separately: caching CMS queries does not eliminate PDF bandwidth.

## Public Reads

Cache/prerender public metadata and use bounded projections. Avoid repeating ad reads for every card, public live subscriptions and polling. Reader page/zoom interactions stay local. Archives load cover images only, never PDF bytes.

The installed Next.js 16.3.6 docs distinguish Cache Components from the previous caching model. Current configuration does not enable Cache Components. Read installed 08-caching.md, 09-revalidating.md and the caching-without-cache-components guide before implementation. Request-level React memoization alone is not cross-request caching.

## Freshness

Agree an update delay with the owner before Sanity integration. Proposed approach: long-lived editorial/edition caches, shorter bounded placement refresh and a verified publication webhook, with time-based recovery if invalidation fails. Exact lifetimes remain open.

Invalidate affected data and page output on publish/update/unpublish/delete/reference changes. Shared creative updates invalidate every referencing placement and historical reader route. Check upstream Sanity CDN freshness as well as Next.js caches so an invalidation does not silently repopulate old data.

## Asset Delivery

- Separate compressed cover uploads; no archive PDF-to-cover generation in visitors' browsers.
- Responsive image variants, correct sizes/dimensions and lazy loading below the fold.
- React-PDF/PDF.js bundle and worker only on readable reader routes; start with current page/spread canvases only, cancellation and cleanup. Neighbor preparation needs measurement before adding it. Feature 02 uses direct PDFs without a page-image conversion pipeline.
- Direct PDF asset requests; verify CORS, byte-range support and cache headers on the actual host. Partial transfer is conditional.
- No archive-wide PDF prefetch, service-worker bulk PDF storage or unnecessary file proxy.
- Keep the approved hero video. Its preload/delivery is a future optimization item with visual review, not a reason to upload video into Sanity file assets.

## Budget

At integration/launch verify [Sanity pricing](https://www.sanity.io/pricing) and [usage accounting](https://www.sanity.io/docs/platform-management/plans-and-payments), including requests, storage and bandwidth, and independently check website hosting limits. Do not freeze date-sensitive quota numbers here.

Estimate monthly PDF opens multiplied by average delivered bytes, plus images/downloads; account for browser cache reuse rather than double-counting transfers. Example: 5,000 uncached full transfers of a 20MB PDF are approximately 100GB before images. This is a capacity illustration, not a billing prediction.

Sanity file uploads are the initial candidate. If measured delivery exceeds affordable allowances, resolve hosting before launch. The stable PdfAsset URL contract permits an explicit later delivery migration; this documentation does not introduce another service.

## Launch Verification

Check production-mode cold/repeated loads, CMS counts and navigation prefetch. Confirm page/zoom makes no CMS requests and archive/homepage loads no PDF code/bytes. Measure real long PDFs on mobile for transfer, memory and responsiveness. Verify publication swaps across old/new readers within the agreed delay, independent magazine ads, image sizes and stable banner geometry. Review service usage against conservative traffic assumptions, configure available usage notifications and set a review threshold below plan limits.
