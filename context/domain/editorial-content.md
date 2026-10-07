# Editorial Content and Editable Fields

## Purpose and Status

This contract supports [feature 01](../feature-spec/01-design-and-website-structure.md): broad editorial control within designed VOC templates. Implement with typed fixtures first; actual Sanity editing comes later. Content changes are editable; CSS, route mechanics, component markup and animation code remain frontend responsibilities.

## Editing Inventory

| Content | Owner-editable fields planned for Sanity | Frontend responsibility |
| --- | --- | --- |
| Publisher/site settings | Company/contact information, social/external links, default metadata | Validation, rendering and technical routing |
| Homepage | Section headings/intros, applicable CTA labels/destinations, approved preview/featured selections | Section templates, grid/layout and responsive rules |
| Magazine | Title, descriptions/audience, ordered benefits/topics, images, subscription/inquiry copy | Magazine identity consistency and template |
| Hero presentation | Per-magazine headline/summary/CTA, cover or edition reference, video reference and poster | Hover/tap selection, active emphasis, loading and motion |
| Partners | Names/logos/alt text, optional destinations, display order | Marquee/grid behavior and responsive density |
| Edition | Cover, issue/year/order, description, PDF metadata and verified print/inquiry information | Gallery/detail layout; later reader |
| Vkladačky | Ordered per-edition labels/descriptions, preview, format/sheet count, optional sponsor and digital file | Honest availability labels and presentation |
| Editorial plan | Year and ordered issue/timing/deadline/theme records | Year selection and accessible responsive display |
| Education posts | Title/slug/excerpt/body/image/publication date, kind and optional event details | Listing/detail templates and safe rich-text rendering |
| FAQ/publisher/services | Questions/answers and agreed text/images/actions | Component behavior and styling |
| Navigation | Labels and approved visible items/destinations within supported navigation | Route registry, current-page state and mobile menu |

This is the initial field inventory to support, not a promise that those editors already exist. Additional requested content can be added without allowing arbitrary executable HTML or unrestricted template building.

## Relationships and Reuse

Use magazine documents for reusable magazine identity/topics; edition references for hero/preview covers; education article references for home previews. Store shared contact data once. Homepage-specific copy can live in its own singleton/template object without duplicating canonical magazine facts.

Embed unique ordered topic/benefit objects within a magazine. Embed edition-specific inserts within that edition. Keep independent published articles separate. Domain records expose semantic content, not eyebrowClass, Tailwind strings, pixel dimensions for layout or card-count fields.

List length/order may be editable; the frontend computes columns and breakpoints. Optional section visibility can be exposed through validated settings where agreed, without a general drag-and-drop page builder.

## Education Content

Extend the article contract with section education and kind conference/course/article for the initial publishing section. Other editorial sections remain future scope. A post may refer to magazines where relevant; it does not have to belong to one.

Optional event details have an occurrence date or start/end time, location and validated registration/inquiry destination. Use date-only precision when time is unknown and an explicit timezone when time is provided. Keep occurrence and publication dates separate.

Use Portable Text for the future Sanity body and compatible fixtures. Render through approved serializers later; raw rich-text data must not supply executable markup or visual-system overrides. Keep evergreen course/conference offer links distinct from dated announcements.

## Hero Media

ContentVideo is a normalized optional video URL/source reference plus poster image and useful metadata. Each magazine has separately assigned relevant footage. Local public video is a fixture; production hosting remains a budget/delivery decision. Sanity may store the reference/assignment and poster but should not serve production hero videos as raw file assets.

## Vkladačka Contract

An embedded insert has a stable entry key, title, optional description/preview, optional paperFormat (A4/A5/other with descriptive label), optional physicalSheetCount, optional sponsor credit and optional PdfAsset.

Presence of a printed insert is independent of digital availability. Physical sheets and PDF pages are distinct. Use an empty array for no inserts, not fake placeholder attachments. Do not create a separate supplement magazine identity, checkout product or file-processing workflow by inference.

Feature 01 presents metadata/previews only. Separate-file reading/downloading is deferred and needs an explicit extension of the relevant future feature.

## Validation and Integration

Validate required titles/slugs, scoped references, dates, integer counts, image alt text and link protocols. Do not invent prices or availability. Public reads expose published content only; malformed optional data gets a safe omitted/fallback treatment, not a broken page.

Keep published-only validation and source normalization in the provider. During Sanity integration, expose clear editor groups (publisher, homepage, magazines, editions/inserts, plans, education, partners) and explain which visual behavior remains in code. Review additional editing needs with the owner/wife before schema freeze.
