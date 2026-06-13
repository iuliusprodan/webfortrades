# Design direction - Kyle Knowles Tiling (Path B)

Grounded in the subject per `anthropics/skills/frontend-design`: the design comes from a tiler's own
world - grout lines, the geometry of set-out tile, the cool grey of unsealed porcelain, wet slate,
fresh plaster. Boldness is spent in one place (the "jobs others turn down" angle + a single deep accent);
everything else is quiet. Explicitly **not** any of the three AI-default looks (warm-cream+serif+terracotta,
near-black+acid-green, broadsheet hairline), and **not** any palette/font pairing already in the
WebForTrades `library/` (navy-brass, forest-green, steel-blue, terracotta-cream, burgundy, charcoal-orange,
Fraunces/Inter, Syne/DM Sans, Space Grotesk/IBM Plex, etc.).

## Palette (named hex, grounded in the subject)
| Token | Hex | What it is / why this value |
|---|---|---|
| `--ink` | `#1B2420` | Wet-slate charcoal - the colour of damp dark slate tile. Primary text and dark sections. Chosen over pure black and over the banned near-black/navy because it carries a faint green-grey that ties to slate, not corporate navy. |
| `--surface` | `#F1F3F2` | Fresh-plaster off-white, deliberately cool. Page background. Picked specifically *cooler/greyer* than the banned warm cream `#F4F1EA` so it reads "new plaster / unsealed grout", not "artisan bakery". |
| `--stone` | `#E5E8E4` | Unsealed-porcelain grey. Alternating section backgrounds and cards - the body colour of a plain floor tile. |
| `--grout` | `#C9CEC8` | Grout-line grey. Used for ALL dividers, borders, and the implied module grid. This is the structural signature: section rules are grout lines, which encodes the subject (per frontend-design "structure is information"), not decoration. |
| `--accent` | `#0F6E5C` | Deep viridian-teal. The single bold colour - primary CTAs, the one key phrase in the angle block, process numerals. Clean and water-adjacent (reads bathrooms/precision), and distinct from every library palette and from the banned terracotta/acid-green accents. |
| `--accent-deep` | `#0A4F43` | Hover/active state of the accent. |
| `--accent-ink` | `#FFFFFF` | Text on the accent. |

Contrast: `--ink` on `--surface` and white on `--accent` both clear WCAG AA for body text.

## Typography (Google Fonts via next/font/google; no bespoke font files)
- **Display: Bricolage Grotesque.** A contemporary grotesque with subtle, slightly irregular cuts - it reads "made by hand but precise", which is exactly Kyle. Used large and tight for the hero, the angle statements, section headers, and process numerals. The type treatment is itself a signature element, not a neutral vehicle. Not used anywhere in the WebForTrades library.
- **Body: Instrument Sans.** Quiet, even, modern neutral grotesque. Deliberately recedes so the display + accent carry the boldness. Not in the library.
- Scale: one clear, intentional scale. Hero h1 ~clamp(2.6rem, 6vw, 4.5rem), tight tracking; section h2 ~1.9-2.4rem; body 1.0-1.125rem with generous line-height (1.6). Weights: display 600/700, body 400/500.

## Layout
- Single column, generous margins, content max-width ~1100px, on an implied 12-column tile-module grid.
- **Grout-line dividers** (`--grout`, 1px) separate every section - the recurring structural motif.
- Hero: full-bleed best landscape project photo (`02-places.webp`, 1600x900) under a `--ink` scrim (approx 55-65% opacity) for text legibility.
- Gallery: CSS masonry, 3 cols >=1024px / 2 cols 640-1023px / 1 col mobile, natural aspect ratios, top-aligned, captions directly beneath.
- Restraint: the accent appears in only a handful of places (CTAs, one angle phrase, process numerals, form panel). No gradients, no drop-shadow excess, square-to-slightly-soft corners (2-4px) echoing tile edges.

## Hero treatment
- **Image:** `02-places.webp` (1600x900 landscape, completed project) - best hero aspect of the 9.
- **Headline (trade-led positioning, not a quote):** "The Manchester tiler other fitters call when the job's too complex." Trade (tiler) + location (Manchester) + the evidenced angle. Complies with banned hero patterns: not a review quote, not first-person testimonial, not owner backstory, not a platitude.
- **Subhead (<=2 sentences, <=220 chars):** difficult floors + intricate work others pass on + 4.9/43 proof. (Exact copy in copy-blocks.md.)
- **CTAs:** primary "Get a quote" (deep-teal) -> #quote; secondary "Call Kyle" -> tel. Proof chip: "4.9 on Google, 43 reviews".

## Section-by-section visual notes
- **the-difference (signature):** `--stone` background; 2-3 large Bricolage statements stacked, grout-line rules between; the accent used once, on the key phrase ("too complex"). The boldest moment on the page.
- **services:** `--surface`; labelled rows (two-letter marks like FL / BA / KT / IN, or plain labels) - NOT 01/02/03 (services are not a sequence) and NOT SVG icons. Grout-line rule between rows.
- **selected-work:** `--surface`; masonry gallery, thin `--grout` frame on each tile, captions in Instrument Sans small caps.
- **reviews:** `--stone`; quiet cards, accent quotation mark or rule, the 4.9 restated once as a stat ("4.9 - Google rating").
- **how-a-job-works:** `--ink` dark section for contrast; large `--accent`/white numerals 01-04 (numbering is honest here - it is a real sequence), grout-line dividers.
- **areas-and-hours:** `--surface`; keyless Google Maps iframe (query `Manchester M11`, town + outward only), area list + 7am-7pm/7-day hours beside it.
- **quote:** `--accent` panel (deep teal) with the form in white fields; the one place the accent goes full-bleed.
- **footer:** `--ink`; grout-grey dividers; brand, phone, areas, hours, quick links, "read our Google reviews" link, small WebForTrades credit.

## Signature summary (the one memorable thing)
Grout-line grid + deep-teal accent + Bricolage Grotesque, all in service of a single message: **Kyle takes the
tiling jobs other fitters won't.** Every other choice stays quiet so that lands.
