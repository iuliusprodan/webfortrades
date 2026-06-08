# Build notes - Ashcroft Painting & Decorating (decorator)

- Slug: `decorator`
- Direction: image-led-gallery-forward
- Library reference: all three prior demos (deliberate **fourth** flavour)
- Divergence: warm neutral putty/stone, terracotta accent, gallery as page hero with before/after framing

## v1 (2026-06-08)

### Art direction
- Warm off-white `#f7f4ef`, stone borders `#d4cdc3`, terracotta `#b85c38`
- Spectral + Hanken Grotesk (fourth font pairing)
- Subtle `rounded-md` corners
- Full-bleed image hero; gallery section immediately after stats with 21:9 feature + 3 before/after pairs + detail portraits

### House structure (shared studio DNA)
- Sticky header with scroll hysteresis, mobile logo-only
- Stats, gallery-forward work section, owner note, services, about, marquee, reviews, coverage, FAQ, contact
- Upgraded quote form (email, optional photos, two-up short fields)
- Dual CTAs, mobile stacked hero CTAs + sticky bottom bar
- Equal-height review cards, WebForTrades footer link, no em dashes

### Components
- `StickyHeader`, `HeroGalleryLed`, `WorkGallery`, `Reveal`, `FaqAccordion`, `PlaceholderImage`, `ContactForm`

## Live
https://decorator-site-8zv4kj.vercel.app
