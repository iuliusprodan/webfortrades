# Build notes - Corvell ltd

- Slug: `corvell-ltd`
- Checklist: read `prompts/site-build-checklist.md` before build
- Site design skill: read `skills/webfortrades-site-design/SKILL.md` before build
- Plan-driven build: section plan from `briefs/corvell-ltd/section-plan.json`
- Site design skill enforcement: enforce (skill_enforced=false)
- Artifacts present: source-evidence, site-strategy, section-plan, creative-brief, pitch-insight, brief
- Artifacts missing: none
- Creative brief: `briefs/corvell-ltd/creative-brief.md`
- Metadata title: Corvell ltd - Local Bristol Plumber for Repairs, Bathrooms and Heating
- Metadata description: Corvell ltd provides bathroom installations, tap, toilet and shower repairs and bathroom refits and shower installs across Bristol. Rated 5★ from 13 Google reviews. Call 07804 693411 to request a free quote.
- OG image strategy: run `npm run preview:site -- --slug corvell-ltd` after build
- Trade style: warm_cream_bathroom_manrope_source_serif_stacked_hero_proof
- Location validation: OK
- Headline stats: 5★ average rating (Google Places); 13 Google reviews (Google Places)
- Photos used: 2 (not shown as stats)
- Services: 6
- Review snippets: 5 (not used as total count)
- Google review count (sourced): 13
- Google Maps URL: https://maps.google.com/?cid=5902983431411409835
- Service areas inferred: yes
- Build ID: corvell-ltd:20260610-fffb682b
- Static export: `output: 'export'` for Vercel

## Design system
```json
{
  "slug": "corvell-ltd",
  "business_name": "Corvell ltd",
  "direction": "warm_cream_bathroom_manrope_source_serif_stacked_hero_proof",
  "trade": "custom",
  "fontPairKey": "manrope-source-serif",
  "layoutFamily": "stacked-hero-proof",
  "statsStyle": "inline-strip",
  "reviewsStyle": "single-featured",
  "galleryStyle": "featured-plus-pair",
  "ctaStyle": "outline-band",
  "heroHeadline": "Bathroom refits and tiling, finished properly in Bristol",
  "heroHeadlineKey": "corvell-ltd-plan-hero",
  "fonts": {
    "display": "Source Serif 4",
    "body": "Manrope"
  },
  "separator": "·",
  "colors": {
    "accent": "#b15c38",
    "accentForeground": "#ffffff",
    "background": "#faf4ec",
    "foreground": "#2b2018",
    "muted": "#efe3d4",
    "mutedForeground": "#6b5847",
    "border": "#e0cdb8",
    "surface": "#ffffff"
  }
}
```

## Run locally
```bash
cd sites/corvell-ltd
npm run dev
```


## Skill rebuild (2026-06-10)

- Old clone score: 85 (FAIL) | business specificity: 15
- New clone score: 16 (PASS) | business specificity: 84
- Plan-driven build from `section-plan.json` (not legacy skeleton)
- Preview/outreach assets: intentionally skipped for this run

## Deploy verification (2026-06-10)
- Preferred alias: corvell-ltd.vercel.app
- Deployment URL: https://corvell-llupujo5f-iulius-projects-0cb33a7b.vercel.app
- Verified URL: https://corvell-ltd.vercel.app
- Alias status: VERIFIED
- Deploy manifest: `/Users/iuliusprodan/.cursor/website/briefs/corvell-ltd/deploy.json`
- Marker found: yes
- Business name verified: yes
- Phone verified: yes
