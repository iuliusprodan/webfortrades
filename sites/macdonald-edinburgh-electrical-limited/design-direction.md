# Design direction - Macdonald Edinburgh Electrical (Path B)

Grounded in the subject per the webfortrades-site-design skill, and built on the pre-allocated batch seed:
**green-natural family (deep pine / forest), body = Geist, display = slab-serif.** The world is a
clean-energy electrician's: the deep green of solar / renewables and Midlothian pinewood, the warm stone
and harled render of Penicuik houses, the matte black of solar panels, and a single clean confident green
as the "clean energy" signal. Boldness is spent in **one** place (the "how the work is done" clean-energy
signature block + a single clean-green accent); everything else stays quiet.

Explicitly **not** any of the three AI-default looks (warm-cream + serif display + terracotta; near-black +
acid-green/vermilion; broadsheet hairline columns), and **not** any palette/font pairing already in the
WebForTrades `library/` (navy-brass, forest-green, steel-blue, terracotta-cream, burgundy, charcoal-orange;
Fraunces/Inter, Syne/DM Sans, Space Grotesk/IBM Plex, Archivo/IBM Plex).

## Distinctness check (BOUND seed: green-natural / Geist / slab-serif)
The seed binds the family, body font, and display category; this build picks the exact values within them.

- **Family = green-natural, but a DEEP NATURAL pine/forest, not a grey-green.** Anchor `--ink #1A3326`
  (deep pine) with a clean-energy emerald accent `--accent #2E7D4F`. This is dark and saturated, the
  opposite of a soft grey-green.
- **Distinct from Brian (sage + chalk + pewter):** sage is a pale, low-chroma grey-green used as a primary
  light surface; this build's green is a very dark, saturated pine used as the *ink* and a saturated
  emerald *accent*. No sage anywhere.
- **Distinct from D.G. (eucalyptus + chalk-white + oak):** eucalyptus is a light, cool, slightly blue-grey
  green; this build's greens are warm-leaning, dark, and saturated. No eucalyptus tint anywhere.
- **Distinct from the old library forest-green:** the library forest-green is a mid green used with
  Fraunces/Inter (serif-editorial + neutral sans). This build pairs deeper pine + cleaner emerald with a
  **slab-serif** display and **Geist** body - a different family member and a different type pairing.
- **Body font = Geist** (next/font/google `Geist`). NOT on the reserved list (Instrument Sans, Hanken
  Grotesk, Mulish). Matches the allocation exactly. Not reused by any deployed site.
- **Display = slab-serif (Roboto Slab)** - matches the allocated category. Distinct from the deployed
  displays (Kyle Bricolage Grotesque, Damo Oswald [sans-condensed], the painters' serif-editorial /
  sans choices). Roboto Slab is the suggested slab in the seed.
- **No reserved-palette overlap:** none of Kyle wet-slate+viridian-teal, Damo larch-iron+cedar-amber,
  Brian sage+chalk+pewter, AC aubergine+brass+bone, D.G. eucalyptus+chalk-white+oak is used or approximated.
- **Only green-natural in the batch** (per the assignment), so no family clash within this batch.

One-line summary vs the 9 prior sites: a **deep pine + warm-stone + clean-emerald** palette with
**Roboto Slab (slab) + Geist** - darker and more saturated than Brian's sage and D.G.'s eucalyptus, and a
different type pairing from every deployed site.

## Palette (named hex, grounded in the subject) - "Pine & Stone"
| Token | Hex | What it is / why this value |
|---|---|---|
| `--ink` | `#1A3326` | **Deep pine** - the anchor. Midlothian pinewood / the green of renewables, pushed dark and saturated. Primary text, dark sections (process, contact, footer), hero scrim. Deliberately darker and more saturated than Brian's sage and D.G.'s eucalyptus, and not a grey-green. |
| `--pine-deep` | `#20402E` | **Forest pine** - the slightly lighter deep-green used for the proof marquee band and dark-section surfaces, so the dark sections have two-tone depth rather than flat black-green. The seed anchor value. |
| `--surface` | `#F0EDE6` | **Warm stone** - pale harled-render / Midlothian sandstone. Page background. A warm stone neutral (supporting family only, never the primary), low-chroma, clearly not the banned warm-cream `#F4F1EA` (greyer, more stone than cream). |
| `--stone` | `#E4DFD4` | **Mid stone** - seasoned render. Alternating section backgrounds and cards. |
| `--line` | `#CDC6B6` | **Stone line** - hairline dividers and borders. Used as the structural signature: section breaks are a **circuit-line rule** (a hairline with a single small clean-green node centred on it, like a junction on a wiring run). |
| `--accent` | `#2E7D4F` | **Clean-energy green** - the single bold colour: primary CTAs, the one key phrase in the signature block, the two-letter service marks, process numerals, marquee separators, circuit-line nodes. A clean, confident emerald-leaning green (the "going solar / clean energy" signal), clearly more saturated and brighter than the deep-pine ink and unrelated to sage/eucalyptus. |
| `--accent-deep` | `#236340` | Hover/active state, and green text on light backgrounds (higher contrast than `--accent` for small text/links). |
| `--accent-ink` | `#FFFFFF` | Text on the accent. |
| `--muted-fg` | `#5E6A5F` | Soft pine-grey for secondary text / captions / labels (a desaturated green-grey, ties to the family). |

Contrast: `--ink #1A3326` on `--surface #F0EDE6` and white on `--ink` both clear WCAG AA comfortably.
CTA buttons use white on `--accent #2E7D4F` (large text, AA). Inline green links use `--accent-deep #236340`
on light for AA on small text.

