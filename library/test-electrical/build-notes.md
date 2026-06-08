# Build notes - Hartley Electrical (test)

- Slug: `test-electrical`
- Direction: quiet-premium-editorial (Syne + DM Sans, amber accent on navy)
- Library reference: none (first entry in /library)
- Divergence: n/a (seed template)
- v2 polish: sticky condensing header, hero focal frame, scroll reveals, FAQ accordion
- v3 polish: dual CTAs, square corners site-wide
- v4 fix: stable header, equal review cards, footer link
- v5 header: compact scroll restored, mobile logo-only
- v6 polish: faster marquee, footer clearance, tighter header top

## v6 changes (2026-06-08)

### Marquee
- Mobile 24s, desktop 38s

### Footer
- Mobile bottom padding clears sticky bar; WebForTrades credit fully visible and clickable

### Header top
- Trimmed expanded padding and hero top spacing; 1px sentinel preserves 80px compact threshold

## v5 changes (2026-06-08)

### Header
- Compact on scroll restored with smooth transitions; 80px IO sentinel (no jiggle)
- Mobile: logo only. Desktop: meta strip + dual CTAs that condense on scroll

## v4 changes (2026-06-08)

### Header
- IntersectionObserver sentinel replaces raw scroll threshold (fixes jiggle)

### Reviews
- Equal-height cards with flex column layout; quote flexes, name + stars pinned to bottom baseline

### Footer
- "Website by WebForTrades" links to https://www.webfortradesuk.co.uk (new tab, noopener)

## v3 changes (2026-06-08)

### CTAs (hero, sticky header, mobile bar)
- Primary: **Get a free quote** → smooth-scroll to `#contact`
- Secondary: **Call Dave - 07700 900123** (tel link)
- Same pair in sticky header; labels shorten slightly when header condenses on scroll
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

## Live
https://test-electrical.vercel.app
