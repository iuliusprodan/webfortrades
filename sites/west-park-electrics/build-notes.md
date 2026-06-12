# Build notes - West Park Electrics

- Slug: `west-park-electrics`
- Checklist: read `prompts/site-build-checklist.md` before build
- Site design skill: read `skills/webfortrades-site-design/SKILL.md` before build
- Plan-driven build: section plan from `briefs/west-park-electrics/section-plan.json`
- Site design skill enforcement: warn (skill_enforced=false)
- Artifacts present: source-evidence, site-strategy, section-plan, pitch-insight, brief
- Artifacts missing: creative-brief
- Creative brief: `briefs/west-park-electrics/creative-brief.md`
- Metadata title: West Park Electrics - Local Leeds Plumber for Repairs, Bathrooms and Heating
- Metadata description: West Park Electrics provides bathroom installations, gas work and bathroom refits and shower installs across Leeds. Rated 5★ from 30 Google reviews. Call 07889 228995 to request a free quote.
- OG image strategy: run `npm run preview:site -- --slug west-park-electrics` after build
- Trade style: charcoal_orange_space_mono_ibm_plex_split_hero_editorial
- Location validation: OK
- Headline stats: 5★ average rating (Google Places); 30 Google reviews (Google Places)
- Photos used: 2 (not shown as stats)
- Services: 3
- Review snippets: 5 (not used as total count)
- Google review count (sourced): 30
- Google Maps URL: https://maps.google.com/?cid=3796732482915553652
- Service areas inferred: yes
- Build ID: west-park-electrics:20260611-2a3a4606
- Static export: `output: 'export'` for Vercel

## Design system
```json
{
  "slug": "west-park-electrics",
  "business_name": "West Park Electrics",
  "direction": "charcoal_orange_space_mono_ibm_plex_split_hero_editorial",
  "trade": "custom",
  "fontPairKey": "space-mono-ibm-plex",
  "layoutFamily": "split-hero-editorial",
  "statsStyle": "centered-row",
  "reviewsStyle": "two-column-grid",
  "galleryStyle": "standard-grid",
  "ctaStyle": "rounded-pill",
  "heroHeadline": "My father was an electrician and he was planning to fit a cooker for my nan, unfortunately",
  "heroHeadlineKey": "west-park-electrics-plan-hero",
  "fonts": {
    "display": "Space Mono",
    "body": "IBM Plex Sans"
  },
  "separator": "◆",
  "colors": {
    "accent": "#e85d04",
    "accentForeground": "#ffffff",
    "background": "#f5f5f4",
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
cd sites/west-park-electrics
npm run dev
```


TODO: library screenshot - run npm run review then redeploy to copy screenshots/west-park-electrics/desktop/01-hero.png


## Deploy verification (2026-06-11)
- Preferred alias: west-park-electrics.vercel.app
- Deployment URL: https://west-park-electrics-n4854xyas-iulius-projects-0cb33a7b.vercel.app
- Verified URL: https://west-park-electrics.vercel.app
- Alias status: VERIFIED
- Deploy manifest: `/Users/iuliusprodan/.cursor/website/briefs/west-park-electrics/deploy.json`
- Marker found: yes
- Business name verified: yes
- Phone verified: yes
## Outreach previews (2026-06-11)
- Preview mode: production static export (no next dev)
- Metadata title: West Park Electrics | Electrician in Leeds
- Metadata description: West Park Electrics. Domestic electrical work in Leeds including lights, sockets, cooker fitting and extractor fans. 5.0 on Google across 30 reviews. Call 07889 228995.
- OG image strategy: hero-screenshot
- OG public path: /Users/iuliusprodan/.cursor/website/sites/west-park-electrics/public/og-image.png
- Hero mobile screenshot: /Users/iuliusprodan/.cursor/website/briefs/west-park-electrics/outreach/hero-mobile.png
- OG brief copy: /Users/iuliusprodan/.cursor/website/briefs/west-park-electrics/outreach/og-image.png
- Scroll video: not requested
