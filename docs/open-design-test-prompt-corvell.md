# Open Design test prompt - Corvell ltd

**Status:** Draft for future pilot. **Do not run until explicitly approved.**

## Preconditions

- Open Design daemon running: `cd ~/.cursor/open-design && nvm use 24 && pnpm tools-dev run web`
- Cursor MCP server `open-design` loaded
- WebForTrades outreach remains disabled
- No deploy, no outreach, no business contact

## MCP project name

`corvell-ltd-test`

## Suggested skill and plugin

- Skill: `web-prototype` (or `saas-landing` if hero/marketing structure fits better)
- Design system: pick at runtime - prefer warm editorial / bathroom-appropriate, avoid Linear/Stripe dev aesthetics
- Post-generation plugin: `od-nextjs-export` for handoff

## Prompt (paste into `start_run`)

Build a bespoke trade landing page for **Corvell ltd**, a Bristol plumbing team focused on bathroom refits and tiling.

This is NOT a reskin of a generic plumbing template. Do not use the old WebForTrades fixed skeleton or repeated plumbing headings.

### Business angle

Jack and Nick run Corvell ltd from Bristol BS15. Reviews praise tidy finishes, fair pricing, and clear communication on bathroom and tiling work.

### Section plan (use this order)

1. **Review-led hero** - open with Harriet's Google review about finding Corvell on Instagram and Jack's detailed measure-up visit
2. **Stats (sourced only)** - 5★ Google rating, 13 reviews (link to Google Maps)
3. **Signature job story** - bathroom refits and installations in Bristol, grounded in Chris and Stephen reviews
4. **Service explainers** - heading: "What Jack and Nick do best" - bathroom installations, refits, tiling, tap/toilet/shower repairs, general plumbing
5. **Team section** - Jack and Nick at Corvell ltd (names from reviews only, no fake founder bio)
6. **Process section** - how a job works: quote visit, clear pricing, tidy install, handover
7. **Review wall** - 4-5 real Google review excerpts with first names
8. **Local coverage** - Based in Bristol, BS15 (no full street address in visible copy)
9. **Simple contact** - phone-led CTA
10. **Quote form** - name, phone, email, message at #contact

Omit: generic owner note, FAQ block, "One van. One trade.", gallery grid (only 2 verified Google photos available - use sparingly or skip gallery)

### Proof (verified only)

- Google Places: 5.0, 13 reviews - https://maps.google.com/?cid=5902983431411409835
- Phone: 07804 693411
- Do not use unverified Facebook URL
- No Checkatrade or TrustATrader claims

### Review quotes to use

- Harriet: Instagram discovery, Jack measure-up, competitively priced, immaculate tiling job
- Chris: Nick and Jack full bathroom renovation, friendly, professional, exceptional result
- Stephen: competitive August quote, September install to high standard

### Design direction

- Warm, trustworthy, bathroom-focused - not corporate SaaS
- Vary background moods across sections (cream, white, terracotta accent band, dark contact footer)
- Source Serif or similar display + clean sans body acceptable if design system provides
- Subtle professional animations, respect prefers-reduced-motion
- No em dashes anywhere in copy

### Images

- Use verified Google photos only if available in project inputs
- Do not invent project locations or fill a fake gallery
- If photos are weak, stay copy-led and review-led

### Output requirements

- Single-page HTML artifact suitable for Next.js static export
- Semantic accessible HTML
- Mobile-first responsive layout
- Mid-page phone CTAs plus header CTA
- Footer: "Website by WebForTrades" (small, unobtrusive)
- No outreach forms that submit externally - contact form is presentational only for static export

### Explicitly avoid

- Plumbing sorted properly
- Heating you can trust
- 06 services. Done plainly.
- A note from X
- Recent work in X
- Questions before you ring
- Pick up the phone, or write
- One van. One trade.
- Generic template section order from previous WebForTrades builds

## Expected MCP workflow

```bash
# Inside Cursor with open-design MCP connected:
# 1. create_project(name: "corvell-ltd-test")
# 2. start_run(
#      prompt: <this file body>,
#      skill: "web-prototype",
#      designSystem: <chosen id>,
#      agent: <from list_agents - e.g. claude>
#    )
# 3. Poll get_run until succeeded
# 4. get_artifact to pull HTML/CSS bundle
# 5. STOP - do not deploy or outreach until WebForTrades review passes
```

## Success criteria (before WebForTrades adopt)

- Clone review would score below 35 (no template skeleton)
- Business specificity above 70 (Jack/Nick, bathroom focus, Bristol BS15, real reviews)
- Section order matches plan above
- No blacklisted template headings
- Handoff produces workable Next.js page structure via `od-nextjs-export`

## Safety

- No outreach
- No WhatsApp, email, or form submission to the business
- No deploy in this test phase unless separately approved after review
