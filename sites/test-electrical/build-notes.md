# Build notes - Hartley Electrical (test)

- Slug: `test-electrical`
- Direction: quiet-premium-editorial (Syne + DM Sans, amber accent on navy)
- v3 polish: dual CTAs, square corners site-wide
- v4 fix: stable header, equal review cards, footer link
- v5 header: compact scroll restored, mobile logo-only

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

## Run locally

```bash
cd sites/test-electrical
npm run dev
```

Open http://localhost:3000
