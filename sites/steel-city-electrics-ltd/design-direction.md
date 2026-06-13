# Design direction - Steel City Electrics Ltd (Path B)

Grounded in the subject per the webfortrades-site-design skill, and bound to the pre-allocated
parallel-batch design seed. Steel City Electrics is a Sheffield electrical team whose work is
heavy-current: full house re-wires, old and burnt-out consumer units stripped out and modernised,
faults traced and made safe. The world is gunmetal switchgear, brushed-steel consumer-unit covers,
graphite trunking, bare copper, and the single signal colour electricians live by - the
yellow-amber of warning labels, live-cable insulation and hi-vis. Sheffield is the "Steel City":
the monochrome-industrial palette is the brand and the place at once. Boldness is spent in **one**
place (the signal-amber accent + the "make-it-safe re-wire" positioning block); everything else is
quiet graphite and steel.

Explicitly **not** any of the three AI-default trade looks (warm-cream + serif display + terracotta;
near-black + acid-green/vermilion; broadsheet hairline columns), and **not** any palette/font pairing
already in the WebForTrades `library/`.

## Pre-allocated design seed (BOUND - may not change)
- **Palette family: monochrome-industrial** (graphite / gunmetal / steel + ONE signal accent). Bound.
- **Body font: Public Sans** (`next/font/google` `Public_Sans`). Bound; may not substitute.
- **Display category: sans-condensed.** Bound. Chosen display within the category: **Barlow Condensed**
  (`Barlow_Condensed`). NOT Oswald (Damo's), NOT a non-condensed display.

## Palette (named hex, within monochrome-industrial) - "Steel City"
| Token | Hex | What it is / why this value |
|---|---|---|
| `--ink` | `#1C1F22` | **Graphite** - the anchor monochrome from the seed. A cool blue-grey near-black (gunmetal switchgear, graphite trunking). Primary text, dark sections (positioning, process, contact, footer), hero base. Deliberately a *cool* graphite, not Damo's warm larch-iron `#22201C` and not Kyle's green-grey slate. |
| `--ink-2` | `#26292D` | **Gunmetal** - slightly lifted graphite for the dark hero panel and card surfaces on dark sections, so dark-on-dark still has structure. |
| `--surface` | `#ECEDEF` | **Cool concrete / cement** - the pale page background. A neutral cool grey-white (no warm/cream cast), the colour of a freshly skimmed wall or a steel-shop floor. The supporting neutral. |
| `--steel` | `#DCDFE3` | **Brushed steel** - alternating section backgrounds and cards; the silver-grey of a consumer-unit cover. |
| `--line` | `#C3C8CE` | **Steel edge** - hairline dividers and borders. Used as the structural signature: section breaks are a **busbar rule** (a 3px solid graphite bar over a 1px steel hairline, like a busbar seated on its DIN rail), encoding the subject rather than decorating. |
| `--accent` | `#E8B021` | **Signal amber** - the single bold colour: primary CTAs, the one key phrase in the positioning block, the two-letter service marks, process numerals, marquee separators on the dark strip. A bright yellow-amber pulled from warning labels / live-cable insulation / hi-vis. Tuned within the seed's signal band (amber/electric-yellow/safety-orange), pushed clearly *brighter and yellower* than Damo's golden-brown cedar-amber `#A96B23` and away from AC's metallic brass, so it reads "electrical signal", not "timber" or "boutique". |
| `--accent-deep` | `#B8860E` | Hover/active state, and amber text on light backgrounds (darker for AA on small text/links). |
| `--accent-ink` | `#1C1F22` | Graphite text sits on the amber (amber is bright; dark text gives the higher-contrast, hi-vis-label look rather than white-on-yellow). |
| `--muted` | `#5B626B` | Cool steel-grey for secondary text / captions / labels. |

Contrast: `--ink` on `--surface` and `--surface`/white on `--ink` both clear WCAG AA comfortably.
CTA buttons use graphite `--accent-ink` on `--accent` signal amber (large text, AA, and the
hi-vis-label inversion is deliberate). Inline amber links use `--accent-deep` on light for AA.

## Distinctness check (REQUIRED - confirms allocation + no overlap with the 9 prior sites)
- **Family within allocation:** PASS - palette family is **monochrome-industrial** exactly as seeded
  (graphite + gunmetal + cool concrete/steel + one signal accent). No second chromatic family is
  introduced; the only hue is the single signal amber. I am the only monochrome-industrial site in
  this batch; the other four batch-mates are green-natural / jewel-tone / blue-cool / warm-earth, so
  there is no family clash.
- **Body font within allocation:** PASS - body is **Public Sans**, an explicitly listed undeployed
  candidate. Not on the reserved list (Instrument Sans / Hanken Grotesk / Mulish).
- **Display within category:** PASS - display is **Barlow Condensed**, inside the seeded
  **sans-condensed** category, and is NOT Oswald (Damo's reserved condensed display).
- **No overlap with the 5 reserved specific palettes:**
  - Kyle (wet-slate `#1B2420` + viridian-teal `#0F6E5C`): no teal, no green anywhere; accent is amber. Clear.
  - Damo (larch-iron `#22201C` warm near-black + cedar-amber `#A96B23` brown): mine is a *cool* graphite
    `#1C1F22` with no warm/brown cast, and the accent `#E8B021` is a bright yellow signal amber, not a
    golden-brown. Different family (monochrome vs warm-earth), different display (Barlow Condensed vs
    Oswald), different body (Public Sans vs Hanken Grotesk). The two must not read as siblings - they do not.
  - Brian (sage + chalk + pewter): no green. Clear.
  - AC (aubergine + brass + bone): no aubergine; the accent is a brighter, yellower electrical amber,
    not a metallic brass; background is cool concrete, not warm bone. Clear.
  - D.G. (eucalyptus + chalk-white + oak): no green, no oak warmth. Clear.
- **Reserved body fonts (never use):** Instrument Sans, Hanken Grotesk, Mulish - none used. PASS.
- **AI-default clusters:** avoided - not warm-cream/serif/terracotta, not near-black + acid-green/vermilion
  (the accent is a controlled signal amber, not an acid green or vermilion, on a *graphite* not a true
  black, with a pale-concrete page, not an all-dark page), not a hairline broadsheet.

## Typography (Google Fonts via next/font/google; no bespoke font files)
- **Display: Barlow Condensed** (sans-condensed). A condensed, slightly squared grotesque that reads as
  stencilled switchgear labelling and rating plates - a conceptual fit for electrical work and the
  "Steel City" industrial line. Used large with mild tracking for the hero, the positioning statements,
  section headers, service marks and process numerals; the condensed type IS the signature, not a neutral
  vehicle. Weights 500 / 600 / 700. Not Oswald; not in the library.
- **Body: Public Sans** (bound). A clear, even, faintly utilitarian US-government-grade grotesque (the
  "reads like a spec sheet" neutral) that recedes so the condensed display + signal amber carry the
  boldness. Weights 400 / 500 / 600. Not Instrument Sans / Hanken Grotesk / Mulish; not in the library.
- Scale: one intentional scale. Hero h1 ~clamp(2.5rem, 6.2vw, 4.5rem), condensed and tight; section h2
  ~1.9-2.6rem; body 1.0-1.125rem, line-height ~1.6. The width contrast (condensed display vs
  normal-width Public Sans body) is the typographic signature.

## Layout
- Single column, generous margins, content max-width ~1100px, container side padding `--container-x: 24px`.
- **Busbar rule** (a 3px solid `--ink` bar over a 1px `--line` hairline) separates every section - the
  recurring structural motif (a busbar seated on a DIN rail). On dark sections it inverts to amber-over-steel.
- Hero: **typographic / solid graphite hero, no photo** (see "Hero treatment" - there is no usable
  finished-work photo). Gunmetal panel over a graphite field with a faint signal-amber edge rule.
  The hero text block keeps the container side padding on mobile (horizontal-inset rule).
- Gallery: CSS masonry, 3 cols >=1024px / 2 cols 640-1023px / 1 col mobile, natural aspect ratios,
  top-aligned, captions directly beneath. (The photos are fault/board shots, captioned plainly.)
- Restraint: amber appears in only a handful of places (CTAs, one positioning phrase, service marks,
  process numerals, marquee separators). No gradients beyond the hero field, square-to-slightly-soft
  corners (2-3px) echoing a consumer-unit cover.

## Hero treatment (TYPOGRAPHIC - no photo; decision recorded in build-notes.md)
The 6 Google Places photos are all (a) the AI-style navy+red brand logo, or (b) close-up
work-in-progress / fault shots of old and burnt-out consumer units against bare walls. Per the skill's
hero rules these all fail (close-up detail crops, WIP, clutter; the logo also clashes with the
mandated monochrome palette). The skill and the assignment both direct: **when no usable finished-work
photo exists, use a strong typographic/solid hero rather than a poor photo.** So the hero is a graphite
field with a gunmetal content panel, a thin signal-amber rule, the condensed Barlow headline, and the
proof chip - no image. The fault/board photos are used honestly in the gallery as fault-finding and
board-replacement evidence (this trade's real "before"), not dressed up as showcases.

- **Headline (trade-led positioning, not a quote):** "Sheffield electricians for full re-wires and old
  fuse boards, left tested and safe." Trade (electricians) + location (Sheffield) + the evidenced angle
  (re-wires / board modernisation, made safe). Complies with banned hero patterns: not a review quote,
  not first-person, not owner backstory, not a platitude.
- **Subhead (<=2 sentences, <=220 chars):** re-wires + consumer units + fault-finding across Sheffield,
  transparent on price and quick to answer. (Exact copy in copy-blocks.md.)
- **CTAs:** primary "Get a quote" (signal amber) -> #quote; secondary "Call Steel City" -> tel. Proof
  chip: "5.0 on Google, 20 reviews". On mobile (<=640px) the CTAs stack full-width, primary on top,
  proof chip below both.

## Section-by-section visual notes
- **what-we-take-on (signature positioning):** `--steel` background; 3 large Barlow statements stacked,
  busbar rules between; amber used once, on the phrase "tested and left safe". The boldest moment on the page.
- **services:** `--surface`; labelled rows with small two-letter marks (RW / CU / FF / IN / CO) in signal
  amber - NOT 01/02/03 (services are not a sequence) and NOT SVG/lucide icons (no_service_icons check).
  Busbar rule between rows.
- **selected-work (gallery):** `--surface`; masonry, thin `--line` frame on each tile; honest captions
  (fault-finding / board replacement / Sheffield). The navy+red logo image is NOT used.
- **who-we-are (team, first-person):** `--steel`; short first-person team block ("We are the lads ...")
  - first-person voice so the owner_voice check passes; stats band inline (5.0, 20 reviews, Sheffield).
- **reviews:** `--surface`; quiet cards, a signal-amber quote rule, the 5.0 restated once as a stat
  ("5.0 - Google rating, 20 reviews"). Exactly one review section.
- **how-a-job-works:** `--ink` dark section for contrast; large amber Barlow numerals 01-04 (numbering is
  honest here - a real sequence); busbar dividers between steps.
- **areas-and-hours:** `--surface`; keyless Google Maps iframe (query `Sheffield S8`, town + outward only,
  no street, no inward postcode), two-column area list + availability beside it.
- **quote:** `--ink` dark surface (NOT the amber accent - contact-section rule). Two columns: left =
  heading + prose + phone/area/availability details; right = the form in light fields, visually distinct.
  Mobile: single column, details first. Amber only on the submit button.
- **footer:** `--ink`; busbar dividers; brand, phone, areas, availability, quick links, "read our Google
  reviews" link, small WebForTrades credit.

## Signature summary (the one memorable thing)
Busbar rules + a single signal-amber accent + condensed Barlow (stencilled switchgear labelling), all in
service of one message: **Steel City are the Sheffield team who take on the re-wire and the old board,
price it straight, and leave it tested and safe.** Every other choice stays quiet graphite and steel so
that lands.
