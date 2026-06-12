# WebForTrades → Open Design brief format

Use this JSON/Markdown structure when commissioning a prospect site from Open Design via MCP `start_run` or the OD Studio composer.

## Purpose

WebForTrades owns **truth** (evidence, verification, strategy). Open Design owns **visual execution** (design system, layout, components). This brief is the contract between them.

## File location (recommended)

```
briefs/<slug>/open-design-brief.json
briefs/<slug>/open-design-brief.md   # human-readable mirror for Cursor
```

Generate from existing artifacts:

- `source-evidence.json` (must be complete after `npm run enrich:lead`)
- `lead-validity.json`
- `site-strategy.json`
- `section-plan.json`
- `pitch-insight.json`
- `creative-constraint.json` (optional uniqueness constraints)

## JSON schema

```json
{
  "version": "1.0",
  "slug": "corvell-ltd",
  "business_name": "Corvell ltd",
  "trade": "plumber",
  "trade_focus": "Bathroom refits and tiling",
  "actual_location": "Bristol, BS15",
  "location_confidence": "high",

  "phone": "07804 693411",
  "email": null,
  "website_url": null,
  "website_status": "SOCIAL_OR_DIRECTORY_ONLY",
  "truly_no_website": true,
  "email_domain_website": {
    "domain": "corvellbathrooms.co.uk",
    "classification": "BROKEN_OR_BAD_SITE",
    "final_url": "https://www.corvellbathrooms.co.uk/",
    "checked": true
  },

  "verified_source_inventory": [
    {
      "platform": "google_places",
      "status": "verified",
      "confidence": "high",
      "url": "https://maps.google.com/?cid=5902983431411409835"
    },
    {
      "platform": "facebook",
      "status": "verified",
      "confidence": "high",
      "url": "https://www.facebook.com/p/Corvell-Bathrooms-61560222691293/"
    }
  ],

  "source_confidence": "high",
  "manual_review_warnings": [],
  "ready_for_build": true,

  "verified_sources": [
    {
      "platform": "google_places",
      "status": "verified",
      "url": "https://maps.google.com/?cid=5902983431411409835",
      "proof": "5.0 rating, 13 reviews"
    }
  ],

  "strongest_proof": {
    "platform": "google",
    "headline": "5★ from 13 Google reviews",
    "url": "https://maps.google.com/?cid=5902983431411409835"
  },

  "review_highlights": [
    {
      "author": "Harriet",
      "rating": 5,
      "quote": "Jack came to measure up... immaculate efficient job",
      "source_url": "https://maps.google.com/?cid=5902983431411409835"
    }
  ],

  "named_people": [
    { "name": "Jack", "source": "google_reviews", "role_hint": "team member" },
    { "name": "Nick", "source": "google_reviews", "role_hint": "team member" }
  ],

  "logo": {
    "available": false,
    "path": null,
    "source_url": null
  },

  "photo_manifest": [
    {
      "path": "briefs/corvell-ltd/images/01-places.webp",
      "source": "google_places",
      "verified": true,
      "caption_safe": "Recent bathroom work",
      "do_not_claim": "specific street address or supplier name"
    }
  ],

  "services": [
    "Bathroom installations",
    "Bathroom refits",
    "Tiling",
    "Tap, toilet and shower repairs",
    "General plumbing"
  ],

  "section_plan": {
    "generic_plan": false,
    "sections": [
      { "id": "review-led-hero", "heading": "...", "why": "..." },
      { "id": "stats-sourced-only", "why": "Google rating only" },
      { "id": "signature-job-story", "heading": "Bathroom refits in Bristol" },
      { "id": "service-explainers", "heading": "What Jack and Nick do best" },
      { "id": "team-person-section", "heading": "Jack and Nick at Corvell ltd" },
      { "id": "process-section", "heading": "How a job with us works" },
      { "id": "review-wall", "heading": "5 on Google reviews" },
      { "id": "local-coverage", "heading": "Based in Bristol" },
      { "id": "simple-contact", "heading": "Get a quote from Corvell ltd" },
      { "id": "quote-form", "why": "Contact anchor form" }
    ],
    "omitted": ["owner-note", "gallery-default", "faq", "about-van-template"]
  },

  "business_angle": "Jack and Nick team, tidy bathroom finishes across Bristol BS15",
  "site_mood": "approachable, named people, trust-first",
  "customer_praise_themes": ["tidy finishes", "fair pricing", "clear communication"],

  "design_constraints": {
    "skill": "web-prototype",
    "design_system_id": null,
    "design_system_hint": "warm editorial or bespoke trade-appropriate system - not generic SaaS",
    "layout_family_hint": "stacked-hero-proof or evidence-led - avoid fixed plumbing template",
    "must_vary": ["hero composition", "section backgrounds", "review presentation", "CTA style"],
    "batch_uniqueness_slugs": ["jt-plumbing", "greens-precise-plumbing-heating-ltd"]
  },

  "required_ctas": [
    { "type": "phone", "label": "Call", "href": "tel:07804693411" },
    { "type": "anchor", "label": "Get a free quote", "target": "#contact" }
  ],

  "form_fields": ["name", "phone", "email", "message", "service_interest"],

  "source_urls": [
    "https://maps.google.com/?cid=5902983431411409835"
  ],

  "things_to_avoid": [
    "Em dashes",
    "Fake owner claims",
    "Invented reviews or photos",
    "Supplier names as job locations",
    "Generic plumbing clone headings: Plumbing sorted properly, One van one trade, Questions before you ring, 06 services done plainly, A note from X, Recent work in X",
    "Fixed WebForTrades skeleton sections not in section_plan",
    "Oversized platform logos",
    "Fake gallery filler"
  ],

  "competitor_reference_notes": {
    "do_not_copy": ["Curletts layout verbatim", "previous WebForTrades template clones"],
    "learn_from": "Curletts method: evidence-first sections, named people, review-led hero"
  },

  "desired_output": {
    "format": "nextjs-handoff",
    "plugin": "od-nextjs-export",
    "target": "single-page static site",
    "framework": "Next.js 15 App Router, static export",
    "styling": "Tailwind if compatible, otherwise scoped CSS modules",
    "deliverables": [
      "One page component matching section_plan order",
      "Responsive mobile-first layout",
      "Accessible semantic HTML",
      "Footer credit: Website by WebForTrades"
    ]
  },

  "outreach": {
    "generate_preview_assets": false,
    "contact_business": false
  }
}
```

