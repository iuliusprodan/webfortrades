# Design direction - AC Painters & Decorators (Path B)

Grounded in the subject per the webfortrades-site-design skill: the design comes from a colour-confident
painter and decorator's own world - the deep, saturated feature-wall colour, the boutique-hotel finish,
the warm metal of a brass handle or picture rail, and the bone-white of fresh emulsion and cut-in trim.
The design seed is **"boutique feature: deep aubergine/damson + warm brass + bone white."** Boldness is
spent in **one** place (the colour-confidence signature block + a single warm-brass accent); everything
else stays quiet so the colour lands.

Explicitly **not** any of the three AI-default looks (warm-cream + serif display + terracotta;
near-black + acid-green/vermilion; broadsheet hairline columns), and **not** any palette/font pairing
already in the WebForTrades `library/` (navy-brass, forest-green, steel-blue, terracotta-cream, burgundy,
charcoal-orange; Fraunces/Inter, Syne/DM Sans, Space Grotesk/IBM Plex, Archivo/IBM Plex).

**And explicitly NOT the sibling builds.** Kyle Knowles Tiling uses wet-slate ink `#1B2420` + viridian-teal
`#0F6E5C` with Bricolage Grotesque + Instrument Sans. Damo's Decking uses blackened iron `#22201C` + cedar
amber `#A96B23` with Oswald + Hanken Grotesk. The two parallel painter builds use muted heritage
sage+pewter and bright white+eucalyptus+oak. This build shares none of those: a deep **purple-toned
aubergine/damson** (not red-toned burgundy, not a green, not a grey-slate) + a **warm brass** (more
yellow-gold than Damo's red-brown cedar amber) + **bone white**, with **Bodoni Moda + Mulish**.

## Palette (named hex, grounded in the subject) - "Boutique Feature"
| Token | Hex | What it is / why this value |
|---|---|---|
| `--ink` | `#2E1A2C` | **Deep aubergine/damson** - the lead colour, a confident dark feature-wall purple (clearly purple-toned, NOT red burgundy). Primary text on light, dark sections (hero scrim, process, contact, footer). |
| `--plum` | `#43223E` | **Damson feature** - a richer mid aubergine for the one signature block (the colour-confidence statements). The single boldest surface on the page. |
| `--surface` | `#F2EDE4` | **Bone white** - warm off-white of fresh emulsion. Page background. Deliberately a touch warmer/greyer than the banned artisan-cream `#F4F1EA`, and paired with a high-contrast editorial serif + an aubergine (not terracotta + bakery cream), so it reads "boutique interior", not "AI cream cluster". |
| `--stone` | `#E7DFD2` | **Cut-in bone** - the slightly deeper bone of a second coat. Alternating section backgrounds and review cards. |
| `--line` | `#D2C7B6` | **Edge line** - hairline dividers and borders. Structural signature: section breaks are a **double paint-edge rule** (two 1px lines a few px apart, like the crisp cut-in line where two colours meet). |
| `--accent` | `#B08433` | **Warm brass** - the single bold metal: primary CTAs, the one key phrase in the angle block, the two-letter service marks, process numerals, marquee separators. A yellow-gold brass, pushed clearly off Damo's redder cedar amber (`#A96B23`) and off terracotta. |
| `--accent-deep` | `#8C6620` | Hover/active state, and brass text on light backgrounds (higher contrast than `--accent` for small text/links - clears AA on `--surface`). |
| `--accent-ink` | `#FFFFFF` | Text on the accent. |
| `--muted` | `#6E6173` | **Warm grey-mauve** for secondary text / captions / labels (a desaturated cousin of the aubergine, not a neutral grey, so the palette stays coherent). |

Contrast: `--ink` (#2E1A2C) on `--surface` (#F2EDE4) and white on `--ink`/`--plum` clear WCAG AA
comfortably. CTA buttons use white on `--accent` (large text, AA); inline brass links use `--accent-deep`
on light for AA on small text.

## Typography (Google Fonts via next/font/google; no bespoke font files)
- **Display: Bodoni Moda.** A high-contrast editorial/fashion serif - thick-thin stroke modulation, the
  letterforms you see on a boutique interiors or a paint-brand lookbook. A deliberate conceptual fit for a
  decorator whose signature is the *boutique-hotel finish* and confident colour. Used large for the hero,
  the angle statements, section headers and process numerals; the type treatment is itself a signature.
  Weights 500/600/700. Not Kyle's Bricolage, not Damo's Oswald, not Fraunces, not in the library.
- **Body: Mulish.** A clean, warm, low-contrast humanist sans that recedes so the editorial serif + brass
  carry the boldness. Weights 400/500/600/700. Not Kyle's Instrument Sans, not Damo's Hanken Grotesk, not
  Inter / DM Sans / IBM Plex; not in the library.
- Scale: one intentional scale. Hero h1 ~clamp(2.2rem, 5.6vw, 4.0rem) (a high-contrast serif needs a touch
  less size than a condensed grotesque at the same weight); section h2 ~1.8-2.5rem; body 1.0-1.0625rem,
  line-height ~1.6. The contrast between the modulated serif display and the even humanist body is the
  typographic signature.

## Layout
- Single column, generous margins, content max-width ~1100px, container side padding `--container-x: 24px`.
- **Double paint-edge rule** (`--line`, two 1px lines a few px apart) separates every section - the recurring
  structural motif (the crisp cut-in line where two colours meet).
- Hero: full-bleed finished interior photo under an `--ink` aubergine scrim (~52-82% via gradient) for
  legibility; the hero **text block keeps the container side padding on mobile** (horizontal-inset rule).
- Gallery: CSS masonry, natural portrait aspect ratios, top-aligned, captions directly beneath. Compact (2
  tiles) by necessity - only one genuinely finished photo exists.
- Restraint: brass appears in only a handful of places (CTAs, one angle phrase, service marks, process
  numerals, separators). No gradients beyond the hero scrim, soft 2-3px corners.

## Hero treatment
- **Image:** `10-places.webp` (1200x1600 portrait) - the **only** genuinely finished, well-lit shot of the
  three: a smooth deep grey-charcoal stairwell and landing with a crisp black flush door, white-painted
  spindles and a chrome rail. It reads boutique and moody and sits naturally with the deep-aubergine
  palette. Portrait is fine per the skill (object-fit: cover crops cleanly into the full-bleed hero and fits
  mobile/portrait viewports); confirm the desktop crop at screenshot verification. `02-places.webp` (room
  strip-out with a hire dehumidifier and bare pink plaster, no finished surface) and `03-places.webp` (a
  period staircase mid-renovation, freshly plastered, treads stripped) are NOT hero candidates - WIP / no
  finished surface. (03 is used once in the gallery, captioned honestly as period-house work, not 'finished'.)
- **Headline (trade-led positioning, not a quote):** "Painters and decorators in Bootle and Crosby,
  confident with colour inside and out." Trade (painters and decorators) + location (Bootle and Crosby) +
  the evidenced angle (colour confidence, inside and out). Complies with banned hero patterns: not a review
  quote, not first-person, not owner backstory, not a platitude.
- **Subhead (<=2 sentences, <=220 chars):** interior and exterior painting, feature colour, wallpaper and
  furniture across Bootle, Crosby and Liverpool + 4.9/58 proof. (Exact copy in copy-blocks.md.)
- **CTAs:** primary "Get a quote" (warm brass) -> #quote; secondary "Call 07592 753933" -> tel. Proof chip:
  "4.9 on Google, 58 reviews". On mobile (<=640px) the CTAs stack full-width, primary on top, proof chip
  below both.

## Section-by-section visual notes
- **the-difference (signature):** `--plum` damson feature surface; 3 large Bodoni statements stacked, double
  paint-edge rules between; brass used once, on the phrase "a luxurious, boutique-hotel finish". The boldest
  moment on the page.
- **services:** `--surface`; labelled rows with small two-letter marks (FC / WP / FR / EX) in brass - NOT
  01/02/03 (services are not a sequence) and NOT SVG/lucide icons. Paint-edge rule between rows.
- **gallery:** `--surface`; compact masonry (2 tiles), thin `--line` frame on each tile, captions in Mulish
  small caps - honest captions only.
- **reviews:** `--stone`; quiet cards, a short brass quote rule, the 4.9 restated once as a stat ("4.9 -
  Google rating, 58 reviews"). Exactly one review section.
- **process:** `--ink` aubergine dark section for contrast; large brass Bodoni numerals 01-04 (numbering is
  honest here - a real sequence); paint-edge dividers between steps.
- **areas:** `--surface`; keyless Google Maps iframe (query `Bootle L20`, town + outward only), two-column
  area list + seven-days hours beside it.
- **quote:** `--ink` aubergine dark surface (NOT the brass accent - contact-section rule). Two columns: left
  = heading + prose + phone/area/hours; right = the form in light bone fields, visually distinct. Mobile:
  single column, details first. Brass only on the submit button.
- **footer:** `--ink` aubergine; paint-edge dividers; brand, phone, areas, hours, quick links, "read our
  Google reviews" link, small WebForTrades credit.

## Signature summary (the one memorable thing)
Deep aubergine/damson + a single warm-brass accent + a high-contrast Bodoni Moda editorial serif, all in
service of one message: **AC Painters are confident with colour - the feature wall, the boutique-hotel
finish, inside and out.** Every other choice stays quiet so that lands.
