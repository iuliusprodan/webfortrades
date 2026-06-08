# Build notes - Northside Mobile Mechanics (test)

- Slug: `test-mechanic`
- Direction: industrial-ops-log (very different from test-electrical)
- Library reference: test-electrical (deliberate divergence)
- Divergence: dark steel palette, safety yellow accent, Space Grotesk + IBM Plex Mono, job-sheet captions, utilitarian uppercase type
- v2 fix: stable header, equal review cards, footer link
- v3 extras: mobile bar, job ticket hero, accent restraint
- v4 header: compact scroll restored, mobile logo-only
- v5 polish: faster marquee, footer clearance, tighter header top
- v6 fix: header scroll trigger (hysteresis)
- v7 mobile hero: centred copy, stacked full-width CTAs
- v8 hero: left-aligned copy, job-sheet corner z-index

## v8 changes (2026-06-08)

### Hero
- Eyebrow, headline and paragraph left-aligned on all breakpoints
- Mobile CTAs unchanged (full-width stacked)
- Job-sheet yellow corner brackets raised above blur/overlay (`z-20`)

## v7 changes (2026-06-08)

### Mobile hero
- CTAs stacked full width (quote primary, call below); desktop row layout unchanged

## v6 changes (2026-06-08)

### Header trigger
- Replaced inverted IO sentinel with scroll hysteresis: compact when `scrollY > 80`, expanded when `scrollY < 20`
- Initial state read from `scrollY` on mount (fresh load at top = expanded)

## v5 changes (2026-06-08)

### Marquee
- Mobile 20s, desktop 32s (~50% / ~20% faster than 40s baseline)

### Footer
- `.site-footer` extra bottom padding on mobile clears sticky CTA bar; credit link fully reachable

### Header top
- 1px IO sentinel + `-80px` rootMargin (removes 80px dead space, keeps compact threshold)
- Expanded padding trimmed (`py-3`); hero top padding reduced (`pt-5` / `md:pt-8`)

## v4 changes (2026-06-08)

### Header
- Compact on scroll restored: smaller title, meta fades, shorter CTA labels (desktop)
- 80px IntersectionObserver sentinel prevents flip-flop; smooth padding/height transitions
- Mobile: business name only (no header CTAs, no meta strip). Desktop keeps both

## v3 changes (2026-06-08)

### Mobile bar
- Sticky bottom bar (mobile only): **Get a free quote** + **Call Liam**, equal-width buttons

### Hero job sheet
- Faux ticket lines: Ref (NSM-0001), ETA (Same-day slots), Status (Available today)
- No invented customer data

### Accent restraint
- Safety yellow reserved for CTAs, key stat numbers, service/coverage indexes, job status, and marquee band
- Section labels, body links, form labels, and FAQ chevrons moved to muted/foreground

## v2 changes (2026-06-08)

### Header
- Fixed height in both scroll states; IntersectionObserver sentinel toggles scrolled style
- Only background, blur, border and shadow change (no layout shift)

### Reviews
- Equal-height flex cards; name + stars bottom-aligned on shared baseline

### Footer
- WebForTrades credit links to https://www.webfortradesuk.co.uk

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

## v9 (2026-06-08)
- ContactForm: email, optional photo upload, two-up field layout on desktop

## v10 (2026-06-08)
- Desktop header: single compact `btn-header-nav` GET QUOTE; phone CTA removed from header (kept in hero, contact, mobile bar)

## Run locally

```bash
cd sites/test-mechanic
npm run dev
```

Open http://localhost:3000
