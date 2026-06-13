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

---

## Proposal: note two predictable verification false-positives (electrician / typographic-hero build)

**Discovered by:** steel-city-electrics-ltd build (electricians, Sheffield; monochrome-industrial,
typographic hero). Build passed 13/13 checks and deployed VERIFIED; these are tooling-noise notes, not
craft failures.

**Under-specification (low severity):** the skill's "Verification before done" section does not warn that
two checks emit predictable false positives a future builder may waste effort chasing:

1. **`identity_review_names` (warn-only check 12)** flags capitalised sentence-START words inside verbatim
   review quotes as candidate "names" (e.g. "These", "Fantastic", "Had", "Did", "Thanks", "Always"). When
   reviews are pasted verbatim this fires once per such word. It is warn-only and correct to ignore *as
   long as* every attributed reviewer first name is a real customer from the brief (here: Andy, Alina,
   Wakas, Pat). Suggested skill note: "identity_review_names will list sentence-start words from verbatim
   quotes; that is expected noise — only act if an actual *attribution* names someone not in the brief."

2. **Deploy-time live style-verify** warned "Primary CTA has no background and no border radius (may be
   unstyled)" for a `.btn-primary` whose background is a CSS custom property (`background: var(--accent)`)
   with a small radius (`border-radius: 2px`). Playwright `getComputedStyle` at verify confirmed the CTA
   is fully styled (bg `rgb(232,176,33)`, radius `2px`, graphite text). The probe appears to miss
   var()-resolved backgrounds and/or sub-3px radii. Suggested skill note: "the live style-verify CTA
   warning can false-positive on var()-driven backgrounds / small radii; confirm with a computed-style
   read before treating it as real."

**Severity:** low. No rule was wrong; this just saves the next builder from chasing non-issues. Also a
data point that the skill's "typographic hero when no usable photo exists" guidance worked cleanly for an
electrician whose only photos were a logo + burnt-board fault shots.

---

## Proposal: batch-2 findings consolidated by main thread (concurrent-append race recovery)

**Discovered by:** main thread at parallel-batch-2 aggregation. **Process bug (medium):** all 5 batch-2
sub-agents appended to THIS file concurrently with no lock; a Read-then-Write race dropped all but one
append (only steel-city's "two false-positives" section survived in the file). The findings below were
recovered from the sub-agents' return values. **Fix for next batch:** sub-agents must NOT write a shared
file concurrently - either have each sub-agent write its own `PENDING-<slug>.md` and let the main thread
merge, or have only the main thread write PENDING-CHANGES.md from the returned findings. (Same class as the
leads.db concurrency issue, but files have no WAL/serialisation.)

Recovered tooling findings (NONE applied to SKILL.md - for operator review; most are enrich/check tooling,
not site-design craft):
1. **`voice_review` looks in `briefs/<slug>/` for voice.json, but Path-B puts it in `sites/<slug>/`** -
   the check still passed but warned it couldn't find the file. (electrical-solutions-bristol-ltd)
2. **enrich classifies a Linktree (linktr.ee) as `HAS_REAL_SITE_SKIP`** - a link-aggregator is not a real
   website; suggest an aggregator denylist (linktr.ee, beacons, etc.) so these stay SOCIAL_OR_DIRECTORY_ONLY.
   (electrical-solutions-bristol-ltd; gather got it right, only enrich/lead-validity over-flagged.)
3. **live style-verify sometimes picks the hamburger as "primary CTA"** → the "CTA may be unstyled" warning;
   the real CTA was correctly styled (confirmed by computed-style + screenshot). (electrical-solutions + others)
4. **`section_integrity` hard-fails a single legitimate feature image when it carries a `.gallery-*` class**
   (only 1 usable photo existed); worked around by renaming the class to `.feature-work`. Suggest treating a
   single-figure block as a feature image, not a 1-column gallery. (amrock-electrical-ltd)
5. **`identity_review_names` sentence-start false positives** (dup of steel-city's note above) recurred on
   every build with verbatim quotes. Worth promoting to the skill's "Verification before done" notes.

---

## Proposal: batch-2 touch-ups findings (main-thread; NOT applied to SKILL.md)

1. **`og:generate` dev-badge heuristic false-positives on dark-themed sites (medium).** `imageHasBottomLeftDevBadge`
   in `scripts/preview_capture.ts` flags the OG if >55% of the bottom-left 20x20px is near-black (r,g,b<25). A
   genuinely dark site (Amrock, bg `#0B0B0C`) fills that corner at 100% → `og:generate` aborts with a false "dev
   indicator detected" even though there is none. Fix: make the heuristic dark-theme-aware (detect the badge by
   shape/contrast vs its local background, or skip when computed body bg is itself near-black). Surfaced via Amrock;
   worked around with a one-off Playwright+sharp capture (dev-indicator DOM guard passed). Tooling, not site-design.
2. **10-site consistency gap (low).** The dot-marker (Fix A) and Recent-work gate (Fix B) were applied + re-deployed
   for the 5 batch-2 sites only. Kyle, Damo, and the 3 batch-1 painter sites still use two-letter service markers
   (their galleries were not re-checked against the new gate). The batch-2 touch-up FINAL STEPS scoped 5 re-deploys;
   a follow-up pass should apply Fix A/B to the older 5 for full 10-site consistency.
