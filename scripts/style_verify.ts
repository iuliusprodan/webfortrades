import fs from "node:fs";
import path from "node:path";
import { chromium, type Page } from "playwright";
import {
  collectSectionIntegrityMetrics,
  evaluateSectionIntegrity,
  evaluateSectionIntegrityHtml,
} from "./checks/section_integrity.js";

/**
 * Style / visual integrity verification.
 *
 * A deployed site can return HTTP 200 for its HTML, CSS and JS and still be
 * completely unstyled. This happened to JT Plumbing: the layout did not import
 * globals.css, so the emitted stylesheet contained only @font-face rules (no
 * Tailwind preflight, no utilities). HTML, CSS and JS all returned 200, so the
 * old marker-only verification passed while the live page rendered as raw HTML.
 *
 * These checks look at CSS *content* and *computed* styles, never just HTTP
 * status or byte size, because the broken CSS was a valid 29KB 200 response.
 */

export interface StyleIssue {
  severity: "error" | "warn";
  message: string;
}

/** Computed-style snapshot collected from a rendered page. */
export interface StyleMetrics {
  bodyFontFamily: string;
  bodyBoxSizing: string;
  bodyMarginTop: number;
  bodyMarginLeft: number;
  appliedRuleCount: number;
  styleSheetCount: number;
  biggestGraphic: { tag: string; w: number; h: number; src: string };
  primaryButton: {
    found: boolean;
    background: string;
    borderRadius: string;
    paddingTop: string;
  };
  bodyText: string;
}

export interface StylesheetAnalysis {
  bytes: number;
  hasPreflight: boolean;
  hasUtilities: boolean;
  utilityMarkers: string[];
}

export interface AssetCheck {
  url: string;
  status: number;
  bytes: number;
}

export interface LiveStyleResult {
  ok: boolean;
  url: string;
  issues: StyleIssue[];
  metrics: StyleMetrics | null;
  cssAssets: AssetCheck[];
  jsAssets: AssetCheck[];
  stylesheet: StylesheetAnalysis | null;
  failedAssets: string[];
  screenshotPath: string | null;
}

const DEFAULT_SERIF_FONT =
  /^\s*(times|times new roman|"times new roman"|serif|georgia|"georgia")/i;

// Minimum number of CSS rules a real Tailwind page applies. A fully unstyled
// build (only @font-face) showed ~117 rules; a styled build has many hundreds.
const MIN_APPLIED_RULES = 300;

// An icon/logo SVG should never be rendered larger than this. The broken JT
// page rendered the Google reviews SVG at 1264x1264.
const MAX_ICON_SVG_PX = 400;

/**
 * Analyse raw stylesheet text. The important signals are presence of Tailwind
 * preflight (box-sizing reset) and at least some utility classes. Byte size is
 * deliberately not treated as sufficient: the broken CSS was 29KB of fonts.
 */
