# WebForTrades website pipeline audit

Date: 2026-06-10  
Scope: Website creation workflow only. No sites rebuilt or deployed as part of this audit.

## Executive summary

The pipeline is strong on **technical QA** (deploy verification, location checks, gallery clustering, creative fingerprint uniqueness) but weak on **business-specific design**. The root cause is architectural: every build copies one monolithic Next.js template with a fixed section order and hardcoded heading patterns. Creative briefs vary palette, fonts, layout family, and hero headline, but not page structure, copy patterns, or evidence-led storytelling. Review passes can score 100/100 creative uniqueness while sites still feel like text-swapped clones.

---

## 1. What does the pipeline currently know?

### House rules and prompts

| Source | What it encodes |
|--------|-----------------|
| `.cursorrules` | Agency identity, approval gates, public-data-only, design diversity, Facebook rules, deploy verification, library logging, batch orchestrator, site-build checklist mandate, outreach safety |
| `prompts/site-build-checklist.md` | CTA pair rules, stats sourcing, reviews, owner/contact naming, services, gallery, metadata, OG, animations, batch diversity, Facebook section |
| `prompts/outreach.md` | WhatsApp/email tone, pitch structure, no price in first message |
| `README.md` | Pipeline stages, npm scripts, batch workflow docs |
| `memory.md` | Run learnings (design directions, subject lines, niches) |

### Scripts and data flow

```
prospect → gather.ts → brief.json + images
         → design_direction.ts + creative_brief.ts → creative-brief.json/md
         → build.ts (copy template → sites/<slug>/) → deploy → preview → review.ts
         → library_sync → library/
```

| Script | Role |
|--------|------|
| `gather.ts` | Google Places primary; optional `--facebook-url`; writes `brief.json`, downloads photos |
| `facebook_source.ts` | Facebook page discovery, phone-match verification, photo/logo download |
| `design_direction.ts` | Palette, font pair, layout family, hero headline with anti-reuse vs recent sites |
| `creative_brief.ts` | Persists creative direction + content strategy summary |
| `business_services.ts` | Derives 6 services from name/reviews |
| `image_gallery.ts` | Clusters near-duplicates, max 2 per cluster, Facebook preference |
| `site_content.ts` | Business name, location labels, contact naming |
| `site_metadata.ts` | Title, description, OG metadata |
| `build.ts` | Copies `scripts/templates/site/` wholesale, injects brief + design |
| `review.ts` | Playwright QA: sections, CTAs, stats, location, captions, style_verify, deploy marker |
| `design_review.ts` | Fingerprint comparison: accent, fonts, layout, hero headline key |
| `review_batch.ts` | Batch uniqueness score, live URL verification |
| `batch_sites.ts` | Parallel gather/build/preview/review/deploy with pre-assigned creative constraints |
| `deploy.ts` / `vercel_alias.ts` | Vercel deploy + alias assignment + content verification |
| `style_verify.ts` | CSS font/colour checks against design-system |
| `preview_site.ts` / `preview_video.ts` | Outreach screenshots and scroll video |

### Template (the actual site generator)

`scripts/templates/site/` is the single source of page structure:

- `app/page.tsx` - fixed section order: hero → stats → owner-note → gallery → services → about → reviews → service-area → FAQ → contact
- `lib/copy.ts` - shared copy patterns: "A note from X", review theme buckets, generic service descriptions, FAQ boilerplate
- Hardcoded headings in page.tsx:
  - `Recent work in ${areaLabel()}.`
  - `${N} services. Done plainly.`
  - `One van. One trade. A name on a list.`
  - `Questions before you ring.`
  - `Pick up the phone, or write.`

### Library and briefs

- `library/index.md` - reference entries with palette/fonts/vibe; 6+ Bristol plumbers with different accents but same structural family
- `briefs/<slug>/` - `brief.json`, `creative-brief.json/md`, `deploy.json`, images, outreach assets
- **Missing outputs:** `site-strategy.md/json`, `source-evidence.md/json`, `pitch-insight.md/json`, `section-plan.md/json`

### Source enrichment today

| Source | Status |
|--------|--------|
| Google Places | Primary, fully integrated |
| Google reviews/photos | Integrated |
| Facebook public page | Module exists (`facebook_source.ts`), optional in gather |
| Instagram | Not integrated |
| Checkatrade | Not integrated |
| TrustATrader | Not integrated |
| MyBuilder | Not integrated |
| Rated People | Not integrated |
| Bark | Not integrated |
| Yell | Not integrated |
| Official website | Not systematically mined |
| Companies House | Not integrated |

---

## 2. What rules already exist?

### Design diversity (scattered across `.cursorrules`, checklist, design_direction)

