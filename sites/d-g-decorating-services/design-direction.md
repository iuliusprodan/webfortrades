# Design direction - D.G. Decorating Services (Path B)

Grounded in the subject per the webfortrades-site-design skill: the design comes from a painter and
decorator's own world, and specifically from the distinctive angle - **prep-led, flawlessly smooth
modern finishes**. The palette is the seed made literal: a clean **chalk-white wall**, a coat of
**soft eucalyptus-grey paint** (a calm, greyed grey-green, the kind of contemporary heritage colour
this decorator actually rolls onto a feature wall), and a **pale-oak** floor for one warm note.
Light, airy, contemporary, calm - which is exactly how the reviews describe the result ("brighter and
more welcoming", "paintwork so smooth"). Boldness is spent in **one** place (the prep-and-finish angle
block + the single soft-eucalyptus accent); everything else stays quiet.

Explicitly **not** any of the three AI-default looks: NOT warm-cream + high-contrast serif +
terracotta (this base is a deliberately cool/clean chalk white, paired with a grotesque, not a serif,
and a soft grey-green, not terracotta); NOT near-black + acid-green/vermilion; NOT broadsheet hairline
columns. And **not** any palette/font pairing already in the WebForTrades `library/` (navy-brass,
forest-green, steel-blue, terracotta-cream, burgundy, charcoal-orange; Fraunces/Inter, Syne/DM Sans,
Space Grotesk/IBM Plex, Archivo/IBM Plex).

**Explicitly NOT the two sibling builds:**
- **NOT Kyle Knowles Tiling:** Kyle uses wet-slate ink `#1B2420` + viridian-teal `#0F6E5C` with
  Bricolage Grotesque + Instrument Sans. This build's accent is a *soft, greyed* eucalyptus
  (`#7E9A86`), nowhere near Kyle's saturated viridian-teal, and the type is Schibsted Grotesk + Mulish.
- **NOT Damo's Decking & Fencing:** Damo uses blackened-iron `#22201C` + cedar-amber `#A96B23` with
  Oswald + Hanken Grotesk. This build is light not timber-warm, its accent is grey-green not amber, and
  the type is a different pairing.

**And kept distinct from the two parallel painter builds:** one is "muted heritage sage + pewter" and
one is "deep aubergine + brass". This build stays anchored to its own **bright, clean chalk-white +
soft eucalyptus-grey + pale-oak** seed - a light/airy page, not a muted-heritage one and not a dark one.
The eucalyptus here is deliberately soft and a touch *cooler/greener-grey* than a "sage", and there is
no pewter or brass.

## Palette (named hex, grounded in the subject) - "Chalk & Eucalyptus"
| Token | Hex | What it is / why this value |
|---|---|---|
| `--ink` | `#2C3230` | **Soft charcoal with a faint cool-green cast** - the deep tone a decorator might use on the darkest woodwork. Primary text, dark sections (proof strip, process, contact, footer), hero scrim. Deliberately NOT Kyle's slate `#1B2420` (this is lighter, greener-grey) and NOT navy/black. |
| `--surface` | `#F7F8F5` | **Chalk white** - a clean, cool off-white with the faintest green-grey whisper, like a freshly painted wall in daylight. Page background. Picked cooler and cleaner than the banned warm-cream `#F4F1EA` (that is warm/yellow; this leans cool), and paired with a *grotesque* (not a serif) and a *grey-green* (not terracotta), so it reads "freshly decorated room", not "artisan bakery cream cluster". |
| `--stone` | `#E9EDE7` | **Palest eucalyptus wash** - the softest possible coat of the accent. Alternating section backgrounds and cards. |
| `--line` | `#D2D9CF` | **Soft eucalyptus-grey hairline** - dividers and borders. Used as the structural signature: a thin hairline + a short painted-edge accent (the "brushstroke rule" - a 1px line with a short ~40px segment of `--accent` at its start, like the crisp edge where a cut-in coat meets the trim). |
| `--accent` | `#7E9A86` | **Soft eucalyptus** - the single bold colour: primary CTAs, the one key phrase in the angle block, the two-letter service marks, process numerals, marquee separators, brushstroke rule segments. A *greyed* grey-green (chlorophyll dialled right down), pushed clearly off forest-green and well off Kyle's saturated viridian-teal. |
| `--accent-deep` | `#5E7766` | Hover/active state, and eucalyptus text on light backgrounds (higher contrast than `--accent` for small text/links - clears AA on `--surface`). |
| `--accent-ink` | `#FFFFFF` | Text on the accent button. |
| `--oak` | `#C9A87C` | **Pale oak** - the one warm note (a pale-wood floor). Used very sparingly: a thin top-edge on the hero proof chip and the footer brand rule. Never as a second loud accent. |
| `--muted` | `#69716B` | Cool grey-green for secondary text / captions / labels. |

Contrast: `--ink` on `--surface` and white on `--ink` both clear WCAG AA comfortably. CTA buttons use
white on `--accent` (large text, AA); inline eucalyptus links use `--accent-deep` on light for AA on
small text. The hero scrim darkens `--ink` further so white headline text clears AA over the photo.

## Typography (Google Fonts via next/font/google; no bespoke font files)
- **Display: Schibsted Grotesk.** A clean, modern, slightly humanist grotesque - airy and
  contemporary, which matches "bright, smooth, modern finishes". Used for the hero, the angle
  statements, section headers, stat numerals, process numerals and the wordmark. Weights 500/600/700.
  Not Kyle's Bricolage Grotesque, not Damo's Oswald, not in the library.
