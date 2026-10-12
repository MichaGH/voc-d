import assert from "node:assert/strict";
import { test } from "node:test";
import { isExternalHref, toSafeHref } from "./safe-href.ts";

test("accepts internal paths and HTTP(S)", () => {
  assert.equal(toSafeHref("/inzercia"), "/inzercia");
  assert.equal(toSafeHref("https://www.tzbportal.sk"), "https://www.tzbportal.sk/");
  assert.equal(toSafeHref(" http://example.com/a?b=1 "), "http://example.com/a?b=1");
});

test("rejects script, data, protocol-relative and malformed values", () => {
  for (const raw of ["javascript:alert(1)", "JAVASCRIPT:alert(1)", "data:text/html,x", "//evil.example", "/\\evil.example", "vbscript:x", "file:///etc/passwd", "https://", "not a url", "", "  ", "/a\u0000b", null, 42]) {
    assert.equal(toSafeHref(raw), null, String(raw));
  }
});

test("contact links only when allowed", () => {
  assert.equal(toSafeHref("mailto:voc@voc.sk"), null);
  assert.equal(toSafeHref("mailto:voc@voc.sk", { allowContact: true }), "mailto:voc@voc.sk");
  assert.equal(toSafeHref("tel:+421556782808", { allowContact: true }), "tel:+421556782808");
});

test("isExternalHref", () => {
  assert.equal(isExternalHref("https://a.sk/"), true);
  assert.equal(isExternalHref("/inzercia"), false);
  assert.equal(isExternalHref("mailto:a@b.sk"), false);
});
