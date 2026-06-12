# Build notes - JT Plumbing

- Slug: `jt-plumbing`
- Checklist: read `prompts/site-build-checklist.md` before build
- Creative brief: `briefs/jt-plumbing/creative-brief.md`
- Metadata title: JT Plumbing - Local Bristol Plumber for Repairs, Bathrooms and Heating
- Metadata description: JT Plumbing provides boiler repairs and servicing, heating and radiators and bathroom installations across Bristol. Rated 4.9★ from 16 Google reviews. Call 07817 850729 to request a free quote.
- OG image strategy: run `npm run preview:site -- --slug jt-plumbing` after build
- Trade style: slate_plumbing_dm_sans_lora_compact_local
- Location validation: OK
- Headline stats: 4.9★ average rating (Google Places); 16 Google reviews (Google Places)
- Photos used: 2 (not shown as stats)
- Services: 6
- Review snippets: 5 (not used as total count)
- Google review count (sourced): 16
- Google Maps URL: https://maps.google.com/?cid=14280073501182388464
- Service areas inferred: yes
- Build ID: jt-plumbing:20260610-90d7a584
- Static export: `output: 'export'` for Vercel

## Design system
```json
{
  "slug": "jt-plumbing",
  "business_name": "JT Plumbing",
  "direction": "slate_plumbing_dm_sans_lora_compact_local",
  "trade": "custom",
  "fontPairKey": "dm-sans-lora",
  "layoutFamily": "compact-local",
  "statsStyle": "inline-strip",
  "reviewsStyle": "two-column-grid",
  "galleryStyle": "compact-row",
  "ctaStyle": "rounded-pill",
  "heroHeadline": "Pipes and heating, done right.",
  "heroHeadlineKey": "pipes-heating-done-right",
  "fonts": {
    "display": "Lora",
    "body": "DM Sans"
  },
  "separator": "◆",
  "colors": {
    "accent": "#3d5a73",
    "accentForeground": "#ffffff",
    "background": "#f7f9fb",
    "foreground": "#1e293b",
    "muted": "#e2e8f0",
    "mutedForeground": "#64748b",
    "border": "#cbd5e1",
    "surface": "#ffffff"
  }
}
```

## Run locally
```bash
cd sites/jt-plumbing
npm run dev
```


## Deploy verification (2026-06-11)
- Preferred alias: bbr-plumbing-heating-bristol-bristol-boiler-repairs.vercel.app
- Deployment URL: https://bbr-plumbing-heating-bristol-bristol-boiler-repairs-ppdpon0px.vercel.app
- Verified URL: https://bbr-plumbing-heating-bristol-bristol-boiler-repairs.vercel.app
- Alias status: VERIFIED
- Deploy manifest: `/Users/iuliusprodan/.cursor/website/briefs/bbr-plumbing-heating-bristol-bristol-boiler-repairs/deploy.json`
- Marker found: yes
- Business name verified: yes
- Phone verified: yes
