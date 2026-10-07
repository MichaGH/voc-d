# 01 — Iterative Design and Website Structure

## Status and Purpose

Specification prepared; implementation has not started. Feature 01 is an iterative design and site-structure phase, developed over many user prompts and visual reviews. The user will refine layouts with the implementing agent until satisfied. A first draft or one completed prompt does not mean this feature is done.

Extend the chosen VOC design D, preserving its editorial character, typography and palette while changing the hero, content hierarchy and routes described here. Implement fixtures and reusable content operations first; connect Sanity last.

No PDF reading in feature 01. [Feature 02](02-pdf-reader-and-advertising.md) owns the reader and its magazine-level paid advertising. Preparing data for that later feature is allowed; installing a renderer or building a reader is not.

## Confirmed Owner Requests

- Distinguish the two magazines in the homepage hero instead of placing both under one generic video/message.
- Both magazines must be visible and easy to select; each has its own video and potentially its own message.
- Hovering/selecting a magazine changes the active presentation and makes its cover more prominent. Tiny slide dots alone are insufficient.
- Change Inzerujú u nás to Partneri.
- Shorten the magazine introduction to `Vždy o krok vpred`.
- Replace the general Čo nájdete v časopisoch treatment with content specific to each magazine.
- Build a Časopisy page, a dedicated page for each title and an edition gallery subpage for each.
- Represent optional vkladačky: additional printed sheets/booklets belonging to particular editions.
- Add Vzdelávanie as an editable publishing section for conference/course announcements and related articles.
- Provide Edičný plán pages.
- Plan substantial text/media/content editing in Sanity, within designed templates.
- Use gsap and @gsap/react for complex animation if required; the user intends to add GSAP skills.

These requests define scope. Exact arrangements, motion and section counts remain subject to the user's visual review.

## Working Design Direction

The initial hero direction is one stage with two persistent magazine-cover selectors, not a generic image carousel. Each magazine has one presentation: assigned background video/poster, title, short message and relevant action.

The active cover becomes larger/more prominent; the other remains clearly visible with its magazine name. Selecting the other cover changes background/copy/active emphasis. The magazines act as visible slide navigation, so the visitor can understand the choice without interpreting dots.

This is a direction for the first prototype, not an approved final composition. The user may prefer side-by-side panels, a different cover arrangement, another copy position or less motion after seeing it. Those refinements belong to this feature, without restarting its architecture.

### Hero Interaction Contract

- Initial render contains readable text, both cover choices and a usable poster before video/animation initializes.
- Mouse hover on a magazine selector changes selection; a short intentional-hover threshold may prevent accidental rapid switching.
- Click/tap and keyboard activation also select it. Selection must work without hover on touch devices.
- Keep a separate clearly labeled action to open the selected magazine. Do not make the same first tap both change slides and unexpectedly navigate.
- Selector hit areas remain stable while covers enlarge; scaling must not trigger hover oscillation or cover the other option.
- The latest selection wins. Cancel/reverse superseded transitions; never queue a long series of animations after rapid input.
- Show active identity visually and accessibly. Use semantic selection controls and correct keyboard behavior for the chosen pattern.
- Retain both choices on mobile, rather than hiding one cover as the current hero does.
- Keep one meaningful H1 and readable selected copy; hidden slide links must not remain in the tab order.

Prototype manual selection first. Automatic cycling is an optional design variant, not a prerequisite. If the user adopts cycling, provide a pause control and suspend it on hover/focus, user selection, hidden tab/off-screen state and reduced motion. Do not resume against a manual selection without an explicit interaction policy agreed during review.

### Hero Media, Motion and Performance

Use separate assigned media for PVK and SBD. A suitable video must actually match its title's audience; if approved footage is missing, use an honest static poster/temporary fixture and record the asset need. Do not silently reuse one generic video for both identities.

At most one video plays in settled state. Avoid eagerly downloading/decoding both complete videos; activate the next source on deliberate selection, use posters while loading and pause hidden/off-screen media. Any brief overlap during a reviewed transition must be bounded.

Videos are decorative, muted and inline. Failed/blocked playback falls back to a poster without losing content/actions. Respect reduced motion with a usable static treatment; avoid mandatory animation or long delays before navigation.

