# Build notes - A.M.T Roofing Penarth

## Port source
- Open Design artifact: `open-design-artifacts/a-m-t-roofing-penarth/`
- Ported: 2026-06-11 per `docs/open-design-next-porting-notes.md`
- Marker: `.od-port`

## Design
- Fonts: Syne (display) + DM Sans (body) via `next/font/google`
- Palette: artifact oklch blues (no external font links)
- Layout: review-led hero, stats, proof strip, gallery grid, FAQ accordion, dark contact

## Section IDs (`data-section-id`)
hero, stats, proof, mentions, gallery, services, process, reviews, service-area, faq, contact

## Pre-build checklist
Before `npm run build`, copy assets:

```bash
cp briefs/a-m-t-roofing-penarth/brief.json sites/a-m-t-roofing-penarth/data/brief.json
mkdir -p sites/a-m-t-roofing-penarth/public/assets/images
cp briefs/a-m-t-roofing-penarth/images/*-places.webp sites/a-m-t-roofing-penarth/public/assets/images/
cd sites/a-m-t-roofing-penarth && npm install && npm run build
```

## References
- Library reference: stay-dry-roofing (roofing trade, syne-dm-sans batch direction)
- Divergence: review-quote hero, oklch blue palette, FAQ section, asymmetric gallery grid


## Deploy verification (2026-06-12)
- Preferred alias: a-m-t-roofing-penarth.vercel.app
- Deployment URL: https://a-m-t-roofing-penarth-dpurnfugo-iulius-projects-0cb33a7b.vercel.app
- Verified URL: https://a-m-t-roofing-penarth.vercel.app
- Alias status: VERIFIED
- Deploy manifest: `/Users/iuliusprodan/.cursor/website/briefs/a-m-t-roofing-penarth/deploy.json`
- Marker found: yes
- Business name verified: yes
- Phone verified: yes
