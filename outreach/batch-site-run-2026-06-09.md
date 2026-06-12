# Batch site run - 2026-06-09 (quality rebuild + alias verification)

Production dry run: 3 plumber sites rebuilt with distinct creative directions. **No outreach sent.**

Machine-readable data: `data/batch-site-run-2026-06-09.json`

## What went wrong first time

The initial batch technically deployed, but all three sites were near-clones of Bristol Plumbing Co:

- Same direction: `solid-warm-editorial`
- Same fonts: Fraunces + Work Sans
- Same cream palette and hero rhythm
- Same headline: "Plumbing sorted properly"
- Greens said **Bristol** everywhere while Google address is **Swansea**
- Gallery captions used supplier names and inferred areas as job locations
- Review passed despite obvious failures
- **JT Plumbing URL was wrong:** `https://jt-plumbing.vercel.app` is someone else's live site (no WebForTrades build marker). The old deploy script assumed `https://<slug>.vercel.app` without alias assignment or content verification.

## Pipeline fixes applied

- Required creative brief: `briefs/<slug>/creative-brief.json` + `.md`
- `scripts/design_direction.ts` - palette, fonts, layout with anti-reuse
- `scripts/image_gallery.ts` - clustering, safe captions
- `scripts/location_validation.ts` - Google address first
- `scripts/review_batch.ts` - batch uniqueness QA + live URL verification
- Hardened `scripts/review.ts` for location, captions, duplication, deploy manifest
- `scripts/vercel_alias.ts` - alias preflight, assignment, post-deploy verification (build marker + business name + phone)
- Hidden build markers: `webfortrades-build-id` and `webfortrades-business-slug` meta tags on every site
- `scripts/pitch_gate.ts` - READY_TO_PITCH gate blocks outreach until deploy verified

**Batch review:** PASS (creative uniqueness 100/100, all URLs verified 2026-06-10)

**Safety:** `sending_enabled=false`, `test_recipient_only=true`. No outreach log updates.

---

## 1. JT Plumbing

| Field | Value |
|-------|-------|
| **Slug** | `jt-plumbing` |
| **Verified URL** | https://jt-plumbing-bs5.vercel.app |
| **Alias status** | VERIFIED |
| **Preferred alias** | `jt-plumbing` (taken by another site) |
| **Build ID** | `jt-plumbing:20260610-f1fb82f0` |
| **Location** | Bristol, BS5 (OK) |
| **Design** | Trust blue, split-hero, compact gallery |
| **Palette** | `#1a8fd1` on `#f4f8fc` |
| **Fonts** | Archivo + IBM Plex Sans |
| **Hero** | Heating you can trust. |
| **Deploy verification** | Marker yes, business yes, phone yes |
| **Review** | PASS |
| **READY_TO_PITCH** | No (preview assets need refresh) |
| **Outreach** | NOT SENT |

Creative brief: `briefs/jt-plumbing/creative-brief.md`  
Deploy manifest: `briefs/jt-plumbing/deploy.json`

Warnings: preferred alias taken; using `jt-plumbing-bs5`; only 2 usable photos after clustering.

---

## 2. NFS Plumbing & Heating

| Field | Value |
|-------|-------|
| **Slug** | `nfs-plumbing-heating` |
| **Verified URL** | https://nfs-plumbing-heating.vercel.app |
| **Alias status** | VERIFIED |
| **Build ID** | `nfs-plumbing-heating:20260610-e819d47a` |
| **Location** | Bristol, BS3 (OK) |
| **Design** | Navy/brass heating, full-bleed hero |
| **Palette** | `#c9a227` on `#f5f0e8` |
| **Fonts** | Space Grotesk + Inter |
| **Hero** | Local plumber. Clear quotes. |
| **Deploy verification** | Marker yes, business yes, phone yes |
| **Review** | PASS |
| **READY_TO_PITCH** | No (preview assets need refresh) |
| **Outreach** | NOT SENT |

Creative brief: `briefs/nfs-plumbing-heating/creative-brief.md`  
Deploy manifest: `briefs/nfs-plumbing-heating/deploy.json`

---

## 3. Greens Precise Plumbing & Heating ltd

| Field | Value |
|-------|-------|
| **Slug** | `greens-precise-plumbing-heating-ltd` |
| **Verified URL** | https://greens-precise-plumbing-heating-ltd.vercel.app |
| **Alias status** | VERIFIED |
| **Build ID** | `greens-precise-plumbing-heating-ltd:20260610-9fc99563` |
| **Location** | Swansea, SA1 (Google address; prospect search was Bristol) |
| **Design** | Forest green, stacked hero, capped same-project gallery |
| **Palette** | `#2d5a3d` on `#f6f8f4` |
| **Fonts** | Fraunces + Inter |
| **Hero** | South Wales plumbing, done properly. |
| **Deploy verification** | Marker yes, business yes, phone yes |
| **Review** | PASS |
| **READY_TO_PITCH** | No (location mismatch needs manual review) |
| **Outreach** | NOT SENT |

Creative brief: `briefs/greens-precise-plumbing-heating-ltd/creative-brief.md`  
Deploy manifest: `briefs/greens-precise-plumbing-heating-ltd/deploy.json`

Warnings: prospect/address region mismatch flagged for manual review; not pitchable until approved.

---

## Commands used

```bash
npm run test:deploy-alias
npm run build:site -- --slug <slug>
npm run deploy -- --slug <slug>
npm run review:batch -- --batch data/batch-site-run-2026-06-09.json
```

Not run: `npm run outreach -- --send`, `npm run send:whatsapp-pitch -- --live`
