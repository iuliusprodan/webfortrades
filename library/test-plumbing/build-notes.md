# Build notes - Tidewell Plumbing (test)

- Slug: `test-plumbing`
- Direction: confident-blue-trust
- Library reference: test-electrical + test-mechanic (deliberate **very different** third take)
- Divergence: calm blue trust palette, full-bleed hero, Fraunces + Inter, soft rounded corners vs editorial amber and industrial steel

## v1 (2026-06-08)

### Art direction
- Deep navy `#0c2d4a` on calm blue-white `#f4f8fc`, accent `#1a8fd1`
- Fraunces serif display + Inter body
- Soft rounded corners (`rounded-lg` / `rounded-xl`) site-wide
- Full-bleed hero: grey-blue placeholder with navy gradient overlay behind left-aligned copy

### House structure (shared studio DNA)
- Sticky header with scroll hysteresis, mobile logo-only
- Stats, owner note, gallery, services, about, marquee, reviews, coverage, FAQ, contact
- Dual CTAs, mobile stacked hero CTAs + sticky bottom bar
- Equal-height review cards, WebForTrades footer link, no em dashes

### Components
- `StickyHeader`, `HeroFullBleed`, `Reveal`, `FaqAccordion`, `PlaceholderImage`, `ContactForm`

### v2 (2026-06-08)
- Unguessable production alias: `plumbing-site-o6leu5.vercel.app`
- Mobile hero: vertically centred (`items-center`, `100svh` min-height) so headline sits upper-middle without scrolling
- Legibility: stronger scrim (`bg-hero-dark/35` + deeper gradients), eyebrow bumped to `text-white/95` semibold

## Live
https://plumbing-site-o6leu5.vercel.app
