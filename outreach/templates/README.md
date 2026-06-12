# Outreach templates

Canonical pitch copy for all channels. Default shape is **one message** with the site link and blank lines above and below the URL.

**Video attachments:** Off by default (`site_design.scroll_video_enabled: false` in config.yaml). Do not reference attachments or hosted clips in touch-1 drafts unless the flag is turned on.

| File | Channel | Touch |
|------|---------|-------|
| `whatsapp-touch-1-with-name.md` | WhatsApp | 1 (named contact) |
| `whatsapp-touch-1-no-name.md` | WhatsApp | 1 (unknown contact) |
| `whatsapp-touch-1-redesign.md` | WhatsApp | 1 (HAS_REAL_SITE / redesign) |
| `whatsapp-bump.md` | WhatsApp | 2, 3 |
| `whatsapp-final.md` | WhatsApp | final |
| `email-touch-1.md` | Email | 1 |
| `email-bump.md` | Email | 2 |
| `email-price-clarity.md` | Email | 3 / price |
| `email-final.md` | Email | final |
| `sms-touch-1.md` | SMS | 1 |

Programmatic builders: `scripts/outreach_message_format.ts`

Lint check: `scripts/checks/outreach_format.test.ts` (`npm run test:outreach-format`)

## Legacy

If video attachments are later enabled in config, use the two-message shapes in `legacy/legacy-video-shape.md`.