## Typography (Google Fonts via next/font/google; no bespoke font files)
- **Display: Roboto Slab.** A slab-serif - the seed's suggested slab and the right register for a
  technical / utilitarian trade: its even, squared slabs read like the printed label on a meter, a breaker,
  or a neatly labelled consumer unit, which is exactly this trader's signature ("box and wiring all tidy and
  neatly labeled"). Used large for the hero, the signature statements, section headers and process numerals.
  Weights 500/600/700. Not Kyle's Bricolage, not Damo's Oswald, not a serif-editorial; not in the library.
- **Body: Geist.** A clean, even, modern neutral sans that recedes so the slab display + clean-green carry
  the boldness. Weights 400/500/600. NOT on the reserved body-font list (Instrument Sans, Hanken Grotesk,
  Mulish); not reused by any deployed site.
- Scale: one intentional scale. Hero h1 ~clamp(2.3rem, 5.6vw, 4.0rem); section h2 ~1.8-2.5rem; body
  1.0-1.125rem, line-height ~1.6. The contrast (squared slab display vs clean neutral body) is the
  typographic signature.

## Layout
- Single column, generous margins, content max-width ~1100px, container side padding `--container-x: 24px`.
- **Circuit-line rule** (`--line` hairline with one small `--accent` node centred on it) separates every
  section - the recurring structural motif (a junction on a wiring run).
- Hero: full-bleed best solar-install photo under a deep-pine `--ink` scrim (~55-82% via gradient) for
  legibility; the hero **text block keeps the container side padding on mobile** (horizontal-inset rule).
- Gallery: CSS masonry, 3 cols >=1024px / 2 cols 640-1023px / 1 col mobile, natural aspect ratios,
  top-aligned, captions directly beneath.
- Restraint: clean-green appears in only a handful of places (CTAs, one signature phrase, service marks,
  process numerals, marquee separators, circuit nodes). No gradients beyond the hero scrim, no drop-shadow
  excess, square-to-slightly-soft corners (3px).

## Hero treatment
- **Image:** `08-places.webp` (1600x1200, landscape) - a completed install: a detached harled/brick house
  with two solar panel arrays on the roof, clear blue sky, no people, no clutter, no tools. The single most
  on-angle finished-work shot (directly states "this home went solar"). Selected over the portrait
  battery/inverter close-ups (03/04/06), the people/action roof shots (05), the selfie (09) and the indoor
  consumer-unit shot (10). Crops cleanly to a full-bleed hero at all widths. Reasoning recorded in
  build-notes.md.
- **Headline (trade-led positioning, not a quote):** "Solar, battery storage and electrical work for homes
  across Penicuik and south Edinburgh." Trade (electrician / solar) + location (Penicuik + south Edinburgh) +
  the evidenced angle (clean energy). Complies with banned hero patterns: not a review quote, not
  first-person, not owner backstory, not a platitude.
- **Subhead (<=2 sentences, <=220 chars):** solar panels + battery storage, consumer-unit upgrades and
  induction / EV wiring, fitted tidy and neatly labelled + the 4.9/63 proof. (Exact copy in copy-blocks.md.)
- **CTAs:** primary "Get a quote" (clean-green) -> #quote; secondary "Call David" -> tel. Proof chip:
  "4.9 on Google, 63 reviews". On mobile (<=640px) the CTAs stack full-width, primary on top, proof chip
  below both.

## Section-by-section visual notes
- **proof-strip:** `--pine-deep` band, white text, clean-green diamond separators; genuine infinite loop
  (list x2, translateX -50%, 38s linear); animates on all viewports; reduced-motion -> static row.
- **the-difference (signature):** `--stone` background; 3 large Roboto Slab statements stacked, circuit-line
  rules between; the clean-green used once, on the phrase "tidy and neatly labelled". Stats band inline
  (4.9 / 63 reviews / Mon-Sat). The boldest moment on the page.
- **services:** `--surface`; labelled rows with small two-letter marks (SB / CU / EV / EI) in clean-green -
  NOT 01/02/03 (services are not a sequence) and NOT SVG/lucide icons. Circuit-line rule between rows.
- **gallery:** `--surface`; masonry gallery, thin `--line` frame on each tile, captions in Geist small caps.
- **reviews:** `--stone`; quiet cards, a short clean-green quote rule, the 4.9 restated once as a stat
  ("4.9 Google rating, 63 reviews"). Exactly one review section.
- **process:** `--ink` dark section for contrast; large clean-green Roboto Slab numerals 01-04 (a real
  sequence); circuit-line dividers between steps.
- **areas:** `--surface`; keyless Google Maps iframe (query `Penicuik EH26`, town + outward only), two-column
  area list + Mon-Sat 9am-5pm hours beside it.
- **quote:** `--ink` dark surface (NOT the clean-green accent - contact-section rule). Two columns: left =
  heading + prose + phone/area/hours details; right = the form in light fields, visually distinct from the
  side details. Mobile: single column, details first. Clean-green only on the submit button.
- **footer:** `--ink`; circuit-line dividers; brand, phone, areas, hours, quick links, "read our Google
  reviews" link, small WebForTrades credit.

## Signature summary (the one memorable thing)
Circuit-line rules (a clean-green node on a hairline, like a junction) + a single clean-energy green accent
+ Roboto Slab (squared slabs that read like a neat breaker/meter label), all in service of one message:
**Macdonald Edinburgh Electrical fits solar, battery storage and electrical work tidy and neatly labelled,
across Penicuik and south Edinburgh.** Every other choice stays quiet so that lands.
