import fs from "node:fs";
import path from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "playwright";
import { getLeadBySlug, getNextBuiltLead, updateLead } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const SECTIONS = [
  { name: "00-utility", selector: '[data-review="utility"]' },
  { name: "01-hero", selector: '[data-review="hero"]' },
  { name: "02-stats", selector: '[data-review="stats"]' },
  { name: "03-owner-note", selector: '[data-review="owner-note"]' },
  { name: "04-gallery", selector: '[data-review="gallery"]' },
  { name: "05-services", selector: '[data-review="services"]' },
  { name: "06-about", selector: '[data-review="about"]' },
  { name: "07-marquee", selector: '[data-review="marquee"]' },
  { name: "08-reviews", selector: '[data-review="reviews"]' },
  { name: "09-service-area", selector: '[data-review="service-area"]' },
  { name: "10-faq", selector: '[data-review="faq"]' },
  { name: "11-contact", selector: '[data-review="contact"]' },
  { name: "12-footer", selector: '[data-review="footer"]' },
  { name: "13-mobile-call", selector: '[data-review="mobile-call"]' },
];

const VIEWPORTS = [
  { label: "mobile", width: 390, height: 844 },
  { label: "desktop", width: 1440, height: 900 },
];

const PLACEHOLDER_PATTERNS = [
  /PLACEHOLDER/i,
  /lorem ipsum/i,
  /your name here/i,
  /sample site/i,
  /TODO/i,
  /FIXME/i,
];

interface ReviewIssue {
  severity: "error" | "warn";
  message: string;
}

function parseArgs(): { slug?: string } {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
  }
  return { slug };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(url: string, timeoutMs = 60000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await sleep(500);
  }
  throw new Error(`Dev server did not start at ${url}`);
}

function startDevServer(siteDir: string): ChildProcess {
  return spawn("npm", ["run", "dev", "--", "-p", "4311"], {
    cwd: siteDir,
    stdio: "pipe",
    shell: true,
  });
}

async function screenshotSections(
  page: Page,
  outDir: string,
  viewport: (typeof VIEWPORTS)[number]
): Promise<void> {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto("http://localhost:4311", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const vpDir = path.join(outDir, viewport.label);
  fs.mkdirSync(vpDir, { recursive: true });

  await page.screenshot({
    path: path.join(vpDir, "full-page.png"),
    fullPage: true,
  });

  for (const section of SECTIONS) {
    const loc = page.locator(section.selector).first();
    const count = await loc.count();
    if (count === 0) continue;
    await loc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await loc.screenshot({
      path: path.join(vpDir, `${section.name}.png`),
    });
  }
}

async function runChecks(page: Page): Promise<ReviewIssue[]> {
  const issues: ReviewIssue[] = [];
  const bodyText = await page.locator("body").innerText();

  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(bodyText)) {
      issues.push({ severity: "error", message: `Placeholder text matched: ${pattern}` });
    }
  }

  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img"));
    return imgs
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.getAttribute("alt") ?? img.getAttribute("src") ?? "unknown");
  });
  if (brokenImages.length) {
    issues.push({
      severity: "error",
      message: `Broken images: ${brokenImages.join(", ")}`,
    });
  }

  const phoneLinks = page.locator('a[href^="tel:"]');
  if ((await phoneLinks.count()) === 0) {
    issues.push({ severity: "error", message: "No click-to-call tel: links found" });
  } else {
    const href = await phoneLinks.first().getAttribute("href");
    if (!href || href === "tel:" || href === "tel:#contact") {
      issues.push({ severity: "error", message: "Invalid tel: href on primary CTA" });
    }
  }

  const form = page.locator('[data-review="contact"] form');
  if ((await form.count()) === 0) {
    issues.push({ severity: "error", message: "Contact form missing" });
  } else {
    const required = await form.locator("[required]").count();
    if (required < 2) {
      issues.push({ severity: "warn", message: "Contact form has few required fields" });
    }
  }

  const overflows = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 2;
  });
  if (overflows) {
    issues.push({ severity: "error", message: "Horizontal layout overflow detected" });
  }

  const lowContrast = await page.evaluate(() => {
    function lum(rgb: number[]) {
      const [r, g, b] = rgb.map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    function parse(color: string) {
      const el = document.createElement("div");
      el.style.color = color;
      document.body.appendChild(el);
      const computed = getComputedStyle(el).color;
      document.body.removeChild(el);
      const m = computed.match(/[\d.]+/g);
      if (!m) return null;
      return m.slice(0, 3).map(Number);
    }
    const samples = [
      { fg: getComputedStyle(document.body).color, bg: getComputedStyle(document.body).backgroundColor },
    ];
    for (const s of samples) {
      const fg = parse(s.fg);
      const bg = parse(s.bg);
      if (!fg || !bg) continue;
      const ratio = (Math.max(lum(fg), lum(bg)) + 0.05) / (Math.min(lum(fg), lum(bg)) + 0.05);
      if (ratio < 4.5) return ratio;
    }
    return null;
  });
  if (lowContrast !== null && lowContrast < 4.5) {
    issues.push({
      severity: "error",
      message: `Body text contrast ratio ${lowContrast.toFixed(2)} below AA (4.5)`,
    });
  }

  const ctaVisible = await page.locator('[data-review="hero"] a').first().isVisible();
  if (!ctaVisible) {
    issues.push({ severity: "error", message: "Primary hero CTA not visible" });
  }

  return issues;
}

async function main(): Promise<void> {
  const { slug: slugArg } = parseArgs();
  const lead = slugArg ? getLeadBySlug(slugArg) : getNextBuiltLead();

  if (!lead?.slug) {
    console.error("No BUILT lead found. Run build:site first, or pass --slug.");
    process.exit(1);
  }

  const slug = lead.slug;
  const siteDir = path.join(ROOT, "sites", slug);
  if (!fs.existsSync(path.join(siteDir, "package.json"))) {
    console.error(`Site not found: ${siteDir}`);
    process.exit(1);
  }

  const outDir = path.join(ROOT, "screenshots", slug);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`Reviewing sites/${slug}...`);
  const dev = startDevServer(siteDir);

  try {
    await waitForServer("http://localhost:4311");
    const browser = await chromium.launch();
    const page = await browser.newPage();

    for (const viewport of VIEWPORTS) {
      console.log(`Screenshotting ${viewport.label} (${viewport.width}px)...`);
      await screenshotSections(page, outDir, viewport);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:4311", { waitUntil: "networkidle" });

    const issues = await runChecks(page);
    const errors = issues.filter((i) => i.severity === "error");

    await browser.close();

    if (errors.length) {
      console.error("\nReview FAILED:");
      for (const issue of issues) {
        console.error(`  [${issue.severity}] ${issue.message}`);
      }
      console.error("\nFix issues in sites/" + slug + " and re-run: npm run review");
      process.exit(1);
    }

    if (issues.length) {
      console.warn("\nWarnings:");
      for (const issue of issues) console.warn(`  ${issue.message}`);
    }

    updateLead(lead.id, { state: "REVIEWED" });
    console.log(`\n✓ Screenshots saved to screenshots/${slug}/`);
    console.log(`✓ State → REVIEWED (lead id=${lead.id})`);
  } finally {
    dev.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
