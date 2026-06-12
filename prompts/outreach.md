# Stage 6: Outreach (WhatsApp primary, email backup)

Draft-only by default. Do not send until Julius explicitly enables `outreach.sending_enabled: true` in `config.yaml`.

## Writing rule

Never use em dashes in drafts, logs, notes, or generated copy. Use a normal hyphen, comma, or full stop instead.

## Config flags

| Flag | Purpose |
|------|---------|
| `whatsapp_check_enabled: true` | Allow OpenWA availability checks (independent of sending) |
| `sending_enabled: false` | Block outbound WhatsApp, email, and follow-up sends only |
| `outreach.approval_mode: per_send` | Ask before each lead (default). Use `batch` for one preflight approval then auto-send. |

`sending_enabled=false` does **not** block: plans, drafts, WhatsApp checks, or reply reading/classification.

## Approval modes (`outreach.approval_mode`)

| Mode | Behaviour |
|------|-----------|
| `per_send` (default) | Preflight + draft for each lead. Ask before every send. Safer. |
| `batch` | At preflight: print full table **and** every drafted message pair. Ask once: `Approve all N sends as drafted? (yes / yes-except <list> / no)`. After approval, send sequentially with no further prompts unless a hard stop fires. |

Switch to `batch` only via explicit user instruction in chat or `--approval-mode batch` on the send command. Config default stays `per_send`.

### Batch approval answers

- `yes` — send all leads in the manifest
- `yes-except 3,5` — skip rows 3 and 5 (1-based indices from preflight table)
- `no` — abort; no sends

### Batch timing

- **Between leads:** random 60 to 180 second cooldown
- **Within a WhatsApp lead:** random 3 to 6 seconds between message 1, message 2, and video attachment

### Hard stops (batch mode)

HALT the batch, do not continue, report and wait:

- OpenWA gateway becomes unreachable or session drops
- A send returns a non-transient HTTP 4xx or 5xx
- Recipient hard-bounce, block, or confirmed not on WhatsApp mid-batch
- More than one send failure in the batch
- Safety flags drift (`sending_enabled` or `test_recipient_only` changed externally)

Always reset `sending_enabled` to `false` at end of batch regardless of mode.

## Script entry points

| Command | Purpose |
|---------|---------|
| `npm run outreach` | Build channel plan, draft next touch, print contact naming. No send. |
| `npm run outreach -- --slug <slug>` | Draft for a specific lead. |
| `npm run send:outreach-batch -- --preflight --batch-file <manifest.json>` | Preflight table + all drafts. No send. |
| `npm run send:outreach-batch -- --live --batch-file <manifest.json> --approval-mode batch --approve yes` | Live batch send (non-interactive approval). |
| `npm run followup` | Read and classify inbox replies. Outbound follow-ups blocked until sending is enabled. |
| `npm run openwa:ensure` | Start OpenWA Docker stack if down; wait for API + session ready |

Live WhatsApp sends auto-run `openwa:ensure` first (Docker Desktop + compose in `~/.cursor/openwa`). If session is disconnected, scan QR at http://localhost:2886.

## Channel rules

1. WhatsApp is primary only when a public UK mobile exists (usually `07...`).
2. UK `01`, `02`, and `03` numbers are landline. Do not draft or send WhatsApp to them.
3. Check availability via OpenWA when `whatsapp_check_enabled=true` and env vars are set.
4. If check confirms unavailable, fall back to email. Do not mention WhatsApp in emails.
5. If check fails or env is missing, set `whatsapp_status=unknown`. Do not pretend unavailable.
6. If `whatsapp_status=unknown` and email exists, draft email-only plan with manual review note.
7. If `whatsapp_status=unknown` and no email, mark `NEEDS_MANUAL_CONTACT`.
8. Never send WhatsApp and email on the same touch.
9. On any negative reply (no thanks, wrong number, opt-out), stop outreach. Set `LOST` or `DO_NOT_CONTACT`.

## Contact state naming

| State | Use when |
|-------|----------|
| `NEEDS_MANUAL_CONTACT` | Human decision needed, or outreach blocked but some contact detail exists. |
| `PITCH_BLOCKED` | No usable public phone or email was found. |
| `DO_NOT_CONTACT` | After opt-out, wrong number, negative reply, or manual suppression only. |

## Contact save (before first WhatsApp send)

1. Intended WhatsApp contact name format: `First_Name - Business_Name`
2. If owner first name is unknown: `Business_Name`
3. **OpenWA cannot create or save WhatsApp contacts directly.** The pipeline records the intended name in lead metadata and creates a vCard under `briefs/<slug>/outreach/` for manual import.
4. Store on lead: `contact_name`, `owner_first_name`, `whatsapp_status`, `whatsapp_checked_at`, `phone_type`

## Contacted lead logging (real sends only)

Every **real successful** outreach send must be logged in both:

- `data/outreach-log.jsonl` (machine-readable, one JSON object per line)
- `outreach/contacted-leads.md` (human-readable append log)

Failed or partial sends go to `data/outreach-failures.jsonl`.

Rules:

- Test sends to `MY_OWN_TEST_NUMBER` must **never** be logged as contacted leads.
- Lead state becomes `PITCHED` only after a real successful send.
- Log message body, attachment path, recipient, timestamp, price note (internal), reply status, and follow-up due date.
- Use slug + channel + touch + timestamp (`send_id`) for idempotency. Do not duplicate entries on retry.

Implementation: `scripts/outreach_log.ts`, called from `scripts/send_whatsapp_pitch.ts` after a successful live send.

## Sequence paths

### WhatsApp + email (5 touches)

