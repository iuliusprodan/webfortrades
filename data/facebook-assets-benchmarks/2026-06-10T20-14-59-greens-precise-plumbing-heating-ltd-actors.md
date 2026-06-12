# Facebook assets benchmark - greens-precise-plumbing-heating-ltd

- Ran: 2026-06-10T20:14:59.625Z
- Facebook: https://www.facebook.com/GPPlumbingandHeatingLtd (verified=true)

## Comparison

| Source | Max width | Saved | Notes |
|--------|-----------|-------|-------|
| Existing Facebook (before) | 320px | - | brief/images |
| Public HTML fallback | -px | - | 0 probed |
| Meta Graph API | -px | 0 | Meta Graph API: not configured (public HTML fallback only) |
| Apify (best) | -px | 0 | Apify failed: Input buffer has corrupt header: glib: XML parse error: Error domain 1 code 76 on line 83 column 78 of data: Opening and ending tag mismatch: html line 1 and body (fallback to public HTML) |
| Google Places | 1600px | - | 16 in brief |
| Website | -px | - | 0 in brief |
| Manual assets | - | - | not needed |

## Apify actors

| Actor | Meta max | Saved max | >=600 | >=800 | >=1000 | Result |
|-------|----------|-----------|-------|-------|--------|--------|
| apify/facebook-posts-scraper | 526px | -px | 0 | 0 | 0 | APIFY_POSTS_IMAGES_TOO_SMALL |
| apify/facebook-photos-scraper | -px | -px | 0 | 0 | 0 | FBCDN_DOWNLOAD_BLOCKED |
| igview-owner/facebook-page-photos-downloader | -px | -px | 0 | 0 | 0 | FBCDN_DOWNLOAD_BLOCKED |
| simpleapi/facebook-photos-scraper | -px | -px | 0 | 0 | 0 | Apify run start failed HTTP 403 |
| crawlerbros/facebook-photos-scraper | -px | -px | 0 | 0 | 0 | Input buffer has corrupt header: glib: XML parse error: Error domain 1 code 76 on line 83 column 78 of data: Opening and ending tag mismatch: html line 1 and body |

- Beats 320px limit: no
- Gallery ready (>=600px): no
- Hero ready (>=1000px): no
- Facebook after max: 320px

## Recommendation

USE_GOOGLE_PLACES

