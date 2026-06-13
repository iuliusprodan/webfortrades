import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  assertNoEmDashes,
  collectEmDashViolations,
  ROOT,
} from "./no_em_dashes.js";

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

function withTempSite(content: string, fn: (root: string, slug: string) => void): void {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wft-em-dash-"));
  const slug = "test-co";
  const appDir = path.join(tmp, "sites", slug, "app");
  fs.mkdirSync(appDir, { recursive: true });
  fs.writeFileSync(path.join(appDir, "page.tsx"), content, "utf8");
  try {
    fn(tmp, slug);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

console.log("no_em_dashes");

test("detects em dash U+2014", () => {
  withTempSite('<h1>Leeds electricians — work</h1>\n', (root, slug) => {
    const hits = collectEmDashViolations({ root, scopes: ["sites"], briefSlugs: [slug] });
    assert.equal(hits.length, 1);
    assert.match(hits[0]!.char, /em dash/);
  });
});

test("detects en dash U+2013", () => {
  withTempSite("<p>Mon–Fri open</p>\n", (root, slug) => {
    const hits = collectEmDashViolations({ root, scopes: ["sites"], briefSlugs: [slug] });
    assert.equal(hits.length, 1);
    assert.match(hits[0]!.char, /en dash/);
  });
});

test("detects horizontal bar U+2015", () => {
  withTempSite("<p>Line one ― line two</p>\n", (root, slug) => {
    const hits = collectEmDashViolations({ root, scopes: ["sites"], briefSlugs: [slug] });
    assert.equal(hits.length, 1);
    assert.match(hits[0]!.char, /horizontal bar/);
  });
});

test("detects ASCII double hyphen sequence", () => {
  withTempSite("<p>Before -- after</p>\n", (root, slug) => {
    const hits = collectEmDashViolations({ root, scopes: ["sites"], briefSlugs: [slug] });
    assert.equal(hits.length, 1);
    assert.match(hits[0]!.char, /ASCII double hyphen/);
  });
});

test("assertNoEmDashes exits non-zero on violations", () => {
  withTempSite("<p>Bad — dash</p>\n", (root) => {
    assert.throws(() => assertNoEmDashes({ root, scopes: ["sites"] }), /Banned dash check failed/);
  });
});

test("clean site passes assertNoEmDashes", () => {
  withTempSite("<p>Good - dash spacing</p>\n", (root) => {
    assert.doesNotThrow(() => assertNoEmDashes({ root, scopes: ["sites"] }));
  });
});

test("production outreach paths are clean", () => {
  assert.doesNotThrow(() => assertNoEmDashes({ root: ROOT, scopes: ["outreach"] }));
});

console.log("\nAll no_em_dashes tests passed.");
