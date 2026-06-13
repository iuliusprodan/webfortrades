# Design direction - Electrical Solutions Bristol Ltd

Path B (Claude-direct). Authored from the frozen brief + CLAUDE.md + the webfortrades-site-design
skill. Pre-allocated design seed: **jewel-tone** family, body **IBM Plex Sans**, display category
**serif-editorial**. The seed is BOUND - I pick exact hexes within the family, the exact serif within
the category, and supporting colours. I may not change the family, body font, or display category.

## Angle this design serves

High-end domestic lighting and electrics, done to a considered standard (the Bristol sparky, Lawrence).
Premium, boutique-lighting feel: a confident jewel violet, an editorial serif headline, a cool metal.
Calm and refined, not loud. Boldness spent once - the signature "the standard Lawrence works to"
block and the single amethyst accent.

## Palette - jewel-tone (deep amethyst violet + near-black + cool pewter/silver)

A saturated jewel violet, clearly NOT green and NOT a dark eggplant-brown. The metal is COOL
(chrome / silver / pewter), never brass. This is a confident boutique-lighting violet.

| Token            | Hex        | Role |
|------------------|------------|------|
| `--ink`          | `#150A24`  | near-black aubergine-violet: page text on light, the dark sections + footer (deep, cool, almost black) |
| `--amethyst`     | `#3A1E5C`  | **anchor** deep amethyst violet (the bound anchor): hero/standard-block fields, headings on dark |
| `--accent`       | `#7A3FB0`  | lit amethyst: the ONE bold accent (buttons, marks, the single highlighted phrase) - a brighter, cooler violet |
| `--accent-deep`  | `#5E2E8C`  | pressed/hover amethyst |
| `--surface`      | `#F4F2F7`  | cool violet-tinted off-white: page background (a hair of violet, not warm cream - deliberately NOT the AI warm-cream cluster) |
| `--stone`        | `#E7E3EE`  | pale lilac-grey: alt sections / cards |
| `--pewter`       | `#9A93A8`  | **cool metal** - pewter/silver: eyebrows, dividers' glint, secondary text on dark (this is the chrome/silver, NOT brass) |
| `--line`         | `#D7D2E0`  | hairline on light surfaces |
| `--muted`        | `#6A6276`  | cool grey-violet for secondary body text on light |

Accent-on-text colour `--accent-ink` is `#FFFFFF`. Hero gradient runs `--amethyst #3A1E5C` (top) to
`--ink #150A24` (bottom). The metal everywhere is pewter/silver `#9A93A8` - never a warm/gold/brass tone.

### Signature motif - the "filament" divider (lighting design)

The structural signature is a thin **luminous filament line**: a 1px horizontal hairline with a
violet-to-pewter gradient and a small centred dot, evoking a lighting filament / a downlight. It
replaces Damo's "double deck-board rule" between sections and between signature-block / service /
process rows. Implemented as a gradient `border-image` / pseudo-element, not an SVG.

## Type

- **Body: IBM Plex Sans** (`next/font/google` `IBM_Plex_Sans`) - the bound body font. Weights 400/500/600/700.
  Plex Sans is a precise, slightly technical humanist sans - right for an electrician, and it sits
  cleanly under an editorial serif. Not on the reserved list (Instrument Sans / Hanken Grotesk / Mulish).
- **Display: Playfair Display** (`next/font/google` `Playfair_Display`) - serif-editorial category, the
  suggested option. High-contrast editorial serif = the boutique-lighting / premium-brand voice.
  Weights 500/600/700. Fallback `Georgia, "Times New Roman", serif`.

## Distinctness check (REQUIRED)

**Within family (specific-hex distinctness):** anchor amethyst `#3A1E5C` + lit accent `#7A3FB0` + near-black
`#150A24` + cool pewter `#9A93A8`. A saturated, cool jewel violet with a silver/pewter metal.

**Clearly distinct from AC's reserved aubergine+brass+bone (the one to beat):**
- AC = a dark, warm eggplant aubergine + a WARM brass/gold metal + warm bone neutral. Reads warm and
  heritage/boutique-hotel.
- This site = a brighter, COOLER amethyst violet (`#7A3FB0` lit accent is markedly more saturated and
  blue-leaning than a dark eggplant) + a COOL pewter/silver metal (no brass/gold anywhere) + a cool
  violet-tinted off-white (`#F4F2F7`), not warm bone. At a glance: cool jewel violet + silver vs warm
  eggplant + brass. Clearly different palettes within the same jewel-tone family. PASS.
- AC's display is Bodoni Moda; this uses Playfair Display (different serif-editorial face). AC's body
  is Mulish (reserved); this is IBM Plex Sans. No overlap.

**Not green (a batch-mate owns green):** zero green in the palette - confirmed. PASS.
**Not a dark eggplant-brown:** the accent is a lit blue-leaning violet `#7A3FB0`, not eggplant. PASS.

**vs all 9 prior deployed reserved palettes:**
- Kyle - wet-slate ink + viridian-teal (blue-cool/green). No overlap (we are violet + silver). PASS.
- Damo - larch-iron + cedar-amber (warm-earth). No overlap. PASS.
- Brian - sage + chalk + pewter (green-natural; note Brian uses pewter as a NEUTRAL on a green palette;
  here pewter is the metal on a VIOLET palette - the family is different, so no clash). PASS.
- AC - aubergine + brass + bone (jewel-tone). Distinct per the dedicated check above. PASS.
- D.G. - eucalyptus + chalk-white + oak (green-natural). No overlap. PASS.
- The remaining deployed batch-mates (this run's green / warm-earth / etc. seeds) are non-violet by
  allocation; this site is the ONLY jewel-tone in the batch and the only violet. PASS.

**Body / display vs reserved fonts:** body IBM Plex Sans is NOT on the reserved list (Instrument Sans,
Hanken Grotesk, Mulish). Display Playfair Display is serif-editorial; it deliberately does NOT reuse
Newsreader (Brian) or Bodoni Moda (AC). PASS.

**Conclusion: family=jewel-tone, body=IBM Plex Sans, display=serif-editorial (Playfair Display). All
distinctness checks PASS. Only jewel-tone in the batch; clearly distinct from AC's aubergine+brass.**

## AI-cluster avoidance

- NOT warm-cream + serif + terracotta (cluster 1): background is a COOL violet-tinted off-white, accent
  is amethyst violet, metal is pewter - no terracotta, no warm cream.
- NOT near-black + acid-green/vermilion (cluster 2): the dark fields are deep amethyst/near-black violet
  with a violet accent, no acid green or vermilion.
- NOT broadsheet (cluster 3): generous radius on buttons/cards, no dense newspaper columns, no hairline
  newspaper rules - the dividers are the soft luminous filament motif.

## Hero treatment (documented)

Typographic / solid hero on a deep-amethyst-to-near-black gradient field, NO photo behind the headline.
Rationale: the 9 gallery photos are technical close-ups (consumer unit, earthing clamps, sockets), one
work-in-progress shot on a bare/peeling wall, and one portrait of Lawrence at his van (a person + van
clutter). None is a clean completed-room showcase. The skill permits a strong typographic/solid hero
when photos are weak/few, and a premium editorial-serif violet field best carries the high-end
positioning. The strong photos go in the gallery. (See build-notes.md for the final hero decision.)
