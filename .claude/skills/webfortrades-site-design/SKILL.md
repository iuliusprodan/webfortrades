---
name: webfortrades-site-design
description: >-
  Build and review WebForTrades one-page trade sites (Claude-direct from a frozen brief).
  Use when creating, rebuilding, or reviewing any prospect site. Encodes hero/proof/coverage/
  contact/stats/rhythm rules and anti-patterns learned from the Kyle Knowles bake-off, plus the
  evidence and banned-phrase discipline. Adapts anthropics/skills/frontend-design (Apache-2.0).
---

# WebForTrades site-design skill

## When to read this skill

Read this **before creating, rebuilding, or reviewing any WebForTrades one-page trade site.** It is the
craft contract for the Claude-direct pipeline (Open Design retired 2026-06-13, see
`docs/claude-migration/bake-off-results.md`). It assumes a frozen brief already exists:
`briefs/<slug>/brief.json` + `source-evidence.json` (raw evidence). You author `site-strategy.json`,
`section-plan.json`, `voice.json`, then the Next.js app.

Operating rules (deploy verification, outreach safety, the 12 invariants, the banned-phrase reference)
live in the root `CLAUDE.md`. This skill may state **tighter** rules than CLAUDE.md; it never loosens one.

## Governing principle

A page must be **business-led, not template-led**. The swap test is the bar: if you could swap the
business name onto another trader's site and it still fit, the page has failed. Spend your boldness in
**one** place (one signature element + one accent); keep everything else quiet and disciplined.

## AI design clusters to avoid (adapted from frontend-design)

AI-generated trade sites converge on a few looks. Reject all of these unless the subject genuinely calls
for it:

1. **Warm cream background (near `#F4F1EA`) + high-contrast serif display + terracotta accent.** This is
   also the WebForTrades clone signature (the bathroom batch). Do not reach for it.
2. **Near-black background + a single bright acid-green or vermilion accent.**
3. **Broadsheet layout: hairline rules, zero border-radius, dense newspaper columns.**

Also avoid every palette/font pairing already in `library/` (navy-brass, forest-green, steel-blue,
burgundy, charcoal-orange; Fraunces+Inter, Syne+DM Sans, Space Grotesk+IBM Plex, Archivo+IBM Plex). The
distinctive choices come from **the subject's own world** - its materials, tools, surfaces, vernacular.
Describe the palette as 4-6 named hex values grounded in that world.

Numbered markers (`01 / 02 / 03`) are only acceptable where the content **is** a sequence (a real
process / timeline). Never use them as decoration on non-sequential content (e.g. services). No inline
`<svg>`, `lucide-react`, or `@heroicons/*` on service or process items - use numbers (sequences only),
two-letter marks, dots, or nothing.

---

## Section rules (load-bearing)

### Hero image selection
Select the hero image from the gallery by **quality, not file order**.
- **Prefer:** completed-room showcase shots; full or near-full room visible; well-lit; finished surface.
- **Avoid:** close-up detail crops (grout lines, tile edges), work-in-progress shots, anything with
  tools/debris/partial fixtures, awkward crops.
- **How to rank:** use image-analysis or LLM vision when available, scoring on (room scope, composition,
  completion state). **Fallback heuristic when vision is unavailable:** prefer landscape orientation,
  larger file size (resolution proxy), and caption keywords like "finished"/"completed"/"tiled" over
  "during"/"detail". State in your build notes which image you chose and why.

### Hero layout
- Full viewport height: `min-height: 100vh` (use `100dvh` / `svh` where supported), **responsive**, not a
  fixed pixel height.
- Background image `object-fit: cover` so it fills any aspect ratio; readable scrim/overlay over it.
- Headline + sub-head + CTAs stacked, left-aligned, over the image.
- Headline is **trade-led** (trade + location + service/outcome or the distinctive angle), never a review
  quote, first-person narrative, owner backstory, or platitude. Sub-head <= 2 sentences, <= 220 chars.
- Primary CTA "Get a quote" -> `#quote`; secondary is the phone.

### Proof marquee / strip
Directly beneath the hero, a horizontal strip of **4-6 evidence-drawn proof points** separated by a
diamond or dot (`·`). On mobile, a static strip if a moving marquee is undesirable.
- Content from `source-evidence.json`: Google rating, review count, named specialism, location, years
  trading (only if known), verified certification names (only if verified).
- Tone: factual, no exclamation marks, no salesy framing.
  Example: `4.9 on Google · 43 local reviews · Manchester M11 · Floors levelled first · Seven days, 7am-7pm`
