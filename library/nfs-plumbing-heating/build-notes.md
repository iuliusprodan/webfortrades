# Build notes - NFS Plumbing & Heating

- Slug: `nfs-plumbing-heating`
- Checklist: read `prompts/site-build-checklist.md` before build
- Creative brief: `briefs/nfs-plumbing-heating/creative-brief.md`
- Metadata title: NFS Plumbing & Heating - Local Bristol Plumber for Repairs, Bathrooms and Heating
- Metadata description: NFS Plumbing & Heating provides heating and radiators, boiler repairs and servicing and bathroom installations across Bristol. Rated 5★ from 18 Google reviews. Call 07788 488486 to request a free quote.
- OG image strategy: run `npm run preview:site -- --slug nfs-plumbing-heating` after build
- Trade style: navy_brass_heating_space_grotesk_inter_full_bleed_hero
- Location validation: OK
- Headline stats: 5★ average rating (Google Places); 18 Google reviews (Google Places)
- Photos used: 2 (not shown as stats)
- Services: 6
- Review snippets: 5 (not used as total count)
- Google review count (sourced): 18
- Google Maps URL: https://maps.google.com/?cid=7989564719662751574
- Service areas inferred: yes
- Build ID: nfs-plumbing-heating:20260610-e819d47a
- Static export: `output: 'export'` for Vercel

## Design system
```json
{
  "slug": "nfs-plumbing-heating",
  "business_name": "NFS Plumbing & Heating",
  "direction": "navy_brass_heating_space_grotesk_inter_full_bleed_hero",
  "trade": "custom",
  "fontPairKey": "space-grotesk-inter",
  "layoutFamily": "full-bleed-hero",
  "statsStyle": "band-cards",
  "reviewsStyle": "stacked-quotes",
  "galleryStyle": "standard-grid",
  "ctaStyle": "sharp-block",
  "heroHeadline": "Local plumber. Clear quotes.",
  "heroHeadlineKey": "local-plumber-clear-quotes",
  "fonts": {
    "display": "Space Grotesk",
    "body": "Inter"
  },
  "separator": "/",
  "colors": {
    "accent": "#c9a227",
    "accentForeground": "#1a1208",
    "background": "#f5f0e8",
    "foreground": "#0c2d4a",
    "muted": "#e8e0d4",
    "mutedForeground": "#4a5568",
    "border": "#d4c4a8",
    "surface": "#ffffff"
  }
}
```

## Run locally
```bash
cd sites/nfs-plumbing-heating
npm run dev
```


## Deploy verification (2026-06-11)
- Preferred alias: nfs-plumbing-heating.vercel.app
- Deployment URL: https://nfs-plumbing-heating-kwhyg1gj2-iulius-projects-0cb33a7b.vercel.app
- Verified URL: https://nfs-plumbing-heating.vercel.app
- Alias status: VERIFIED
- Deploy manifest: `/Users/iuliusprodan/.cursor/website/briefs/nfs-plumbing-heating/deploy.json`
- Marker found: yes
- Business name verified: yes
- Phone verified: yes
