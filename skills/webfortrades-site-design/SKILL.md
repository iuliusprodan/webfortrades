---
name: webfortrades-site-design
description: >-
  Business-led playbook for WebForTrades prospect websites. Use when creating,
  rebuilding, reviewing, or batch-generating any trade site. Mandates evidence
  mining, site strategy, section planning, and clone rejection before build.
---

# WebForTrades site design skill

## A. Purpose

Use this skill whenever you **create, rebuild, review, or batch-generate** a WebForTrades prospect website.

This skill is the **creative source of truth**. It overrides older scattered design rules when they conflict. Operational rules (deploy verification, outreach caps, db dedupe) still apply from `.cursorrules` and `config.yaml`.

---

## B. Core principle

**The site must be business-led, not template-led.**

### Critical rule (swap test)

If the business name, photos, and reviews can be swapped out and the website still works for another company, **the build has failed**.

Do not start from a layout. Start from evidence.

Templates in `/library` and `scripts/templates/site/` are **references only**, not finished skins. Never ship a text-swapped copy of the default template.

---

## C. Pre-build evidence mining

Before design, mine evidence from all applicable public sources:

| Source | Look for |
|--------|----------|
| Google Places | Name, phone, address, hours, rating, review count |
| Google reviews | Quotes, named people, recurring praise, service hints |
| Google photos | Job types, quality, duplicates |
| Facebook public page | Logo, brand colours, work photos (Meta Graph API when configured), email, intro |
| Instagram public profile | Gallery, captions, follower proof |
| Checkatrade | Score, review count, verified badges, photos |
| TrustATrader | Ratings, endorsements, photos |
| MyBuilder | Feedback, job history snippets |
| Rated People | Reviews, badges |
| Bark | Profile, reviews |
| Yell | Listing, categories |
| Official website | Services, team, tone (do not copy claims as fact) |
| Directories | Cross-check phone and name |
| Companies House | Factual company context only where useful |

### Rules

- **Gathering comes before design.** Run `npm run enrich:lead -- --slug <slug> --no-build` after gather.
- Do not build from Google-only if richer public sources exist.
- Always check email domains for hidden websites (`scripts/website_discovery.ts`).
- Always verify whether the business truly lacks a website.
- If extraction fails on a likely useful source, mark manual review instead of pretending data does not exist.
- Enrichment quality must be checked before design (`benchmark:sources` or full `enrich:lead`).
- A lead is not ready for design until source evidence, website discovery, logo discovery and photo discovery have run.
- If a real website exists, do not use the no-website pitch.
- If photos are weak, use proof-led layout. If logo exists, use it for palette or header when suitable.
- Public sources only
- Do not log in to Facebook with a personal account for scraping
- Do not automate a logged-in Facebook browser
- Preferred Facebook photos: Meta Graph API when configured; **Apify REST API** when Graph unavailable; public HTML is last resort (often thumbnails only)
- Apify MCP is for Cursor manual tests only; pipeline uses `APIFY_TOKEN` in `.env`
- Cookie/login Facebook scraping is not allowed
- If Facebook media is `LOW_RES_ONLY`, use proof-led or typography-led layout; mark manual asset review
- Image priority: official website, Google Places, directory, manual assets, Facebook evidence only (not gallery under 600px), proof-led if weak
- Manual assets folder: `briefs/<slug>/images/manual/`. Validate with `npm run assets:manual -- --slug <slug>`. Optional `sources.json` sidecar for provenance
- Statuses: `MANUAL_ASSET_REVIEW_RECOMMENDED`, `MANUAL_ASSET_REVIEW_REQUIRED`. Pause before Open Design when required and no manual files exist
- Never render visible placeholder boxes on the final public site. Internal `image_slots` in section-plan are planning only
- Do not bypass CAPTCHAs
- Do not scrape private content
- Do not contact the business
- Verify each source before use
- Save source URLs and verification evidence
- **Phone match is the strongest verification signal**
- If uncertain, mark `manual_review_required: true`

### Output

Write `briefs/<slug>/source-evidence.md`, `briefs/<slug>/source-evidence.json`, and `briefs/<slug>/lead-validity.json` with:

- `sources[]`: url, platform, verified (bool), verification_method, phone_match, notes
- `attempted_sources[]`: platforms checked even if nothing found
- `strongest_proof_source`: platform + url + metric
- `website_status`, `email_domain_website`, `logo_found`, `image_manifest`
- `ready_for_build`, `lead_validity_status`, `manual_review_flags[]`

