# Build notes - Hartley Electrical (test)

- Slug: `test-electrical`
- Direction: quiet-premium-editorial (Syne + DM Sans, amber accent on navy)
- v2 polish: sticky condensing header, hero focal frame, scroll reveals, FAQ accordion

## v2 changes (2026-06-08)

### Header
- Replaced flat utility bar with sticky header (`StickyHeader.tsx`)
- Condenses on scroll: business name stays, meta line fades, CTA shrinks to phone-only
- Backdrop blur + subtle shadow when scrolled

### Hero
- Tighter type hierarchy: smaller subtext, headline spacing reduced
- Primary CTA: "Call Dave, 07700 900123" (comma format)
- `HeroFocal.tsx`: dark gradient focal frame with corner accents, grid texture, caption overlay (replaces empty grey box)

### Motion
- `Reveal.tsx`: intersection-observer fade + rise per section, staggered cards
- `FaqAccordion.tsx`: height + opacity animation, rotating chevron, one open at a time
- `.btn-primary` / `.btn-secondary` / `.card-hover` soft hover states
- Marquee slowed to 48s; all motion disabled under `prefers-reduced-motion`

### Copy
- Removed all em dashes site-wide (hyphens, commas, full stops instead)

### Components added
- `StickyHeader`, `HeroFocal`, `Reveal`, `FaqAccordion`

## Run locally

```bash
cd sites/test-electrical
npm run dev
```

Open http://localhost:3000
