/** Shared gallery inner-element selectors for integrity checks and OG capture. */
export const GALLERY_INNER_SELECTORS = [
  "#gallery .gallery",
  '[data-section-id="gallery"] .gallery',
  '[data-section-id="gallery"] .gallery--masonry',
  '[data-section-id="gallery"] .gallery--strip',
  ".gallery--masonry",
  ".gallery",
] as const;

export function gallerySelectorList(): readonly string[] {
  return GALLERY_INNER_SELECTORS;
}
