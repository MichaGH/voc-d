import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { AdCreative, ReaderAdPlacement } from "@/types/content";
import { mockAdPlacementCases, mockReaderAdPlacements } from "../../data/mock/advertising.ts";
import { HOUSE_AD, resolveReaderAd } from "./resolve-reader-ad.ts";

const creative = (id: string, rest: Partial<AdCreative> = {}): AdCreative => ({
  id,
  title: `Kampaň ${id}`,
  advertiser: `Firma ${id}`,
  image: { src: `/images/ads/${id}.jpg`, alt: `Reklama firmy ${id}`, width: 1940, height: 180 },
  href: "https://example.com/",
  ...rest,
});

/** First creative of the chain ("house" when empty). */
const shown = (ad: ReturnType<typeof resolveReaderAd>) => ad.creatives[0] ?? { kind: "house" as const };

const placement = (rest: Partial<ReaderAdPlacement> = {}): ReaderAdPlacement => ({
  magazineKey: "pvk",
  enabled: true,
  candidates: [creative("a"), creative("b")],
  selectedId: "a",
  fallback: creative("default", { href: undefined }),
  ...rest,
});

describe("resolveReaderAd", () => {
  test("enabled placement shows the selected creative", () => {
    const ad = resolveReaderAd(placement());
    assert.deepEqual(ad.creatives.map((c) => [c.kind, c.advertiser]), [["paid", "Firma a"], ["fallback", "Firma default"]]);
  });

  test("selection change swaps the banner without touching editions", () => {
    const ad = shown(resolveReaderAd(placement({ selectedId: "b" })));
    assert.equal(ad.kind === "paid" && ad.advertiser, "Firma b");
  });

  test("disabled placement uses the magazine fallback", () => {
    const ad = resolveReaderAd(placement({ enabled: false }));
    assert.deepEqual(ad.creatives.map((c) => c.kind), ["fallback"]);
  });

  test("selection outside the candidate list is never shown, and no other candidate is substituted", () => {
    const ad = resolveReaderAd(placement({ selectedId: "zzz" }));
    assert.deepEqual(ad.creatives.map((c) => c.kind), ["fallback"]);
  });

  test("unusable selected artwork falls back", () => {
    for (const broken of [
      creative("a", { image: { src: "", alt: "x", width: 10, height: 10 } }),
      creative("a", { image: { src: "/x.jpg", alt: " ", width: 10, height: 10 } }),
      creative("a", { image: { src: "/x.jpg", alt: "x", width: 0, height: 10 } }),
      creative("a", { image: { src: "javascript:alert(1)", alt: "x", width: 10, height: 10 } }),
      creative("a", { advertiser: "" }),
    ]) {
      const ad = resolveReaderAd(placement({ candidates: [broken, creative("b")] }));
      assert.deepEqual(ad.creatives.map((c) => c.kind), ["fallback"]);
    }
  });

  test("missing placement or unusable fallback uses the house banner", () => {
    assert.deepEqual(resolveReaderAd(null), HOUSE_AD);
    assert.deepEqual(resolveReaderAd(undefined), HOUSE_AD);
    assert.deepEqual(resolveReaderAd(placement({ enabled: false, fallback: undefined })), HOUSE_AD);
    assert.deepEqual(
      resolveReaderAd(placement({ enabled: false, fallback: creative("d", { image: { src: "", alt: "", width: 1, height: 1 } }) })),
      HOUSE_AD,
    );
  });

  test("unsafe destinations make the banner non-clickable", () => {
    for (const href of ["javascript:alert(1)", "data:text/html,x", "//evil.example", "mailto:a@b.sk", " "]) {
      const ad = shown(resolveReaderAd(placement({ candidates: [creative("a", { href })] })));
      assert.equal(ad.kind, "paid");
      assert.equal(ad.kind === "paid" && ad.href, undefined, href);
    }
    const internal = shown(resolveReaderAd(placement({ candidates: [creative("a", { href: "/inzercia" })] })));
    assert.equal(internal.kind === "paid" && internal.href, "/inzercia");
  });

  test("invalid mobile artwork is dropped without losing the banner", () => {
    const ad = shown(
      resolveReaderAd(placement({ candidates: [creative("a", { mobileImage: { src: "/m.jpg", alt: "", width: 640, height: 200 } })] })),
    );
    assert.equal(ad.kind, "paid");
    assert.equal(ad.kind === "paid" && ad.mobileImage, undefined);
  });

  test("resolved props expose no internal ids or titles", () => {
    const ad = shown(resolveReaderAd(placement()));
    assert.deepEqual(Object.keys(ad).sort(), ["advertiser", "href", "image", "kind"]);
  });
});

describe("fixtures", () => {
  test("PVK and SBD placements resolve independently", () => {
    const pvk = shown(resolveReaderAd(mockReaderAdPlacements.find((p) => p.magazineKey === "pvk")));
    const sbd = shown(resolveReaderAd(mockReaderAdPlacements.find((p) => p.magazineKey === "sbd")));
    assert.equal(pvk.kind, "paid");
    assert.equal(sbd.kind, "paid");
    assert.notDeepEqual(pvk, sbd);
  });

  test("documented failure cases resolve as described", () => {
    assert.equal(shown(resolveReaderAd(mockAdPlacementCases.disabled)).kind, "fallback");
    assert.equal(shown(resolveReaderAd(mockAdPlacementCases.selectionNotInCandidates)).kind, "fallback");
    assert.equal(shown(resolveReaderAd(mockAdPlacementCases.brokenSelectedNoFallback)).kind, "house");
    assert.equal(shown(resolveReaderAd(mockAdPlacementCases.missing)).kind, "house");
  });
});
