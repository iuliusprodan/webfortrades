# Build notes - Northside Mobile Mechanics (test)

- Slug: `test-mechanic`
- Direction: industrial-ops-log (very different from test-electrical)
- Library reference: test-electrical (deliberate divergence)
- Divergence: dark steel palette, safety yellow accent, Space Grotesk + IBM Plex Mono, job-sheet captions, utilitarian uppercase type

## v1 (2026-06-08)

### Art direction
- Dark/steel base (`#12151a`, `#1c2128`) with safety yellow accent (`#f5c518`)
- Space Grotesk display + IBM Plex Sans body + IBM Plex Mono for labels/numbers
- JOB SHEET / 0001 style gallery captions, numbered borough coverage
- Hazard-stripe header/footer accents, ops-grid texture on hero and placeholders

### Structure (house layout)
- Sticky header with dual CTAs (quote primary, phone secondary)
- Hero, stats, owner note, gallery, services, about, marquee, reviews, service area, FAQ, contact, footer
- Square corners site-wide, scroll reveals, smooth FAQ accordion
- Grey placeholder image blocks only

### Components
- `StickyHeader`, `HeroJobSheet`, `Reveal`, `FaqAccordion`, `PlaceholderImage`, `ContactForm`

## Run locally

```bash
cd sites/test-mechanic
npm run dev
```

Open http://localhost:3000
