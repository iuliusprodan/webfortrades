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

## Parallel-batch design-seed allocation

For a SINGLE build, derive the palette from the subject's world (above). For a **parallel batch** (the main
thread allocating design seeds to N sub-agents that build at once), specific-hex distinctness is **not
enough**: in parallel-batch-1 two sub-agents derived *sage* and *eucalyptus* from different seeds and both
landed in the same colour FAMILY, so the batch read as only 2 families across 3 sites. **Family-level
distinctness is what a user perceives at a glance; specific-hex distinctness is invisible.**

**Rule - one palette FAMILY per seed, no family repeats within a batch.** The main thread pre-allocates a
palette family per seed *before* sub-agents start. Recognised families:
- **green-natural** (sage, eucalyptus, forest, moss, olive)
- **blue-cool** (slate, indigo, steel, navy, teal) - *wet-slate is Kyle's; this subset is reserved*
- **warm-earth** (terracotta, ochre, rust, cedar) - *cedar-amber is Damo's; this subset is reserved*
- **jewel-tone** (aubergine, emerald, sapphire, burgundy)
- **monochrome-industrial** (iron, graphite, cement, bone)
- **warm-neutral** (chalk, sand, linen, oat) - **supporting family only, never the primary**

Constraints:
- Reserved subsets (Kyle = blue-cool/wet-slate; Damo = warm-earth/cedar-amber) stay **blocked** for batch
  allocation.
- Each sub-agent gets **one primary family + one supporting neutral**.
- If two seeds would naturally derive into the same family (e.g. "heritage/period" and "prep-quality" both
  pull toward green-natural), the main thread **must re-seed before sub-agents start**, by either
  (a) reframing one seed toward a different family-defining material, or (b) naming the family explicitly in
  the seed text ("warm-earth required; do not use green").

Worked example (parallel-batch-1, painters):
- Seed A (AC, "boutique-hotel finish") -> **jewel-tone** OK (aubergine + brass)
- Seed B (Brian, "heritage/period homes") -> **green-natural** (sage + pewter)
- Seed C (D.G., "prep-quality / smooth modern") -> **green-natural CLASH** (eucalyptus + oak); should have
  been re-seeded before start. Correct fix: reframe Seed C as "modern-monochrome / crisp finish" ->
  **monochrome-industrial** (bone + graphite + signal accent).

**Rule - body-font + display-category allocation across batches.** Palette family is not the only axis that
converges: in parallel-batch-1 all three sub-agents independently picked **Mulish** for body, and two of
three picked a serif-editorial display. Track fonts already deployed and do not reuse a reserved body font.
- **Reserved body fonts (do not reuse):** Instrument Sans (Kyle body), Hanken Grotesk (Damo body),
  Mulish (Brian + AC + D.G. body - appeared 3x in one batch, too many).
- The next batch's body font must come from **outside** the reserved list. Undeployed candidates to draw
  from: Inter, Manrope, Public Sans, Outfit, IBM Plex Sans, Geist, Söhne (if available).
- Per-seed allocation must also fix a **display-font category**, not just a body font:
  - **serif-editorial** (Bodoni, Playfair, Newsreader, Fraunces)
  - **sans-condensed** (Oswald, Barlow Condensed, Bebas)
  - **sans-display** (Schibsted Grotesk, Space Grotesk, General Sans)
  - **sans-humanist** (Inter Tight, Manrope Display)
