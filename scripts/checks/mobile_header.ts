/** Mobile header at 375px: logo + hamburger only (2h). */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "../..");

export interface CopyCheckIssue {
  code: string;
  message: string;
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

/**
 * Serve a static directory on a free port. Static-export sites reference assets
 * with absolute paths (/_next/static/...), which do NOT resolve under file://;
 * serving over HTTP lets the stylesheet load so responsive CSS actually applies.
 */
function serveDir(dir: string): Promise<{ port: number; close: () => Promise<void> }> {
  const server = http.createServer((req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]!);
      let rel = urlPath === "/" ? "/index.html" : urlPath;
      // resolve within dir; prevent traversal
      let filePath = path.normalize(path.join(dir, rel));
      if (!filePath.startsWith(dir)) {
        res.writeHead(403).end();
        return;
      }
      if (!fs.existsSync(filePath) && fs.existsSync(filePath + ".html")) {
        filePath += ".html";
      }
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404).end();
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
      res.end(fs.readFileSync(filePath));
    } catch {
      res.writeHead(500).end();
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        server.close();
        reject(new Error("Could not bind static server"));
        return;
      }
      resolve({
        port: addr.port,
        close: () => new Promise<void>((r) => server.close(() => r())),
      });
    });
  });
}

export async function reviewMobileHeader(
  slug: string,
  root = ROOT
): Promise<CopyCheckIssue[]> {
  const issues: CopyCheckIssue[] = [];
  const outDir = path.join(root, "sites", slug, "out");
  const htmlPath = path.join(outDir, "index.html");
  if (!fs.existsSync(htmlPath)) {
    issues.push({
      code: "mobile_header_no_build",
      message: "Built out/index.html missing — run next build before mobile_header check",
    });
    return issues;
  }

  const srv = await serveDir(outDir);
  const browser = await chromium.launch({ headless: true });
  let headerInfo: { found: boolean; visibleLinks: string[]; hasHamburger: boolean; hasPhone: boolean };
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    // HTTP load so /_next/static/css resolves and media queries apply.
    await page.goto(`http://127.0.0.1:${srv.port}/`, { waitUntil: "load" });
    await page.waitForTimeout(150); // let stylesheet apply

    headerInfo = await page.evaluate(() => {
      const header = document.querySelector(".site-header, header");
      if (!header) return { found: false, visibleLinks: [] as string[], hasHamburger: false, hasPhone: false };
      const isVisible = (el: Element): boolean => {
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return false;
        if (parseFloat(style.opacity || "1") === 0) return false;
        // offsetParent null => an ancestor is display:none (unless fixed)
        if ((el as HTMLElement).offsetParent === null && style.position !== "fixed") return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      const visible = Array.from(header.querySelectorAll("a, button"))
        .filter(isVisible)
        .map((el) => (el.textContent ?? "").trim())
        .filter(Boolean);
      const hasHamburger = !!header.querySelector(".menu-toggle, [aria-label*='menu' i]");
      const hasPhone = visible.some((t) => /call|\d{5}/i.test(t));
      const navLinks = visible.filter(
        (t) => !/menu|open|close|skip/i.test(t) && !/^(Cutts|Stephen|Bristol|Newcastle|Renovate|DPS|S\.M|LC|Renovatik)/i.test(t)
      );
      return { found: true, visibleLinks: navLinks, hasHamburger, hasPhone };
    });
  } finally {
    await browser.close();
    await srv.close();
  }

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