See [examples/source-enrichment-checklist.md](examples/source-enrichment-checklist.md).

---

## D. Business story extraction

From evidence, identify:

- The real business angle (what makes them different)
- What customers repeatedly praise
- Named people (owners, staff mentioned in reviews)
- Distinctive phrases from reviews
- Strongest review quote (verbatim, attributed)
- Strongest proof source (Google vs Checkatrade vs Facebook, etc.)
- Best photos (story value, not just count)
- Weak or risky claims to avoid
- Best pitch insight (one hook for outreach)

### Output

Write `briefs/<slug>/site-strategy.md` and `briefs/<slug>/site-strategy.json`:

```json
{
  "slug": "",
  "business_angle": "",
  "customer_praise_themes": [],
  "named_people": [],
  "distinctive_phrases": [],
  "strongest_review_quote": { "text": "", "author": "", "source": "", "url": "" },
  "strongest_proof_source": { "platform": "", "metric": "", "url": "" },
  "best_photos_rationale": "",
  "claims_to_avoid": [],
  "pitch_hook_summary": "",
  "personality": "premium|practical|emergency|craft|industrial|family|local|heritage",
  "evidence_strength": "strong|moderate|thin"
}
```

See [examples/site-strategy-example.md](examples/site-strategy-example.md).

**If site-strategy is missing, do not build.**

---

## E. Section planning

Choose sections from evidence. Justify each inclusion. Omit sections with no evidence.

### Do not default to

- "A note from X"
- "Recent work in {area}"
- "{N} services. Done plainly."
- "One van. One trade. A name on a list."
- "Questions before you ring."
- "Pick up the phone, or write."
- Same CTA strip copy on every site
- Same stats band layout without sourced stats
- Same review card pattern without platform-specific proof

### Section menu (pick what fits)

| Section | Use when |
|---------|----------|
| Proof-led hero | Strong Checkatrade/Google combined proof |
| Photo-led hero | Exceptional gallery, weaker text proof |
| Review-led hero | One standout quote defines the business |
| Signature job story | One job type dominates reviews/photos |
| Before and after | Decorator, bathroom refit, restoration evidence |
| Strongest review breakdown | Long detailed review worth featuring |
| What customers keep mentioning | Clear repeated themes in reviews |
| Third-party proof strip | Multiple platforms verify same story |
| Checkatrade proof section | Verified Checkatrade profile with score |
| TrustATrader proof section | Verified TrustATrader profile |
| Facebook work gallery | Verified FB photos beat Google clusters |
| Instagram gallery | Active IG with real job posts |
| How the job works | Process clarity valued in reviews |
| Service-specific explainers | Few distinct services, not generic six-pack |
| Emergency callout block | Reviews mention urgency, 24h, same-day |
| Local coverage block | Clear geographic story |
| Team/person block | Named people verified across sources |
| FAQ | Only if real questions appear in reviews/calls |
| Contact | Always last; wording specific to business |

### Output

Save `briefs/<slug>/section-plan.md` and `briefs/<slug>/section-plan.json`:

```json
{
  "slug": "",
  "sections": [
    { "id": "hero-proof-led", "priority": 1, "justification": "", "background_mood": "dark|light|accent|warm|cool" }
  ],
  "omitted_defaults": ["owner-note", "faq"],
  "generic_plan": false
}
```

Set `generic_plan: true` only if using the legacy 10-section stack **and** each section has bespoke headings and copy. Prefer `generic_plan: false` with a custom list.

See [examples/section-plan-example.md](examples/section-plan-example.md).

**If section plan is generic (default stack + template headings), do not build.**

---

## F. Design direction

After strategy and section plan, choose:

- Palette (from logo, photos, name, niche, review tone)
- Fonts (approved pairs; not Fraunces+Inter for every plumber)
- Layout style (hero composition, not just 3 variants of same page)
- Image treatment (full-bleed, grid, masonry, paired before/after)
- CTA style (button weight, placement per section plan)
- Background mood per section (not one alternating pattern)
- Section rhythm (density, spacing, scroll pacing)
- Animation style (subtle, respects `prefers-reduced-motion`)

Base choices on: business type, photos, logo, review tone, location, proof sources, customer type, personality from strategy.

### Rules