- **Body: Mulish.** A light, smooth, minimalist sans-serif with very even strokes - it literally reads
  "smooth" and recedes so the display + eucalyptus carry the calm boldness. Weights 400/500/600.
  Not Kyle's Instrument Sans, not Damo's Hanken Grotesk, not in the library.
- Scale: one intentional scale. Hero h1 `clamp(2.3rem, 5.6vw, 4.1rem)`, tight; section h2
  `clamp(1.8rem, 4vw, 2.6rem)`; body `1.0625rem`, line-height `~1.65` (a touch airier than Damo, to
  feel light). The contrast (clean grotesque display vs light even body) is the typographic signature.

## Layout
- Single column, generous margins, content max-width `~1100px`, container side padding
  `--container-x: 1.5rem`.
- **Brushstroke rule** (a 1px `--line` hairline with a short `--accent` segment at the start)
  separates every section and sits under each eyebrow - the recurring structural motif.
- Hero: full-bleed best finished-interior photo under an `--ink` scrim (~50-78% via gradient) for
  legibility; the hero **text block keeps the container side padding on mobile** (horizontal-inset rule).
- Gallery: CSS masonry, 3 cols >=1024px / 2 cols 640-1023px / 1 col mobile, natural aspect ratios,
  top-aligned, captions directly beneath.
- Restraint: eucalyptus appears in only a handful of places (CTAs, one angle phrase, service marks,
  process numerals, rule segments). Pale oak appears in two tiny places only. No gradients beyond the
  hero scrim, soft corners (4-6px, a slightly softer radius than the timber sites, to feel calm/modern).

## Hero treatment
- **Image:** `05-places.webp` (1200x1600 portrait). A hallway of freshly painted smooth white panel
  doors and crisp white trim against a calm soft blue-grey wall, on a warm wood floor - well lit,
  finished, no people, minimal clutter. It is the prep-and-finish angle made visible (the smooth
  repainted doors and woodwork Walter describes), and its calm light palette matches the chalk-white +
  soft-grey-green + pale-oak seed almost exactly. Portrait crops cleanly into a full-bleed hero via
  `object-fit: cover` (skill confirms a stronger portrait completed shot can beat a weaker landscape one);
  confirmed at screenshot-verification. State the file + reason in build notes.
- **Headline (trade-led positioning, not a quote):** "Painters and decorators in Killingworth, with a
  finish so smooth it looks like new." Trade (painters and decorators) + location (Killingworth) + the
  evidenced angle (smooth flawless finish). Complies with banned hero patterns: not a review quote, not
  first-person, not owner backstory, not a platitude.
- **Subhead (single sentence, <=220 chars):** interior decorating across named North Tyneside / Newcastle
  areas, prep-first method + the smooth finish. (Exact copy in copy-blocks.md.)
- **CTAs:** primary "Get a quote" (soft eucalyptus) -> #quote; secondary "Call Dan" -> tel. Proof chip:
  "5.0 on Google, 24 reviews" (thin pale-oak top edge). On mobile (<=640px) the CTAs stack full-width,
  primary on top, proof chip below both.

## Section-by-section visual notes
- **proof-strip:** `--ink` band, light text, soft-eucalyptus diamond separators; seamless marquee, animates
  on all viewports, reduced-motion -> static row.
- **the-difference (signature):** `--stone` background; 3 large Schibsted Grotesk statements stacked,
  brushstroke rules between; the eucalyptus used once, on the phrase "a finish so smooth it looks like
  new". 3 sourced stats inline beneath. The boldest moment on the page.
- **services:** `--surface`; labelled rows with small two-letter marks (PD / DW / PR / WH) in soft
  eucalyptus - NOT 01/02/03 (services are not a sequence) and NOT SVG/lucide icons. Brushstroke rule
  between rows.
- **gallery:** `--surface`; masonry gallery, thin `--line` frame on each tile, captions in Mulish small
  caps. Six finished Google Places interiors only.
- **reviews:** `--stone`; quiet cards, a short eucalyptus quote rule, the 5.0 restated once as a stat
  ("5.0 - Google rating, 24 reviews"). Exactly one review section.
- **process:** `--ink` dark section for contrast; large eucalyptus Schibsted numerals 01-04 (numbering is
  honest here - a real sequence); soft hairline dividers between steps.
- **areas:** `--surface`; keyless Google Maps iframe (query `Killingworth NE12`, town + outward only),
  two-column area list + Mon-Fri 8am-5pm / Sat 8am-1pm hours beside it.
- **quote:** `--ink` dark surface (NOT the eucalyptus accent - contact-section rule). Two columns: left =
  heading + prose + phone/area/hours details; right = the form in light fields, visually distinct from the
  side details. Mobile: single column, details first. Eucalyptus only on the submit button.
- **footer:** `--ink`; soft hairline dividers; brand (thin pale-oak rule), phone, areas, hours, quick
  links, "read our Google reviews" link, small WebForTrades credit.

## Signature summary (the one memorable thing)
A brushstroke rule (hairline + short eucalyptus segment) + the single soft-eucalyptus accent + a clean
modern grotesque on a chalk-white page, all in service of one message: **Dan preps properly and leaves a
finish so smooth it looks like new, bringing dated rooms back brighter.** Every other choice stays quiet
so that lands.