## Markdown prompt body (for `start_run.prompt`)

Use plain British English. No em dashes.

Template:

```markdown
Build a bespoke one-page trade website for {business_name} ({trade_focus}) in {actual_location}.

Business angle: {business_angle}
Site mood: {site_mood}

Use this section plan in order (do not use a generic plumbing template skeleton):
{numbered section list from section_plan}

Proof to foreground:
- {strongest_proof.headline} ({strongest_proof.url})
- Named people from reviews only: {named_people}
- Review quote: "{strongest_review_quote}"

Services (evidence-based only):
{services list}

Photos: use only these verified paths; if fewer than 3, omit gallery and stay proof-led:
{photo_manifest paths}

Design:
- Skill: web-prototype (or saas-landing if better fit)
- Pick a design system that suits {site_mood}, not a generic dev-tool aesthetic
- Vary section background moods (light, warm, accent, dark)
- British plain English copy, no hype

Required CTAs: phone {phone}, quote form at #contact

Avoid: {things_to_avoid joined}

Output: HTML artifact suitable for Next.js static export handoff via od-nextjs-export.
Footer must include: Website by WebForTrades
```

## MCP call sequence

```text
1. list_agents          → pick available agent (do not guess)
2. list_skills          → confirm web-prototype / saas-landing
3. list_plugins         → note od-nextjs-export
4. create_project       → name: "<slug>-<business_name>"
5. start_run            → prompt: open-design-brief.md body, skill, designSystem
6. get_run (poll)       → wait for succeeded
7. get_artifact         → pull full bundle
8. Hand off to WebForTrades build adapter
```

## Validation before send

- [ ] `npm run enrich:lead` completed for this slug
- [ ] `source-evidence.json` has `enrichment_complete: true`
- [ ] `lead-validity.json` has `ready_for_build: true` (or manual review documented)
- [ ] `website_status` and `truly_no_website` reflect email-domain website checks
- [ ] `verified_source_inventory` lists all sources attempted and verified
- [ ] Logo path set when `logo.available` is true
- [ ] `photo_manifest` matches on-disk images; no placeholder boxes in design if photos missing
- [ ] Design direction adapts to weak image sets (proof-led / typography-led)
- [ ] `section_plan.generic_plan` is false
- [ ] Every service appears in `source-evidence.json`
- [ ] Every review quote has `source_url`
- [ ] No unverified Facebook/Instagram claims
- [ ] Photo manifest paths exist on disk
- [ ] `things_to_avoid` includes old WebForTrades clone headings

## Permanent port rules (2026-06-11 polish pass)

### Text-only wordmarks

