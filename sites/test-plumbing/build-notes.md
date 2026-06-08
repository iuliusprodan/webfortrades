# Build notes - Tidewell Plumbing (test)

- Slug: `test-plumbing`
- Direction: confident-blue-trust (Fraunces + Inter)
- Library reference: test-electrical + test-mechanic (deliberate **very different** third take)
- Divergence: calm blue trust palette, full-bleed hero, soft rounded corners vs editorial square and industrial dark

## v1 (2026-06-08)

### Art direction
- Deep navy `#0c2d4a` on calm blue-white `#f4f8fc`, accent `#1a8fd1`
- Fraunces serif display + Inter body
- Soft rounded corners (`rounded-lg` / `rounded-xl`) site-wide
- Full-bleed hero with grey-blue placeholder and navy gradient overlay behind text

### House structure
- Sticky header (hysteresis scroll, mobile logo-only)
- Full-bleed hero, stats, owner note, gallery, services, about, marquee, reviews, service area, FAQ, contact, footer
- Dual CTAs, mobile stacked hero + sticky bottom bar
- Equal-height review cards, WebForTrades footer link

### Components
- `StickyHeader`, `HeroFullBleed`, `Reveal`, `FaqAccordion`, `PlaceholderImage`, `ContactForm`

## v2 (2026-06-08)
- Production alias: https://plumbing-site-o6leu5.vercel.app
- Mobile hero centred vertically (`items-center`, `min-h-[100svh]`)
- Stronger hero scrim + white eyebrow for legibility

## v3 (2026-06-08)
- ContactForm: email, optional photo upload, two-up field layout on desktop

## Run locally

```bash
cd sites/test-plumbing
npm run dev
```

Open http://localhost:3000
