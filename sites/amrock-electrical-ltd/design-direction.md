# Design direction - Amrock Electrical Ltd (Path B)

Grounded in the subject per the webfortrades-site-design skill, and bound by the pre-allocated
design seed (palette family **warm-earth**, body **Inter**, display category **sans-humanist**).
The angle is **older-home modernisation / heritage**: tidy, reassuring, clearly-explained domestic
electrical upgrades on older Cardiff properties - additional sockets, updating light fittings,
storage heaters and electric fires - with an EV-charger add-on. The colour world is drawn from that
subject: the warm terracotta-brick and rust of older Cardiff housing stock, fired clay and red
brick, set on a cool grey clay-stone, with a deep brown-ink for ironwork and copper-cable warmth.

Boldness is spent in **one** place (the typographic "older homes, brought up to standard" hero + a
single terracotta accent); everything else stays quiet.

Explicitly **not** any of the three AI-default looks: NOT the warm-cream + serif display + terracotta
cluster (this build cools/greys the base stone away from cream `#F4F1EA` and pairs it with a
**sans-humanist** display, not a serif); NOT near-black + acid-green/vermilion; NOT the broadsheet
hairline-column look. Not any palette/font pairing already in the WebForTrades `library/`.

## Distinctness check (mandatory - within family + cross-site)

- **Family:** warm-earth (terracotta / rust / sienna over a warm-but-cool clay stone). I am the
  **only** warm-earth in this batch.
- **Within-family distinctness vs Damo (the reserved warm-earth specific palette - larch-iron +
  cedar-amber):** Damo's accent is a **golden-brown cedar-amber `#A96B23`** (a yellow-leaning
  decking-oil tone) on a pale **sawn-timber `#EDEAE2`** background. Amrock goes deliberately
  **redder and earthier**: the accent is **terracotta/rust `#A8492A`** (clearly red-orange, not
  golden), on a **cool clay-grey stone `#E4E0DA`** that is greyer and less yellow than Damo's timber
  bg. Damo = warm yellow timber yard; Amrock = fired red brick. They will not read as siblings.
- **NOT the warm-cream serif+terracotta AI cluster:** base stone is cooled and greyed away from
  cream (`#E4E0DA`, lower chroma, faintly cool), the display is a **sans-humanist (Inter Tight)**
  not a serif, and the accent is a true brick-terracotta not the soft decorative terracotta of that
  cluster. Three of the cluster's defining traits (cream bg / serif / soft terracotta) are each
  broken.
- **Body + display match the seed:** body = **Inter** (allowed; outside the reserved body-font list
  Instrument Sans / Hanken Grotesk / Mulish). Display = **Inter Tight** (sans-humanist category,
  the suggested font). Used large for display only; body stays Inter. The width/weight contrast
  (tight, heavy Inter Tight display vs even Inter body) is the typographic signature, not a second
  family.
- **No reserved-palette overlap:** distinct from Kyle (wet-slate + viridian-teal), Damo (larch-iron
  + cedar-amber), Brian (sage + chalk + pewter), AC (aubergine + brass + bone), D.G. (eucalyptus +
  chalk-white + oak). Different family from all except Damo, and clearly redder/earthier than Damo
  within warm-earth.
- The brand's own logo (`03-places.webp`) is a **red swoosh on black** - the terracotta/rust accent
  is therefore the authentic brand colour, which reinforces the choice (it is grounded in the
  subject, not imported).

## Palette (named hex, grounded in the subject) - "Fired Brick & Clay"

