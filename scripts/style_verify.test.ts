import assert from "node:assert/strict";
import {
  analyzeStylesheetText,
  evaluateStylesheet,
  evaluateAssets,
  evaluateComputedStyle,
  type StyleMetrics,
  type AssetCheck,
} from "./style_verify.js";

function hasError(issues: { severity: string; message: string }[]): boolean {
  return issues.some((i) => i.severity === "error");
}

// A real Tailwind build: preflight + utilities present (padded > 1000 bytes,
// like a real stylesheet).
const STYLED_CSS =
  `*,::before,::after{box-sizing:border-box}
@font-face{font-family:Archivo;src:url(a.woff2)}
.flex{display:flex}.grid{display:grid}.mx-auto{margin-left:auto;margin-right:auto}
.items-center{align-items:center}.max-w-6xl{max-width:72rem}.rounded{border-radius:.25rem}
.px-5{padding-left:1.25rem}.gap-3{gap:.75rem}
` + Array.from({ length: 60 }, (_, i) => `.pad-${i}{padding:${i}px;margin:${i}px}`).join("\n");

// The broken JT build: only @font-face, no preflight, no utilities.
const BROKEN_CSS = `@font-face{font-family:Fraunces;src:url(f.woff2)}
@font-face{font-family:Archivo;src:url(a.woff2)}
@font-face{font-family:Inter;src:url(i.woff2)}`.repeat(30);

function testStyledStylesheetPasses() {
  const a = analyzeStylesheetText(STYLED_CSS);
  assert.equal(a.hasPreflight, true);
  assert.equal(a.hasUtilities, true);
  assert.equal(hasError(evaluateStylesheet(a)), false);
}

function testBrokenStylesheetFails() {
  const a = analyzeStylesheetText(BROKEN_CSS);
  assert.equal(a.hasPreflight, false);
  assert.equal(a.hasUtilities, false);
  const issues = evaluateStylesheet(a);
  assert.equal(hasError(issues), true);
  assert.ok(
    issues.some((i) => /preflight/i.test(i.message)),
    "expected a preflight error"
  );
}

function testMarkerButMissingCssFails() {
  // HTML had a valid 200 CSS that is large but contains no Tailwind output:
  // build marker present, assets 200, but stylesheet analysis fails.
  const a = analyzeStylesheetText(BROKEN_CSS);
  assert.equal(hasError(evaluateStylesheet(a)), true);
}

function testCss404Fails() {
  const css: AssetCheck[] = [
    { url: "https://x/_next/static/css/app.css", status: 404, bytes: 0 },
  ];
  const issues = evaluateAssets(css, []);
  assert.equal(hasError(issues), true);
  assert.ok(issues.some((i) => /HTTP 404/.test(i.message)));
}

function testJs404Fails() {
  const css: AssetCheck[] = [
    { url: "https://x/_next/static/css/app.css", status: 200, bytes: 5000 },
  ];
  const js: AssetCheck[] = [
    { url: "https://x/_next/static/chunks/main.js", status: 404, bytes: 0 },
  ];
  assert.equal(hasError(evaluateAssets(css, js)), true);
}

function testNoStylesheetLinkFails() {
  assert.equal(hasError(evaluateAssets([], [])), true);
}

function styledMetrics(): StyleMetrics {
  return {
    bodyFontFamily: "Archivo, sans-serif",
    bodyBoxSizing: "border-box",
    bodyMarginTop: 0,
    bodyMarginLeft: 0,
    appliedRuleCount: 1800,
    styleSheetCount: 2,
    biggestGraphic: { tag: "IMG", w: 1280, h: 720, src: "hero.webp" },
    primaryButton: {
      found: true,
      background: "rgb(26, 143, 209)",
      borderRadius: "8px",
      paddingTop: "12px",
    },
    bodyText: "JT Plumbing Bristol",
  };
}

function testStyledPagePasses() {
  assert.equal(hasError(evaluateComputedStyle(styledMetrics())), false);
}

function testDefaultSerifFontFails() {
  const m = styledMetrics();
  m.bodyFontFamily = "Times";
  assert.equal(hasError(evaluateComputedStyle(m)), true);
}

function testDefaultBodyMarginFails() {
  const m = styledMetrics();
  m.bodyMarginTop = 8;
  m.bodyMarginLeft = 8;
  assert.equal(hasError(evaluateComputedStyle(m)), true);
}

function testMissingPreflightBoxSizingFails() {
  const m = styledMetrics();
  m.bodyBoxSizing = "content-box";
  assert.equal(hasError(evaluateComputedStyle(m)), true);
}

function testFewRulesFails() {
  const m = styledMetrics();
  m.appliedRuleCount = 117;
  assert.equal(hasError(evaluateComputedStyle(m)), true);
}

function testGiantSvgIconFails() {
  const m = styledMetrics();
  m.biggestGraphic = { tag: "SVG", w: 1264, h: 1264, src: "" };
  const issues = evaluateComputedStyle(m);
  assert.equal(hasError(issues), true);
  assert.ok(issues.some((i) => /SVG/.test(i.message)));
}

function main(): void {
  testStyledStylesheetPasses();
  testBrokenStylesheetFails();
  testMarkerButMissingCssFails();
  testCss404Fails();
  testJs404Fails();
  testNoStylesheetLinkFails();
  testStyledPagePasses();
  testDefaultSerifFontFails();
  testDefaultBodyMarginFails();
  testMissingPreflightBoxSizingFails();
  testFewRulesFails();
  testGiantSvgIconFails();
  console.log("style verify tests: all passed");
}

main();
