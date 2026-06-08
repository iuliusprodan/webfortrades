# Build notes - Hartley Electrical (test)

- Slug: `test-electrical`
- Direction: quiet-premium-editorial (Syne + DM Sans, amber accent on navy)
- v3 polish: dual CTAs, square corners site-wide
- v4 fix: stable header, equal review cards, footer link
- v5 header: compact scroll restored, mobile logo-only
- v6 polish: faster marquee, footer clearance, tighter header top
- v7 fix: header scroll trigger (hysteresis)
- v8 mobile hero: centred copy, stacked full-width CTAs

## v8 changes (2026-06-08)

### Mobile hero
- Eyebrow, headline and paragraph centre-aligned on mobile
- CTAs stacked full width (quote primary, call below); desktop unchanged

## v7 changes (2026-06-08)

### Header trigger
- Replaced inverted IO sentinel with scroll hysteresis: compact when `scrollY > 80`, expanded when `scrollY < 20`
- Initial state read from `scrollY` on mount (fresh load at top = expanded)

## v6 changes (2026-06-08)

### Marquee
- Mobile 24s, desktop 38s (~50% / ~20% faster than 48s baseline)

### Footer
- `.site-footer` extra bottom padding on mobile clears sticky CTA bar; credit link fully reachable

### Header top
- 1px IO sentinel + `-80px` rootMargin (removes 80px dead space, keeps compact threshold)
- Expanded padding trimmed (`py-3`); hero top padding reduced (`pt-5` / `md:pt-8`)

## v5 changes (2026-06-08)

### Header
- Compact on scroll restored: smaller title, meta fades, shorter CTA labels (desktop)
- 80px IntersectionObserver sentinel prevents flip-flop; smooth padding/height transitions
- Mobile: business name only (no header CTAs, no meta strip). Desktop keeps both

## v4 changes (2026-06-08)

### Header
- IntersectionObserver sentinel toggles scrolled style (replaced raw scroll threshold)

### Reviews
- Equal-height flex cards; name + stars bottom-aligned on shared baseline

### Footer
- WebForTrades credit links to https://www.webfortradesuk.co.uk

## v3 changes (2026-06-08)

### CTAs (hero, sticky header, mobile bar)
- Primary: **Get a free quote** → smooth-scroll to `#contact`
- Secondary: **Call Dave - 07700 900123** (tel link)
- Same pair in sticky header and mobile bar
- Mobile bottom bar: quote + compact call button

### Corners
- One sharp/square treatment site-wide via `.card` utility (no rounded corners)
- Gallery figures use `PlaceholderImage` with `embedded` prop so outer card border matches inner placeholder exactly
- Buttons, form fields, badges, hero focal frame all square

### Kept from v2
- Glass sticky header with scroll condense
- `Reveal` scroll animations
- `FaqAccordion` smooth accordion
- Syne + DM Sans, amber/navy palette, overall page structure

### Copy
- No em dashes (hyphens, commas, full stops only)

### Components
- `StickyHeader`, `HeroFocal`, `Reveal`, `FaqAccordion`, `PlaceholderImage` (`embedded` variant)

## v9 (2026-06-08)
- ContactForm: email, optional photo upload, two-up field layout on desktop

## Run locally

```bash
cd sites/test-electrical
npm run dev
```

Open http://localhost:3000
