# Build notes - Corvell ltd (skill rebuild)

- Slug: `corvell-ltd`
- Rebuilt: 2026-06-10 (WebForTrades site design skill, plan-driven)
- Checklist: read `prompts/site-build-checklist.md`
- Site design skill: read `skills/webfortrades-site-design/SKILL.md`
- Skill enforcement: `--enforce-site-skill` (config `site_design.skill_enforced` remains false globally)

## Old clone failure (pre-rebuild)

- Clone score: 85/100 (FAIL)
- Business specificity: 15/100
- Issues: fixed section skeleton, repeated template headings, generic copy, missing strategy artifacts

## New site strategy

- Business angle: Jack and Nick team, bathroom/tiling focus, Bristol BS15
- Proof hierarchy: Google 5.0 (13 reviews), then photos
- Mood: approachable, named people, trust-first
- Strongest quote: Harriet on Instagram discovery and Jack's measure-up detail

## Section plan (10 sections, generic_plan: false)

1. review-led-hero
2. stats-sourced-only
3. signature-job-story
4. service-explainers
5. team-person-section
6. process-section
7. review-wall
8. local-coverage
9. simple-contact
10. quote-form

Omitted: owner-note, about-van-template, generic-stats-band, faq, gallery-default (insufficient photos)

## Removed clone patterns

- No "A note from X"
- No "Recent work in X"
- No "06 services. Done plainly."
- No "One van. One trade."
- No "Questions before you ring."
- No "Pick up the phone, or write."
- No "Heating you can trust."
- No "Plumbing sorted properly."

## Design direction

- Palette: warm-cream-bathroom (accent `#b15c38`, background `#faf4ec`)
- Fonts: Source Serif 4 + Manrope
- Layout: stacked-hero-proof
- Hero headline: Bathroom refits and tiling, finished properly in Bristol.
- Image strategy: lean, proof-led (2 Google photos; no fake gallery)

## Third-party proof

- Google Places: verified (5★, 13 reviews)
- Facebook URL in brief: unverified, not used
- Checkatrade / TrustATrader: not found or not attempted

## QA results

| Metric | Before | After |
|--------|--------|-------|
| Clone score | 85 (FAIL) | 16 (PASS) |
| Business specificity | 15 | 84 |
| Standard review | - | PASS (`--skip-preview-assets`) |

## Deploy

- Verified URL: https://corvell-ltd.vercel.app
- Alias status: VERIFIED
- Build marker: corvell-ltd:20260610-fffb682b
- Business name: yes | Phone: yes | CSS/style: verified live

## Outreach / preview assets

- Outreach: NOT SENT
- OG image: intentionally skipped
- Preview screenshots: intentionally skipped
- Preview video: intentionally skipped
- Mobile hero screenshot: intentionally skipped

## Artifacts

- `briefs/corvell-ltd/source-evidence.json`
- `briefs/corvell-ltd/site-strategy.json`
- `briefs/corvell-ltd/section-plan.json`
- `briefs/corvell-ltd/pitch-insight.json`
- `briefs/corvell-ltd/creative-brief.json`
- `briefs/corvell-ltd/clone-review.json`
