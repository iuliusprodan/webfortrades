# Pitch insight example

Every site needs a personalised outreach angle **before** READY_TO_PITCH. Do not send from this file - drafts only.

---

## Example: Greens Precise Plumbing & Heating Ltd

### pitch-insight.md

```markdown
# Pitch insight - Greens Precise Plumbing & Heating Ltd

## Opening line
Hi - I was looking at Greens Precise online and noticed customers on Google keep
mentioning tidy finishes on heating jobs. I put together a simple site idea around
that, using your verified Facebook photos.

## Source evidence
- Google reviews: recurring "tidy" / "clean" themes (see brief.json review texts)
- Facebook: phone-verified page https://www.facebook.com/GPPlumbingandHeatingLtd
- Strongest quote: [verbatim from brief - e.g. customer praising neat boiler work]

## Why this angle
"Precise" in the business name matches review language about tidy heating work.
Facebook portfolio is stronger than repetitive Google photos - site leads with that proof.
Swansea locality is non-negotiable (not Bristol).

## Suggested WhatsApp
Hi, Julius here. I build websites for local trades. I had a look at Greens Precise -
customers seem to rate you for tidy heating work. I mocked up a one-page site using
your public photos (no obligation). Happy to send a quick video if useful?

## Price recommendation
£250-£300 (moderate evidence, verified social, regional outside core Bristol batch)

## Follow-up replies
- If "how much?": One-page site from £300, includes mobile-friendly layout and contact form setup.
- If "not interested": No problem - I'll delete the preview. Thanks for your time.
- If "send link": [verified URL from deploy.json]
```

### pitch-insight.json

```json
{
  "slug": "greens-precise-plumbing-heating-ltd",
  "opening_line": "Hi - I noticed Google reviewers keep mentioning tidy finishes on your heating jobs, and your Facebook page shows solid recent work.",
  "source_quote": "REPLACE_VERBATIM_FROM_BRIEF",
  "source_evidence": "Google review themes + Facebook phone-verified page",
  "why_this_angle": "Name 'Precise' aligns with tidy-work praise; FB photos beat Google clusters",
  "suggested_whatsapp": "Hi, Julius here. I build sites for local trades. I looked at Greens Precise - customers rate you for tidy heating work. I mocked up a one-page idea from your public photos. No obligation - want a 30s video?",
  "price_recommendation_gbp": 275,
  "price_tier": "starter",
  "follow_up_replies": [
    { "trigger": "price", "text": "One-page site from £300. Includes mobile layout and quote form." },
    { "trigger": "not interested", "text": "No problem - I'll remove the preview. Cheers." }
  ]
}
```

---

## Example: Corvell Ltd (hypothetical after replan)

```json
{
  "slug": "corvell-ltd",
  "opening_line": "Hi - I read a Bristol review where a customer said you sorted their bathroom refit without the usual mess - that stood out.",
  "source_quote": "REPLACE_FROM_STRONGEST_BATHROOM_REVIEW",
  "source_evidence": "Google review - bathroom/refit theme",
  "why_this_angle": "Reviews skew bathroom work; generic 'plumbing sorted' headline wastes the hook",
  "suggested_whatsapp": "Hi, Julius here. I make websites for Bristol trades. One of your Google reviews mentioned a bathroom refit done properly - I built a quick page around that kind of work. Want to see it?",
  "price_recommendation_gbp": 300,
  "price_tier": "starter",
  "follow_up_replies": []
}
```

**Bad pitch (clone path - do not use):**

> Hi, I built you a website. Here is the link.

No detail, no proof, no personalisation.

---

## Example: BBR Bristol Boiler Repairs

```json
{
  "slug": "bbr-plumbing-heating-bristol-bristol-boiler-repairs",
  "opening_line": "Hi - your business name says boiler repairs first, so I shaped a site around emergency heating callouts rather than a generic plumber page.",
  "source_quote": null,
  "source_evidence": "Business name + service categories from Google",
  "why_this_angle": "Differentiates from other Bristol plumber sites in same batch",
  "suggested_whatsapp": "Hi, Julius here. I build sites for heating firms. I noticed BBR leads with boiler repairs - I mocked up a page focused on that. Want a quick look?",
  "price_recommendation_gbp": 300,
  "price_tier": "starter",
  "follow_up_replies": []
}
```

---

## Curletts-style reference (not a WebForTrades brief)

What good personalisation looks like:

- Opening anchored on **Ryan turning up within the hour** after another decorator let-down (Roy Fleming review)
- Or: **9.96 on Checkatrade with 65 reviews** as trust opener

Pipeline must produce equivalent specificity from gathered evidence.

---

## Rules

1. Opening line must reference **one verifiable detail**
2. Store source quote verbatim when used
3. Do not claim owner relationship unless verified
4. Price tier maps to config.yaml (Starter £300, etc.) with lead-quality adjustment
5. Do not send while `sending_enabled: false`