Simple hover/fade treatments can use CSS. For complex coordinated motion, use gsap with @gsap/react, scoped client-side animation and cleanup. These dependencies/GSAP skills are not currently installed. Read any GSAP skill the user adds before using it; do not invent an unavailable skill or install unrelated animation stacks.

Do not upload production hero video into Sanity's raw file storage as the default delivery solution. Use local clips for fixtures and keep a replaceable video URL/poster contract; decide a suitable production video host separately. Sanity can edit the approved media reference without storing all playback bytes there.

## Homepage Changes and Content Hierarchy

| Area | Initial requirement/direction |
| --- | --- |
| Hero | Magazine-specific selectable presentations with both covers visible |
| Partner strip | Visible label Partneri; editable partner names/logos and destinations later |
| Magazine introduction | Heading `Vždy o krok vpred`; distinct magazine summaries/actions |
| General topics | Move detailed audience/benefit/topic content to each magazine's landing page |
| Education | Preview editable education posts with a link to the full section |
| Recent editions | Small preview leading into the appropriate magazine galleries |
| Publisher/contact/services | Preserve their role; rearrange only as needed for a coherent reviewed layout |

The default content hierarchy puts full Čo nájdete detail under each magazine. Homepage magazine blocks can include concise distinctive benefits drawn from the same content. If the user prefers two richer magazine sections on the homepage, treat them as a reviewed alternative using those same records; do not duplicate independently edited copy or leave the generic section alongside them.

Removing/moving TopicsSection must account for its existing subscription CTA and navigation anchor. Preserve useful subscription/contact paths elsewhere instead of accidentally deleting them with the section.

Change only the requested partner label; Partneri does not automatically rename Inzercia services, the advertising CTA or later reader-ad labeling. Verify the actual partner roster before making production claims.

Do not derive edition frequency from current marketing statistics. Mock claims/copy are placeholders requiring owner confirmation.

## Route Structure

Use a consistent initial map; changes to these public paths are durable architecture decisions, not cosmetic tweaks.

| Route | Purpose |
| --- | --- |
| / | Publisher homepage and discovery |
| /casopisy | Magazine directory comparing/presenting both titles |
| /plynar-vodar-kurenar-klimatizacia | PVK landing page |
| /spravca-bytovych-domov | SBD landing page |
| /[magazineSlug]/vydania | That magazine's full edition gallery |
| /[magazineSlug]/vydania/[editionSlug] | Edition information, optional supplements and print/contact actions |
| /[magazineSlug]/edicny-plan | That magazine's annual editorial plans |
| /vzdelavanie | Education posts listing |
| /vzdelavanie/[postSlug] | Education announcement/article detail |

Use known magazine slugs only; unknown/cross-magazine identities return proper not-found states. Working keys remain pvk/sbd, while the brief's SPD abbreviation awaits editorial confirmation. The edition detail page is normal HTML, not a reader.

No top-level global Edičný plán is required initially: the two magazine-specific pages carry it. Expose both clearly through magazine navigation/directory so visitors do not need to guess which plan they opened.

Feature 02 keeps /[magazineSlug]/citat/[editionSlug]. Reserve that helper/destination for later without exposing dead live links now. In feature 01, cover cards open edition information; PDF availability may be labeled, but do not implement reading or silently redirect new reading actions to old PDFs.

Existing external links for content not rebuilt here remain intentional and clearly distinguished. Internalize new magazine/gallery/education/plan destinations once working. On subpages, publisher contact/service links can use /#kontakt and /#inzercia until dedicated routes exist; bare homepage anchors are not valid everywhere.

Do not create empty publisher/service/cart routes just to make navigation appear complete. Update shared navigation/footer with working routes and review its labels. A legacy redirect inventory is a later launch task; do not fabricate redirects for nonexistent new destinations.

## Page Requirements

### Magazine Directory and Landing Pages

The directory makes both titles visible with cover imagery, full names, distinct audiences, summaries and clear landing-page links.

Each magazine landing page has its own identity, audience, magazine-specific topic/benefit content, latest edition or small preview, gallery and Edičný plán actions, and print/subscription/contact information. Preserve recognition across pages through shared VOC styling and reusable components, while the text/content differs.

