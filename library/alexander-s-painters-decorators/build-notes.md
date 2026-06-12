# Alexander's Painters&Decorators - build notes

## Port source
- Open Design artifact: `open-design-artifacts/alexander-s-painters-decorators/`
- Reference: `sites/jt-plumbing/`, `docs/open-design-next-porting-notes.md`
- Skills read: `skills/webfortrades-site-design/SKILL.md`, `prompts/site-build-checklist.md`

## Design
- Fonts: Archivo (display) + IBM Plex Sans (body) via `next/font/google`
- Palette: warm cream / terracotta accent from OD artifact
- Layout: review-led hero, stats strip, themes, masonry gallery, services, featured review, process, review wall, coverage map, contact + quote

## Deploy
- Live URL: https://alexander-s-painters-decorators.vercel.app
- Build ID: `alexander-s-painters-decorators:20260611-od-port`
- OG: none (ogImage null)
- QuoteForm: preview-only (no submission)
- SiteEnhancements: scroll reveal + mobile sticky CTA

## Clone review
- FAIL (score 32) - section order matches default template; manual review before pitch
- READY_TO_PITCH: false (location mismatch + contactability + clone review)


## Deploy verification (2026-06-11)
- Preferred alias: alexander-s-painters-decorators.vercel.app
- Deployment URL: https://alexander-s-painters-decorators-i53snhtkw.vercel.app
- Verified URL: https://alexander-s-painters-decorators.vercel.app
- Alias status: VERIFIED
- Deploy manifest: `/Users/iuliusprodan/.cursor/website/briefs/alexander-s-painters-decorators/deploy.json`
- Marker found: yes
- Business name verified: yes
- Phone verified: yes
## Outreach previews (2026-06-11)
- Preview mode: production static export (no next dev)
- Metadata title: Alexander's Painters&Decorators · Painting and decorating in Bramhall and Stockport
- Metadata description: Alexander's Painters&Decorators. Interior painting, wallpaper removal and room refurbishments in Bramhall, Stockport and surrounding SK7 postcodes. Rated 5 stars on Google. Call 07944 444082.
- OG image strategy: hero-screenshot
- OG public path: /Users/iuliusprodan/.cursor/website/sites/alexander-s-painters-decorators/public/og-image.png
- Hero mobile screenshot: /Users/iuliusprodan/.cursor/website/briefs/alexander-s-painters-decorators/outreach/hero-mobile.png
- OG brief copy: /Users/iuliusprodan/.cursor/website/briefs/alexander-s-painters-decorators/outreach/og-image.png
- Scroll video: not requested


TODO: library screenshot - run npm run review then redeploy to copy screenshots/alexander-s-painters-decorators/desktop/01-hero.png
