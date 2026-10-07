# Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes — do not layer workarounds.
- Do not mix unrelated concerns in one component or route.
- Respect the system boundaries defined in `architecture-context.md`.

## TypeScript

- Strict mode is required throughout the project.
- Avoid `any`; use explicit interfaces or narrowly scoped types.
- Validate unknown external input at system boundaries before trusting it.
- Use `interface` for object contracts.

## Next.js

- Default to React Server Components.
- Add `"use client"` only when the component needs browser interactivity, hooks, or real-time state.
- Keep route handlers focused on a single responsibility.
- Long-running work belongs in background tasks, not in request handlers.

## Styling

- Follow `ui-context.md` and existing VOC components. Context maintenance must not change the visual design.
- Reuse `--color-*` variables in `app/globals.css` through existing utilities such as `bg-[var(--color-navy)]`, `text-[var(--color-copy)]` and `border-[var(--color-line)]`.
- White/transparent utilities, opacity treatments, navy gradients and existing shadows belong to this style. Do not introduce the previous app's token names or an unrelated palette.
- Match existing shapes: pill buttons/tabs, small-radius covers, 24–28px image/card corners and the 32px contact panel. Do not impose a different radius system.
- Preserve Geist typography, fluid headings, generous spacing and responsive 1400px containers.
- Keep styling in components/CSS. Content records contain semantic keys, not Tailwind classes.

## API Routes

- Validate and parse request input before any logic runs.
- Enforce auth and project ownership checks before any mutation.
- Return consistent, predictable response shapes.
- Keep route handlers thin — push complexity into shared modules or background tasks.

## Data and Storage

- Use domain fixtures in `data/mock/` first, then Sanity for structured content and asset references. Integrate Sanity last; no Prisma or Vercel Blob.
- Read editable content through asynchronous operations in `lib/content/`. Mock/Sanity adapters normalize to the same interfaces in `types/content.ts`.
- New presentation components do not import mock datasets or GROQ queries. Server Components load data and pass minimal props to interactive components.
- Public reads return published content only. Validate external data, normalize references/assets and keep credentials server-side.
- Editions and editorial plans belong to one magazine. Reader advertising resolves from its magazine placement, never an edition-specific copy.
- Keep PDF bytes out of metadata payloads. Use public fixture URLs first and direct asset delivery in production.
- Define explicit cache/freshness policies and measure requests/bandwidth. Avoid visitor polling; caching does not make asset traffic free.
- Never silently replace failed production CMS reads with dummy data.

## File Organization

- `app/` — public routes, metadata, layouts and server-side composition.
- `components/layout/`, `components/homepage/` — existing UI; add focused magazine/editorial/reader folders as implemented. Domain rules stay in shared modules.
- `lib/content/` — server-only read facade, provider contract, mock/Sanity adapters and mapping.
- `lib/advertising/` — reusable ad selection/fallback rules.
- `types/content.ts` — provider-independent interfaces; generated Sanity query types stay separate.
- `data/mock/` — future domain fixtures. Existing `data/homepage.ts` and `data/navigation.ts` are presentation fixtures/static configuration to migrate as needed.
- `public/images/`, `public/videos/`, future `public/pdfs/` — local assets; not runtime upload storage.
- `sanity/` — future schemas, queries, Studio configuration and generated types, introduced during final integration.
- `constants/` — site configuration and shared links; avoid duplicated route/domain rules.
- `app/api/` — justified integration handlers such as verified content revalidation; no public auth/mutation system.
- `context/domain/` — content relationships, operation contracts, advertising and delivery/cost rules.
- `context/feature-spec/` — substantial behavioral specs; routine visual changes can use concise context notes.
- Name files after the responsibility they contain, not the technology.

## Applicability of Shared Route Rules

The General, TypeScript, Next.js and API Routes sections remain unchanged. Project ownership language does not introduce VOC reader accounts: there are no public mutation routes. Future integration endpoints authenticate the integration (for example a webhook signature); editors use Sanity's authenticated Studio. The shared background-work rule does not require installing a background service here.

## Installed Sanity Skills

- Read [sanity-best-practices](../.agents/skills/sanity-best-practices/SKILL.md) for Sanity integration, schemas, GROQ, assets, Studio and TypeGen; load relevant references only. Installed Next.js docs govern version-specific Next.js APIs.
- Read [content-modeling-best-practices](../.agents/skills/content-modeling-best-practices/SKILL.md) for relationships, reuse and content/presentation separation.
- Use [portable-text-serialization](../.agents/skills/portable-text-serialization/SKILL.md) for rich-text rendering and [portable-text-conversion](../.agents/skills/portable-text-conversion/SKILL.md) for HTML/Markdown imports.
- Use [sanity-migration](../.agents/skills/sanity-migration/SKILL.md) for agreed legacy imports and [sanity-studio-upgrade](../.agents/skills/sanity-studio-upgrade/SKILL.md) for later Studio upgrades.
- Use [seo-aeo-best-practices](../.agents/skills/seo-aeo-best-practices/SKILL.md) for metadata, sitemaps and structured data.
