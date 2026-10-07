# UI Context

## Visual Reference

The approved starting point is [VOC design D](https://voc-d.thegrandpoints.com/). Local `app/globals.css`, `app/layout.tsx` and homepage/layout components define its precise implementation. Context updates do not authorize a redesign.

[Feature 01](feature-spec/01-design-and-website-structure.md) explicitly authorizes iterative hero/layout/content changes within this identity. The existing patterns below describe the baseline, not a requirement to retain every section or arrangement. Final compositions require user review; preserve significant accepted decisions here rather than logging every spacing/card-count tweak.

This is an editorial publisher website: white content sections, navy photographic/video sections, large headings, blue links and pill actions. No dark-only technical workspace, canvas or theme switcher.

## Colors

Colors are existing CSS variables in `app/globals.css`, referenced through Tailwind arbitrary values such as `bg-[var(--color-navy)]`, `text-[var(--color-copy)]` and `border-[var(--color-line)]`. Only the font is mapped through `@theme inline`; old utilities such as `bg-base` and `text-brand` do not exist.

| Variables | Values | Role |
| --- | --- | --- |
| `--color-background` | `#ffffff` | Page background |
| `--color-navy`, `--color-navy-light` | `#04173a`, `#0a2f6e` | Main text, dark sections, gradients |
| `--color-blue`, `--color-blue-light`, `--color-blue-pale`, `--color-blue-wash` | `#006fe8`, `#4da3ff`, `#7fb6ff`, `#e8f1ff` | Links/accents/light treatments |
| `--color-cta`, `--color-cyan` | `#0a3fb5`, `#00c2e8` | Contact panel, focus, hover accents |
| `--color-green`, `--color-mint`, `--color-teal` | `#0b7a5e`, `#1cc49a`, `#00708c` | Editorial accents; existing SBD eyebrow green, PVK teal |
| `--color-gold` | `#ffc24b` | Rating accent |
| `--color-copy`, `--color-muted`, `--color-steel`, `--color-slate-blue` | `#4a5b70`, `#5b6b80`, `#7d8fa5`, `#2a4468` | Body text/supporting details |
| `--color-hero-copy`, `--color-card-copy`, `--color-about-copy` | `#d2deee`, `#d3ddea`, `#b9c8da` | Text on dark sections |
| `--color-stat-copy`, `--color-cta-copy` | `#a9b9cc`, `#dcebff` | Statistics/contact text |
| `--color-surface`, `--color-surface-hover` | `#f3f6fa`, `#e8eef6` | Light surfaces and hover |
| `--color-line`, `--color-line-dark`, `--color-line-button`, `--color-line-light` | `#dce4ee`, `#cbd5e1`, `#d3dce6`, `#e3e9f0` | Dividers and borders |

White/transparent utilities, white opacity borders and existing navy rgba gradients/shadows are intentional. Keep them. New components reuse the palette; Sanity data must not contain Tailwind classes or arbitrary visual choices.

## Typography

- Geist via `next/font/google`, `latin`/`latin-ext`, `display: swap`.
- CSS variable `--font-geist`; `--font-sans` maps to it. No monospace UI requirement.
- Body 17px/1.6; small labels typically 14–15px.
- Hero: `clamp(44px,6vw,92px)`, bold, .98 line height, -.04em tracking.
- Common section headings: `clamp(36px,4.4vw,64px)`, tight line height, -.035em tracking.
- Keep fluid editorial headings, readable paragraph widths, balanced headings and existing text-pretty treatments.
- Public copy/controls are Slovak; retain diacritics and `lang="sk"`.

## Layout and Shapes

- Most content uses centered 1400px containers and `px-5 md:px-8 xl:px-12`.
- Large fluid spacing, photographic sections, editorial whitespace and image/text compositions define the page.
- Fixed header: 76px high, transparent over hero, navy/blurred when scrolled/open. Anchor sections offset by 76px.
- Pill buttons/tabs use `rounded-full`; action heights generally 52–56px, header actions 46px.
- Education cards: `rounded-3xl`; audience images/tabs: 28px corners; contact panel: 32px; covers: `rounded-sm`/`rounded-md`.
- Match the relevant existing shape instead of imposing a universal radius hierarchy.

## Existing Homepage Patterns

Sequence: video hero with overlapping covers, partner marquee, statistics, magazine presentations, publisher statement, topics, photographic divider, audience tabs, education, advertising services, latest-issue cover rail, FAQ, contact CTA and footer.

Covers retain portrait proportions (existing assets 595:842), restrained shadows and occasional slight rotations. Never crop important cover content into landscape cards. The homepage rail previews recent issues; magazine archives must expose every supplied cover.

No component library is installed. Reuse existing components/simple local primitives. Current icons include text arrows, plus/minus marks and small custom graphics; Lucide/shadcn are not mandatory.

## Feature 01 Direction and Review Rules

Confirmed copy changes: Inzerujú u nás becomes `Partneri`; the magazine introduction becomes `Vždy o krok vpred`. Advertising service/CTA labels are not renamed by the partner-strip change.

The hero needs distinct magazine presentations with separately assigned videos/posters and optional different copy. Keep both named cover choices visible on desktop/mobile; hovering/selecting changes the active presentation and enlarges/emphasizes its cover. Cover choices, not tiny dots alone, provide navigation. Use keyboard/tap selection and separate navigation actions. The initial stage/cover arrangement is a prototype direction, not an approved final layout.

Prototype manual selection first; automatic cycling is optional and needs review, pause controls and focus/reduced-motion handling if adopted. Use CSS for simple motion and gsap/@gsap/react for complex sequences when needed, with cleanup and any user-added GSAP skill. Keep stable selector hit areas, bounded active-video playback and working posters when video fails/is disabled.

Detailed Čo nájdete content belongs on each magazine page initially. Homepage magazine summaries may reuse concise benefits; two richer magazine-specific homepage sections are an alternative to review, without independent duplicate content. Preserve the subscription actions currently located inside the general topics section when moving it.

The new page family includes a magazine directory, magazine landings, galleries, HTML edition details with optional Vkladačky, magazine-specific Edičný plán and education listings/articles. Card counts, arrangements and spacing are refined through review. Content editing is planned through the [editorial inventory](domain/editorial-content.md); layout/code remain frontend responsibilities.

Record accepted interaction/content/template decisions here; route/data decisions belong in architecture/domain context. Track usable pages/subsystems in progress-tracker.md, not each minor visual revision. No final visual approval or completed implementation is claimed by these planning notes.

## Future Magazine Pages and Edičný Plán

Extend existing typography, palette, spacing, buttons and cover treatment. Magazine identity comes from its title/content and current accents, not separate unrelated themes. Provide clear paths to editions, Edičný plán and advertising information.

Plans have an explicit year selector and clearly labeled issue, publication/distribution date, submission deadline and optional theme/note. Mobile rows may stack without losing labels. Future years remain accessible. Dates come from content, not fixed decorative months. Final layout is chosen during implementation.

## Future PDF Reader

Keep VOC navigation, magazine/issue identity and a clearly labeled advertising rectangle above the PDF. It is separate HTML, not embedded in the PDF. Reserve consistent slot dimensions for paid/default/loading states to prevent layout jumps.

Use navy/blue controls, light surfaces and clear Slovak loading/error messages. Preserve PDF proportions and readable mobile controls. Banner dimensions and sticky/fullscreen behavior are undecided; a normal non-sticky block is the initial assumption. Native/raw PDF viewing cannot guarantee a website banner.

## Interaction and Accessibility

Retain visible cyan focus outlines, skip navigation, semantic headings and descriptive control labels. Extend responsive navigation/tabs/accordions with keyboard and touch support. Covers need edition identity in text or accessible link names; decorative duplicate images can have empty alt text.

Existing motion includes a 42-second marquee, smooth archive scrolling, subtle cover lifts and short transitions. Honor reduced-motion CSS; explicit scripted-scroll/video handling can be improved when scoped. Label ads `Inzercia`; keep fallback/error states accessible.