Place Čo nájdete content here initially. Topics/benefits may contain a heading, short copy and image; quantities and layouts are reviewable. Do not model them as exactly three cards because the current component has three.

### Edition Gallery and Detail

Show every supplied published cover for that title, grouped/filterable by year, with issue identity and an understandable path to its detail. Keep missing-PDF editions visible. A homepage preview must not become the only place historical covers can be found.

Detail pages show title, issue/year, cover, short description when supplied, available vkladačky and verified print/contact information. Ordering supports combined/special issues. Do not invent availability, prices, complete historical inventories or PDF URLs.

Printing/subscriptions are contact-based in this scope. Use an owner-approved inquiry destination; no e-commerce, stock management, payment or assumptions about supplements being sold separately.

### Vkladačky

Model an ordered optional list of inserts within each edition. An insert has an independent label/description and may have a preview/cover, format (A4, A5 or other), physical sheet count, optional sponsor credit and optional digital PDF metadata.

These are distinct from the magazine itself: a printed insert may have no digital version, and a digital file may be separate from the main PDF. Do not infer one from the other or append it to the main PDF.

Show a small Vkladačky section/list in edition detail when records exist; omit an empty section. Use short metadata and a preview where supplied, not a mandatory carousel or another full magazine page. Optional gallery badge/teaser may indicate inserts, subject to design review.

Physical sheet count and digital page count are separate. Some inserts have several sheets; format/sheet count are optional when unknown. Label printed-only versus digital availability honestly. Downloads/supplement PDF reading are not implemented in feature 01; whether feature 02 will later read separate insert files requires a deliberate spec extension.

### Edičný Plán

Each magazine has a page with clearly visible title/year and published years including future ones. Display issue label, planned publication/distribution timing, submission deadline where available and optional theme/note. Distinguish exact dates from month-only precision.

Use the selection/default rules in content-model.md. Plans are data, not dates baked into JSX, and do not automatically publish editions. Responsive rows/cards must keep labels readable and have an empty state. Supply clearly identified fixtures until the owner provides real dates.

### Vzdelávanie

Build a publishing section with listing and individual HTML article pages. It covers conference/course announcements and related educational material; it is broader than the current two fixed homepage links.

Starting contract: article records assigned to the education section, with conference/course/article kind, title, slug, excerpt, image, publication date and rich-text body. Event posts may additionally include occurrence date/time, location and an inquiry/registration URL. Article publication date and event occurrence date are distinct.

Do not require registration software, payments, live event feeds or private attendee data. Existing conference/course offers can remain evergreen links/previews; new dated posts are separate records and may reference the same offer.

Initial listing order is publication date descending with a stable tie-breaker and bounded loading. Past events remain published unless editors unpublish them; do not hide articles merely because an event date passed. Final public labels/categories and richer filtering can be refined through review.

## Editable Content and Provider Preparation

The owner/wife currently edit much of WordPress. Plan broad content editing, while layout and technical behavior remain in code. Do not promise unrestricted page-building or insist that all text must remain hardcoded.

Use the [editable-content contract](../domain/editorial-content.md) as the field inventory. This includes headings/body copy, CTA labels/approved destinations, magazine descriptions/topics/hero copy and assigned media, partner data, edition metadata/covers/inserts, plans, education posts, FAQs, contact and relevant publisher/service content.

Separate semantic domain content from UI decisions: editors can add/remove/reorder topic or partner items; frontend chooses card columns, typography, spacing and animation. If another field is requested later, extend its contract and record the durable decision.

Use shared references for reused data, so contact information/magazine benefits/education posts are not copied into multiple unrelated page fixtures. Templates may have dedicated content objects or documented overrides where the message is intentionally different.

Prepare asynchronous read operations and typed fixtures in data/mock/ behind lib/content/. Server Components read content; small client components receive props. No new presentation component should import the entire mock dataset. Keep navigation route registry separate from editable labels so editing copy cannot accidentally break routing.

Sanity is not installed as part of this feature. Preparing contracts does not count as delivering working editorial editing. At later integration map published CMS documents into the same interfaces and validate rich text, assets, links and references.

