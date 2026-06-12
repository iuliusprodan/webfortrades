# Source enrichment checklist

Complete before `site-strategy.json`. Log every attempt, even failures.

---

## Platforms to check

| # | Platform | URL pattern | Verify with |
|---|----------|-------------|-------------|
| 1 | Google Places | From gather | Place ID, phone, address |
| 2 | Google reviews | Maps listing | Same business name + phone |
| 3 | Google photos | Maps listing | Same listing |
| 4 | Facebook | Search business name + city | **Phone match**, name, location |
| 5 | Instagram | Search handle/name | Bio phone, location, trade keywords |
| 6 | Checkatrade | checkatrade.com search | Phone, name, postcode |
| 7 | TrustATrader | trustatrader.com search | Phone, name |
| 8 | MyBuilder | mybuilder.com search | Phone, profile |
| 9 | Rated People | ratedpeople.com search | Phone, name |
| 10 | Bark | bark.com search | Profile match |
| 11 | Yell | yell.com search | Phone, address |
| 12 | Official website | From Google or search | Phone cross-check |
| 13 | Other directories | Thomson, FreeIndex, etc. | Phone match |
| 14 | Companies House | find-and-update.company-information.service.gov.uk | Name only - factual context |

---

## Verification rules

### Strong match (use freely)

- Phone number matches Google/lead phone (normalised)
- Business name match or clear trading name alias
- Postcode or city matches Google address

### Medium match (use with note)

- Name match but phone not visible
- Phone match but different spelling of business name

### Weak match (manual review)

- Name only, no phone
- Multiple businesses with similar names
- Location far from Google address

### Do not use

- Private or login-walled content
- CAPTCHA-blocked scrape attempts
- Unverified social profiles
- Stock photos from directories

---

## source-evidence.json template

```json
{
  "slug": "example-slug",
  "gathered_at": "2026-06-10T12:00:00Z",
  "attempted_sources": [
    { "platform": "google_places", "status": "found", "url": "" },
    { "platform": "checkatrade", "status": "not_found", "search_query": "Business Name Bristol" },
    { "platform": "facebook", "status": "found", "url": "" },
    { "platform": "instagram", "status": "not_attempted", "reason": "" }
  ],
  "sources": [
    {
      "platform": "google_places",
      "url": "",
      "verified": true,
      "verification_method": "place_id_match",
      "phone_match": true,
      "notes": "Primary source"
    },
    {
      "platform": "facebook",
      "url": "",
      "verified": true,
      "verification_method": "phone_match",
      "phone_match": true,
      "notes": "10 public photos, email visible"
    }
  ],
  "strongest_proof_source": {
    "platform": "google",
    "metric": "4.8 rating, 42 reviews",
    "url": ""
  },
  "manual_review_flags": [],
  "enrichment_complete": true
}
```

`enrichment_complete: true` requires all platforms 1-11 **attempted** (found or not_found), not all found.

---

## Example: Greens Precise

| Platform | Result |
|----------|--------|
| Google Places | Found - Swansea |
| Facebook | Found - phone match 07309 553552 |
| Checkatrade | not_found (log search query) |
| TrustATrader | not_found |
| Instagram | not_found or not_attempted - must log |

Use Facebook photos over Google clusters when verified.

---

## Example: Corvell Ltd

| Platform | Result |
|----------|--------|
| Google Places | Found - Bristol BS15 |
| Facebook | Log attempt |
| Checkatrade | **Must attempt** - may strengthen proof |
| TrustATrader | Must attempt |

If only Google found, `evidence_strength: moderate` in strategy, not strong.

---

## Example: Bristol Plumbing Co

- Higher review count may surface named contacts
- Checkatrade common for established Bristol trades
- Facebook/Instagram may exist - do not skip because Google is rich

---

## Manual override

```bash
npm run gather -- --slug <slug> --facebook-url "https://facebook.com/..."
```

Record override in source-evidence.json with reason.

---

## Public data only

- No login
- No CAPTCHA bypass
- No contacting the business
- Save every URL in brief `source_urls` and source-evidence.json

---

## Gate

**build.ts must refuse if `source-evidence.json` missing or `enrichment_complete !== true`.**

(Not yet implemented - see implementation plan.)
