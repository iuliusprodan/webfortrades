import type { Page } from "playwright";
import { GALLERY_INNER_SELECTORS } from "./checks/gallery_selectors.js";

/** Scroll gallery into view and return desktop column count (0 if no gallery). */
export async function collectGalleryColumnCount(page: Page): Promise<number> {
  const gallerySection = page.locator('[data-section-id="gallery"], #gallery');
  if ((await gallerySection.count()) === 0) return 0;

  await gallerySection.first().scrollIntoViewIfNeeded({ timeout: 30_000 });
  await page.waitForTimeout(500);

  return page.evaluate((selectors) => {
    let gallery: Element | null = null;
    for (const sel of selectors) {
      gallery = document.querySelector(sel);
      if (gallery) break;
    }
    if (!gallery) return 0;
    const style = getComputedStyle(gallery);
    const cols = style.columnCount || (style as CSSStyleDeclaration & { webkitColumnCount?: string }).webkitColumnCount;
    const parsed = Number(cols);
    if (parsed >= 2) return parsed;
    const gridCols = style.gridTemplateColumns.split(" ").filter(Boolean).length;
    return gridCols >= 2 ? gridCols : parsed || 1;
  }, [...GALLERY_INNER_SELECTORS]);
}

export async function verifyGalleryMultiColumn(page: Page, minColumns = 2): Promise<boolean> {
  const count = await collectGalleryColumnCount(page);
  return count === 0 || count >= minColumns;
}
