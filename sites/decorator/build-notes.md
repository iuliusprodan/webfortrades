# Build notes - Ashcroft Painting & Decorating (decorator)

- Slug: `decorator`
- Direction: image-led-gallery-forward (Spectral + Hanken Grotesk)
- Library reference: test-electrical, test-mechanic, test-plumbing (deliberate **fourth** take)
- Divergence: warm putty/stone palette, terracotta accent, gallery-first with before/after pairs, full-bleed image hero

## v1 (2026-06-08)

### Art direction
- Off-white `#f7f4ef`, stone `#d4cdc3`, terracotta accent `#b85c38`
- Spectral serif display + Hanken Grotesk body
- Subtle rounded corners (`rounded-md`) site-wide
- Full-bleed warm stone hero; gallery section elevated early with featured 21:9 + 3 before/after pairs

### House structure
- Sticky header (hysteresis scroll, mobile logo-only)
- Hero, stats, **gallery (prominent)**, owner note, services, about, marquee, reviews, service area, FAQ, contact, footer
- Upgraded ContactForm (email, photo upload, two-up desktop layout)
- Dual CTAs, mobile stacked hero + sticky bottom bar
- Equal-height review cards, WebForTrades footer link

### Components
- `StickyHeader`, `HeroGalleryLed`, `WorkGallery`, `Reveal`, `FaqAccordion`, `PlaceholderImage`, `ContactForm`

## v2 (2026-06-08)
- Desktop header: single compact `btn-header-nav` GET A QUOTE; phone CTA removed from header (kept in hero, contact, mobile bar)

## Live
https://decorator-site-8zv4kj.vercel.app

## Run locally

```bash
cd sites/decorator
npm run dev
```

Open http://localhost:3000
