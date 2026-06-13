# Design direction - Brian McGuinness Decorators (Path B)

Grounded in the subject per the webfortrades-site-design skill: the design comes from a period-home
decorator's own world - the muted sage-green a heritage room gets repainted in, the chalky lime-white
of a freshly cut-in Victorian cornice and ceiling, and the aged pewter-grey of original plasterwork and
a tenement close. The seed is **"heritage tenement - muted sage-green + chalk lime-white + aged
pewter"**: cool, muted, traditional/period. Boldness is spent in **one** place (the "period homes" angle
block + a single muted-sage accent); everything else stays quiet and traditional.

Explicitly **not** any of the three AI-default looks (warm-cream + serif display + terracotta;
near-black + acid-green/vermilion; broadsheet hairline columns), and **not** any palette/font pairing
already in the WebForTrades `library/` (navy-brass, forest-green, steel-blue, terracotta-cream, burgundy,
charcoal-orange; Fraunces/Inter, Fraunces/Work Sans, Syne/DM Sans, Space Grotesk/IBM Plex,
Space Grotesk/Inter, Archivo/IBM Plex, Archivo Black/Barlow, Lora/DM Sans, Space Mono/IBM Plex,
**Spectral/Hanken Grotesk** - the existing `library/decorator` pairing, deliberately NOT reused here).

