# Curletts principles (method, not design to copy)

Reference site: https://curletts-decorating-liverpool.vercel.app/

**Do not copy** Curletts colours, fonts, or layout. Learn the **method** that makes the site feel business-specific.

---

## 1. Builds around a real business story

- Opens with **Ryan and Isaac**, named decorators in Anfield
- About section explains who they are, combined experience, how they work
- Not a generic "A note from the owner" template block

**Pipeline contrast:** `ownerNoteParagraphs()` in `copy.ts` generates the same three paragraphs for every plumber with name/area tokens.

---

## 2. Uses third-party proof like Checkatrade

- Hero stats: Google 5.0, **Checkatrade 9.96/10 (65 reviews)**, 30 years combined
- Review section heading: "5.0 on Google. 9.96 on Checkatrade."
- Proof strip repeats both platforms

**Pipeline contrast:** No Checkatrade module. Stats band usually shows Google rating + review count only.

---

## 3. Chooses sections based on the business

Curletts includes sections that fit decorators:

- Recent work (with Instagram pointer)
- What we do (six strengths, not generic categories)
- About the team
- **How it works** (4-step process)
- Reviews (long quotes)
- Service area
- Contact to Ryan

No filler FAQ. No "One van. One trade." about block.

**Pipeline contrast:** Fixed 10 sections including FAQ and owner-note for every trade.

---

## 4. Changes background colours and section moods

- Hero dark with photo
- Lighter work section
- Warm about block
- Process section with distinct styling
- Reviews on contrasting background

**Pipeline contrast:** Mostly `bg-surface` / `bg-accent/10` alternation on same rhythm.

---

## 5. Uses photos as part of the story

- Gallery intro explains real jobs vs stock
- References specific work (jungle mural, silver damask, dental practice exterior)
- Instagram linked as extended portfolio

**Pipeline contrast:** "Recent work in Bristol." + clustered Google photos with generic captions.

---

## 6. Writes about actual people and work

- Review cards name Amy, Liam, Margi, Sue, Roy
- Quotes mention heritage restoration, PVA fixes, Isaac helping when behind schedule
- Services reference real job types from their portfolio

**Pipeline contrast:** `reviewHeadline()` buckets reviews into generic themes ("Leaves the place spotless").

---

## 7. Creates a personalised pitch line from review detail

Obvious outreach hooks from Curletts content:

- "Ryan turns up when he says he will" (repeated in reviews)
- Checkatrade 9.96 with 65 reviews (strong third-party proof)
- "Let down by one decorator, Ryan was on the phone within the hour" (Roy Fleming review)

**Pipeline contrast:** No `pitch-insight.json`. Outreach drafts written ad hoc without anchored detail.

---

## 8. Does not paste Google data into a fixed layout

Data serves the narrative:

- Services written as strengths, not Places API categories
- Stats chosen for credibility (years, platforms, Instagram job count)
- Location section uses real postcodes and neighbourhood names from work

**Pipeline contrast:** `business_services.ts` derives six services; `page.tsx` renders them in fixed grid with regex descriptions.

---

## Applying principles to plumbers (without copying Curletts skin)

| Curletts method | Plumber adaptation |
|-----------------|-------------------|
| Named team | Named fitter from reviews (verified only) |
| Checkatrade strip | Add if verified profile exists |
| How it works | Emergency callout flow if reviews mention speed |
| Signature job | "Boiler repairs" story if name/reviews centre on heating |
| Lean FAQ | Drop FAQ if reviews already answer pricing/punctuality |
| Proof-led hero | Lead with 47 five-star mentions of "turns up on time" if true |

---

## Quality bar question

Before shipping, ask:

> If I removed the business name from every heading, could I sell this page to a different plumber in the same city?

If yes, apply Curletts method and replan sections.
