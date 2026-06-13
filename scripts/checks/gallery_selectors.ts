/** Shared gallery inner-element selectors for integrity checks and OG capture. */
export const GALLERY_INNER_SELECTORS = [
  "#gallery .gallery-grid",
  '[data-section-id="gallery"] .gallery-grid',
  '[data-section-id="gallery-lean"] .gallery-grid',
  '[data-section-id="gallery"] .gallery-masonry',
  '[data-section-id="gallery-lean"] .gallery-masonry',
  ".gallery-masonry",
  ".gallery-pairs",
  ".gallery-pair",
  "#gallery .gallery",
  '[data-section-id="gallery"] .gallery',
  '[data-section-id="gallery-lean"] .gallery',
  '[data-section-id="gallery"] .gallery--masonry',
  '[data-section-id="gallery"] .gallery--strip',
  ".gallery-grid",
  ".gallery--masonry",
  ".gallery--strip",
] as const;

export function gallerySelectorList(): readonly string[] {
  return GALLERY_INNER_SELECTORS;
}