export function analyzeStylesheetText(css: string): StylesheetAnalysis {
  const hasPreflight =
    /\*\s*,\s*::before|\*\s*,\s*::after|box-sizing\s*:\s*border-box/i.test(css);

  const utilityPatterns: { name: string; re: RegExp }[] = [
    { name: ".flex", re: /\.flex\{/ },
    { name: ".grid", re: /\.grid\{/ },
    { name: ".mx-auto", re: /\.mx-auto\{/ },
    { name: ".items-center", re: /\.items-center\{/ },
    { name: ".justify-", re: /\.justify-[a-z]+\{/ },
    { name: ".max-w-", re: /\.max-w-/ },
    { name: ".px-/.py-", re: /\.p[xy]-[0-9]/ },
    { name: ".rounded", re: /\.rounded/ },
    { name: ".gap-", re: /\.gap-[0-9]/ },
  ];
  const utilityMarkers = utilityPatterns
    .filter((p) => p.re.test(css))
    .map((p) => p.name);

  return {
    bytes: Buffer.byteLength(css, "utf8"),
    hasPreflight,
    hasUtilities: utilityMarkers.length >= 2,
    utilityMarkers,
  };
}

/** Evaluate a parsed stylesheet for integrity problems. */
export function evaluateStylesheet(analysis: StylesheetAnalysis): StyleIssue[] {
  const issues: StyleIssue[] = [];
  if (analysis.bytes < 1000) {
    issues.push({
      severity: "error",
      message: `Main stylesheet is suspiciously small (${analysis.bytes} bytes)`,
    });
  }
  if (!analysis.hasPreflight) {
    issues.push({
      severity: "error",
      message:
        "Main stylesheet has no Tailwind preflight (box-sizing reset missing). globals.css was not bundled.",
    });
  }
  if (!analysis.hasUtilities) {
    issues.push({
      severity: "error",
      message: `Main stylesheet has no Tailwind utility classes (markers: ${analysis.utilityMarkers.join(", ") || "none"})`,
    });
  }
  return issues;
}

/** Evaluate CSS/JS asset HTTP results. */
export function evaluateAssets(
  cssAssets: AssetCheck[],
  jsAssets: AssetCheck[]
): StyleIssue[] {
  const issues: StyleIssue[] = [];
  if (cssAssets.length === 0) {
    issues.push({
      severity: "error",
      message: "No stylesheet <link> found in page HTML",
    });
  }
  for (const a of cssAssets) {
    if (a.status !== 200) {
      issues.push({
        severity: "error",
        message: `CSS asset returned HTTP ${a.status}: ${a.url}`,
      });
    } else if (a.bytes < 1000) {
      issues.push({
        severity: "error",
        message: `CSS asset too small (${a.bytes} bytes): ${a.url}`,
      });
    }
  }
  for (const a of jsAssets) {
    if (a.status !== 200) {
      issues.push({
        severity: "error",
        message: `JS chunk returned HTTP ${a.status}: ${a.url}`,
      });
    }
  }
  return issues;
}

/**
 * Evaluate computed styles from a rendered page. Works for both local dev
 * (review) and live production (deploy), because it reads what the browser
 * actually applied rather than HTTP metadata.
 */
export function evaluateComputedStyle(m: StyleMetrics): StyleIssue[] {
  const issues: StyleIssue[] = [];

  if (DEFAULT_SERIF_FONT.test(m.bodyFontFamily)) {
    issues.push({
      severity: "error",
      message: `Body font is a browser default serif (${m.bodyFontFamily}); stylesheet did not apply`,
    });
  }

  if (m.bodyBoxSizing !== "border-box") {
    issues.push({
      severity: "error",
      message: `Body box-sizing is "${m.bodyBoxSizing}" (expected border-box); Tailwind preflight missing`,
    });
  }

  if (m.bodyMarginTop > 0 || m.bodyMarginLeft > 0) {
    issues.push({
      severity: "error",
      message: `Body has default browser margin (top=${m.bodyMarginTop}, left=${m.bodyMarginLeft}); preflight reset missing`,
    });
  }

  if (m.appliedRuleCount < MIN_APPLIED_RULES) {
    issues.push({
      severity: "error",
      message: `Only ${m.appliedRuleCount} CSS rules applied (expected >= ${MIN_APPLIED_RULES}); page is effectively unstyled`,
    });
  }

  const g = m.biggestGraphic;
  if (g.tag === "SVG" && Math.min(g.w, g.h) > MAX_ICON_SVG_PX) {
    issues.push({
      severity: "error",
      message: `An SVG icon renders at ${g.w}x${g.h}px (unconstrained, e.g. giant Google icon)`,
    });
  }

  if (
    m.primaryButton.found &&
    (m.primaryButton.background === "rgba(0, 0, 0, 0)" ||
      m.primaryButton.background === "transparent") &&
    m.primaryButton.borderRadius === "0px"
  ) {
    issues.push({
      severity: "warn",
      message:
        "Primary CTA has no background and no border radius (may be unstyled)",
    });
  }

  return issues;
}

/** Collect computed-style metrics from an open Playwright page. */
export async function collectStyleMetrics(page: Page): Promise<StyleMetrics> {
  return page.evaluate(() => {
    const body = document.body;
    const cs = getComputedStyle(body);

    let ruleCount = 0;
    for (const ss of Array.from(document.styleSheets)) {
      try {
        ruleCount += ss.cssRules ? ss.cssRules.length : 0;
      } catch {
        /* cross-origin sheet, ignore */
      }
    }

    const graphics = Array.from(document.querySelectorAll("img,svg"));
    let biggest = { tag: "", w: 0, h: 0, src: "" };
    for (const el of graphics) {
      const r = (el as HTMLElement).getBoundingClientRect();
      if (r.width * r.height > biggest.w * biggest.h) {
        biggest = {
          tag: el.tagName.toUpperCase(),
          w: Math.round(r.width),
          h: Math.round(r.height),
          src:
            (el as HTMLImageElement).currentSrc ||
            (el as HTMLImageElement).src ||
            el.getAttribute("aria-label") ||
            "",
        };
      }
    }

    const btnEl =
      document.querySelector('[data-review="hero"] a[href="#contact"]') ||
      document.querySelector('a[href="#contact"]') ||
      document.querySelector("button");
    const btnCs = btnEl ? getComputedStyle(btnEl) : null;

    return {
      bodyFontFamily: cs.fontFamily,
      bodyBoxSizing: cs.boxSizing,
      bodyMarginTop: parseFloat(cs.marginTop) || 0,
      bodyMarginLeft: parseFloat(cs.marginLeft) || 0,
      appliedRuleCount: ruleCount,
      styleSheetCount: document.styleSheets.length,
      biggestGraphic: biggest,
      primaryButton: {
        found: Boolean(btnEl),
        background: btnCs ? btnCs.backgroundColor : "",
        borderRadius: btnCs ? btnCs.borderRadius : "",
        paddingTop: btnCs ? btnCs.paddingTop : "",
      },
      bodyText: document.body.innerText.slice(0, 300),
    };
  });
}

function extractAssetUrls(
  html: string,
  baseUrl: string
): { css: string[]; js: string[] } {
  const css: string[] = [];
  const js: string[] = [];
  const linkRe = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
  const hrefRe = /href=["']([^"']+)["']/i;
  for (const tag of html.match(linkRe) ?? []) {
    const m = tag.match(hrefRe);
    if (m) css.push(new URL(m[1], baseUrl).toString());
  }
  const scriptRe = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let sm: RegExpExecArray | null;
  while ((sm = scriptRe.exec(html))) {
    js.push(new URL(sm[1], baseUrl).toString());
  }
  return { css, js };
}

async function headOrGetSize(url: string): Promise<AssetCheck> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "WebForTrades-StyleVerify/1.0" },
    });
    const buf = Buffer.from(await res.arrayBuffer());
    return { url, status: res.status, bytes: buf.length };
  } catch {
    return { url, status: 0, bytes: 0 };
  }
}