- Within a batch, **display categories must not repeat**, and **body fonts must not repeat** and must not be
  on the reserved list. (Update the reserved list as each batch ships.)

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
- **Orientation is a tiebreaker, not a hard rule.** Quality, on-trade subject, and "no people / no
  clutter" beat orientation. A stronger *portrait* completed-project shot can be the right hero over a
  weaker landscape one - `object-fit: cover` crops a portrait cleanly into a full-bleed hero (and it fits
  mobile/portrait viewports perfectly). Pick the most on-brand finished shot first, then confirm the
  desktop crop looks right at screenshot-verification and swap only if it crops badly. (Damo's hero used a
  portrait raised-deck shot over the landscape options because the landscape ones had a person / a patio
  the trader doesn't offer; it cropped cleanly at 1280 and 1920.)

### Hero layout
- Full viewport height: `min-height: 100vh` (use `100dvh` / `svh` where supported), **responsive**, not a
  fixed pixel height.
- Background image `object-fit: cover` so it fills any aspect ratio; readable scrim/overlay over it.
- Headline + sub-head + CTAs stacked, left-aligned, over the image.
- Headline is **trade-led** (trade + location + service/outcome or the distinctive angle), never a review
  quote, first-person narrative, owner backstory, or platitude. Sub-head <= 2 sentences, <= 220 chars.
- Primary CTA "Get a quote" -> `#quote`; secondary is the phone.

**Hero - horizontal inset on mobile.** The background image may full-bleed, but the **text content block**
(eyebrow, headline, sub-head, CTAs) must keep the same horizontal breathing room as every other section on
mobile - match the site's container padding token (e.g. `24px` / `var(--container-x)`). The common bug is a
hero that uses a different (full-bleed) container so the text inherits zero side padding on phones; fix it
at the content wrapper, not the section.

**Hero CTAs - mobile stack.** At `<= 640px` the CTA buttons stack **vertically, each full width** of the
content column: primary ("Get a quote") on top, secondary (phone) below, min tap target 44-48px tall. A
proof chip, if used, goes **below both CTAs**, never inline. At `>= 768px` they sit side by side.

### Proof marquee / strip
Directly beneath the hero, a horizontal strip of **4-6 evidence-drawn proof points** separated by a
diamond or dot (`·`).
- Content from `source-evidence.json`: Google rating, review count, named specialism, location, years
  trading (only if known), verified certification names (only if verified).
- Tone: factual, no exclamation marks, no salesy framing.
  Example: `4.9 on Google · 43 local reviews · Manchester M11 · Floors levelled first · Seven days, 7am-7pm`
- Background: a contrasting band (dark on light pages, accent on dark pages).

**Implementation rules (the marquee must loop seamlessly and animate everywhere).** The strip is a
genuine infinite loop: no hard cut, no visible reset, no empty tail. Render the proof-point list **twice**
inside the animated track, then `translateX(-50%)` over the animation duration; because the second copy
occupies the position the first held, the wrap is invisible. The track is `2x` the content width and the
parent is `overflow: hidden` so the second half is off-screen on first paint. Use a **single full
traversal of one copy in 25-45s** (slower than instinct) with `animation-timing-function: linear` - any
`ease-*` pulses and reads as broken. The separator must sit between **every** proof point, including at the
wrap boundary (between the last item of copy 1 and the first of copy 2) - the simplest way is a separator
rendered after each item (e.g. `::after`), which naturally covers the seam.

**Animate on ALL viewports, including mobile.** Do **not** disable the animation on small screens. The
only exception is `prefers-reduced-motion: reduce`, where you degrade to a **static row showing the first
3-4 proof points** (not a frozen scrollable strip). If you ever write
`@media (max-width: Npx) { animation: none }` for the marquee, that is the bug - stop and surface. (This
was the live bug on Kyle: a mobile breakpoint set `animation: none` and turned the strip into a static
overflow-scroll row.)

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

## Interaction & motion patterns

### Sticky CTA - entrance / exit animation
The mobile sticky CTA (quote-only - never the phone, per `sticky_cta`) appears once the user has scrolled
past the hero (IntersectionObserver on the hero, or a ~80%-viewport-height threshold). It must **animate**,
not hard-toggle `display`. Drive it with a class (e.g. `.is-visible`) on an element that already has
`transform`/`opacity` transitions:
- **Entrance:** fade `opacity 0 -> 1` **and** slide `translateY(16px) -> 0`, 200-280ms, `ease-out`.
- **Exit** (scrolling back up past the threshold): reverse - `opacity 1 -> 0` and `translateY(0 -> 16px)`,
  160-200ms, `ease-in`.
- Never `display:none` toggling (it kills the transition). Keep it in the DOM and transition it.
- `prefers-reduced-motion: reduce`: keep the fade, skip the slide.

### Mobile nav - overlay drawer (never push-down)
The mobile nav **overlays** page content; it must **not** push content down or otherwise shift layout
(changing `margin-top` or inserting into document flow breaks the user's scroll position - this was the
Kyle bug). Implementation:
- A `position: fixed` panel entering from the right (project convention): `translateX(100%) -> 0`,
  240-320ms `ease-out`; a backdrop **scrim** fading `opacity 0 -> 0.5` in parallel. Exit reverses,
  200-240ms `ease-in`.
- **Body scroll locked** while open (`overflow: hidden` on `body`; restore on close).
- **Close on:** tap a nav link, tap the scrim, or `Escape`.
- **Focus** moves to the first link on open and returns to the hamburger on close; trap focus inside the
  open panel.
- Hamburger animates to an X (or rotates) on open as the standard affordance.
- **Banned anti-pattern:** a drawer that pushes `.site-content` down via flow/margin. Overlay only.
- **Containing-block gotcha (cost a rebuild on Kyle):** a `position: fixed` panel/scrim must **not** live
  inside an ancestor that has `transform`, `filter`, `backdrop-filter`, `will-change`, or `contain` -
  those create a containing block that traps the fixed element inside that ancestor's box (e.g. a 68px
  sticky header with `backdrop-filter`), so the scrim covers only the header strip and the panel is
  clipped. Render the drawer + scrim at body/root level, **outside** the header.

---

## Interactive state - visual verification

**Code that compiles is not code that works.** For every interactive UI state - nav drawer
open/closed, modal open/closed, sticky CTA visible/hidden, marquee animating, form focus, hover
treatments - you MUST **visually verify the state with vision tools** (screenshot the actual rendered
state and look at it) before reporting the implementation done. Geometry measurements and "the class
toggles" are not enough; verify what the user actually sees. This section exists because a nav drawer was
reported "verified" from measurements while, visually, it had no scrim, a see-through panel, and no
visible close button.

**Mobile nav overlay - run this checklist AT THE OPENED STATE (not closed):**
- [ ] Backdrop scrim is visible and darkens the page behind the panel (page content is clearly dimmer
      than when the nav is closed).
- [ ] Panel has an opaque (or near-opaque) background; page content does **not** bleed through the nav
      items.
- [ ] A close affordance is visible **inside/above the panel** - an X button, or the hamburger
      transformed to an X - and is **not occluded by the panel** (a hamburger left in a lower z-index
      header will be hidden behind the panel; put the X in the panel or raise it above).
- [ ] The panel occupies its intended region cleanly: no half-rendered artifacts, no partially-covered
      wordmark/logo, no clipped edges.
- [ ] Tapping the scrim closes the panel.
- [ ] Tapping a nav link closes the panel.
- [ ] Escape closes the panel.
- [ ] Body scroll is locked while the panel is open.

If any item fails, the implementation is **incomplete** - surface the failing item and fix before the
next verification pass; do not report done.

**This applies to ALL interactive states, not only mobile nav.** When implementing modals, drawers,
carousels, accordions, or dropdowns, author a state-specific visual checklist and run it at each
non-default state.

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
`lib/build-marker.ts`). Worked references: `sites/kyle-knowles-tiling/` (slate/teal tiler) and
`sites/damos-decking-and-fencing/` (timber/amber decking-fencing builder) and their Phase 1 plan files.
