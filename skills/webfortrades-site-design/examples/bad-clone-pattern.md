# Bad clone pattern: repeated plumbing layout

This documents why the Bristol plumber batch kept failing creatively while passing technical review.

## What happened

Sites for Bristol Plumbing Co, NFS, JT, Corvell, BBR, and Greens shared:

- Same 10-section order: hero → stats → owner-note → gallery → services → about → reviews → service-area → FAQ → contact
- Same heading skeleton with token swaps only
- Same mid-page CTA phrases from `scripts/templates/site/lib/copy.ts`
- Different hex colours and font pairs (enough to score 100/100 "creative uniqueness")

Documented in `outreach/batch-site-run-2026-06-09.md`: first three sites were near-clones of Bristol Plumbing Co (same `solid-warm-editorial`, Fraunces + Work Sans, "Plumbing sorted properly").

Batch `2026-06-10_10-33-21` fixed palette/headline collision but Corvell and BBR still use the same page skeleton.

## Template headings that signal a clone

If these appear unchanged, the build is template-led:

| Pattern | Location |
|---------|----------|
| `A note from {name}` | owner-note section |
| `Recent work in {area}.` | gallery heading |
| `{06} services. Done plainly.` | services heading |
| `One van. One trade. A name on a list.` | about heading |
| `Questions before you ring.` | FAQ heading |
| `Pick up the phone, or write.` | contact heading |
| `Need this sorted? Get a free quote.` | mid-page CTA |

## Swap test failure examples

### Corvell Ltd

- Hero: "Plumbing sorted properly." (could be any Bristol plumber)
- About: "One van. One trade. A name on a list." (not Corvell-specific)
- No Checkatrade, TrustATrader, or named-person story despite review evidence
- Steel-blue palette differentiates visually, not narratively

### Greens Precise Plumbing & Heating Ltd

- Hero: "South Wales plumbing, done properly." (area swap only)
- Facebook verified with 10 photos, but page still follows default gallery/services rhythm
- Tone in creative brief: "Assured, precise, plain English" (same as Corvell)
- Location mismatch (Swansea vs Bristol prospect region) caught, but structure still generic

### BBR Plumbing & Heating Bristol

- Burgundy palette + Archivo fonts = batch uniqueness pass
- Still uses owner-note, six-service grid, FAQ quartet, identical section labels
- Boiler/heating angle in name not reflected in unique section choices

### JT Plumbing (warning example)

- Wrong deploy URL initially (`jt-plumbing.vercel.app` was someone else's site)
- Illustrates technical vs creative failure: even URL verification did not fix clone layout

## Why review passed anyway

`design_review.ts` compares accent colour, font pair, layout family, hero headline key. It hardcodes identical `sectionOrder` for every fingerprint.

`review.ts` checks CTAs, stats sourcing, location, captions, deploy marker. It does not score business-specificity.

## What should have failed

- Swap test: replace "Corvell" with "BBR" in body copy, page still works
- Missing third-party proof sections when not searched
- No `site-strategy.json` or `pitch-insight.json`
- Headings copied from template without business justification

## Fix direction (not applied to existing sites)

1. Mandatory section-plan before build
2. Blacklist default headings unless rewritten
3. Clone score in review.ts comparing heading set to last N sites
4. Composable sections instead of one `page.tsx`

Do not rebuild these sites as part of the audit. Use them as negative examples only.