/**
 * Render a live (or any http) URL, capture a screenshot, inspect computed
 * styles and fetch the linked CSS/JS to confirm they load and the main
 * stylesheet actually contains Tailwind output.
 */
export async function verifyLiveStyle(
  url: string,
  opts: { screenshotPath?: string; timeoutMs?: number } = {}
): Promise<LiveStyleResult> {
  const issues: StyleIssue[] = [];
  const failedAssets: string[] = [];
  let metrics: StyleMetrics | null = null;
  let stylesheet: StylesheetAnalysis | null = null;
  let cssAssets: AssetCheck[] = [];
  let jsAssets: AssetCheck[] = [];
  let screenshotPath: string | null = null;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });

    page.on("response", (r) => {
      const u = r.url();
      const isAsset =
        u.includes("/_next/") ||
        /\.(css|js|webp|png|jpe?g|svg|woff2?)(\?|$)/i.test(u);
      if (isAsset && r.status() >= 400) {
        failedAssets.push(`${r.status()} ${u}`);
      }
    });

    let html = "";
    try {
      const resp = await page.goto(url, {
        waitUntil: "networkidle",
        timeout: opts.timeoutMs ?? 60000,
      });
      html = (await page.content()) ?? "";
      if (resp && resp.status() >= 400) {
        issues.push({
          severity: "error",
          message: `Page returned HTTP ${resp.status()} at ${url}`,
        });
      }
    } catch (err) {
      issues.push({
        severity: "error",
        message: `Could not load ${url}: ${err instanceof Error ? err.message : String(err)}`,
      });
      return {
        ok: false,
        url,
        issues,
        metrics,
        cssAssets,
        jsAssets,
        stylesheet,
        failedAssets,
        screenshotPath,
      };
    }

    metrics = await collectStyleMetrics(page);

    const sectionMetrics = await collectSectionIntegrityMetrics(page);
    issues.push(...evaluateSectionIntegrity(sectionMetrics));

    if (opts.screenshotPath) {
      fs.mkdirSync(path.dirname(opts.screenshotPath), { recursive: true });
      await page.screenshot({ path: opts.screenshotPath, fullPage: true });
      screenshotPath = opts.screenshotPath;
    }

    const { css, js } = extractAssetUrls(html, url);
    cssAssets = await Promise.all(css.map(headOrGetSize));
    jsAssets = await Promise.all(js.slice(0, 8).map(headOrGetSize));

    // Next.js often emits a large font-face sheet before the Tailwind bundle.
    // Analyse every stylesheet and prefer one that actually contains utilities.
    let bestAnalysis: StylesheetAnalysis | null = null;
    for (const asset of cssAssets.filter((a) => a.status === 200 && a.bytes > 0)) {
      try {
        const res = await fetch(asset.url);
        const text = await res.text();
        const analysis = analyzeStylesheetText(text);
        if (analysis.hasPreflight && analysis.hasUtilities) {
          bestAnalysis = analysis;
          break;
        }
        if (
          !bestAnalysis ||
          analysis.utilityMarkers.length > bestAnalysis.utilityMarkers.length
        ) {
          bestAnalysis = analysis;
        }
      } catch {
        /* asset check will already flag failures */
      }
    }
    stylesheet = bestAnalysis;
  } finally {
    await browser.close();
  }

  issues.push(...evaluateAssets(cssAssets, jsAssets));
  if (stylesheet) issues.push(...evaluateStylesheet(stylesheet));
  if (metrics) issues.push(...evaluateComputedStyle(metrics));

  if (failedAssets.length) {
    issues.push({
      severity: "error",
      message: `Assets failed to load: ${failedAssets.slice(0, 6).join(", ")}`,
    });
  }

  const ok = !issues.some((i) => i.severity === "error");
  return {
    ok,
    url,
    issues,
    metrics,
    cssAssets,
    jsAssets,
    stylesheet,
    failedAssets,
    screenshotPath,
  };
}

export function saveStyleVerifyManifest(
  root: string,
  slug: string,
  result: LiveStyleResult
): string {
  const dir = path.join(root, "briefs", slug);
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, "style-verify.json");
  fs.writeFileSync(
    p,
    JSON.stringify(
      {
        slug,
        updated_at: new Date().toISOString(),
        url: result.url,
        ok: result.ok,
        screenshot: result.screenshotPath,
        stylesheet: result.stylesheet,
        metrics: result.metrics,
        css_assets: result.cssAssets,
        js_assets: result.jsAssets,
        failed_assets: result.failedAssets,
        issues: result.issues,
      },
      null,
      2
    ) + "\n"
  );
  return p;
}

export function loadStyleVerifyManifest(
  root: string,
  slug: string
): { ok?: boolean; url?: string; screenshot?: string | null } | null {
  const p = path.join(root, "briefs", slug, "style-verify.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8")) as {
    ok?: boolean;
    url?: string;
    screenshot?: string | null;
  };
}