- Templates are references, not skins
- Do not clone the last site
- Do not reuse palette, fonts, hero layout, **or section order** as recent sites in batch
- Use logo or sample colours from logo when verified
- Without logo, derive from photos and personality
- Background colour changes encouraged when they support the story
- Bespoke but practical: trades sites must convert

Write or update `briefs/<slug>/creative-brief.md` and `.json` **after** site-strategy and section-plan exist. Creative brief must reference strategy, not stand alone.

---

## G. Image strategy

- Images must support the story (hero photo = best proof of craft, not random van shot)
- Do not fill gallery with near-duplicates
- Cluster images; max 2 from same project unless very few photos overall
- Prefer verified Facebook or Instagram images when better than Google clusters
- Use Checkatrade or TrustATrader images if public, accessible, verified
- Do not invent project locations in captions
- Do not use giant platform logos as content
- Captions must be safe and specific (service type, generic area, no supplier names as locations)
- **If few images exist, build a leaner site** instead of fake portfolio density
- Respect portrait vs landscape aspect ratios in gallery. Do not force awkward landscape crops on portrait photos.
- **Gallery layout:** tiles align to the top of the row and keep natural aspect ratio. Tiles must not overflow their column horizontally. Uneven bottom edges are acceptable. Do not stretch shorter tiles, pad empty space under an image, or force a uniform aspect ratio just to line up bottoms. Prefer CSS columns masonry on desktop (`column-count: 2`, `break-inside: avoid`), or CSS Grid with `align-items: start`. Mobile is single column with natural heights. Captions sit directly under each image.

Save selected image manifest in brief or `briefs/<slug>/image-manifest.json`.

---

## G2. Local area map and footer

**Local area map (mandatory when location evidence exists):**

- Include a Google Maps embed (lazy-loaded iframe, accessible title, no paid API key) or a polished static map-style area card
- List only verified service areas from evidence. Do not invent areas
- Link to a safe public Google Maps URL when available
- Keep address presentation tasteful. **Do not show full street addresses on the public site by default.** Use city, postcode district or postcode and service areas. Keep full addresses in internal evidence only
- **Map embeds:** query by area/postcode (e.g. Bristol BS5 8JB, UK), not a precise residential street pin, unless the business clearly operates from a public premises
- Map section reinforces trust and locality

**Business footer (mandatory):**

- Footer must feel like a real local business site, not only the WebForTrades credit
- Include: brand, phone, email, social if verified, service areas, quick section links, sourced hours when available
- WebForTrades credit stays smaller at the bottom, linking to `https://webfortradesuk.co.uk`
- No fake company registration, VAT, certifications, guarantees, or memberships

---

## H. Copy rules

Copy must:

- Use real proof (quotes, scores, platform names when verified)
- Use specific review details, not theme buckets only
- Mention third-party proof when verified
- Avoid generic trade filler ("your trusted local plumber")
- Avoid fake owner/founder claims (contact names from reviews only)
- Avoid repeating claims from their official site as if verified
- Avoid overclaiming service areas
- Avoid raw Google service category dumps as prose
- Avoid repeating phrasing from previous WebForTrades sites
- **No em dashes** (use hyphen, comma, or full stop)
- **Evergreen review proof on public sites:** exact counts stay in source evidence and internal notes. Public copy may use plus-style phrasing when the count is sourced (e.g. 45+ Google reviews). Omit small secondary-platform review counts if they date quickly (prefer "100% recommended on Facebook" over "from 10 reviews"). Do not invent or inflate numbers. Open Design and briefs use exact evidence; live site copy should age well.
- **Review usage on public sites:** reviews guide copy but should not dominate every section. One strong quote section and review cards are fine. Avoid naming multiple individual reviewers across many normal business sections. Prefer natural evidence-backed summaries (e.g. customers often mention tidy work, fair pricing and quick response). Do not invent named reviewers, exact jobs, certifications, years trading, guarantees or awards beyond evidence.

Write headings in `section-plan`, not from `copy.ts` defaults.

---

## I. Metadata and OG

- Metadata reads like a real business website
- Do not mention demo, preview, test, sample, concept, speculative, or WebForTrades
- Do not claim official status
- Use location, service, and safe proof only
- OG image = generated hero/site preview, not random project photo
- Preview video and screenshots must be generated before READY_TO_PITCH

---

## J. Review and quality gate

Site must **fail review** if any apply:

