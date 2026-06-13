# PENDING skill changes — review before merging into SKILL.md

These are PROPOSALS discovered during runs. They are NOT applied to SKILL.md. The operator reviews
and decides which to merge. Applied proposals move to "Resolved proposals" at the bottom (history kept).

---

## 2026-06-13 — (cross-reference, NOT a site-design skill fix) source_quality mislabels verified-FB-but-gmail leads as FAIL

This is an **enrich/check tooling** observation, logged here only so it isn't lost — it does NOT belong
in SKILL.md. `scripts/source_quality.ts` returned `FAIL` for D.G. Decorating with reason "Email present
but email-domain website discovery not completed", even though the lead has a **verified high-confidence
Facebook page** (genuinely multi-source, Google + FB). The email is a gmail address, so there is no
domain to resolve, yet the missing email-domain check drove a FAIL. Proposal (for the tooling owner, not
this skill): when `facebook_verified` is true, a missing email-domain resolution should not force FAIL;
treat a verified second platform as satisfying multi-source. Surfaced in the run report as an audit
finding.

---

## Resolved proposals

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

**Proposed change (for review):**
1. Add a short "fonts already in use — do not reuse" list to the skill's typography guidance, and keep it
   current: Instrument Sans (Kyle body), Hanken Grotesk (Damo body), **Mulish (×3 this batch)**;
   displays Bricolage Grotesque (Kyle), Oswald (Damo), Newsreader / Bodoni Moda / Schibsted Grotesk (this
   batch).
2. For parallel/batch builds, the pre-allocated design seed should also fix the **body font** and the
   **display category** (e.g. seed A → grotesque display, seed B → serif display, seed C → slab/mono
   display) so the batch spreads across type families, not just palettes.
3. Single-build note: when picking fonts, check the recent worked references' fonts and pick a body face
   not already used by them.

**Severity:** low. No site fails; this is a quality/distinctness refinement. The three sites are still
visibly distinct on palette + display font + hero + voice.
