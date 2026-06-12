# Build notes - MayerPlumbing

- Slug: `mayerplumbing`
- Checklist: read `prompts/site-build-checklist.md` before build
- Creative brief: `briefs/mayerplumbing/creative-brief.md`
- Metadata title: MayerPlumbing - Local Bristol Plumber for Repairs, Bathrooms and Heating
- Metadata description: MayerPlumbing provides bathroom installations, tap, toilet and shower repairs and plumbing repairs across Bristol. Rated 4.9★ from 13 Google reviews. Call 07914 723864 to request a free quote.
- OG image strategy: run `npm run preview:site -- --slug mayerplumbing` after build
- Trade style: trust_blue_archivo_ibm_plex_split_hero_editorial
- Location validation: OK
- Headline stats: 4.9★ average rating (Google Places); 13 Google reviews (Google Places)
- Photos used: 2 (not shown as stats)
- Services: 6
- Review snippets: 5 (not used as total count)
- Google review count (sourced): 13
- Google Maps URL: https://maps.google.com/?cid=18116576822181614931
- Service areas inferred: yes
- Build ID: mayerplumbing:20260610-6a88b7b8
- Static export: `output: 'export'` for Vercel

## Design system
```json
{
  "slug": "mayerplumbing",
  "business_name": "MayerPlumbing",
  "direction": "trust_blue_archivo_ibm_plex_split_hero_editorial",
  "trade": "custom",
  "fontPairKey": "archivo-ibm-plex",
  "layoutFamily": "split-hero-editorial",
  "statsStyle": "centered-row",
  "reviewsStyle": "two-column-grid",
  "galleryStyle": "compact-row",
  "ctaStyle": "rounded-pill",
  "heroHeadline": "Heating you can trust.",
  "heroHeadlineKey": "heating-you-can-trust",
  "fonts": {
    "display": "Archivo",
    "body": "IBM Plex Sans"
  },
  "separator": "◆",
  "colors": {
    "accent": "#1a8fd1",
    "accentForeground": "#ffffff",
    "background": "#f4f8fc",
    "foreground": "#0c2d4a",
    "muted": "#dbeafe",
    "mutedForeground": "#475569",
    "border": "#bfdbfe",
    "surface": "#ffffff"
  }
}
```

## Run locally
```bash
cd sites/mayerplumbing
npm run dev
```


TODO: library screenshot - run npm run review then redeploy to copy screenshots/mayerplumbing/desktop/01-hero.png
