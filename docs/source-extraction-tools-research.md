# Source extraction tools research

Research date: 2026-06-10. Public sources only. No login bypass. No CAPTCHA bypass.

## Summary recommendation

| Priority | Adopt now | Defer | Reject |
|----------|-----------|-------|--------|
| Core | Playwright, sharp, custom html_extract, website_discovery, logo_discovery, photo_discovery, website_crawler | metascraper (partial overlap) | gallery-dl for Facebook, Instagram scrapers with login |
| Search | Manual URL + enrich overrides | SerpAPI / Google CSE (paid, needs approval) | Firecrawl paid tier without approval |
| Directories | HTTP fetch + html_extract for Yell/Checkatrade public pages | Apify actors (paid) | Nextdoor automated scrape |
| Registry | Companies House API (free) | Browserless cloud | TikTok/Pinterest automated |

---

## Tool evaluations

### Playwright (already installed)

| Field | Value |
|-------|-------|
| Extracts | Facebook page text, phones, emails, visible images when not blocked |
| Platforms | Facebook, some directory pages, JS-heavy sites |
| Install | Already in project |
| Reliability | Medium for Facebook (blocks vary), good for general pages |
| Cost | Free local |
| Legal/platform risk | Medium on Facebook - use public pages only, rate limit, mark manual review on block |
| Recommendation | **Adopt now** - keep for Facebook, fallback when fetch-only fails |

### Puppeteer

| Field | Value |
|-------|-------|
| Extracts | Same class as Playwright |
| Platforms | General web |
| Install | Redundant with Playwright |
| Reliability | Similar to Playwright |
| Cost | Free |
| Legal/platform risk | Same as Playwright |
| Recommendation | **Reject** - duplicate engine |

### Cheerio / linkedom / jsdom

| Field | Value |
|-------|-------|
| Extracts | OG tags, link icons, schema.org JSON-LD, img src lists |
| Platforms | Static HTML sites, server-rendered pages |
| Install | Low (optional npm add later) |
| Reliability | High for static HTML, fails on heavy JS |
| Cost | Free |
| Legal/platform risk | Low |
| Recommendation | **Defer** - current regex-based `html_extract.ts` covers MVP; add linkedom if parsing gets fragile |

### metascraper

| Field | Value |
|-------|-------|
| Extracts | OG, Twitter cards, favicons, author, date |
| Platforms | Blogs, marketing sites, some trade sites |
| Install | Medium (multiple sub-packages) |
| Reliability | High for metadata |
| Cost | Free OSS |
| Legal/platform risk | Low |
| Recommendation | **Defer** - `html_extract.ts` + `logo_discovery.ts` cover logo/OG for now |

### sharp (already installed)

| Field | Value |
|-------|-------|
| Extracts | Dimensions, alpha, resize, webp conversion, perceptual thumb hashes |
| Platforms | All image URLs |
| Install | Already in project |
| Reliability | High |
| Cost | Free |
| Recommendation | **Adopt now** |

### exifr

| Field | Value |
|-------|-------|
| Extracts | EXIF metadata from photos |
| Platforms | Downloaded JPEG/WebP |
| Install | Low |
| Reliability | Medium (many web images strip EXIF) |
| Recommendation | **Defer** - low value for trade site photos |

### gallery-dl

| Field | Value |
|-------|-------|
| Extracts | Media from many sites including some social |
| Platforms | Instagram, Facebook (fragile) |
| Install | Python sidecar |
| Reliability | Low for Facebook business pages, breaks often |
| Legal/platform risk | High on social platforms |
| Recommendation | **Reject** for Facebook/Instagram in WebForTrades pipeline |

### yt-dlp

| Field | Value |
|-------|-------|
| Extracts | Video/audio |
| Platforms | YouTube, some embeds |
| Recommendation | **Defer** - only if video proof becomes a product requirement |

### Apify actors

| Field | Value |
|-------|-------|
| Extracts | Google Maps, Facebook, directories (varies by actor) |
| Cost | Paid usage |
| Legal/platform risk | Depends on actor; some violate platform ToS |
| Recommendation | **Defer** - note for scale, needs explicit approval |

### Firecrawl

| Field | Value |
|-------|-------|
| Extracts | Markdown/clean HTML crawl, sitemap |
| Cost | Free tier + paid |
| Recommendation | **Defer** - `website_crawler.ts` covers MVP |

### SerpAPI / Google Custom Search / Bing Web Search

| Field | Value |
|-------|-------|
| Extracts | Search result URLs for discovery (Facebook, Checkatrade, Yell profiles) |
| Cost | Paid / quota limited |
| Reliability | High for discovery, not extraction |
| Recommendation | **Defer** - adopt when automated profile discovery is approved |

### Companies House API

| Field | Value |
|-------|-------|
| Extracts | Company name, registered address, officers |
| Cost | Free with API key |
| Reliability | High for Ltd companies |
| Recommendation | **Adopt later** - good verification, not logo/photo source |

### Facebook public page approaches

| Approach | Reliability | Notes |
|----------|-------------|-------|
| OG meta HTTP fetch | Medium | Good for profile image URL when not blocked |
| Playwright body scrape | Medium | Phones, emails, intro when page loads |
| Share URL resolve | High | Must run before verification |
| gallery-dl / logged scrapers | Low | Reject |

### Instagram public profile

| Field | Value |
|-------|-------|
| Reliability | Low without login |
| Recommendation | **Manual review only** |