- Background: a contrasting band (dark on light pages, accent on dark pages).

### Coverage / areas section
- **Banned:** a dump of the brief's Google-Maps chips (e.g. "Manchester / Openshaw / East Manchester /
  M11") as the only coverage content. That is data, not coverage.
- **Required:** 8-14 actual surrounding villages / districts / postcode areas around the base, as a
  bullet list or two-column grid, plus one sentence framing the coverage range. Derive the districts from
  UK geographic knowledge of the base postcode (do not invent areas the trader could not plausibly serve;
  do not over-claim a national footprint for a one-van trade).
- Plus a base-area block with a **keyless** Google Maps embed centred on the **postcode district** (e.g.
  `M11`), never the exact street. Plus operating hours.

### Contact / quote-form section
- **Banned:** the form alone on a solid colour background.
- **Required:** two columns. **Left:** heading + framing prose + key details (phone as click-to-call,
  base area / postcode, operating hours). **Right:** the form.
- Background: a **dark ink surface** (the page's deep ink, e.g. `#1B2420`), **not** the brand accent. The
  form fields must read as visually distinct from the side details.
- Mobile: stack to a single column, details first.
- The form is **presentational only** - it must not submit to the business, call SMTP/WhatsApp, or carry
  any "preview form" disclaimer. Submit button says what it does ("Send job details", not "Submit").

### Stats (inline within about / positioning)
- Where evidence supports, surface **3 specific stats** inline (large numeral, small label beneath).
- **Sourced only:** Google rating, review count, years trading (if known), days callable, count of
  verified certifications.
- **Banned:** photo counts, invented numbers, "100% satisfaction"-type fabrications.

### Content-row consolidation
- At most **2 consecutive** plain-text content-row sections (positioning prose with no distinct visual
  treatment). Three or more: consolidate to 2 by combining related angles, or break them up with a visual
  treatment (gallery / stats band / marquee).

### Section rhythm
Target rhythm for a one-page site:
`hero -> proof strip -> about (<=2 content rows, stats inline) -> services -> gallery -> reviews ->
process -> coverage -> contact (two-col)`.
Acceptable variation: gallery earlier; reviews split into a lead testimonial + a wall; stats as their own
band. Reviews appear in **exactly one** section (no duplicate "What customers say" + review wall). Exactly
one review section; first names + "Google review" attribution; never a first name as a section headline.

---

## Services rules
3-6 **real** services, each with a one-line evidence-based description. Never Google Places categories
(e.g. "Building & construction", "home goods store"), CTAs, or coverage areas as services. Headings are
bespoke - never "X services explained plainly".

## Gallery rules
Multi-column desktop masonry: 3 cols >= 1024px, 2 cols 640-1023px, 1 col mobile. Natural aspect ratios,
top-aligned, captions directly under each image. Captions safe: never invent a job location, room, or
customer name you cannot verify; a neutral "Completed tiling, <city>" is fine.

## Copy + evidence discipline
- Every visible claim must trace to a specific key in `brief.json` / `source-evidence.json`. List any that
  cannot, and cut or soften them.
- **Banned phrases:** the authoritative list is `scripts/copy_voice_constants.ts`, summarised in root
  `CLAUDE.md`. If this skill and the constants file disagree, the constants file wins - flag the drift.
- No em/en dashes (use ` - `, comma, full stop). British English.
- Claim a certification/badge only if it is in `brief.certifications` or a **verified** directory probe.
- Use a proprietor's first name only when evidenced (named in the business name or >=2 review bodies);
  this is a judgment call (see the Kyle Knowles `contact_name_usage_allowed` override - the canonical
  ARCH-2 example).

## Verification before "done"
- **Swap test:** mark each copy block lead-specific (FAIL) vs generic (PASS); fewer than **30%** may PASS.
- **Banned-phrase scan:** clean against `copy_voice_constants.ts` (quotes inside attributed reviews are
  exempt).
- **Em-dash scan:** clean across all authored files.
- **Build gate:** `next build` succeeds and the 13-check suite passes (`run_site_source_checks.ts`).
- **Deploy gate (root CLAUDE.md):** live canonical alias returns 200, the **exact** just-deployed build
  marker is present, business name + phone present, sampled gallery images return 200. Never report a
  deploy live from a cached fetch or the build alone.

## Output artifacts (per site)
`site-strategy.json`, `section-plan.json` (`generic_plan: false`), `voice.json`, then the Next.js app
(`app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `components/`, `data/brief.json`,
`lib/build-marker.ts`). Worked reference: `sites/kyle-knowles-tiling-claude/` and its Phase 1 plan files.
