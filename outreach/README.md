# Outreach

WhatsApp-first pitch workflow. Drafts live under `outreach/drafts/`. Templates under `outreach/templates/`.

**Default touch 1:** one message with the site link (blank lines above and below the URL). Video attachments are off (`site_design.scroll_video_enabled: false`).

## Commands

```bash
npm run outreach -- --slug <slug>              # draft next touch for one lead
npm run send:outreach-batch -- --preflight --batch-file data/batches/<id>/outreach-batch.json
npm run send:outreach-batch -- --live --batch-file ... --approval-mode per_send
```

## Batch site builds (not outreach)

Multi-site builds use `batch:sites`, not `batch`:

```bash
npm run batch:sites -- --location Bristol --niche plumbers --count 2 --concurrency 2 --no-outreach
npm run batch:sites -- --location Bristol --niche plumbers --count 1 --dry-run-leads --no-outreach
```

`--dry-run-leads` stops after lead selection (no build, deploy, or preview). There is no `--dry-run` flag on `batch:sites`.

## Safety

- `outreach.sending_enabled: false` blocks live sends unless explicitly enabled.
- `outreach.approval_mode: per_send` (default) or `batch` for one-shot approval.
- Successful sends log to `data/outreach-log.jsonl` and `outreach/contacted-leads.md`.

## Legacy video pitch

See `outreach/templates/legacy/legacy-video-shape.md` if video attachments are re-enabled in config.
