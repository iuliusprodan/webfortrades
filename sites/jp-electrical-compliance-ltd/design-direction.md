# Design direction - jp-electrical-compliance-ltd

JP Electrical & Compliance ltd. Electrician, Bristol BS5 (Easton / Whitehall),
wider Bristol. 5.0 on Google from 21 reviews. No website (clean target).

## The angle (drives the whole page)

The business name literally carries the word **Compliance**, and the evidence backs it:
reviews cite an **EICR booked and done within a week**, **"all the relevant certs provided"**
on an **EV charger** fit, and consumer-unit / inspection work shown in the photos (a labelled
board with inspection dates, a smoke/heat-alarm record). So the page is built around
**certification, safety and technical correctness** - the side of electrical work most
trade sites bury. Tone: confident, technical, compliance-led, calm. Not salesy.

You deal with two named electricians, **Pier (Pierre) and Jack** - evidenced in four of the
five review bodies - so the page can name them and lean on the two-man, certified-and-tidy story.

## Palette - family: BLUE-COOL (deep petrol-navy + electric-cyan safety accent)

Grounded in the subject's world: the deep blue of a switched-off, isolated supply and the petrol
sheen of conduit / enclosures; the electric-cyan accent is the live-blue LED ring on the EV charger
in the gallery (image 05) and reads as the "safe / tested / energised" signal. Cool, technical,
trustworthy - the opposite of warm-cream trade-site slop.

Exact hexes (BOUND family = blue-cool; specific hexes chosen within it):

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#0E2230` | deep petrol-navy: primary text + darkest surfaces |
| `--navy` | `#15323F` | petrol-blue: header band, hero scrim base, dark sections (the seed anchor `#15323F`) |
| `--surface` | `#F4F6F8` | clean cool light neutral: page background |
| `--stone` | `#E6EBF0` | cool pale grey-blue: alt sections / cards |
| `--line` | `#C7D3DC` | cool hairline: dividers + borders (used as a 1px + accent "circuit" rule) |
| `--accent` | `#1FA6E0` | electric-cyan / safety blue: the ONE bold colour (CTAs, numerals, accents) |
| `--accent-deep` | `#1683B5` | hover / pressed accent |
| `--muted` | `#5C6E7A` | cool grey for secondary text |
| `--accent-ink` | `#06222F` | dark ink used as text ON the cyan accent (contrast) |

One signature element: a **thin cyan "circuit" rule** dividing sections (a 1px `--line` hairline
with a short `--accent` lead-in segment), echoing a wiring run / a busbar - the technical motif,
used quietly. One accent only (`--accent`). Everything else stays disciplined.

## Type

- **Body: Manrope** (`next/font/google` -> `Manrope`). BOUND. Not changed. Weights 400/500/600/700.
- **Display: Space Grotesk** (`next/font/google` -> `Space_Grotesk`), category **sans-display**.
  Its slightly mechanical, geometric letterforms read as technical / instrument-panel, which suits
  a compliance-led electrician. Weights 500/600/700.

## Distinctness check (required)

- **Within-family hex choice:** blue-cool. Anchor is a true deep petrol-navy `#15323F` / `#0E2230`,
  NOT a green-grey slate. Accent is an electric-cyan `#1FA6E0` (a clean blue), NOT a green-tinted teal.
- **vs Kyle (wet-slate + viridian-teal) - the critical one:** Kyle's primary is a desaturated
  green-grey "wet slate" with a **viridian/green-teal** accent. Mine is a saturated blue petrol-navy
  with a **blue cyan** accent - no green in either the base or the accent. Clearly distinct at a glance:
  Kyle reads green-grey, this reads blue. PASS.
- **vs other reserved specific palettes:** Damo larch-iron + cedar-amber (warm-earth) - different family.
  Brian sage + chalk + pewter (green) - different. AC aubergine + brass + bone (jewel) - different.
  D.G. eucalyptus + chalk + oak (green) - different. No overlap. PASS.
- **I am the ONLY blue-cool in this batch.** PASS.
- **Body font:** Manrope - NOT on the reserved list (Instrument Sans / Hanken Grotesk / Mulish). PASS.
- **Display category:** sans-display via Space Grotesk - NOT Schibsted Grotesk (D.G.) and not reused
  within the batch. PASS.

## Hero

Strong **finished-work photographic** hero is available and on-angle, so no typographic fallback
needed. Hero image = **02-places.webp**: a labelled, certified consumer unit with a visible
smoke/heat-alarm record and inspection dates - finished, well-lit, no people, no clutter, and it
IS the compliance/EICR story in one frame. Portrait crops cleanly full-bleed (`object-fit: cover`)
on mobile and desktop. Decision recorded again in build-notes.md.

## Sections (rhythm)

hero -> proof marquee -> what they're known for (compliance/EICR/EV, stats inline) ->
services (real, evidenced) -> who you deal with (Pier & Jack, first-person) -> gallery ->
reviews (one section) -> how a job works (process) -> coverage (Bristol BS5 + districts, keyless map)
-> contact (two-col, dark navy ink).

## Banned / discipline

No em/en dashes. No banned generic phrases. No certification-scheme badges (NICEIC / NAPIT /
Part P / "fully insured") - NONE are evidenced (0 verified directory probes). "Compliance" (the
trading name) and "EICR" / "certificates provided" are allowed because they are the trade work
itself and are evidenced in review bodies, not scheme-membership claims. No meta-provenance.
British English.
