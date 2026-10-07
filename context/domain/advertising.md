# Reader Advertising

## Confirmed Rules

One horizontal placement above the PDF is manually managed by the owner. It belongs to a magazine, not an edition. Selecting company A for PVK applies to all PVK editions, including historical ones, after cache refresh; SBD has independent configuration. A default is required. Rotation may be wanted later but is not approved now.

Commercial arrangements/payment happen outside the website.

## Initial Selection

Each magazine placement has ordered creative references and one explicitly selected creative. No randomness, timer, round-robin, campaign scheduling or edition override.

1. Show the selected published creative only when the published placement is enabled, the selection belongs to its candidate list and its image/accessible data are usable.
2. Otherwise use a valid configured magazine fallback.
3. Otherwise use a local built-in VOC house banner inviting contact about advertising through the existing email link.

Never silently substitute another paid candidate. A missing destination can make a banner non-clickable; unsafe destinations must never become links. Final default artwork/copy and banner dimensions await design decisions.

## Owner Workflow

Create/upload a creative, supply accessible text/destination, add/select it in the relevant placement and publish. Replace the selection or disable the placement to change all readers for that magazine. Draft edits stay private to editing/preview.

Publication and enabled are separate: publication makes content available; enabled allows paid display. Owner changes are manual initially.

## Refresh and Failures

Invalidate placement caches by magazine plus cached route output containing them, including old reader pages. New loads reflect changes within the agreed delay. Open readers keep their initial ad until reload/navigation; no polling.

Missing/failed placement reads use the local fallback. Broken paid images switch to it without moving the PDF; built-in text still works if artwork fails. Prefer supplied valid mobile creative, otherwise fit desktop artwork without cropping important copy. Label the slot Inzercia; reserve its geometry; never inject advertiser scripts/raw executable HTML.

No impression/click persistence, tracking pixels or reporting in this scope.

## Future Rotation

Keep placement/creative separation, candidate references and a pure reusable resolveReaderAd function. A later spec may add cadence, ordering/weights, visibility and reduced-motion rules. Reuse a fetched candidate set instead of fetching from Sanity on each switch. No future rotation state belongs on editions.

## Placement Limits and Open Choices

The ad belongs to the site's reader; raw downloads/native external PDF views do not include it. Omitting a download button does not protect a public PDF. Decide visible download/raw-file links, slot dimensions, mobile assets, sticky/fullscreen behavior, final fallback and future rotation before implementing those choices. A normal non-sticky bar is the initial working assumption.