- Unique palette, font pair, layout family, hero headline per site
- No consecutive batch clones
- Gallery clustering, max 2 per project cluster
- Safe photo captions
- Templates are "references, not skins" (stated but not enforced structurally)
- Facebook verification when Google photos weak

### Technical quality gates

- Location validation (Google address first)
- Deploy URL verification (build marker + business name + phone)
- Style verification (fonts/colours)
- CTA pair consistency
- Stats must be sourced
- Review count from verified source
- READY_TO_PITCH gate (deploy, screenshots, video, no blockers)

### Copy and compliance

- Public data only, source URLs logged
- No em dashes
- No invented contact details
- Contact name from reviews only, not owner claims
- British English, plain tone

---

## 3. Which rules are duplicated or conflicting?

| Topic | Duplication / conflict |
|-------|------------------------|
| Design diversity | `.cursorrules`, `prompts/site-build-checklist.md` section 16, `design_direction.ts`, `design_review.ts`, `batch_sites.ts` constraints |
| Facebook | `.cursorrules`, checklist section 17, `creative_brief.ts`, `gather.ts` |
| CTA rules | Checklist section 1, template `copy.ts`, `review.ts` assertions |
| "Templates are references" vs build reality | Rules say library/templates are references; `build.ts` always `copyDir(TEMPLATE)` - full skin copy |
| Library guidance | "Use as reference, decide divergence" vs batch anti-reuse only checking accent/fonts/headline |
| Hero headline ban | `.cursorrules` bans overused "Plumbing sorted properly"; Corvell batch site still got it (creative brief assigned it; review only checks if *other* sites used it) |
| Publishing | `.cursorrules` says always publish; current task explicitly forbids deploy - task-specific override |

---

## 4. Which rules are too weak?

1. **"Templates are references, not skins"** - no code enforces structural divergence
2. **Creative uniqueness score** - compares accent, fonts, layout family, hero headline key only; `sectionOrder` is hardcoded identical in `design_review.ts`
3. **Content strategy in creative brief** - lists services and gallery notes but does not drive section selection or copy
4. **Review pass criteria** - no check for generic heading patterns, clone copy, or missing third-party proof
5. **Source enrichment** - Google-first; one optional social source; no mandatory enrichment checklist
6. **Business story** - no required narrative artifact before build
7. **Pitch personalisation** - outreach prompts exist but no `pitch-insight` artifact tied to build
8. **Tone field** - creative brief often says "Assured, precise, plain English" for every plumber

---

## 5. Which steps are still template-led instead of business-led?

| Step | Template-led behaviour |
|------|------------------------|
| Build | Copies entire `scripts/templates/site/` unchanged in structure |
| Section order | Always 10 sections in fixed sequence |
| Headings | Hardcoded in page.tsx, only area/name tokens swap |
| Owner note | Always "A note from X" block with 3 generic paragraphs from `copy.ts` |
| Services | Always 6-card grid with regex-based descriptions |
| Reviews | Always same card layout + synthetic reviewHeadline() buckets |
| FAQ | Always same 4 questions |
| Stats | Layout variants exist but same stat band placement |
| Hero | 3 layout families but same proof pattern (rating + review count) |

**Business-led would mean:** sections chosen from evidence, headings written for this business, proof sources surfaced (Checkatrade, named people, specific review quotes), variable background moods, leaner pages when evidence is thin.

---

## 6. Which steps are technical only but should include creative judgement?

| Step | Current | Should include |
|------|---------|----------------|
| `gather.ts` | Fetch Google (+ optional Facebook) | Mandatory multi-source enrichment pass with verification log |
| `creative_brief.ts` | Palette/fonts/headline | Business story, section plan, pitch angle |
| `build.ts` | Template copy + inject | Validate site-strategy exists; refuse generic section plan |
| `review.ts` | DOM/CTA/location/style | Business-specificity score, clone detection, proof coverage |
| `design_review.ts` | Fingerprint diff | Section order diff, heading similarity, copy fingerprint |
| `review_batch.ts` | Uniqueness + URLs | Cross-site structural similarity, shared heading detection |
| Batch QA | 100/100 with different colours | Fail batch if all sites share skeleton |

---

## 7. Why did clone sites still happen despite creative-brief and review files?

