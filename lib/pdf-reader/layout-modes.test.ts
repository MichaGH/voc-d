import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { GRID_GAP, GRID_PAGE_WIDTH, gridColumns, gridLayout, gridRow, gridRowPages, gridVisibleRows } from "./grid.ts";
import { SCROLL_MAX_PAGE_WIDTH, SCROLL_ZOOM_LEVELS, pageAt, pageOffsets, scrollPageWidth, visiblePages } from "./scroll.ts";
import { canZoom, stepZoom } from "./zoom.ts";

const A4 = { width: 595, height: 842 };

describe("page overview grid", () => {
  test("4 columns on large screens, 3 on medium, 1 on phones", () => {
    assert.equal(gridColumns(1905), 4);
    assert.equal(gridColumns(1200), 4);
    assert.equal(gridColumns(1199), 3);
    assert.equal(gridColumns(768), 3);
    assert.equal(gridColumns(767), 1);
    assert.equal(gridColumns(375), 1);
  });

  test("pages keep their size on resize; only the column spacing changes", () => {
    const wide = gridLayout(1905, 36, A4);
    const narrower = gridLayout(1400, 36, A4);
    assert.equal(wide.pageWidth, GRID_PAGE_WIDTH);
    assert.equal(narrower.pageWidth, GRID_PAGE_WIDTH);
    assert.equal(wide.pageHeight, narrower.pageHeight);
    assert.equal(wide.rowStride, wide.pageHeight + GRID_GAP);
  });

  test("once the column spacing equals the row gap, pages shrink until a column drops", () => {
    // 4 columns: spacing reaches the gap at 4 × (282 + 30) = 1248 px.
    assert.equal(gridLayout(1248, 36, A4).pageWidth, GRID_PAGE_WIDTH);
    const squeezed = gridLayout(1200, 36, A4);
    assert.equal(squeezed.columns, 4);
    assert.ok(squeezed.pageWidth < GRID_PAGE_WIDTH);
    assert.equal(1200 / 4 - squeezed.pageWidth, GRID_GAP);
    // Next column count: full size again.
    assert.equal(gridLayout(1199, 36, A4).pageWidth, GRID_PAGE_WIDTH);
    assert.ok(gridLayout(800, 36, A4).pageWidth < GRID_PAGE_WIDTH);
    // One column on a phone: the same small page, not stretched.
    assert.equal(gridLayout(375, 36, A4).pageWidth, GRID_PAGE_WIDTH);
    assert.equal(gridLayout(300, 36, A4).pageWidth, 300 - GRID_GAP);
  });

  test("rows and pages per row", () => {
    const layout = gridLayout(1905, 7, A4);
    assert.equal(layout.rows, 2);
    assert.equal(gridRow(1, 4), 0);
    assert.equal(gridRow(4, 4), 0);
    assert.equal(gridRow(5, 4), 1);
    assert.deepEqual(gridRowPages(1, 4, 7), [5, 6, 7]);
    assert.deepEqual(gridRowPages(0, 1, 7), [1]);
  });

  test("visible rows are clamped to the document", () => {
    const layout = gridLayout(1905, 36, A4);
    assert.deepEqual(gridVisibleRows(layout, 0, 900), { first: 0, last: 2 });
    assert.deepEqual(gridVisibleRows(layout, layout.rowStride * 2 + 5, layout.rowStride * 3), { first: 2, last: 3 });
    assert.deepEqual(gridVisibleRows(layout, 100_000, 101_000), { first: 8, last: 8 });
  });
});

describe("continuous reading", () => {
  test("reading width leaves room at the sides and is capped", () => {
    const width = scrollPageWidth(1905);
    assert.ok(width > 1500 && width < 1905 - 200);
    assert.equal(scrollPageWidth(3840), SCROLL_MAX_PAGE_WIDTH);
    assert.equal(scrollPageWidth(390), 390 - 16);
  });

  test("on a full-HD screen roughly a third of a page is visible", () => {
    const height = (scrollPageWidth(1905) / A4.width) * A4.height;
    const share = 830 / height;
    assert.ok(share > 0.25 && share < 0.45, `share ${share}`);
  });

  test("offsets, page at a position and visible pages", () => {
    const offsets = pageOffsets([100, 100, 150]);
    assert.deepEqual(offsets, [0, 100, 200, 350]);
    assert.equal(pageAt(offsets, -10), 1);
    assert.equal(pageAt(offsets, 0), 1);
    assert.equal(pageAt(offsets, 99.9), 1);
    assert.equal(pageAt(offsets, 100), 2);
    assert.equal(pageAt(offsets, 349), 3);
    assert.equal(pageAt(offsets, 5000), 3);
    assert.deepEqual(visiblePages(offsets, 50, 150), { first: 1, last: 2 });
    assert.deepEqual(visiblePages(offsets, 100, 200), { first: 2, last: 2 });
    assert.deepEqual(visiblePages(pageOffsets([80]), 0, 900), { first: 1, last: 1 });
  });

  test("zoom steps of the continuous mode", () => {
    assert.equal(stepZoom(1, 1, SCROLL_ZOOM_LEVELS), 1.25);
    assert.equal(stepZoom(1, -1, SCROLL_ZOOM_LEVELS), 0.75);
    assert.equal(stepZoom(0.5, -1, SCROLL_ZOOM_LEVELS), 0.5);
    assert.equal(canZoom(0.5, -1, SCROLL_ZOOM_LEVELS), false);
    assert.equal(canZoom(1, -1, SCROLL_ZOOM_LEVELS), true);
    assert.equal(canZoom(2, 1, SCROLL_ZOOM_LEVELS), false);
  });
});