| Fail condition |
|----------------|
| Feels like a clone (swap test passes) |
| No site-strategy artifacts |
| No source-evidence artifacts |
| Ignores stronger third-party proof when verified |
| Same section order as recent sites without justification |
| Same headings as recent sites ("Questions before you ring.", etc.) |
| Generic copy (template `copy.ts` patterns unchanged) |
| Weak image strategy (duplicate gallery, invented captions) |
| Incorrect location |
| Unverified deploy URL |
| CSS/style verification fails |
| Missing preview assets |
| Missing pitch-insight |
| `section-plan.generic_plan === true` with template headings |

See [examples/bad-clone-pattern.md](examples/bad-clone-pattern.md).

---

## K. Pitch insight

Every site must produce:

- `briefs/<slug>/pitch-insight.md`
- `briefs/<slug>/pitch-insight.json`

```json
{
  "slug": "",
  "opening_line": "",
  "source_quote": "",
  "source_evidence": "",
  "why_this_angle": "",
  "suggested_whatsapp": "",
  "price_recommendation_gbp": 0,
  "price_tier": "starter|standard|premium",
  "follow_up_replies": []
}
```

Rules:

- Opening line anchored on **one real detail** (review quote, Checkatrade score, named person, specific job type)
- Do not send the pitch (outreach gates apply separately)

See [examples/pitch-insight-example.md](examples/pitch-insight-example.md).

---

## L. Output checklist

For each future site, require before READY_TO_PITCH:

- [ ] `brief.json`
- [ ] `site-strategy.md` / `site-strategy.json`
- [ ] `creative-brief.md` / `creative-brief.json`
- [ ] `source-evidence.md` / `source-evidence.json`
- [ ] `section-plan.md` / `section-plan.json`
- [ ] `pitch-insight.md` / `pitch-insight.json`
- [ ] Selected image manifest
- [ ] Metadata + OG image
- [ ] Mobile + desktop screenshots
- [ ] Preview video (when enabled)
- [ ] Review report
- [ ] Deploy verification report
- [ ] READY_TO_PITCH gate result

Also read before build:

- [ ] This skill (`SKILL.md`)
- [ ] `prompts/site-build-checklist.md` (operational checks)
- [ ] `library/index.md` (anti-clone reference)

---

## Open Design workflow (bespoke sites)

When using Open Design instead of the template builder, follow **`docs/open-design-to-vercel-recipe.md`**. Do not rediscover daemon ports, agents, or porting steps.

| Step | Command / action |
|------|------------------|
| Readiness | `npm run od:status` (read-only) |
| Brief assembly | `npm run od:prepare -- --slug <slug>` (does not start OD) |
| Generation | MCP: `create_project` → copy images → `BRIEF.md` → `start_run` with **cursor-agent** + **design-taste-frontend** |
| Artifact QA | `npm run od:check -- --slug <slug>` |
| Port | `docs/open-design-next-porting-notes.md`, reference `sites/greens-precise-plumbing-heating-ltd/` |
| Deploy | Only after artifact review passes. Use `next/font/google`. Keep Tailwind layers for style gate. |

Rules:

- Do not switch to Claude, Hermes, or Antigravity without approval.
- Do not deploy if artifact review fails.
- Do not outreach after deploy unless explicitly approved.
- Evidence gates still apply before Open Design (`source-evidence`, `lead-validity`, `source-quality`).
- Every site must include a quote form (`#quote`). Primary CTA → quote form, secondary → call. Static forms must not submit or contact the business.
- Mobile sticky CTA after hero scroll; hide near footer. Refine luxury/interiors feel toward premium but grounded trade styling when needed.

---

## Quick workflow

```
1. Read library/index.md + this skill
2. Gather + enrich sources → source-evidence.json
3. Extract story → site-strategy.json
4. Plan sections → section-plan.json (generic_plan: false)
5. Design direction → creative-brief.json (linked to strategy)
6. Build from plan (not default page.tsx order)
7. Review: swap test + clone score + technical QA
8. Write pitch-insight.json
9. Preview assets + deploy verify
10. READY_TO_PITCH gate
```

---

## Examples (read on demand)

- [bad-clone-pattern.md](examples/bad-clone-pattern.md)
- [curletts-principles.md](examples/curletts-principles.md)
- [site-strategy-example.md](examples/site-strategy-example.md)
- [section-plan-example.md](examples/section-plan-example.md)
- [pitch-insight-example.md](examples/pitch-insight-example.md)
- [source-enrichment-checklist.md](examples/source-enrichment-checklist.md)