| Touch | Day | Channel |
|-------|-----|---------|
| 1 | 0 | WhatsApp (demo link) |
| 2 | 3 | Email |
| 3 | 7 | WhatsApp |
| 4 | 12 | Email (price clarity) |
| 5 | 18 | WhatsApp final, or email if WhatsApp unavailable |

### WhatsApp only (4 touches, no email)

| Touch | Day | Channel |
|-------|-----|---------|
| 1 | 0 | WhatsApp |
| 2 | 3 | WhatsApp |
| 3 | 7 | WhatsApp |
| 4 | 18 | WhatsApp final |

Then stop. Keep messages short and polite.

### Email only (3 touches max)

| Touch | Day | Channel |
|-------|-----|---------|
| 1 | 0 | Email |
| 2 | 3 | Email bump if no reply |
| 3 | 12 | Email final with price clarity |

Then stop. Do not send 5 emails to email-only leads.

## Drafting rules

- Draft WhatsApp only if mobile + `whatsapp_status=available`.
- Draft email if email exists, or if WhatsApp is unavailable.
- If `whatsapp_status=unknown`, draft email when possible. Never mention failed WhatsApp checks in emails.
- Do not mention automation, scraping, or Google Places.
- Frame as a quick site built for the business. Avoid overusing "demo" if it sounds throwaway.
- Include the live `site_url`.
- Include opt-out: "If it is not useful, reply no thanks and I will take it down."
- Do not state price in the first WhatsApp touch unless it still feels natural and not pushy. Default: no price in touch 1.
- Prepare a short price reply ready for "how much?" (typically £200 to £300 based on lead quality).
- Attach the preview video (`briefs/<slug>/outreach/site-scroll.mp4`) when pitching on WhatsApp if available.
- Use a verified contact first name only when confidence is high (e.g. review-mentioned `contact_name`). Never call them owner or founder unless `owner_name` is sourced.
- Every real prospect site should have OG image and outreach screenshots after build/review. Video is optional but recommended for WhatsApp.
- Always prepare drafts for approval first. Never send while `sending_enabled=false` or while `test_recipient_only=true` routes to your test number only.

## Suggested pricing (£200 to £300 for first-touch prospects)

| Price | When |
|-------|------|
| £200 | Very small or low-review businesses |
| £250 | Solid local trades, good reviews, simple one-page site, no current website |
| £300 | Stronger businesses, competitive niches, richer content, or more customisation |

Keep price out of WhatsApp touch 1 by default. Use touch 4 or a reply when they ask.

## Templates (touch 1)

**WhatsApp (preferred when contact name is known)**

```
Hi {contact_first_name}, it's Julius from WebForTrades. I put together a quick website for {business_name} and thought I'd send it over in case it's useful.

{site_url}

Happy to change anything on it. If you'd like to keep it, just let me know.
```

Attachment when available: `briefs/<slug>/outreach/site-scroll.mp4`

**WhatsApp (no contact name)**

```
Hi, is this {business_name}?

I'm Julius from WebForTrades. I put together a quick website for {business_name} and thought I'd send it over in case it's useful.

{site_url}

Happy to change anything on it. If you'd like to keep it, just let me know.
```

**Email**

Subject: `Quick demo site for {business_name}`

```
Hi {owner_first_name_or_there},

I'm Julius from WebForTrades.

I built a quick one-page demo site for {business_name} here:
{site_url}

I used the public details I could find and kept it simple: services, reviews, areas covered, and a quote form.

If it is not useful, reply no thanks and I will take it down.

Julius
WebForTrades
```

**Price clarity (email touch 3 or mixed touch 4)**

```
Hi {owner_first_name_or_there},

Just adding a bit more context.

The site is a one-off build, usually £300 to £800 depending on what you want changed. No monthly contract, and you own it.

Demo:
{site_url}

If it is not useful, reply no thanks and I will take it down.

Julius
```

## Implementation map

| File | Role |
|------|------|
| `scripts/outreach/send.ts` | Batch send orchestrator (`send:outreach-batch`) with `per_send` / `batch` approval |
| `scripts/outreach/batch_approval.ts` | One-shot batch approval parsing and prompts |
| `scripts/outreach/hard_stops.ts` | Hard stop classification for batch halts |
| `scripts/outreach/preflight.ts` | Preflight table + draft printing |
| `scripts/outreach/send_one.ts` | Single-lead WhatsApp send from `outreach/drafts/` |
| `scripts/outreach_log.ts` | JSONL + markdown contacted lead logs |
| `scripts/send_whatsapp_pitch.ts` | Live WhatsApp pitch send (`--live`) + logging |
| `scripts/send_whatsapp_test_pitch.ts` | Test send to `MY_OWN_TEST_NUMBER` only (not logged as contacted) |
| `outreach/contacted-leads.md` | Human-readable contacted leads log |
| `data/outreach-log.jsonl` | Machine-readable contacted sends |
| `data/outreach-failures.jsonl` | Failed or partial sends |
| `scripts/outreach_sequence.ts` | Sequence logic, templates, contact naming |
| `scripts/phone_utils.ts` | UK mobile vs landline classification |
| `scripts/whatsapp_gateway.ts` | OpenWA check (enabled separately from send) |
| `scripts/send_email.ts` | Namecheap Private Email SMTP (gated by `sending_enabled`) |
| `scripts/check_replies.ts` | Namecheap Private Email IMAP reply read/classify (always allowed) |
| `scripts/test_email.ts` | SMTP + IMAP smoke test to `contact@webfortradesuk.co.uk` only |
| `config.yaml` | Caps, channels, approval mode |
| `leads.db` | `whatsapp_sends`, contact columns, `whatsapp_status` |

## Caps

- `daily_send_cap: 15` (email sends when sending enabled)
- `whatsapp_daily_cap: 10`
- `min_minutes_between_whatsapp: 3`
