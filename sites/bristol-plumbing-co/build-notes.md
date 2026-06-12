# Build notes - Bristol Plumbing Co.

- Slug: `bristol-plumbing-co`
- Checklist: read `prompts/site-build-checklist.md` before build
- Metadata title: Bristol Plumbing Co. - Local Bristol Plumber for Repairs, Bathrooms and Heating
- Metadata description: Bristol Plumbing Co. provides plumbing repairs, bathroom plumbing and heating and radiator work across Bristol. Rated 5★ from 26 Google reviews. Call 07972 176630 to request a free quote.
- OG image strategy: run `npm run preview:site -- --slug bristol-plumbing-co` after build
- Trade style: solid-warm-editorial
- Headline stats: 5★ average rating (Google Places); 26 Google reviews (Google Places)
- Photos used: 10 (not shown as stats)
- Services: 6
- Review snippets: 5 (not used as total count)
- Google review count (sourced): 26
- Google Maps URL: https://maps.google.com/?cid=4601006227052623654
- Service areas inferred: yes
- Static export: `output: 'export'` for Vercel

## Design system
```json
{
  "slug": "bristol-plumbing-co",
  "business_name": "Bristol Plumbing Co.",
  "direction": "solid-warm-editorial",
  "trade": "warm-heating",
  "fonts": {
    "display": "Fraunces",
    "body": "Work Sans"
  },
  "separator": "◆",
  "colors": {
    "accent": "#4b2500",
    "accentForeground": "#ffffff",
    "background": "#faf8f5",
    "foreground": "#1c1917",
    "muted": "#e7e5e4",
    "mutedForeground": "#57534e",
    "border": "#d6d3d1",
    "surface": "#ffffff"
  }
}
```

## Run locally
```bash
cd sites/bristol-plumbing-co
npm run dev
```

## Outreach previews (2026-06-09)
- Preview mode: production static export (no next dev)
- Metadata title: Bristol Plumbing Co. - Local Bristol Plumber for Repairs, Bathrooms and Heating
- Metadata description: Bristol Plumbing Co. provides plumbing repairs, bathroom plumbing and heating and radiator work across Bristol. Rated 5★ from 26 Google reviews. Call 07972 176630 to request a free quote.
- OG image strategy: hero-screenshot
- OG public path: /Users/iuliusprodan/.cursor/website/sites/bristol-plumbing-co/public/og-image.png
- Hero mobile screenshot: /Users/iuliusprodan/.cursor/website/briefs/bristol-plumbing-co/outreach/hero-mobile.png
- OG brief copy: /Users/iuliusprodan/.cursor/website/briefs/bristol-plumbing-co/outreach/og-image.png
- Scroll video: /Users/iuliusprodan/.cursor/website/briefs/bristol-plumbing-co/outreach/site-scroll.mp4 (16:9, 1280x720, 18.0s, production preview)
