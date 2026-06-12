# Source extraction benchmark plan

Run benchmarks read-only before batch builds:

```bash
npm run benchmark:sources -- --slug corvell-ltd
npm run benchmark:sources -- --slug greens-precise-plumbing-heating-ltd
npm run benchmark:sources -- --slug bristol-plumbing-co
npm run benchmark:sources -- --all-known
```

Output: `data/source-benchmarks/<timestamp>/benchmark-report.json` and `.md`

Default mode is **read-only**. Use `--write-brief` only when intentionally updating brief artifacts.

---

## Benchmark set

| Slug | Case type | Expected signals |
|------|-----------|------------------|
| `corvell-ltd` | Facebook + hidden real website | Email from FB, corvell.co.uk HAS_REAL_SITE, FB verified, logo from FB or site |
| `greens-precise-plumbing-heating-ltd` | Facebook as Google "website" | FB verified, email domain site check, social-only or broken site pitch |
| `bristol-plumbing-co` | Google-only | No website, Google photos/reviews, no FB unless discovered |
| `jt-plumbing` | Additional trade | Baseline comparison |
| `nfs-plumbing-heating` | Additional trade | Baseline comparison |

Optional future cases (manual URL required):

- Curletts or similar when a public Checkatrade/Yell profile URL is confirmed
- A known Checkatrade-heavy plumber with public listing URL
- A known bad/outdated WordPress trade site (redesign candidate)

---

## Per-case test matrix

For each slug, record:

| Field | Source |
|-------|--------|
| business_name | brief.json |
| phone | brief + Facebook + website crawl |
| email | Facebook + website crawl + brief |
| website | website_discovery + email domain + crawler |
| logo | logo_discovery (FB, schema, favicon, apple-touch) |
| cover_image | Facebook page data |
| photo_count | photo_discovery (Google + FB + website) |
| selected_useful_photos | photo_discovery score >= threshold |
| reviews | brief Google reviews |
| third_party_ratings | future: Checkatrade/Yell |
| services | brief + website crawl + FB hints |
| location | brief address + FB location match |
| source_confidence | source_verification summary |
| lead_validity | lead_validity.ts categories |

---

## Pass criteria (before batch build)

| Check | Required |
|-------|----------|
| `enrichment_complete` | true after `enrich:lead` |
| `lead_validity_status` | not NEEDS_MANUAL_REVIEW unless `--allow-manual-review` |
| HAS_REAL_SITE | must block no-website build |
| Logo | found OR manual review flag if FB/website had logo signals |
| Photos | count recorded; layout recommendation if <= 2 useful photos |
| Facebook | verified OR not_found with search attempted |

---

## Lead validity categories (benchmark expectations)

| Category | Meaning | Corvell | Greens | Bristol |
|----------|---------|---------|--------|---------|
| HAS_REAL_SITE_SKIP | Real site, no pitch | Expected | If domain site found | No |
| SOCIAL_ONLY_READY | FB/social only | No | Expected | Possible |
| NO_WEBSITE_READY | True no-site | No | No | Expected |
| BROKEN_SITE_READY | Broken domain | - | Possible | - |
| BAD_SITE_REDESIGN_CANDIDATE | Outdated site | - | - | - |
| NEEDS_MANUAL_REVIEW | Blocked/unclear | If WAF | If FB block | If thin evidence |

---

## Running the benchmark

```bash
npm run test:source-extraction
npm run benchmark:sources -- --slug corvell-ltd
npm run benchmark:sources -- --slug greens-precise-plumbing-heating-ltd
npm run benchmark:sources -- --slug bristol-plumbing-co
```

Compare reports under `data/source-benchmarks/` over time to measure extraction improvements.

---

## Improvement backlog from first benchmark

1. Facebook logo: upscale CDN URLs, lower min size, retry og:image
2. Facebook photos: paginate public photos tab when Playwright session allows
3. Directory fetchers: Checkatrade, Yell lightweight HTML probe
4. SerpAPI profile discovery (deferred, paid)
5. Website quality scorer: outdated template, mobile, PageSpeed hint (manual)
