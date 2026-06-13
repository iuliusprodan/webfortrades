/** Mobile header at 375px: logo + hamburger only (2h). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "../..");

export interface CopyCheckIssue {
  code: string;
  message: string;
}

export async function reviewMobileHeader(
  slug: string,
  root = ROOT
): Promise<CopyCheckIssue[]> {
  const issues: CopyCheckIssue[] = [];
  const htmlPath = path.join(root, "sites", slug, "out", "index.html");
  if (!fs.existsSync(htmlPath)) {
    issues.push({
      code: "mobile_header_no_build",
      message: "Built out/index.html missing — run next build before mobile_header check",
    });
    return issues;
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(`file://${htmlPath}`, { waitUntil: "domcontentloaded" });

  const headerInfo = await page.evaluate(() => {
    const header = document.querySelector(".site-header, header");
    if (!header) return { found: false, visibleLinks: [] as string[], hasHamburger: false, hasPhone: false };
    const visible = Array.from(header.querySelectorAll("a, button"))
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return r.width > 0 && r.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      })
      .map((el) => (el.textContent ?? "").trim())
      .filter(Boolean);
    const hasHamburger = !!header.querySelector(".menu-toggle, [aria-label*='menu' i]");
    const hasPhone = visible.some((t) => /call|\d{5}/i.test(t));
    const navLinks = visible.filter(
      (t) => !/menu|open|close|skip/i.test(t) && !/^(Cutts|Stephen|Bristol|Newcastle|Renovate|DPS|S\.M|LC|Renovatik)/i.test(t)
    );
    return { found: true, visibleLinks: navLinks, hasHamburger, hasPhone };
  });

  await browser.close();

  if (!headerInfo.found) {
    issues.push({ code: "mobile_header_missing", message: "No site header found" });
    return issues;
  }
  if (!headerInfo.hasHamburger) {
    issues.push({ code: "mobile_header_no_hamburger", message: "Mobile header missing hamburger control" });
  }
  if (headerInfo.hasPhone) {
    issues.push({ code: "mobile_header_phone_visible", message: "Phone/Call visible in mobile header at 375px" });
  }
  if (headerInfo.visibleLinks.length > 2) {
    issues.push({
      code: "mobile_header_extra_nav",
      message: `Mobile header shows extra nav beyond logo+hamburger: ${headerInfo.visibleLinks.slice(0, 5).join(", ")}`,
    });
  }
  return issues;
}

export async function assertMobileHeaderForSiteSlug(slug: string, root = ROOT): Promise<void> {
  const issues = await reviewMobileHeader(slug, root);
  if (issues.length) {
    throw new Error(`mobile_header failed:\n${issues.map((i) => `  - ${i.message}`).join("\n")}`);
  }
  console.log("mobile_header passed.");
}
