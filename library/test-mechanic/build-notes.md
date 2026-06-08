# Build notes - Northside Mobile Mechanics (test)

- Slug: `test-mechanic`
- Direction: industrial-ops-log
- Library reference: test-electrical (deliberate **very different** divergence)
- Divergence: dark steel + safety yellow vs cream/amber editorial; grotesk + mono vs Syne/DM Sans; utilitarian job-sheet tone vs quiet Cambridge editorial

## v7 changes (2026-06-08)

### Mobile hero
- Centre-aligned eyebrow, headline, body on mobile; full-width stacked CTAs

## v6 changes (2026-06-08)

### Header trigger
- Scroll hysteresis (`>80` compact, `<20` expanded); loads expanded at top of page

## v5 changes (2026-06-08)

### Marquee
- Mobile 20s, desktop 32s

### Footer
- Mobile bottom padding clears sticky bar; WebForTrades credit fully visible and clickable

### Header top
- Trimmed expanded padding and hero top spacing; 1px sentinel preserves 80px compact threshold

## v4 changes (2026-06-08)

### Header
- Compact on scroll restored with smooth transitions; 80px IO sentinel (no jiggle)
- Mobile: logo only. Desktop: meta strip + dual CTAs that condense on scroll

## v3 changes (2026-06-08)

### Mobile bar
- Sticky bottom bar (mobile only): **Get a free quote** + **Call Liam**

### Hero job sheet
- Faux ticket lines: Ref, ETA, Status (Available today), no customer data

### Accent restraint
- Safety yellow on CTAs and key numbers only; body text uses muted/foreground

## v2 changes (2026-06-08)

### Header
- Fixed height in both scroll states (no padding, text or button size changes)
- Scrolled state toggles via IntersectionObserver sentinel (no raw scroll threshold jiggle)
- Only background opacity, blur, border and shadow change on scroll

### Reviews
- Equal-height cards with flex column layout; quote flexes, name + stars pinned to bottom baseline

### Footer
- "Website by WebForTrades" links to https://www.webfortradesuk.co.uk (new tab, noopener)

## v1 (2026-06-08)

### Art direction
- Dark/steel base (`#12151a`, `#1c2128`) with safety yellow accent (`#f5c518`)
- Space Grotesk display + IBM Plex Sans body + IBM Plex Mono for labels and numbers
- JOB SHEET / 0001 gallery captions, numbered borough coverage, hazard-stripe accents
- Ops-grid texture on hero focal and grey placeholder blocks

### House structure (shared with test-electrical)
- Sticky glass header, dual CTAs (Get a free quote + Call Liam)
- Hero, stats, owner note, gallery, services, about, marquee, reviews, service area, FAQ, contact, footer
- Square corners, scroll reveals, smooth FAQ accordion, no em dashes
- Footer: Website by WebForTrades

### Components
- `StickyHeader`, `HeroJobSheet`, `Reveal`, `FaqAccordion`, `PlaceholderImage`, `ContactForm`

## Live
https://test-mechanic.vercel.app