**And explicitly NOT the two reference builds' identities:**
- **Kyle Knowles Tiling:** wet-slate ink `#1B2420` + viridian-teal `#0F6E5C`, Bricolage Grotesque +
  Instrument Sans. This build shares none of those: a cooler pewter near-black and a *grey-green dusty
  sage* (not Kyle's saturated blue-green teal), with a period serif + a humanist sans.
- **Damo's Decking & Fencing:** warm blackened-iron `#22201C` + cedar-amber `#A96B23`, Oswald + Hanken
  Grotesk. This build is the opposite temperature - cool muted greens and limewash, a serif not a
  condensed grotesque, no amber anywhere.

It also stays distinct from the two other painter sites building in parallel (one "boutique aubergine +
brass", one "bright white + eucalyptus + oak") by anchoring hard to the **muted heritage-sage + limewash
+ pewter** seed - cooler, greyer and more traditional than either.

## Palette (named hex, grounded in the subject) - "Heritage Tenement"
| Token | Hex | What it is / why this value |
|---|---|---|
| `--ink` | `#2C2F2B` | **Aged pewter** - the cool grey-green near-black of original plasterwork and a tenement close stair. Primary text, dark sections (process, contact, footer), hero scrim. A *cool* near-black with a faint green-grey cast, deliberately not Damo's warm brown-black `#22201C` and not Kyle's slate `#1B2420`. |
| `--surface` | `#F0EEE6` | **Chalk lime-white** - the soft, slightly cool white of a freshly cut-in ceiling and cornice (limewash, not cream). Page background. Picked cooler and lighter than the banned warm-cream `#F4F1EA` and than Damo's `#EDEAE2`, paired with a *muted sage* (not terracotta), so it reads "period townhouse", not "artisan bakery cream cluster". |
| `--stone` | `#E4E3D8` | **Pale dove** - a muted greyed limewash, the colour of a primed wall. Alternating section backgrounds and cards. |
| `--line` | `#C7C7B9` | **Pewter line** - hairline dividers and borders. Used in the structural signature: section breaks are a **cornice rule** (a 2px sage line above a 1px pewter hairline, like the shadow-line under a length of cornice / a picture rail), which encodes the subject rather than decorating. |
| `--accent` | `#6E7C5E` | **Heritage sage** - the single bold colour: primary CTAs, the one key phrase in the angle block, the two-letter service marks, process numerals, marquee separators on the dark strip. A cool, dusty grey-green olive (the colour a period room gets repainted in), pushed clearly off both the banned terracotta hue and Kyle's saturated viridian-teal (`#0F6E5C` is a blue-green; this is a muted yellow-green olive). |
| `--accent-deep` | `#566048` | Hover/active state, and sage text on light backgrounds (higher contrast than `--accent` for small text/links - clears AA on `--surface`). |
| `--accent-ink` | `#FFFFFF` | Text on the accent. |
| `--muted` | `#5E6157` | Cool pewter-grey for secondary text / captions / labels. |

Contrast: `--ink` on `--surface` and white on `--ink` both clear WCAG AA comfortably. CTA buttons use
white on `--accent` (large button text, AA); inline sage links/small text use `--accent-deep` on light
for AA.

## Typography (Google Fonts via next/font/google; no bespoke font files)
- **Display: Newsreader.** A period editorial transitional serif (Production Type) with a traditional,
  literary character that suits a Victorian/heritage subject - it reads like the lettering on an old
  townhouse rather than a modern startup. Used for the hero, the angle statements, section headers and
  process numerals; the serif treatment is itself the signature. Weights 400/500/600. Deliberately NOT
  Spectral (the existing `library/decorator` serif), NOT Fraunces/Lora (library), NOT Kyle's Bricolage
  Grotesque, NOT Damo's Oswald.
- **Body: Mulish.** A quiet, even, highly legible humanist sans that recedes so the period serif + sage
  carry the boldness. Weights 400/500/600/700. Not in any library pairing; not Kyle's Instrument Sans;
  not Damo's Hanken Grotesk; not DM Sans / IBM Plex / Inter / Work Sans / Barlow.
- Scale: one intentional scale. Hero h1 ~clamp(2.3rem, 5.6vw, 4.0rem), serif and fairly tight; section
  h2 ~1.9-2.5rem; body 1.0-1.125rem, line-height ~1.65. The contrast (period serif display vs neutral
  humanist body) is the typographic signature; the serif is what sets the heritage tone.

## Layout
- Single column, generous margins, content max-width ~1100px, container side padding `--container-x: 24px`.
- **Cornice rule** (a 2px `--accent` sage line above a 1px `--line` pewter hairline) separates every
  section - the recurring structural motif (shadow-line under a cornice / a picture rail).
- Hero: full-bleed best finished period-room photo under an `--ink` scrim (~50-82% via gradient) for
  legibility; the hero **text block keeps the container side padding on mobile** (horizontal-inset rule).
- Gallery: CSS masonry, 3 cols >=1024px / 2 cols 640-1023px / 1 col mobile, natural aspect ratios
  (the photos are a mix of portrait period rooms and landscape walls), top-aligned, captions beneath.
- Restraint: sage appears in only a handful of places (CTAs, one angle phrase, service marks, process
  numerals, marquee separators). No gradients beyond the hero scrim, no drop-shadow excess, soft 3px
  corners (calm, traditional, not sharp/broadsheet).

## Hero treatment
- **Image:** `03-places.webp` - a finished period room painted in a soft sage-green, with an ornate
  white Victorian cornice/coving running the wall head, a ceiling rose and chandelier, panelled period
  doors and a radiator. Selected by vision over the other candidates because it (a) is finished,
  well-lit and clutter-free with no people, (b) directly shows the period-plasterwork specialism the
  reviews praise (cornices and ceilings), and (c) the room's own sage-green echoes the design seed, so
  the hero and the palette reinforce each other. It is portrait, which `object-fit: cover` crops cleanly
  into a full-bleed hero and fits mobile/portrait viewports. (Backup: `02-places.webp`, period living
  room with ornate cornice + marble fireplace.) WIP/exterior/people shots (04, 07, 08, 09, 10) are
  excluded from hero and gallery.
- **Headline (trade-led positioning, not a quote):** "Painters and decorators for Coatbridge and the
  east of Glasgow, trusted with period homes." Trade (painters and decorators) + honest location
  (Coatbridge and east Glasgow) + the evidenced angle (trusted with period homes). Complies with banned
  hero patterns: not a review quote, not first-person, not owner backstory, not a platitude.
- **Subhead (<=2 sentences, <=220 chars):** painting and wallpaper, Victorian cornices and ceilings,
  halls and staircases, clean and tidy + 5.0/98 proof. (Exact copy in copy-blocks.md.)
- **CTAs:** primary "Get a quote" (muted sage) -> #quote; secondary "Call Brian" -> tel. Proof chip:
  "5.0 on Google, 98 reviews". On mobile (<=640px) the CTAs stack full-width, primary on top, proof chip
  below both.

## Section-by-section visual notes
- **proof-strip:** `--ink` pewter band, limewash text; seamless infinite marquee (rendered twice,
  translateX(-50%), 36s linear); sage diamond separator after every item incl. the wrap seam. Animates
  on all viewports; static row only under prefers-reduced-motion.
- **the-period-difference (signature):** `--stone` pale-dove background; 3 large Newsreader statements
  stacked, cornice rules between; the sage used once, on the phrase "Victorian cornices and ceilings".
  The boldest moment on the page. A 3-stat band (5.0 Google rating / 98 Google reviews / Mon-Fri)
  sits inline beneath - sourced stats only, never a photo count.
- **services:** `--surface`; labelled rows with small two-letter marks (PD / PT / WP / HS) in muted sage
  - NOT 01/02/03 (services are not a sequence) and NOT SVG/lucide icons. Cornice rule between rows.
- **gallery:** `--surface`; masonry, thin `--line` frame on each tile, captions in Mulish small caps.
- **reviews:** `--stone`; quiet cards, a short sage quote rule, the 5.0 restated once as a stat
  ("5.0 Google rating, 98 reviews"). Exactly one review section.
- **process:** `--ink` dark section for contrast; large sage Newsreader numerals 01-04 (numbering is
  honest here - a real sequence); cornice dividers between steps.
- **areas:** `--surface`; keyless Google Maps iframe (query `Coatbridge ML5`, town + outward only),
  two-column area list + Mon-Fri 9am-5pm hours beside it. Honest geo: Coatbridge base, North Lanarkshire
  + east Glasgow, never Glasgow city centre.
- **quote:** `--ink` dark surface (NOT the sage accent - contact-section rule). Two columns: left =
  heading + prose + phone/area/hours details; right = the form in light fields, visually distinct from
  the side details. Mobile: single column, details first. Sage only on the submit button.
- **footer:** `--ink`; cornice dividers; brand, phone, honest areas, hours, quick links, "read our
  Google reviews" link, small WebForTrades credit.

## Signature summary (the one memorable thing)
A cornice rule (sage line over a pewter hairline) + a single muted heritage-sage accent + a period
editorial serif (Newsreader), all in service of one message: **Brian McGuinness is the decorator you
trust with a period home - Victorian cornices and ceilings, halls and staircases over several floors,
painting and paper, left clean and tidy.** Every other choice stays quiet so that lands.
