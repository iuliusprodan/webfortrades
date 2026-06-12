# Section plan examples

Different businesses should get different sections. Default 10-section stack is a failure mode unless heavily customised.

---

## Example 1: Greens Precise (heating + verified Facebook)

**Evidence:** Swansea location, heating in name, verified FB photos, moderate Google proof, no Checkatrade.

```json
{
  "slug": "greens-precise-plumbing-heating-ltd",
  "sections": [
    {
      "id": "hero-proof-led",
      "priority": 1,
      "heading": "Swansea heating and plumbing, finished tidy.",
      "justification": "Name + review themes support precision; Google rating in hero",
      "background_mood": "warm-light"
    },
    {
      "id": "third-party-proof-strip",
      "priority": 2,
      "heading": "Google reviews and a verified Facebook page",
      "justification": "FB phone match stronger than Google photo diversity",
      "background_mood": "accent"
    },
    {
      "id": "facebook-work-gallery",
      "priority": 3,
      "heading": "Recent heating and plumbing work",
      "justification": "FB photos beat Google clusters",
      "background_mood": "light"
    },
    {
      "id": "what-customers-mention",
      "priority": 4,
      "heading": "What Swansea customers mention most",
      "justification": "Review theme extraction with real quotes",
      "background_mood": "surface"
    },
    {
      "id": "service-explainers",
      "priority": 5,
      "heading": "Boilers, bathrooms, and emergency leaks",
      "justification": "4 focused services from evidence, not 06 generic grid",
      "background_mood": "light"
    },
    {
      "id": "local-coverage",
      "priority": 6,
      "heading": "Based in Swansea",
      "justification": "Location critical after Bristol mismatch risk",
      "background_mood": "accent"
    },
    {
      "id": "contact",
      "priority": 7,
      "heading": "Request a quote from Greens",
      "justification": "Company voice, no fake owner",
      "background_mood": "dark"
    }
  ],
  "omitted_defaults": ["owner-note", "about-van-template", "faq", "stats-band-if-weak"],
  "generic_plan": false
}
```

**Omitted:** "A note from X", "Questions before you ring.", six-service grid.

---

## Example 2: Corvell Ltd (replan - not current deployed site)

**Evidence:** Bristol BS15, review-led services, contact name possible from reviews, no third-party directory found.

```json
{
  "slug": "corvell-ltd",
  "sections": [
    {
      "id": "review-led-hero",
      "priority": 1,
      "heading": "REPLACE_WITH_STRONGEST_REVIEW_HEADLINE",
      "justification": "Lead with specific praise, not Plumbing sorted properly",
      "background_mood": "cool-dark"
    },
    {
      "id": "stats-sourced-only",
      "priority": 2,
      "heading": null,
      "justification": "Google rating + count only if sourced",
      "background_mood": "steel"
    },
    {
      "id": "signature-job-story",
      "priority": 3,
      "heading": "Bathrooms and refits done once, properly",
      "justification": "Services skew bathroom/refit from review evidence",
      "background_mood": "light"
    },
    {
      "id": "gallery-lean",
      "priority": 4,
      "heading": "Recent bathroom and plumbing work in Bristol",
      "justification": "Max 4 photos, 2 per cluster",
      "background_mood": "surface"
    },
    {
      "id": "team-person-block",
      "priority": 5,
      "heading": "REPLACE_IF_CONTACT_NAME_VERIFIED",
      "justification": "Only if reviews name same person 2+ times",
      "background_mood": "warm"
    },
    {
      "id": "reviews-long-form",
      "priority": 6,
      "heading": "What Bristol customers wrote",
      "justification": "Full quotes, not synthetic reviewHeadline buckets",
      "background_mood": "light"
    },
    {
      "id": "contact",
      "priority": 7,
      "heading": "Call Corvell for a clear quote",
      "justification": "Direct, business-named",
      "background_mood": "accent"
    }
  ],
  "omitted_defaults": ["owner-note", "faq", "service-area-wall", "about-one-van"],
  "generic_plan": false
}
```

---

## Example 3: BBR (boiler/heating specialist - what not to repeat)

BBR batch site passed uniqueness via burgundy + Archivo. Better section plan:

```json
{
  "slug": "bbr-plumbing-heating-bristol-bristol-boiler-repairs",
  "sections": [
    { "id": "hero-emergency-callout", "priority": 1, "heading": "Boiler breakdowns across Bristol", "justification": "Name includes Bristol Boiler Repairs" },
    { "id": "how-emergency-works", "priority": 2, "heading": "From no heat to fixed boiler", "justification": "Process section for heating anxiety jobs" },
    { "id": "checkatrade-or-google-proof", "priority": 3, "heading": "Verified customer feedback", "justification": "Search Checkatrade first" },
    { "id": "heating-services-focused", "priority": 4, "heading": "Boilers, radiators, and heating repairs", "justification": "3-4 services not 06 grid" },
    { "id": "gallery", "priority": 5, "heading": "Boiler and heating jobs", "justification": "Caption by job type not area guess" },
    { "id": "contact", "priority": 6, "heading": "Book a boiler repair", "justification": "Heating-specific CTA" }
  ],
  "omitted_defaults": ["owner-note", "about-one-van", "faq"],
  "generic_plan": false
}
```

---

## Example 4: Bristol Plumbing Co (established local)

Hypothetical replan if contact name verified in reviews:

- Hero: local Bristol + years if sourced
- **What customers keep mentioning** (not owner-note template)
- Gallery with neighbourhood-safe captions
- Services: 4 cards max from review-led list
- Reviews with Read all Google reviews
- Contact: "Call Bristol Plumbing Co" not "Pick up the phone, or write."

---

## Anti-pattern: generic_plan true (reject)

```json
{
  "sections": ["hero", "stats", "owner-note", "gallery", "services", "about", "reviews", "service-area", "faq", "contact"],
  "generic_plan": true
}
```

Only acceptable if every section has custom headings and copy documented in the same file. Default is **reject at build gate**.

---

## Batch rule

Two sites in the same batch must not share:

- Section order **and**
- Section heading patterns **and**
- Background mood sequence

Palette/font uniqueness alone is insufficient.
