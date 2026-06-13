# Design direction - Damo's Decking & Fencing (Path B)

Grounded in the subject per the webfortrades-site-design skill: the design comes from a decking and
fencing builder's own world - planed softwood and cedar decking boards, the warm honey of fresh-cut
timber and decking oil, blackened-iron fence ironmongery and posts, the silver-tan of weathered board,
and concrete bases. Boldness is spent in **one** place (the "built true on ground that never sits level"
angle block + a single cedar-amber accent); everything else stays quiet.

Explicitly **not** any of the three AI-default looks (warm-cream + serif display + terracotta;
near-black + acid-green/vermilion; broadsheet hairline columns), and **not** any palette/font pairing
already in the WebForTrades `library/` (navy-brass, forest-green, steel-blue, terracotta-cream, burgundy,
charcoal-orange; Fraunces/Inter, Syne/DM Sans, Space Grotesk/IBM Plex, Archivo/IBM Plex).

**And explicitly NOT Kyle Knowles Tiling's identity:** Kyle uses wet-slate ink `#1B2420` + viridian-teal
`#0F6E5C` with Bricolage Grotesque + Instrument Sans. This build shares none of those - warm timber neutrals
+ a golden cedar-amber, with Oswald + Hanken Grotesk. The two sites should not read as siblings.

## Palette (named hex, grounded in the subject) - "Larch & Iron"
| Token | Hex | What it is / why this value |
|---|---|---|
| `--ink` | `#22201C` | **Blackened iron** - the colour of a wrought fence post and dark wood-stain. Primary text, dark sections (process, contact, footer), hero scrim. A *warm* near-black (faint brown), deliberately not Kyle's green-grey slate and not corporate navy. |
| `--bg` | `#EDEAE2` | **Sawn timber** - pale planed softwood. Page background. Picked deliberately greyer and lower-chroma than the banned warm-cream `#F4F1EA`, and paired with a *condensed grotesque* (not a serif) and an *amber* (not terracotta), so it reads "timber yard", not "artisan bakery cream cluster". |
| `--stone` | `#E2DED4` | **Weathered board** - the silver-tan of seasoned decking. Alternating section backgrounds and cards. |
| `--line` | `#CFC9BC` | **Sawdust line** - hairline dividers and borders. Used as the structural signature: section breaks are a **double deck-board rule** (two 1px lines a few px apart, like the gap between two deck boards), which encodes the subject rather than decorating. |
| `--accent` | `#A96B23` | **Cedar amber** - the single bold colour: primary CTAs, the one key phrase in the angle block, the two-letter service marks, process numerals, marquee separators on the dark strip. A golden-brown (fresh-cut cedar / decking oil), pushed clearly off the banned terracotta hue (`#b15c38` is redder; this is more golden). |
| `--accent-deep` | `#8A5419` | Hover/active state, and amber text on light backgrounds (higher contrast than `--accent` for small text/links). |
| `--accent-ink` | `#FFFFFF` | Text on the accent. |
| `--muted-fg` | `#6B6356` | Warm grey for secondary text / captions / labels. |

Contrast: `--ink` on `--bg` and white on `--ink` both clear WCAG AA comfortably. CTA buttons use white on
`--accent` (large text, AA); inline amber links use `--accent-deep` on light for AA on small text.

## Typography (Google Fonts via next/font/google; no bespoke font files)
- **Display: Oswald.** A condensed grotesque whose tall, vertical letterforms stand like **fence pales** -
  a deliberate conceptual fit for a fencing and decking builder, and the structural/precision feel matches
  the "dead straight, screwed and fixed" angle. Used large with generous tracking for the hero, the angle
  statements, section headers and process numerals; the type treatment is itself a signature, not a neutral
  vehicle. Weights 500/600/700. Not Kyle's Bricolage Grotesque; not in the library.
- **Body: Hanken Grotesk.** A warm, even, highly legible neutral grotesque that recedes so the condensed
  display + amber carry the boldness. Weights 400/500/600. Not Kyle's Instrument Sans; not in the library.