| Token | Hex | What it is / why this value |
|---|---|---|
| `--ink` | `#241D19` | **Iron-flue brown-black** - the colour of old cast-iron fittings and a dark brown-ink. Primary text, dark sections (process, contact, footer), hero base. A warm near-black (brown-leaning), deliberately not navy and not Kyle's green-grey slate. |
| `--surface` | `#E4E0DA` | **Clay stone** - a cool, low-chroma grey-clay. Page background. Chosen greyer and cooler than the banned warm-cream `#F4F1EA` and than Damo's yellow sawn-timber `#EDEAE2`, so it reads "stone / fired clay", not "bakery cream". |
| `--stone` | `#D8D2C8` | **Weathered brick-dust** - a warmer mid-tone clay. Alternating section backgrounds and cards. |
| `--line` | `#C6BEB2` | **Mortar line** - hairline dividers and borders. The structural signature is a **brick-course double rule** (two 1px lines a few px apart, like a mortar joint between brick courses). |
| `--accent` | `#A8492A` | **Fired terracotta / rust** - the single bold colour: primary CTAs, the one key phrase in the angle block, the two-letter service marks, process numerals, marquee separators. A true red-orange brick terracotta, pushed clearly off Damo's golden cedar-amber (`#A96B23` is yellow-brown; this is red-brown). Matches the brand logo's red. |
| `--accent-deep` | `#8C3A20` | **Deep sienna** - hover/active state and accent text on light backgrounds (higher contrast than `--accent` for small text/links). |
| `--accent-ink` | `#FFFFFF` | Text on the accent. |
| `--muted` | `#6E6457` | Warm grey-brown for secondary text / captions / labels. |

Contrast: `--ink` on `--surface` and white on `--ink` both clear WCAG AA comfortably. CTA buttons use
white on `--accent` `#A8492A` (large text, AA). Inline links use `--accent-deep` `#8C3A20` on light
for AA on small text.

## Typography (Google Fonts via next/font/google; no bespoke font files)

- **Display: Inter Tight (`Inter_Tight`).** Sans-humanist category (the allocated category, the
  suggested font). A tight, modern humanist sans used **large and heavy** (weights 600/700) for the
  hero, the angle statements, section headers, stat numerals and process numerals. Its tightness
  and weight carry the boldness; it is the typographic signature, not a neutral vehicle. NOT a serif
  (so it cannot read as the cream cluster) and NOT condensed.
- **Body: Inter (`Inter`).** The bound body font. Even, highly legible, recedes so the heavy Inter
  Tight display + terracotta carry the boldness. Weights 400/500/600. Outside the reserved list
  (Instrument Sans / Hanken Grotesk / Mulish).
- Scale: one intentional scale. Hero h1 ~clamp(2.3rem, 5.6vw, 4rem), tight and heavy; section h2
  ~1.8-2.5rem; body 1.0-1.125rem, line-height ~1.6. The weight/width contrast (heavy tight display
  vs even body) is the typographic signature.

## Layout

- Single column, generous margins, content max-width ~1100px, container side padding 24px.
- **Brick-course double rule** (`--line`, two 1px lines a few px apart) separates every section -
  the recurring structural motif (a mortar joint between brick courses, echoing the older-home
  brickwork the trade works on).
- **Hero: typographic, NOT photo** (see Hero treatment). A warm-earth ground with a faint brick-course
  texture; the hero text block keeps the container side padding on mobile (horizontal-inset rule).
- Gallery: a single strong completed-work image (only one usable finished photo exists) presented as
  a feature, with the masonry grid degrading cleanly to one column. The image is the electric-fire /
  media-wall install that matches the heritage angle.
- Restraint: terracotta appears in only a handful of places (CTAs, one angle phrase, service marks,
  process numerals, marquee separators). No gradients beyond a subtle hero ground, square-to-slightly-
  soft corners (2-4px) echoing brick edges.

## Hero treatment (DECISION: typographic, solid warm-earth)

- **Why typographic, not photo:** only **one** of the three Google photos is usable finished work
  (`02-places.webp`, a tidy completed electric-fire media wall). `01-places.webp` is a
  work-in-progress shot (cardboard box, tools on the floor, a person crouched mid-install) - banned
  as a hero per the skill. `03-places.webp` is the brand **logo** on black, not a project photo.
  Spending the single good photo on a full-bleed hero would leave the gallery empty; and one
  domestic living-room shot reads as a single room, not a portfolio. The skill explicitly allows a
  strong typographic / solid hero when no finished photo is suitable. The brand's own red-on-black
  logo also makes a bold typographic terracotta hero on-brand. The one good photo is featured in the
  body (selected-work) where it does the most good.
