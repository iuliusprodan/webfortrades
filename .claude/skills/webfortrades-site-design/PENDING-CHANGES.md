# PENDING skill changes — review before merging into SKILL.md

These are PROPOSALS discovered during runs. They are NOT applied to SKILL.md. The operator reviews
and decides which to merge. Applied/fixed proposals move to "Resolved proposals" at the bottom (history kept).

## Pending

_None currently pending._

---

## Resolved proposals

### 2026-06-13 (evening) — source_quality gmail / verified-secondary mislabel — FIXED in tooling

**Status:** RESOLVED. Fixed in `scripts/source_quality.ts` (commit "fix(source_quality): verified secondary
source overrides gmail email-domain downgrade"). A verified secondary source (Facebook or a directory
listing recorded in `lead_validity.source_confidence_summary.verified_platforms`) now (a) means a free-mail
contact address no longer pushes the "email-domain discovery not completed" blocker, and (b) clamps a
warning-count NEEDS_MANUAL_REVIEW down to PASS_WITH_WARNINGS when there are no hard blockers. Own-domain
email remains a positive signal (can reach PASS) but its absence no longer forces FAIL when another verified
source exists. Unit test: `scripts/source_quality.test.ts`. Verified on the real lead: D.G. Decorating moved
FAIL -> PASS_WITH_WARNINGS; Brian (FAIL, enrichment-incomplete) and AC (PASS_WITH_WARNINGS) unchanged.

*Original note (kept for history):* `scripts/source_quality.ts` returned `FAIL` for D.G. Decorating with
reason "Email present but email-domain website discovery not completed", even though the lead has a verified
high-confidence Facebook page (genuinely multi-source, Google + FB). The email is a gmail address, so there
is no domain to resolve, yet the missing email-domain check drove a FAIL.

### 2026-06-13 (evening) — Batch typographic distinctness — APPLIED to SKILL.md

**Status:** RESOLVED. Applied to SKILL.md "Parallel-batch design-seed allocation" section as the
"body-font + display-category allocation across batches" rule (reserved body-font list: Instrument Sans /
Hanken Grotesk / Mulish; per-seed display-font category; no body-font or display-category repeats within a
batch). Companion palette-family rule added in the same section.

*Original proposal (kept for history):*

**Discovered by:** main thread at aggregation (not by any single sub-agent — each sub-agent only sees
its own site, so none could notice the convergence).

**Problem:** The 3 parallel painter sub-agents were each told to derive a distinct *palette* from a
pre-allocated seed and to avoid Kyle's / Damo's / the library's fonts. They produced 3 distinct
palettes and 3 distinct **display** fonts (Newsreader, Bodoni Moda, Schibsted Grotesk) — but all three
independently chose **Mulish** as the **body** font, and two of three (Brian, AC) chose a **serif**
display. Body-font convergence + display-family clustering is the weakest distinctness dimension of the
batch. Palettes + heroes still carry clear distinctness, so the sites read as different — but "different
fonts" (a hard constraint) was only half-met.

**Why it happened:** the seed pre-allocates a *palette* anchor only; nothing constrains the body font or
the display *category*. Mulish is a popular neutral body grotesque that isn't on any ban list, so three
independent agents all reached for it. Kyle/Damo/library bans don't yet include it.

**Severity:** low. No site fails; this is a quality/distinctness refinement. The three sites are still
visibly distinct on palette + display font + hero + voice.
