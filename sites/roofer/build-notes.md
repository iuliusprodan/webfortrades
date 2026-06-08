# Build notes - Stonegate Roofing (roofer)

- Slug: `roofer`
- Direction: rugged-industrial-strength (Archivo Black + Barlow)
- Library reference: test-mechanic (push further earthy/heavier), distinct from all four prior demos
- Divergence: slate/stone/charcoal base, safety orange accent, larger uppercase headlines, sharp corners, brisk marquee

## v1 (2026-06-08)

### Art direction
- Charcoal `#1e282c`, deep slate `#2c3a3f`, warm stone `#c8b8a8`, safety orange `#e85d04`
- Archivo Black display + Barlow body, larger headings than other sites
- Sharp square corners site-wide
- Split hero with bold uppercase copy + `HeroSolidFocal` image panel

### House structure
- Sticky header with orange accent bar, scroll hysteresis, mobile logo-only
- Stats, owner note, gallery (standalone finished work), services, about, marquee (18s/28s), reviews, service area, FAQ, contact
- Upgraded ContactForm (email, photo upload, two-up desktop)
- Uppercase CTAs via btn classes, dual mobile sticky bar

### Gallery
- Brief has no photos: standalone numbered finished-work grid (not forced before/after)

### Components
- `StickyHeader`, `HeroSolidFocal`, `Reveal`, `FaqAccordion`, `PlaceholderImage`, `ContactForm`

## Live
https://roofer-site-m4p7wq.vercel.app

## Run locally

```bash
cd sites/roofer
npm run dev
```

Open http://localhost:3000
