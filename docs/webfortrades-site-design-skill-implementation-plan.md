# WebForTrades site design skill - implementation plan

Date: 2026-06-10  
Status: **Plan only. No site rebuilds, deploys, or outreach in this phase.**

Skill location: `skills/webfortrades-site-design/SKILL.md`

---

## Goal

Shift pipeline from **template-led** (copy `page.tsx`, swap tokens) to **business-led** (evidence → strategy → sections → build). Existing deployed sites stay unchanged until explicitly rebuilt under new gates.

---

## Phase overview

| Phase | Focus | Risk |
|-------|-------|------|
| 0 | Skill + docs (this PR) | None - documentation only |
| 1 | Artifact gates + enrichment logging | Blocks builds until artifacts exist |
| 2 | Review clone detection | May fail existing sites on re-review |
| 3 | Composable template refactor | Largest code change |
| 4 | Directory source modules | New gather integrations |
| 5 | Batch + pitch integration | End-to-end test |

---

## Scripts that need to change

### New scripts (create)

| Script | Purpose |
|--------|---------|
| `scripts/site_strategy.ts` | Schema, validate, write site-strategy from brief + enrichment |
| `scripts/source_enrichment.ts` | Orchestrate platform checks, write source-evidence.json |
| `scripts/section_plan.ts` | Validate section-plan, detect generic default stack |
| `scripts/pitch_insight.ts` | Generate pitch-insight from strategy + reviews |
| `scripts/clone_review.ts` | Heading similarity, swap test heuristics, section order diff |
| `scripts/require_site_design_skill.ts` | Read skill + confirm artifacts before build |

### Modify

| Script | Changes |
|--------|---------|
| `scripts/gather.ts` | Call source_enrichment after Google; attempt directory searches; log attempted_sources |
| `scripts/build.ts` | Gate on site-strategy, source-evidence, section-plan; read SKILL.md via checklist; stop copying blind template when plan differs |
| `scripts/creative_brief.ts` | Require site-strategy input; link strategy IDs; reject palette-only briefs |
| `scripts/design_direction.ts` | Accept personality from strategy; ban layout if section-plan conflicts |
| `scripts/business_services.ts` | Service count flexible (3-6) from strategy, not fixed 6 |
| `scripts/site_content.ts` | Pull copy from strategy/section-plan, not only copy.ts |
| `scripts/image_gallery.ts` | Read image strategy from site-strategy |
| `scripts/site_checklist.ts` | Add skill path + artifact checklist |
| `scripts/review.ts` | Import clone_review; fail on blacklisted headings; require pitch-insight |
| `scripts/design_review.ts` | Load actual section order from section-plan.json; compare across batch |
| `scripts/review_batch.ts` | Structural similarity threshold; fail if all sites share heading set |
| `scripts/batch_sites.ts` | Run enrichment + strategy before creative assignment; enforce skill artifacts per job |
| `scripts/pitch_gate.ts` | Require pitch-insight.json for READY_TO_PITCH |

### Template refactor (Phase 3)

| Path | Changes |
|------|---------|
| `scripts/templates/site/app/page.tsx` | Split into composable section components driven by section-plan |
| `scripts/templates/site/lib/copy.ts` | Deprecate hardcoded headings; fallbacks only when plan allows |
| `scripts/templates/site/sections/*` | One file per section type (hero-proof-led, checkatrade-proof, etc.) |

### Do not change in Phase 0-1

- `scripts/deploy.ts` - deploy logic stays
- `scripts/vercel_alias.ts` - verification stays
- Deployed sites under `sites/` for Corvell, Greens, etc.

---

## Review gates that need to change

### review.ts (new failures)

```typescript
// Pseudocode
failIfMissingArtifact("site-strategy.json");
failIfMissingArtifact("source-evidence.json");
failIfMissingArtifact("section-plan.json");
failIfMissingArtifact("pitch-insight.json");
failIfBlacklistedHeadings(pageText, TEMPLATE_HEADING_BLACKLIST);
failIfCloneScoreAboveThreshold(slug, recentSlugs);
failIfGenericPlan(sectionPlan);
```

Blacklist initial set:

- `Questions before you ring.`
- `Pick up the phone, or write.`
- `One van. One trade. A name on a list.`
- `services. Done plainly.`
- `A note from` (unless section-plan explicitly includes owner-note with custom h2)

### design_review.ts

- Read `sectionOrder` from `briefs/<slug>/section-plan.json`, not hardcoded array
- Compare section order + heading keys across batch fingerprints
- Warn on identical background mood sequence

### review_batch.ts

- Add `structural_uniqueness_score` alongside creative_uniqueness_score
- Fail batch if structural score < 70 when count >= 2
- Report which headings collided

### READY_TO_PITCH (pitch_gate.ts)

Add:

- pitch-insight.json exists
- source-evidence.enrichment_complete === true
- review clone check passed

---

## Docs to replace or merge

| Current | Action |
|---------|--------|
| `.cursorrules` design diversity section | Keep ops rules; point to skill for creative rules |
| `prompts/site-build-checklist.md` | Keep CTA/stats/deploy checks; add "read skill first" + artifact list; remove duplicated design prose |
| `README.md` | Add "Site design skill" section with path and workflow |
| `memory.md` | Log skill adoption date and test results |
| Scattered design notes in audit docs | Skill is canonical; audit doc is historical reference |

Do not delete checklist - operational checks remain valid.

---

## How build.ts should load the skill

