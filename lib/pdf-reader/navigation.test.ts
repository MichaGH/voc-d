import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  adjacentViews,
  chooseLayout,
  clampPage,
  jumpPage,
  nextPage,
  parsePageInput,
  previousPage,
  viewForPage,
  viewLabel,
  type ReaderLayout,
} from "./navigation.ts";

/** Walks "next" from page 1 and returns every view shown. */
function walk(pageCount: number, layout: ReaderLayout) {
  const views: number[][] = [];
  let page: number | null = 1;
  while (page !== null) {
    views.push(viewForPage(page, pageCount, layout));
    page = nextPage(page, pageCount, layout);
  }
  return views;
}

/** Walks "previous" from the last page. */
function walkBack(pageCount: number, layout: ReaderLayout) {
  const views: number[][] = [];
  let page: number | null = pageCount;
  while (page !== null) {
    views.push(viewForPage(page, pageCount, layout));
    page = previousPage(page, pageCount, layout);
  }
  return views.reverse();
}

describe("spread pairing", () => {
  test("7 pages: 1, 2–3, 4–5, 6–7", () => {
    assert.deepEqual(walk(7, "spread"), [[1], [2, 3], [4, 5], [6, 7]]);
  });

  test("6 pages: final even page stands alone", () => {
    assert.deepEqual(walk(6, "spread"), [[1], [2, 3], [4, 5], [6]]);
  });

  test("1 and 2 page documents", () => {
    assert.deepEqual(walk(1, "spread"), [[1]]);
    assert.deepEqual(walk(2, "spread"), [[1], [2]]);
    assert.deepEqual(walk(3, "spread"), [[1], [2, 3]]);
  });

  test("walking back visits the same views", () => {
    for (const count of [1, 2, 3, 6, 7, 36, 37]) {
      assert.deepEqual(walkBack(count, "spread"), walk(count, "spread"), `count ${count}`);
      assert.deepEqual(walkBack(count, "single"), walk(count, "single"), `count ${count}`);
    }
  });

  test("never references a page beyond the count", () => {
    for (let count = 1; count <= 40; count++) {
      for (const view of walk(count, "spread")) {
        assert.ok(view.every((page) => page >= 1 && page <= count));
      }
    }
  });

  test("jump to 13 shows 12–13 and single shows 13", () => {
    assert.deepEqual(viewForPage(13, 80, "spread"), [12, 13]);
    assert.deepEqual(viewForPage(13, 80, "single"), [13]);
    assert.deepEqual(viewForPage(12, 80, "spread"), [12, 13]);
  });

  test("jump to 5 then switch layouts keeps the focused page", () => {
    const focused = 5;
    assert.deepEqual(viewForPage(focused, 7, "spread"), [4, 5]);
    assert.deepEqual(viewForPage(focused, 7, "single"), [5]);
  });

  test("next/previous from a page that is the right half of a spread", () => {
    assert.equal(nextPage(13, 80, "spread"), 14);
    assert.equal(previousPage(13, 80, "spread"), 10);
    assert.equal(previousPage(2, 80, "spread"), 1);
    assert.equal(previousPage(1, 80, "spread"), null);
    assert.equal(nextPage(80, 80, "spread"), null);
    assert.equal(nextPage(79, 80, "spread"), 80);
  });

  test("single layout steps one page", () => {
    assert.deepEqual(walk(4, "single"), [[1], [2], [3], [4]]);
  });

  test("adjacent views for preparing turns", () => {
    assert.deepEqual(adjacentViews(1, 7, "spread"), { next: [2, 3], previous: null });
    assert.deepEqual(adjacentViews(4, 7, "spread"), { next: [6, 7], previous: [2, 3] });
    assert.deepEqual(adjacentViews(6, 6, "spread"), { next: null, previous: [4, 5] });
  });
});

describe("bounds and labels", () => {
  test("clampPage", () => {
    assert.equal(clampPage(0, 10), 1);
    assert.equal(clampPage(11, 10), 10);
    assert.equal(clampPage(Number.NaN, 10), 1);
    assert.equal(clampPage(3.7, 10), 3);
  });

  test("viewLabel", () => {
    assert.equal(viewLabel([1], 80), "Strana 1 z 80");
    assert.equal(viewLabel([12, 13], 80), "Strany 12–13 z 80");
  });

  test("chooseLayout uses the stage width", () => {
    assert.equal(chooseLayout(959), "single");
    assert.equal(chooseLayout(960), "spread");
  });
});

describe("fast jumps", () => {
  test("±10 pages, normalised to the view and clamped", () => {
    assert.equal(jumpPage(1, 36, "spread", 10), 10); // 11 → spread 10–11
    assert.equal(jumpPage(12, 36, "spread", 10), 22);
    assert.equal(jumpPage(30, 36, "spread", 10), 36);
    assert.equal(jumpPage(3, 36, "spread", -10), 1);
    assert.equal(jumpPage(15, 36, "single", -10), 5);
    assert.equal(jumpPage(36, 36, "single", 10), 36);
  });
});

describe("page input", () => {
  test("accepts integers within the page count", () => {
    assert.deepEqual(parsePageInput(" 13 ", 80), { ok: true, page: 13 });
    assert.deepEqual(parsePageInput("1", 1), { ok: true, page: 1 });
  });

  test("rejects empty, fractional, negative and out-of-range values", () => {
    for (const raw of ["", "  ", "0", "81", "-3", "2.5", "1e2", "abc", "12a"]) {
      const result = parsePageInput(raw, 80);
      assert.equal(result.ok, false, raw);
    }
    assert.deepEqual(parsePageInput("81", 80), { ok: false, error: "Zadajte číslo od 1 do 80." });
  });
});