- **Ground:** `--ink` brown-black base with a very subtle terracotta-tinted brick-course texture
  (CSS only, faint) and a quiet terracotta rule under the eyebrow. No stock imagery, no AI image.
- **Headline (trade-led positioning, not a quote):** "Electricians for Cardiff's older homes, brought
  up to standard." Trade (electricians) + location (Cardiff) + the evidenced heritage angle.
  Complies with banned hero patterns: not a review quote, not first-person, not owner backstory, not
  a platitude.
- **Subhead (<=2 sentences, <=220 chars):** older-home upgrades (sockets, lighting, storage heaters,
  electric fires) + EV chargers, explained as you go + 5.0/27 proof. (Exact copy in copy-blocks.md.)
- **CTAs:** primary "Get a quote" (terracotta) -> #quote; secondary "Call Naz" -> tel. Proof chip:
  "5.0 on Google, 27 reviews". On mobile (<=640px) the CTAs stack full-width, primary on top, proof
  chip below both.

## Naming - use of "Naz" (documented per the assignment + ARCH-2 precedent)

Use **Naz** as the first-name the customer deals with. Basis: `brief.json contact_name = "Naz"`,
`contact_name_source = google_reviews`, `contact_name_confidence = high`,
`contact_name_evidence_count = 5`, and `contact_name_usage_allowed = true`. Naz is named in 5 of the
reviews (Molly, Faye, Simon, Rhys, JT1988JT all name "Naz"). This clears the skill's bar (named in
>=2 review bodies) comfortably. Henry is also named (Molly: "Naz and Henry"; "Henry handled much of
the installation") - referenced as a named team member only, factually, no invented backstory. No
owner monologue (no self-description in evidence). Default to light third person ("Naz comes out and
looks at the job...").

## Section-by-section visual notes

- **hero (signature):** typographic, `--ink` ground + faint brick-course texture; heavy Inter Tight
  headline; terracotta primary button; proof chip. The boldest typographic moment.
- **proof-strip:** `--ink` band, terracotta diamond separators, marquee looping seamlessly, animates
  on all viewports (reduced-motion degrades to a static row).
- **the-difference (signature block):** `--stone` background; 3 large Inter Tight statements, brick-
  course double rules between; terracotta used once, on the phrase "explained as we go". The boldest
  copy moment.
- **services:** `--surface`; labelled rows with small two-letter marks (SL / EF / EV / OB) in
  terracotta - NOT 01/02/03 (services are not a sequence; the numbered process below is) and NOT
  SVG/lucide icons. Brick-course rule between rows.
- **selected-work:** `--surface`; the one usable finished photo (`02-places.webp`) featured with a
  thin `--line` frame and a safe caption ("Completed living-room install, Cardiff").
- **reviews:** `--stone`; quiet cards, a terracotta quote rule, the 5.0/27 restated once as a stat
  ("5.0 - Google rating, 27 reviews"). Exactly one review section.
- **how-a-job-works:** `--ink` dark section for contrast; large terracotta Inter Tight numerals
  01-04 (numbering is honest here - a real sequence); brick-course dividers between steps.
- **areas-and-hours:** `--surface`; keyless Google Maps iframe (query `Cardiff CF23`, town + outward
  only), two-column area list + hours beside it.
- **quote:** `--ink` dark surface (NOT the terracotta accent - contact-section rule). Two columns:
  left = heading + prose + phone/area/hours details; right = the form in light fields, visually
  distinct from the side details. Mobile: single column, details first. Terracotta only on the submit
  button.
- **footer:** `--ink`; brick-course dividers; brand, phone, areas, hours, quick links, "read our
  Google reviews" link, small WebForTrades credit.

## Signature summary (the one memorable thing)

Brick-course double rules + a fired-terracotta accent + heavy tight Inter Tight display, all in
service of a single message: **Amrock brings Cardiff's older homes up to standard - extra sockets,
updated lighting, storage heaters and electric fires, plus EV chargers - tidy and explained as they
go.** Every other choice stays quiet so that lands.
