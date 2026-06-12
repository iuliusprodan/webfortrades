import type { Page } from "playwright";
import type { StyleIssue } from "../style_verify.js";
import { GALLERY_INNER_SELECTORS } from "./gallery_selectors.js";

export { GALLERY_INNER_SELECTORS, gallerySelectorList } from "./gallery_selectors.js";

export const SECTION_INTEGRITY_CHECK_NAME = "section_integrity";

/** Headings/subtitles that promise explanatory body copy. */
export const PROMISE_HEADING_RE =
  /explained plainly|in plain language|in plain english|what we cover|how it works|explained in plain/i;

export interface SectionIntegrityMetrics {
  galleryFound: boolean;
  galleryColumnCount: number;
  viewportWidth: number;
  promiseSections: Array<{
    id: string;
    heading: string;
    itemCount: number;
    itemsWithDescription: number;
    averageDescriptionWords: number;
  }>;
}

export function evaluateSectionIntegrity(metrics: SectionIntegrityMetrics): StyleIssue[] {
  const issues: StyleIssue[] = [];

  if (metrics.viewportWidth >= 1024) {
    if (!metrics.galleryFound) {
      issues.push({
        severity: "warn",
        message: `${SECTION_INTEGRITY_CHECK_NAME}: no gallery block found for column check`,
      });
    } else if (metrics.galleryColumnCount < 2) {
      issues.push({
        severity: "error",
        message: `${SECTION_INTEGRITY_CHECK_NAME}: gallery renders single column on desktop (${metrics.galleryColumnCount} columns at ${metrics.viewportWidth}px viewport). Use CSS columns masonry or grid with 3 cols >=1024px, 2 cols 640-1023px.`,
      });
    } else if (metrics.galleryColumnCount < 3 && metrics.viewportWidth >= 1024) {
      issues.push({
        severity: "error",
        message: `${SECTION_INTEGRITY_CHECK_NAME}: gallery has ${metrics.galleryColumnCount} columns at ${metrics.viewportWidth}px; expected 3 at >=1024px`,
      });
    }
  }

  for (const section of metrics.promiseSections) {
    const underExplained =
      section.itemCount === 0 ||
      section.itemsWithDescription < section.itemCount ||
      section.averageDescriptionWords < 8;

    if (underExplained) {
      issues.push({
        severity: "error",
        message: `${SECTION_INTEGRITY_CHECK_NAME}: section "${section.heading}" promises explanatory copy but items average ${section.averageDescriptionWords.toFixed(1)} description words (${section.itemsWithDescription}/${section.itemCount} items have text). Add one-line evidence-based descriptions or remove promise wording.`,
      });
    }
  }

  return issues;
}

/** Detect promise-heading sections with bare service lists in static HTML (build-time). */
export function evaluateSectionIntegrityHtml(html: string): StyleIssue[] {
  const issues: StyleIssue[] = [];

  if (/gallery--single-column|gallery-single-column/i.test(html)) {
    issues.push({
      severity: "error",
      message: `${SECTION_INTEGRITY_CHECK_NAME}: gallery uses single-column desktop class (gallery--single-column)`,
    });
  }

  const sectionChunks = html.split(/<section[\s>]/i).slice(1);
  for (const chunk of sectionChunks) {
    const headingMatch = chunk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    const leadMatch = chunk.match(/class="[^"]*section__lead[^"]*"[^>]*>([\s\S]*?)<\//i);
    const headingText = stripTags(headingMatch?.[1] ?? "");
    const leadText = stripTags(leadMatch?.[1] ?? "");
    const combined = `${headingText} ${leadText}`;
    if (!PROMISE_HEADING_RE.test(combined)) continue;

    const listItems = [...chunk.matchAll(/<li[^>]*class="[^"]*service[^"]*"[^>]*>([\s\S]*?)<\/li>/gi)];
    if (listItems.length === 0) continue;

    let withDesc = 0;
    let totalWords = 0;
    for (const item of listItems) {
      const inner = item[1] ?? "";
      const pMatch = inner.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const words = wordCount(stripTags(pMatch?.[1] ?? ""));
      if (words > 0) withDesc++;
      totalWords += words;
    }
    const avg = listItems.length ? totalWords / listItems.length : 0;
    if (withDesc < listItems.length || avg < 8) {
      issues.push({
        severity: "error",
        message: `${SECTION_INTEGRITY_CHECK_NAME}: "${headingText.trim()}" promises explanatory copy but service items average ${avg.toFixed(1)} words (${withDesc}/${listItems.length} with descriptions)`,
      });
    }
  }

  return issues;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function wordCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

export async function collectSectionIntegrityMetrics(page: Page): Promise<SectionIntegrityMetrics> {
  return page.evaluate(
    ({ promiseReSource, gallerySelectors }: { promiseReSource: string; gallerySelectors: string[] }) => {
    const promiseRe = new RegExp(promiseReSource, "i");
    let gallery: Element | null = null;
    for (const sel of gallerySelectors) {
      gallery = document.querySelector(sel);
      if (gallery) break;
    }
    const galleryColumnCount = gallery
      ? parseInt(getComputedStyle(gallery).columnCount, 10) || 1
      : 0;

    const promiseSections: SectionIntegrityMetrics["promiseSections"] = [];
    const sections = document.querySelectorAll("section[data-section-id], section[id]");
    sections.forEach((section) => {
      const heading = section.querySelector("h2");
      const lead = section.querySelector(".section__lead, .section-intro p, .lead");
      const headingText = heading?.textContent?.trim() ?? "";
      const leadText = lead?.textContent?.trim() ?? "";
      if (!promiseRe.test(`${headingText} ${leadText}`)) return;

      const items = section.querySelectorAll(
        ".services-list li, .service-item, .service-card, .service, .services .service"
      );
      let itemsWithDescription = 0;
      let totalWords = 0;
      items.forEach((item) => {
        const desc =
          item.querySelector("p")?.textContent?.trim() ||
          [...item.querySelectorAll("p")].map((p) => p.textContent?.trim() ?? "").join(" ");
        const words = desc.split(/\s+/).filter(Boolean).length;
        if (words > 0) itemsWithDescription++;
        totalWords += words;
      });

      promiseSections.push({
        id: section.id || section.getAttribute("data-section-id") || "section",
        heading: headingText || section.id || "untitled",
        itemCount: items.length,
        itemsWithDescription,
        averageDescriptionWords: items.length ? totalWords / items.length : 0,
      });
    });

    return {
      galleryFound: Boolean(gallery),
      galleryColumnCount,
      viewportWidth: window.innerWidth,
      promiseSections,
    };
  },
    {
      promiseReSource: PROMISE_HEADING_RE.source,
      gallerySelectors: [...GALLERY_INNER_SELECTORS],
    }
  );
}