### Checkatrade / TrustATrader / Yell

| Field | Value |
|-------|-------|
| Extracts | Reviews, photos, phone, sometimes logo (public listing pages) |
| Reliability | Medium - HTML fetch often works |
| Recommendation | **Adopt later** - add lightweight directory fetcher after benchmark proves value |

### Nextdoor / MyBuilder / Rated People / Bark

| Field | Value |
|-------|-------|
| Reliability | Low-Medium, login or anti-bot on some |
| Recommendation | **Manual review** or deferred HTTP probe |

### Official website crawling (`website_crawler.ts`)

| Field | Value |
|-------|-------|
| Extracts | Phones, emails, services, schema.org, gallery imgs, sitemap URLs |
| Reliability | High for small trade WordPress/Wix sites |
| Recommendation | **Adopt now** |

### schema.org LocalBusiness + OpenGraph (`html_extract.ts`)

| Field | Value |
|-------|-------|
| Extracts | Logo, images, phone, email, address |
| Reliability | High when present |
| Recommendation | **Adopt now** |

### Google Places API (existing gather)

| Field | Value |
|-------|-------|
| Extracts | Reviews, photos, phone, hours, website field (sometimes wrong/social) |
| Reliability | High for core fields, website field unreliable |
| Recommendation | **Keep** - always cross-check website via email domain |

---

## Platform matrix (current pipeline)

| Platform | Searched | Scraped | Logo | Photos | Reviews | Email/website | Blocked/login |
|----------|----------|---------|------|--------|---------|---------------|---------------|
| Google Places | Yes | Yes (API) | Rare | Yes | Yes | Phone, sometimes wrong website | No |
| Facebook | Yes | Partial | Partial | Partial | No | Often | Sometimes |
| Instagram | Registry only | No | Manual | Manual | No | Bio link | Yes |
| Checkatrade | Registry | No | - | - | - | - | Sometimes |
| TrustATrader | Registry | No | - | - | - | - | Sometimes |
| Yell | Registry | No | - | - | - | - | Low |
| Official website | Via discovery | Yes (crawler) | Yes | Yes | Sometimes | Yes | Sometimes WAF |
| Email domain | Yes | Yes | Yes | Yes | - | Yes | WAF possible |
| Companies House | Registry | No | No | No | No | Registered address | No |

---

## Gaps that matter most for better sites

1. **Logo extraction** - Facebook CDN URL sizing, website schema.org + apple-touch-icon fallback
2. **Facebook photos** - public HTML/OG often returns ~315px thumbnails. Optional Meta Graph API (`scripts/facebook_graph.ts`) when token + permissions allow. **Apify fallback** (`scripts/apify_facebook.ts`, `apify/facebook-posts-scraper`) for higher-res post media when `APIFY_TOKEN` is set.
3. **Directory proof** - Checkatrade/Yell not scraped yet
4. **Website quality scoring** - distinguish HAS_REAL_SITE_SKIP vs BAD_SITE_REDESIGN_CANDIDATE
5. **Automated profile discovery** - still manual Facebook URL override

---

## Meta Graph API (Facebook Page photos) - adopted optional path

Research date: 2026-06-10. Official Meta docs: [Graph API Page node](https://developers.facebook.com/docs/graph-api/reference/page/), [Page photos edge](https://developers.facebook.com/docs/graph-api/reference/page/photos/), [Photo node](https://developers.facebook.com/docs/graph-api/reference/photo/).

| Question | Answer |
|----------|--------|
| Endpoint for uploaded photos | `GET /{page-id}/photos?type=uploaded&fields=id,images,link,name,created_time` |
| Full-size variants | Photo `images` field returns multiple `{ width, height, source }` entries; pick largest |
| App access token alone | Usually **not enough** for arbitrary public Page photos you do not administer |
| User access token | Often required with **Page Public Content Access (PPCA)** feature approval |
| Page access token | For Pages you manage/administer only |
| New Page Experience | Same Graph endpoints; some fields require PPCA or appropriate permissions |
| Rate limits | Standard Graph API app-level limits; expect 403/200 permission errors without PPCA |
| Failure modes | `GRAPH_API_PERMISSION_REQUIRED`, invalid token, page ID not resolved, empty uploaded photos |

### Pipeline behaviour (`scripts/facebook_graph.ts`)

1. Verify Facebook page (phone/name/location).
2. If `META_GRAPH_API_TOKEN` is set, try Graph API photos.
3. On success, use highest-res `images` variant (prefer >=1000px wide, reject <600px when alternatives exist).
4. On failure or no token, fall back to public HTML/OG extraction (`scripts/facebook_source.ts`, `scripts/photo_discovery_helpers.ts`).
5. If only thumbnails remain, record `LOW_RES_FACEBOOK_ONLY` and `manual_asset_review_recommended: true` in source evidence.

### Rules

- **Do not use personal logged-in Facebook scraping.**
- **Do not** automate a logged-in browser, bypass login walls, or use private content.
- Low-res Facebook images must **not** drive a photo-led design.
- If a verified business has strong Facebook presence but API is unavailable, mark manual asset review.

### Env (optional)

- `META_GRAPH_API_TOKEN` - app or user token with PPCA as required by Meta
- `META_GRAPH_API_VERSION` - default `v25.0`

### Tests

```bash
npm run test:facebook-graph
npm run benchmark:sources -- --slug <slug>
```

Without a token, tests and benchmarks must not fail; Graph API is reported as not configured and public HTML fallback continues.
