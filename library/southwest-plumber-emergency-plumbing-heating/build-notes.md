# Build notes - Southwest Plumber - Emergency Plumbing & Heating

- Slug: `southwest-plumber-emergency-plumbing-heating`
- Checklist: read `prompts/site-build-checklist.md` before build
- Creative brief: `briefs/southwest-plumber-emergency-plumbing-heating/creative-brief.md`
- Metadata title: Southwest Plumber - Emergency Plumbing & Heating - Local Bristol Plumber for Repairs, Bathrooms and Heating
- Metadata description: Southwest Plumber - Emergency Plumbing & Heating provides boiler repairs and servicing, emergency callouts and heating and radiators across Bristol. Rated 5★ from 5 Google reviews. Call 07379 475143 to request a free quote.
- OG image strategy: run `npm run preview:site -- --slug southwest-plumber-emergency-plumbing-heating` after build
- Trade style: navy_brass_heating_space_grotesk_inter_full_bleed_hero
- Location validation: OK
- Headline stats: 5★ average rating (Google Places); 5 Google reviews (Google Places)
- Photos used: 2 (not shown as stats)
- Services: 5
- Review snippets: 4 (not used as total count)
- Google review count (sourced): 5
- Google Maps URL: https://maps.google.com/?cid=6125591694827853219
- Service areas inferred: yes
- Build ID: southwest-plumber-emergency-plumbing-heating:20260610-4d7da489
- Static export: `output: 'export'` for Vercel

## Design system
```json
{
  "slug": "southwest-plumber-emergency-plumbing-heating",
  "business_name": "Southwest Plumber - Emergency Plumbing & Heating",
  "direction": "navy_brass_heating_space_grotesk_inter_full_bleed_hero",
  "trade": "custom",
  "fontPairKey": "space-grotesk-inter",
  "layoutFamily": "full-bleed-hero",
  "statsStyle": "band-cards",
  "reviewsStyle": "stacked-quotes",
  "galleryStyle": "standard-grid",
  "ctaStyle": "sharp-block",
  "heroHeadline": "Warm homes. Reliable heating.",
  "heroHeadlineKey": "warm-homes-reliable-heating",
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
cd sites/southwest-plumber-emergency-plumbing-heating
npm run dev
```


TODO: library screenshot - run npm run review then redeploy to copy screenshots/southwest-plumber-emergency-plumbing-heating/desktop/01-hero.png
