# Build notes - JKL Clifton Plumbers & Drain Cleaning

- Slug: `jkl-clifton-plumbers-drain-cleaning`
- Checklist: read `prompts/site-build-checklist.md` before build
- Creative brief: `briefs/jkl-clifton-plumbers-drain-cleaning/creative-brief.md`
- Metadata title: JKL Clifton Plumbers & Drain Cleaning - Local USA Plumber for Repairs, Bathrooms and Heating
- Metadata description: JKL Clifton Plumbers & Drain Cleaning provides bathroom installations, leak and burst pipe repairs and plumbing repairs across USA. Rated 4.8★ from 20 Google reviews. Call (862) 281-7401 to request a free quote.
- OG image strategy: run `npm run preview:site -- --slug jkl-clifton-plumbers-drain-cleaning` after build
- Trade style: navy_brass_heating_space_grotesk_inter_full_bleed_hero
- Location validation: LOCATION_MISMATCH_NEEDS_REVIEW
- Headline stats: 4.8★ average rating (Google Places); 20 Google reviews (Google Places)
- Photos used: 1 (not shown as stats)
- Services: 5
- Review snippets: 4 (not used as total count)
- Google review count (sourced): 20
- Google Maps URL: https://maps.google.com/?cid=2195138038047501134
- Service areas inferred: yes
- Build ID: jkl-clifton-plumbers-drain-cleaning:20260610-919705df
- Static export: `output: 'export'` for Vercel

## Design system
```json
{
  "slug": "jkl-clifton-plumbers-drain-cleaning",
  "business_name": "JKL Clifton Plumbers & Drain Cleaning",
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
cd sites/jkl-clifton-plumbers-drain-cleaning
npm run dev
```


TODO: library screenshot - run npm run review then redeploy to copy screenshots/jkl-clifton-plumbers-drain-cleaning/desktop/01-hero.png
