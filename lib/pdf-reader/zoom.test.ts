import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { MAX_ZOOM, MIN_STAGE_HEIGHT, MIN_ZOOM, canZoom, fitScale, formatZoom, needsRerender, renderScale, stepZoom } from "./zoom.ts";

const A4 = { width: 595, height: 842 };

describe("zoom steps", () => {
  test("25 % steps between 100 and 250 %", () => {
    assert.equal(stepZoom(1, 1), 1.25);
    assert.equal(stepZoom(2.5, 1), MAX_ZOOM);
    assert.equal(stepZoom(1, -1), MIN_ZOOM);
    assert.equal(stepZoom(1.3, -1), 1.25);
    assert.equal(stepZoom(1.3, 1), 1.5);
  });

  test("availability and formatting", () => {
    assert.equal(canZoom(1, -1), false);
    assert.equal(canZoom(2.5, 1), false);
    assert.equal(canZoom(1.5, 1), true);
    assert.equal(formatZoom(1.25), "125 %");
  });
});

describe("fit scale", () => {
  test("spread fits both pages into a 1440×900 laptop stage", () => {
    const scale = fitScale({ layout: "spread", stageWidth: 1300, stageHeight: 560, page: A4 });
    assert.ok(A4.height * scale <= 560 + 1e-6);
    assert.ok(2 * A4.width * scale <= 1300 + 1e-6);
  });

  test("spread is width-bound on a tall stage", () => {
    const scale = fitScale({ layout: "spread", stageWidth: 1000, stageHeight: 2000, page: A4 });
    assert.ok(Math.abs(2 * A4.width * scale - 1000) < 1e-6);
  });

  test("single page fits the width, capped for very wide stages", () => {
    assert.ok(Math.abs(fitScale({ layout: "single", stageWidth: 358, stageHeight: 400, page: A4 }) * A4.width - 358) < 1e-6);
    assert.ok(Math.abs(fitScale({ layout: "single", stageWidth: 2000, stageHeight: 400, page: A4 }) * A4.width - 900) < 1e-6);
  });

  test("tiny stage heights fall back to the minimum", () => {
    const scale = fitScale({ layout: "spread", stageWidth: 3000, stageHeight: 100, page: A4 });
    assert.ok(Math.abs(scale * A4.height - MIN_STAGE_HEIGHT) < 1e-6);
  });

  test("invalid input never returns zero", () => {
    assert.equal(fitScale({ layout: "spread", stageWidth: 0, stageHeight: 0, page: A4 }), 1);
    assert.equal(fitScale({ layout: "spread", stageWidth: 100, stageHeight: 100, page: { width: 0, height: 0 } }), 1);
  });
});

describe("render scale", () => {
  test("caps density at devicePixelRatio 2", () => {
    assert.equal(renderScale({ cssScale: 1, devicePixelRatio: 3, page: A4, maxCanvasPixels: 1e9 }), 2);
    assert.equal(renderScale({ cssScale: 1, devicePixelRatio: 1, page: A4, maxCanvasPixels: 1e9 }), 1);
  });

  test("never exceeds the per-canvas pixel budget", () => {
    const budget = 4_000_000;
    const scale = renderScale({ cssScale: 4, devicePixelRatio: 2, page: A4, maxCanvasPixels: budget });
    assert.ok(A4.width * scale * A4.height * scale <= budget + 1);
  });

  test("small differences are stretched, large ones re-rendered", () => {
    assert.equal(needsRerender(1, 1.05), false);
    assert.equal(needsRerender(1, 1.2), true);
    assert.equal(needsRerender(2, 1), true);
  });
});
