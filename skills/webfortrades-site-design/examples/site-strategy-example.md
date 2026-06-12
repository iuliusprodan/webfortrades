# Site strategy example (Greens Precise Plumbing & Heating Ltd)

Illustrates a strong `site-strategy.json` for a real brief. Use format, not necessarily these exact claims.

---

## site-strategy.md

```markdown
# Site strategy - Greens Precise Plumbing & Heating Ltd

## Business angle
Family-run Swansea heating and plumbing firm with verified Facebook presence and repeat
customer praise for tidy work and clear communication. "Precise" in the name supports a
careful, no-mess positioning - not emergency cowboy plumbing.

## What customers praise
- Tidy finishes and cleaning up after jobs
- Reliable communication
- Fair pricing on heating work
- Local Swansea knowledge

## Named people
- No verified owner name from Google reviews (do not invent)
- Facebook page brand voice is company-first ("we")

## Strongest review quote
(To be pulled verbatim from brief.json reviews at build time - do not paraphrase here.)

## Strongest proof source
- Google Places: rating + review count (primary)
- Facebook: verified page, phone match 07309 553552, 10 public photos, email info@gpplumbingltd.com

## Best photos
- Prefer 2 diverse Facebook photos over 6 similar Google van/interior shots
- Avoid duplicate boiler cupboard angles from same cluster

## Claims to avoid
- Bristol service area (prospect region mismatch - site must say Swansea)
- "Owner" or founder claims without evidence
- Supplier names as job locations in captions

## Pitch hook
Facebook-verified local firm with repeat mentions of tidy heating work - lead with
precision and Swansea locality, not generic "local plumber".

## Personality
practical, family, local

## Evidence strength
moderate (Google + verified Facebook; no Checkatrade found in enrichment log)
```

---

## site-strategy.json

```json
{
  "slug": "greens-precise-plumbing-heating-ltd",
  "business_angle": "Swansea heating and plumbing with precise, tidy work - company voice, verified Facebook portfolio",
  "customer_praise_themes": [
    "tidy finishes",
    "clear communication",
    "fair heating prices",
    "reliable attendance"
  ],
  "named_people": [],
  "distinctive_phrases": [],
  "strongest_review_quote": {
    "text": "REPLACE_WITH_VERBATIM_FROM_BRIEF",
    "author": "REPLACE_FROM_BRIEF",
    "source": "google",
    "url": "REPLACE_GOOGLE_REVIEWS_URL"
  },
  "strongest_proof_source": {
    "platform": "facebook",
    "metric": "phone-verified page, 10 public photos",
    "url": "https://www.facebook.com/GPPlumbingandHeatingLtd"
  },
  "best_photos_rationale": "Facebook photos less clustered than Google Places boiler shots",
  "claims_to_avoid": [
    "Bristol coverage",
    "named owner",
    "supplier names in captions"
  ],
  "pitch_hook_summary": "Verified Swansea firm - tidy heating work, Facebook portfolio stronger than Google clusters",
  "personality": "family",
  "evidence_strength": "moderate"
}
```

---

## Contrast: weak strategy (Corvell-style clone path)

What the pipeline produced without strategy:

```json
{
  "business_angle": "Bristol plumber",
  "personality": "practical",
  "evidence_strength": "moderate"
}
```

That weak strategy would still produce "Plumbing sorted properly." + default sections. Reject.

---

## Contrast: Bristol Plumbing Co

If building Bristol Plumbing Co today, strategy might centre:

- Established Bristol local brand (if reviews mention longevity)
- Specific neighbourhoods from review text
- Contact name from reviews if evidence count >= 2
- Whether Checkatrade or Facebook adds proof beyond Google

Strategy must be written **before** creative brief picks Fraunces + Work Sans again.