- Headers, footers, mobile sticky bars and JSON-LD must **not** reference raster logo images.
- Wordmark = business name only in the site display typeface. No taglines inside the wordmark, no monogram boxes, no decorative shapes.
- Remove unused `logo.webp` from `public/` after port.

### Owner-name sections

- Do **not** use section titles like "Customers mention {Name} by name".
- Acceptable titles: "What customers say", "Why customers come back", "What reviewers highlight".
- Verbatim review quotes may still include names; titles and intros must not foreground a single owner name.

### Hero treatment matrix (batch sites)

Assign one per site before Open Design or port. Document in `data/batches/<batch-id>/section-variation.json`:

| Treatment | Use when |
|-----------|----------|
| full_bleed_image | Strong verified hero photo |
| split_hero | Balanced copy + project photo |
| typography_with_proof_in_hero | Weak or no photos; proof cards in hero |
| typography_with_proof_bar | Electrician / proof-led |
| asymmetric_image_light | Small accent image only |

Never leave an empty hero image column. Either fill with a verified 1000px+ Places photo or commit to typography-only layout.

### Section order diversity

- Each batch site needs a distinct `data-section-id` DOM order (see `section-variation.json`).
- Do not reuse the default template stack: hero → stats → owner-note → gallery → services → about → reviews → service-area → faq → contact.
- Run `npm run review:clone` after port; target clone score below 35.

### HAS_REAL_SITE handling

- If `lead-validity.json` has `HAS_REAL_SITE` or `HAS_REAL_SITE_SKIP`, write `briefs/<slug>/notes.md` with redesign-pitch framing.
- Do **not** reference the existing URL in public copy.
- Do **not** set `ready_for_pitch: true` without explicit approval.

### Post-port commands

- Use `next build` + `npm run deploy -- --slug <slug>` only.
- **Never** run `npm run build:site` after an Open Design port (wipes artifact).

### AI hero imagery (optional)

- Command: `npm run images:generate -- --slug <slug>` (Gemini Nano Banana via `.env.local`).
- Use only when image readiness FAIL is hero-only and no verified Google Places hero exists at 1000px+.
- AI images: hero backgrounds, abstract textures, service-tile illustrations, brand graphics only.
- Never in galleries, reviews, before/afters, or anywhere implying the business's own work.
- Alt text must be neutral (e.g. "abstract copper pipework texture"). No business name, owner name, or UK address in prompts.
- Manifest: `briefs/<slug>/images/manifest.json` (`source: ai_generated`). Never overwrite `google_places` or `manual_verified` entries.
- Not auto-triggered in batch scripts until explicitly enabled.

## Section integrity (mandatory)

### Gallery rule

- Galleries must render **multiple columns on desktop**. Use CSS columns masonry so the **top row of tiles aligns on their top edges** and rows below stagger naturally with each tile's own height.
- Breakpoints: **3 columns at >=1024px**, **2 columns at 640 to 1023px**, **1 column below 640px** (full width on mobile).
- Captions sit directly under each image. Natural aspect ratios preserved. No forced equal heights. No horizontal overflow.
- **Single-column desktop galleries are not a valid clone-variation tactic.** Forced equal-height grids that remove masonry stagger are also not acceptable. If clone variation is needed, vary section order or hero treatment, not gallery columns.

### Manifest hygiene rule

- Any image flagged as a business card, letterhead, scanned document, certificate, or contact sheet is **hero ineligible and gallery ineligible**.
- Such images may remain in `briefs/<slug>/` as evidence only (`purpose: evidence_only`, `selected: false`).
- Remove excluded images from `sites/<slug>/public/` and from live gallery markup.

### Alias rule

- Prefer a **short, brand-led Vercel alias** derived from trade and city (e.g. `bristol-boiler-repairs.vercel.app`).
- Do not use raw Google Places listing slugs as the canonical alias. The Google listing name is for internal identification only.
- Keep one legacy alias as fallback on the same deployment for one week after a canonical change, then retire it.

### Section-copy integrity rule

- A section title or subtitle must not promise content the section does not deliver.
- Phrases like "explained plainly", "in plain language", "in plain English", "what we cover", and "how it works" require body content that actually explains, describes, or walks through.
- Bare bullet lists of service names are not "explained". Each item must carry a one-line description grounded in verified evidence, or the promise wording must be removed from the title and subtitle.

### Automated check

- `section_integrity` runs during live style verify (`npm run deploy`) via Playwright at 1280px viewport.
- Flags: single-column desktop galleries; promise headings with fewer than 8 description words per item on average or items with zero descriptive text.
- Run unit tests: `npm run test:section-integrity`.
