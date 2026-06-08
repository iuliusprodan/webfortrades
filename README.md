# Autonomous Web Agency

A local, single-operator pipeline for finding small businesses, building Next.js sites from briefs, QA-reviewing them, deploying, and running email outreach — with human approval gates where you want them.

## Layout

| Path | Purpose |
|------|---------|
| `config.yaml` | Caps, pricing, outreach defaults, approval mode |
| `briefs/<slug>/` | Per-business `brief.json` + `images/` |
| `sites/<slug>/` | One Next.js app per business (created at build stage) |
| `prompts/` | Stage instruction files for the agent |
| `scripts/` | Node/TS utilities (DB helpers, etc.) |
| `screenshots/` | QA captures |
| `leads.db` | SQLite lead pipeline |
| `memory.md` | Agent learnings (append-only over time) |

## Stages

1. **Discover** — Find leads (e.g. Google Places), score them, `insertLead` into `leads.db`.
2. **Gather** — Enrich brief + images under `briefs/<slug>/`, set state `GATHERED`.
3. **Build** — Scaffold/update `sites/<slug>/` from the brief (respect `daily_build_cap`).
4. **Review** — Playwright screenshots → `screenshots/`, state `REVIEWED`.
5. **Deploy** — Vercel deploy, set `site_url`, state `DEPLOYED`.
6. **Pitch** — Email sequence via SMTP/IMAP; honor `approval_mode` and `daily_send_cap`.

## Quick start

```bash
npm install
npm run db:init          # create leads.db schema (if missing)
cp .env.example .env     # fill in API keys and mail credentials
```

Edit `config.yaml` (your name, email, caps). Place stage prompts in `prompts/`. Run each stage with your agent using the matching prompt file and scripts in `scripts/`.
