# Apify Facebook tools research

Research date: 2026-06-10. Public content only. No personal Facebook login or cookies in automation.

## Summary

| Priority | Actor | Role |
|----------|-------|------|
| **First choice** | `apify/facebook-posts-scraper` | Post media at up to ~960px via `media.photo_image.uri` |
| Second choice | `apify/facebook-photos-scraper` | Photo-specific, lower usage, sample output often ~206px |
| Page metadata | `apify/facebook-pages-scraper` | Page info, not primary for gallery images |
| Reject for pipeline | Cookie/login-dependent actors | Mark unsuitable |

**WebForTrades pipeline default:** `apify/facebook-posts-scraper` via REST API (`scripts/apify_facebook.ts`).

---

## Actor evaluations

### apify/facebook-posts-scraper (preferred)

| Field | Value |
|-------|-------|
| Actor ID | `apify/facebook-posts-scraper` |
| REST ID | `apify~facebook-posts-scraper` |
| Input | `{ "startUrls": [{ "url": "<page URL>" }], "resultsLimit": 20 }` |
| Page URL | Yes |
| Images | Yes, in `media[].photo_image.uri` with width/height |
| Quality | Example output includes 960x540, 526x526 (beats 320px thumbnails) |
| Pricing | ~$2 / 1,000 posts |
| Free tier | Apify free plan includes monthly credits; 500 posts mentioned in marketing copy |
| Login/cookies | No user cookies required in input schema |
| Maintained | Yes, Apify official, 78k+ total users, 4.56 rating |
| MCP | Yes, add via mcp.apify.com |
| Node API | `POST https://api.apify.com/v2/acts/apify~facebook-posts-scraper/runs` |
| Risk | Medium (third-party scraping, platform ToS). No personal login. |

### apify/facebook-photos-scraper

| Field | Value |
|-------|-------|
| Actor ID | `apify/facebook-photos-scraper` |
| Input | `{ "startUrls": [{ "url": "<page URL>" }], "resultsLimit": 10 }` |
| Page URL | Yes |
| Images | `image` URL field |
| Quality | Sample docs show 206x206 CDN URLs (often thumbnail-sized) |
| Pricing | ~$1.10 / 1,000 photos |
| Login/cookies | Not in default input |
| Maintained | Yes but lower usage (3k users) |
| MCP | Yes |
| Risk | Medium. Fallback if posts scraper fails. |

### apify/facebook-pages-scraper

| Field | Value |
|-------|-------|
| Actor ID | `apify/facebook-pages-scraper` |
| Purpose | Page metadata, categories, likes, intro |
| Images | Cover/profile hints, not full gallery |
| Pricing | Store pricing varies |
| Pipeline use | Secondary metadata only |

### simpleapi/facebook-photos-scraper

| Field | Value |
|-------|-------|
| Actor ID | `simpleapi/facebook-photos-scraper` |
| Notes | Third-party. Verify maintenance and output quality before use. |
| Risk | Higher (non-Apify-maintained) |

### igview-owner/facebook-page-photos-downloader

| Field | Value |
|-------|-------|
| Notes | Community actor. Check for cookie/login requirements before adoption. |
| Risk | High until verified cookie-free |

### crawlerbros/facebook-photos-scraper

| Field | Value |
|-------|-------|
| Notes | Community actor. Evaluate separately if official actors fail. |
| Risk | Medium-high |

---

## Pipeline extraction order

1. **Meta Graph API** if `META_GRAPH_API_TOKEN` configured and permitted
2. **Apify** if `APIFY_TOKEN` configured (`apify/facebook-posts-scraper`, then photos actor if set)
3. **Public HTML/OG** fallback (often ~315-320px)
4. **Manual asset review** if still `LOW_RES_ONLY`

---

## Cost estimate (Greens benchmark, 20 posts)

- Posts scraper: 20 posts × ($2/1000) ≈ **$0.04 USD**
- Plus Apify platform compute (usually small on pay-per-event actors)

Always set `resultsLimit: 20` for benchmarks.

---

## Rules for automation

- Do not use personal Facebook login or cookies
- Do not bypass login walls or private content
- If actor input requires cookies, mark `requires_login: true` and skip in pipeline
- Low-res-only Facebook media must not drive photo-led layouts
- Strong leads with low-res assets: run Apify enrichment or manual asset export

---

## MCP vs direct API

| | MCP | REST API |
|---|-----|----------|
| Where | Cursor agent | `scripts/apify_facebook.ts` |
| Token | `~/.cursor/mcp.json` or OAuth | `.env` `APIFY_TOKEN` |
| Best for | Manual exploration | `enrich:lead`, benchmarks, batch |
| Dataset retrieval | Via MCP tools | Poll run + fetch dataset items |

See `docs/apify-mcp-setup.md` for Cursor setup.

## Greens benchmark (2026-06-10)

| Actor | Meta max | Saved | Failure |
|-------|----------|-------|---------|
| apify/facebook-posts-scraper | 526px | 0 | APIFY_POSTS_IMAGES_TOO_SMALL |
| apify/facebook-photos-scraper | n/a | 0 | FBCDN_DOWNLOAD_BLOCKED |
| igview-owner/facebook-page-photos-downloader | n/a | 0 | FBCDN_DOWNLOAD_BLOCKED |
| simpleapi/facebook-photos-scraper | n/a | 0 | Run start HTTP 403 |
| crawlerbros/facebook-photos-scraper | n/a | 0 | HTML/non-image payload |

Recommendation: **USE_GOOGLE_PLACES** (1600px in brief). Posts scraper remains useful for post text and captions, not gallery images.