## Iterative Work and Progress Recording

This is the user's specific tracking policy for feature 01. Keep ai-workflow-rules.md unchanged; normal verification and truthful implementation reporting still apply.

| Change | Where to record it |
| --- | --- |
| Small visual revision: card count, gap, size, alignment, wording exploration | Implement/review; no separate tracker bullet or journal entry for each tweak |
| Adopted design direction: hero interaction, content hierarchy, visual identity or page template | Update ui-context.md and the relevant spec; record the current accepted rule rather than every abandoned attempt |
| Route/data/editorial contract decision | Update architecture/domain/spec context |
| Page/subpage or usable subsystem implemented | Update progress-tracker.md once for the meaningful milestone |
| Prototype awaiting visual approval | Tracker says implemented/in review, not approved or complete |
| Later context-only cleanup/spec preparation | Do not mark implementation progress |
| Whole feature approved and verified | Mark feature 01 complete only after user acceptance and structural checks |

When implementation starts, record feature 01 as active and the current meaningful milestone. Building the magazine directory, both landing pages, galleries/details, plans or education routes is implementation progress that must be reflected. Routine follow-up spacing/card tweaks can be summarized within the existing milestone.

User approval of one hero/layout does not approve all pages or complete feature 01. Major accepted decisions belong in durable context so another agent can resume them. If requirements remain uncertain, record them here/domain context and any blocking implementation question concisely in the tracker; avoid a transcript of every review prompt.

## Delivery and Review Units

These are review boundaries, not a command to build the entire website in one turn:

1. Hero prototype and exact homepage label/copy changes.
2. Magazine directory/landing templates and navigation.
3. Edition galleries/details and vkladačka representation.
4. Editorial-plan pages.
5. Education listing/article templates.
6. Provider/content preparation, cross-page consistency and final verification.

Build one coherent unit, show the rendered result in the available browser/preview, summarize what works and invite the user's next review. Continue subsequent units when directed; do not end after a plan without producing the requested unit. Validate structural behavior before review so the user is judging a working design.

Visual iteration can revisit completed units. Keep approved decisions consistent across pages without automatically rolling out speculative redesigns everywhere.

## Verification and Completion

- Both hero magazine choices are visible on desktop/mobile and usable by hover, tap and keyboard.
- Assigned copy/media and active-cover emphasis follow selection; rapid switching, failed video and reduced motion work.
- Settled hero playback is bounded, and page content does not wait for a video to download.
- `Partneri` and `Vždy o krok vpred` are applied; generic topics have a clear magazine-specific replacement.
- Directory, both landing pages, galleries/details, plans and education listing/details resolve with meaningful fixtures.
- Invalid/mismatched slugs return correct not-found states; empty/missing data is handled.
- Inserts belong to the correct edition and printed-only/digital distinctions are honest.
- Current/future plan years and date precision are preserved.
- Shared navigation/CTAs work from subpages; no dead PDF-reader actions.
- No reader dependency/worker/PDF fetch is introduced by browsing these pages.
- Content contracts permit the agreed editing scope and keep classes/layout out of records.
- Responsive/accessibility checks and appropriate project lint/type/build checks pass for code actually changed.
- The user explicitly accepts final designs. Tracker reflects page milestones and final status accurately.

No implementation is claimed by this spec. No tracker update is needed for writing it.

## Open Design and Content Questions

- Exact hero arrangement, approved separate videos/posters and optional cycling.
- Homepage summary depth versus richer magazine-specific blocks; default detail lives on magazine pages.
- Actual vkladačka samples, print availability and later digital delivery expectations.
- Final magazine abbreviation, education labels and approved copy/assets/schedules.
- Final list of additional fields the wife wants editable.
- Production video delivery and traffic budget.

Resolve visual choices through prototypes/review, not a long questionnaire before useful work can begin.

## References

- [GSAP React guidance](https://gsap.com/resources/React/) for scoped useGSAP lifecycle and interaction cleanup.
- Installed Next.js guides under node_modules/next/dist/docs/ before implementation.
- Installed Sanity/content-modeling skills referenced in code-standards.md when extending editorial contracts.