- Scale: one intentional scale. Hero h1 ~clamp(2.4rem, 6vw, 4.3rem), condensed and tight; section h2
  ~1.9-2.4rem; body 1.0-1.125rem, line-height ~1.6. The width contrast (condensed display vs normal-width
  body) is the typographic signature.

## Layout
- Single column, generous margins, content max-width ~1100px, container side padding `--container-x: 24px`.
- **Double deck-board rule** (`--line`, two 1px lines a few px apart) separates every section - the recurring
  structural motif.
- Hero: full-bleed best landscape project photo under an `--ink` scrim (~55-65% via gradient) for legibility;
  the hero **text block keeps the container side padding on mobile** (horizontal-inset rule).
- Gallery: CSS masonry, 3 cols >=1024px / 2 cols 640-1023px / 1 col mobile, natural aspect ratios,
  top-aligned, captions directly beneath.
- Restraint: amber appears in only a handful of places (CTAs, one angle phrase, service marks, process
  numerals). No gradients beyond the hero scrim, no drop-shadow excess, square-to-slightly-soft corners
  (2-4px) echoing cut board ends.

## Hero treatment
- **Image:** the best landscape completed-project photo, selected by vision in Phase 2 from the three
  1600px-wide landscape candidates (`02-places.webp` 1600x900, `04-places.webp` 1600x900,
  `05-places.webp` 1600x1343) - scored on finished-build scope, composition and light. State the chosen
  file + reason in build notes.
- **Headline (trade-led positioning, not a quote):** "Decking and fencing for north Leeds, built straight
  on ground that never sits level." Trade (decking & fencing) + location (north Leeds) + the evidenced
  angle (built true on uneven ground). Complies with banned hero patterns: not a review quote, not
  first-person, not owner backstory, not a platitude.
- **Subhead (<=2 sentences, <=220 chars):** decking + fencing across named north-Leeds areas, screwed-and-
  fixed method + 4.9/79 proof. (Exact copy in copy-blocks.md.)
- **CTAs:** primary "Get a quote" (cedar-amber) -> #quote; secondary "Call Damo" -> tel. Proof chip:
  "4.9 on Google, 79 reviews". On mobile (<=640px) the CTAs stack full-width, primary on top, proof chip
  below both.

## Section-by-section visual notes
- **the-difference (signature):** `--stone` background; 3 large Oswald statements stacked, double deck-board
  rules between; the amber used once, on the phrase "screwed and fixed, not a nail in sight". The boldest
  moment on the page.
- **services:** `--bg`; labelled rows with small two-letter marks (DK / FN / GW / GT) in cedar-amber - NOT
  01/02/03 (services are not a sequence) and NOT SVG/lucide icons. Deck-board rule between rows.
- **selected-work:** `--bg`; masonry gallery, thin `--line` frame on each tile, captions in Hanken Grotesk
  small caps.
- **reviews:** `--stone`; quiet cards, a short cedar-amber quote rule, the 4.9 restated once as a stat
  ("4.9 - Google rating, 79 reviews"). Exactly one review section.
- **how-a-job-works:** `--ink` dark section for contrast; large amber Oswald numerals 01-04 (numbering is
  honest here - a real sequence); deck-board dividers between steps.
- **areas-and-hours:** `--bg`; keyless Google Maps iframe (query `Leeds LS6`, town + outward only), two-column
  area list + Mon-Sat 8am-4pm hours beside it.
- **quote:** `--ink` dark surface (NOT the amber accent - contact-section rule). Two columns: left = heading +
  prose + phone/area/hours details; right = the form in light fields, visually distinct from the side details.
  Mobile: single column, details first. Amber only on the submit button.
- **footer:** `--ink`; deck-board dividers; brand, phone, areas, hours, quick links, "read our Google reviews"
  link, small WebForTrades credit.

## Signature summary (the one memorable thing)
Double deck-board rules + cedar-amber accent + condensed Oswald (letterforms like fence pales), all in service
of a single message: **Damo builds decking and fencing true even where the ground isn't level, screwed and
fixed and dead straight.** Every other choice stays quiet so that lands.