```typescript
// Phase 1
import { requireSiteDesignArtifacts } from "./require_site_design_skill.js";

export async function build(slug: string) {
  requireSiteBuildChecklist(); // existing
  requireSiteDesignArtifacts(slug); // new - throws if missing strategy/evidence/plan
  
  const sectionPlan = loadSectionPlan(slug);
  if (sectionPlan.generic_plan && !sectionPlan.customised) {
    throw new Error("Generic section plan - see skills/webfortrades-site-design/SKILL.md");
  }
  // ...
}
```

Phase 3: render sections from plan instead of monolithic page.tsx.

---

## How batch_sites.ts should enforce the skill

Per job worker sequence (replace current gather → design → build):

1. gather (Google)
2. source_enrichment (attempt all platforms)
3. site_strategy (agent or script scaffold + agent fill)
4. section_plan (must differ from previous job in batch)
5. design_direction (constrained by strategy personality)
6. creative_brief
7. build
8. preview + review + clone_review
9. pitch_insight
10. deploy (unchanged)

Batch pre-assigns **personality + banned palettes/fonts** from previous jobs, not full page layout. Section plans compared in batch QA.

Add to job JSON:

```json
{
  "artifacts": {
    "site_strategy": true,
    "source_evidence": true,
    "section_plan": true,
    "pitch_insight": true
  }
}
```

---

## How review.ts should score business-specificity

Proposed `business_specificity_score` (0-100):

| Check | Weight |
|-------|--------|
| site-strategy exists | 15 |
| source-evidence complete | 15 |
| section-plan generic_plan false | 20 |
| No blacklisted headings | 20 |
| Third-party proof on page when source exists | 15 |
| Custom h2 count >= 5 | 15 |

Fail review if score < 70 or any hard fail (clone, missing artifacts).

---

## How review_batch.ts should catch clone sites

1. Extract heading set from each deployed site HTML (or section-plan.json)
2. Jaccard similarity on heading normalised keys
3. If similarity > 0.6 between any pair, batch FAIL
4. Report alongside creative_uniqueness_score

Example failure message:

```
Batch FAIL: corvell-ltd and bbr-plumbing share 8/10 section headings (structural similarity 0.82)
```

---

## Source enrichment mandatory

Phase 1:

- `gather.ts` writes `source-evidence.json` with attempted_sources for platforms 1-11
- Manual Facebook URL still supported
- `enrichment_complete: true` only when all attempted

Phase 4 modules:

- `scripts/checkatrade_source.ts`
- `scripts/trustatrader_source.ts`
- `scripts/instagram_source.ts` (public profile only)
- Shared `scripts/directory_search.ts` helper

Each module: search → verify phone → download public assets → log URL.

---

## Testing plan

### Test 1: Corvell (read-only, no rebuild)

```bash
# After clone_review.ts exists
npm run review:clone -- --slug corvell-ltd
```

Expected: **FAIL** on blacklisted headings, missing artifacts, generic structure.

Do not rebuild Corvell. Use output to tune thresholds.

### Test 2: New 2-site batch

```bash
npm run batch:sites -- --location Bristol --niche plumbers --count 2 --concurrency 2 --no-outreach
```

Acceptance:

- Both sites have all artifacts in briefs/
- structural_uniqueness_score >= 70
- Different section orders OR clearly different headings
- Neither site uses full default heading set
- Batch review PASS on both creative and structural scores

### Test 3: Thin evidence lead

Prospect with few photos and no Checkatrade.

Expected: lean section-plan (<= 6 sections), no padded gallery, no FAQ.

---

## How to avoid making current sites worse

1. **Do not rebuild** Corvell, Greens, BBR, Bristol Plumbing Co until Julius approves
2. **Gate new builds only** - artifact checks apply to new builds after Phase 1 merge
3. **Opt-in re-review** - `review:clone` as read-only diagnostic on old sites
4. **Feature flag** - `config.yaml`:

```yaml
site_design:
  skill_enforced: false  # flip true after Test 2 passes
  clone_review_enabled: false
```

5. **Template coexistence** - legacy page.tsx remains until Phase 3; new composable builder behind flag
6. **Library unchanged** - old entries stay as "what not to copy" references

---

## Cursor integration

1. `.cursorrules` updated (Phase 0) - mandate skill read
2. Optional symlink: `.cursor/skills/webfortrades-site-design` → `../skills/webfortrades-site-design`
3. `scripts/site_checklist.ts` logs skill read confirmation in build-notes.md

---

## Outreach safety (unchanged)

Confirm before any future outreach work:

- `outreach.sending_enabled: false`
- `outreach.test_recipient_only: true`

Pitch-insight is draft only until gates lifted.

---

## Suggested implementation order

1. ✅ Skill + examples + audit docs (done)
2. `.cursorrules` update (done in same PR)
3. `require_site_design_skill.ts` + config flag
4. `source_enrichment.ts` scaffold (attempt logging, no new scrapers yet)
5. `clone_review.ts` + review.ts integration
6. `design_review.ts` section order from plan
7. Agent workflow test (manual strategy + plan for one new lead)
8. Composable template (Phase 3)
9. Checkatrade module (Phase 4)
10. Enable `skill_enforced: true` after 2-site batch passes

---

## Success criteria

Julius can open two new Bristol plumber sites and immediately tell which business each belongs to - without reading the logo or business name in the hero.

Technical checks still pass. Creative uniqueness and structural uniqueness both >= 70 in batch QA. Every READY_TO_PITCH site has pitch-insight anchored on a real review detail.