1. **Single page skeleton** - creative brief changes skin variables, not anatomy
2. **Fingerprint blind spot** - `design_review.ts` hardcodes identical `sectionOrder` for every site; never compared
3. **Copy centralisation** - all prose patterns live in `copy.ts`; brief only swaps names/areas
4. **Review tests technical compliance** - CTAs, stats sourcing, location, captions pass while site feels generic
5. **Batch constraint scope** - pre-assigns unique palette/fonts/headline but not sections, headings, or story
6. **Library drift** - six Bristol plumbers with different hex codes but same Fraunces/Inter/Syne patterns and same page rhythm
7. **Documented failure** - `outreach/batch-site-run-2026-06-09.md` records first batch as near-clones; fixes addressed colours/location/URLs, not structure

Evidence: batch `2026-06-10_10-33-21` scored **Creative uniqueness: 100/100** for Corvell + BBR while both use the same 10-section template and shared copy patterns.

---

## 8. Why did the Curletts example feel better?

Reference: https://curletts-decorating-liverpool.vercel.app/ (method only, not design to copy)

| Curletts method | Pipeline default |
|-----------------|------------------|
| Hero built around Ryan and Isaac, named people | Generic "Local plumber. Clear quotes." fallback |
| Stats mix Google + Checkatrade + years + Instagram | Google rating/count only |
| Third-party proof in hero strip | No Checkatrade/TrustATrader integration |
| Gallery intro references real jobs and Instagram | "Recent work in {area}" |
| Services titled from what they do well, with review-linked detail | Regex service blurbs |
| About section is a business story, not owner-note template | "A note from X" boilerplate |
| "How it works" section from real process | Not available in template |
| Reviews section cites platform scores in heading | Generic "Reviews" label |
| Full review quotes, named reviewers | Truncated cards + synthetic headlines |
| Section backgrounds and moods vary | Mostly surface/accent alternation |
| Contact addressed to Ryan | "Pick up the phone, or write." |
| Pitch angle obvious (reliability, prep, fair price from reviews) | No pitch-insight artifact |

Curletts reads like it could only belong to that business. The pipeline output reads like Bristol Plumbing Co with different CSS variables.

---

## 9. What is missing from the current build process?

1. **Pre-build evidence mining** across directories and social platforms
2. **`site-strategy.md/json`** - business angle, proof hierarchy, people, risks
3. **`source-evidence.md/json`** - verified URLs, phone-match evidence, manual-review flags
4. **`section-plan.md/json`** - chosen sections with justification
5. **`pitch-insight.md/json`** - personalised opening line from real review detail
6. **Composable page builder** - sections assembled from plan, not one page.tsx
7. **Third-party proof modules** - Checkatrade, TrustATrader, etc.
8. **Business-specificity review gate** - fail clones explicitly
9. **Copy originality check** - compare against recent sites' headings and boilerplate
10. **Lean site mode** - fewer sections when evidence is thin
11. **Skill/playbook as enforced source of truth** - rules exist but are scattered and overridden by template defaults

---

## 10. What should be mandatory before any future site is built?

Checklist for the builder (human or agent):

1. Read `skills/webfortrades-site-design/SKILL.md`
2. Read `library/index.md` and note what not to repeat
3. Complete source enrichment (minimum: Google + directory search attempt log)
4. Write `briefs/<slug>/site-strategy.md` and `.json`
5. Write `briefs/<slug>/source-evidence.md` and `.json`
6. Write justified `section-plan` (not the default 10-section stack unless evidence supports it)
7. Write `creative-brief.md/json` tied to strategy, not palette-only
8. Write `pitch-insight.md/json` before outreach prep
9. Confirm section headings are business-specific, not template defaults
10. Confirm swap test: would another business name fit this page? If yes, stop and replan

**Hard gates (recommended for scripts):**

- `build.ts` refuses if `site-strategy.json` missing or `section_plan.generic === true`
- `review.ts` fails on clone patterns, missing strategy, missing enrichment log
- `review_batch.ts` fails if structural similarity exceeds threshold across batch

---

## Appendix: file inventory reviewed

- `.cursorrules`, `README.md`, `config.yaml`
- `prompts/site-build-checklist.md`, `prompts/outreach.md`
- `scripts/build.ts`, `gather.ts`, `batch_sites.ts`, `design_direction.ts`, `creative_brief.ts`
- `scripts/site_metadata.ts`, `site_content.ts`, `business_services.ts`, `image_gallery.ts`
- `scripts/facebook_source.ts`, `location_validation.ts`, `design_review.ts`
- `scripts/review.ts`, `review_batch.ts`, `deploy.ts`, `vercel_alias.ts`, `style_verify.ts`
- `scripts/preview_site.ts`, `preview_video.ts`
- `scripts/templates/site/` (page.tsx, copy.ts)
- `library/index.md`, briefs for greens/corvell/bristol-plumbing-co
- `data/batches/2026-06-10_10-33-21/batch-report.md`
- `outreach/batch-site-run-2026-06-09.md`
