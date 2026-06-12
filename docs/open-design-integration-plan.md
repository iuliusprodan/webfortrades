# Open Design integration plan for WebForTrades

Created: 2026-06-10  
Updated: 2026-06-10  
Status: **Cursor CLI generation verified (Corvell test artifact saved)**

## Summary

| Item | Result |
|------|--------|
| Open Design cloned | Yes - `/Users/iuliusprodan/.cursor/open-design` |
| Install success | Yes - Node 24.16.0 + pnpm 10.33.2 |
| App runs | Yes - dev mode via `pnpm tools-dev run web` |
| MCP server | Yes - stdio via `od mcp` |
| Cursor MCP configured | Yes - `~/.cursor/mcp.json` entry `open-design` |
| External API key for MCP | No - MCP proxies to local daemon only |
| Generation agent auth | **cursor-agent** works when Cursor CLI is logged in (Corvell test succeeded) |
| Corvell test artifact | `open-design-artifacts/corvell-ltd/artifact.html` |

## What is Open Design?

Open Design (OD) is a local-first, open-source design workspace. It ships:

- **150+ `DESIGN.md` design systems** (palette, type, layout, voice, anti-patterns)
- **100+ skills** under `skills/` (web prototype, SaaS landing, dashboard, decks, etc.)
- **261 plugins** including `od-nextjs-export`, `od-react-export`, `od-code-migration`
- A **daemon + web UI** that spawns coding agents (Claude, Cursor Agent, Codex, etc.) to generate HTML/CSS/JSX artifacts
- A **stdio MCP server** so external agents (including Cursor) can read projects, pull artifact bundles, and commission generation runs

It is explicitly positioned as an open alternative to Claude Design: brief → skill + design system → streamed artifact → export/handoff.

## Cursor support

Yes. Official support:

- README lists Cursor with `od mcp install cursor`
- Agent adapter for `cursor-agent` CLI (prompt injection via `.cursorrules` in artifact cwd)
- MCP config target: `~/.cursor/mcp.json` under `mcpServers.open-design`

## MCP server

| Property | Value |
|----------|-------|
| Transport | **stdio** |
| Command | `node /Users/iuliusprodan/.cursor/open-design/apps/daemon/dist/cli.js mcp` |
| Daemon dependency | Must be running (dev: `pnpm tools-dev run web`) |
| Discovery | Sidecar IPC via `OD_SIDECAR_IPC_PATH` (auto when started by tools-dev) |
| Data dir | `OD_DATA_DIR=/Users/iuliusprodan/.cursor/open-design/.od` |
| HTTP port | Not used for MCP (daemon HTTP is separate) |

### MCP tools exposed (key subset)

Read: `list_projects`, `get_active_context`, `get_artifact`, `get_project`, `get_file`, `search_files`, `list_files`, `list_skills`, `list_plugins`, `list_agents`, `get_run`

Write/generation: `create_project`, `create_artifact`, `write_file`, `delete_file`, `start_run`, `cancel_run`

Resources: `od://design-systems/<id>/DESIGN.md`, `od://skills/<id>/SKILL.md`

### Verified locally

- `initialize` succeeds (server `open-design` v0.2.0)
- Daemon health: `GET /api/health` → ok
- Design systems API returns 152 systems
- Skills API returns 157 skills
- `od mcp install cursor` merged into `~/.cursor/mcp.json` without removing existing servers

**Cursor reload required:** restart MCP servers or reload Cursor window to pick up `open-design`.

## Commands to start Open Design

### Dev (from source, recommended for integration work)

```bash
cd /Users/iuliusprodan/.cursor/open-design
source ~/.nvm/nvm.sh && nvm use 24
corepack enable
pnpm install   # first time only
pnpm tools-dev run web
```

Prints ephemeral ports, e.g.:

- Web: `http://127.0.0.1:64617/`
- Daemon: `http://127.0.0.1:64616/`

Production-style single port (Docker or packaged): `http://localhost:7456`

### MCP install / reinstall for Cursor

```bash
cd /Users/iuliusprodan/.cursor/open-design
source ~/.nvm/nvm.sh && nvm use 24
./apps/daemon/bin/od.mjs mcp install cursor
# dry run: add --print --json
# remove: add --uninstall
```

### MCP server (manual, if not using Cursor auto-spawn)

```bash
OD_DATA_DIR=/Users/iuliusprodan/.cursor/open-design/.od \
OD_SIDECAR_IPC_PATH=/tmp/open-design/ipc/default/daemon.sock \
node /Users/iuliusprodan/.cursor/open-design/apps/daemon/dist/cli.js mcp
```

## Cursor MCP config

**Path:** `/Users/iuliusprodan/.cursor/mcp.json`

Installed entry (secrets omitted from Magic MCP env in docs - see live file):

```json
{
  "mcpServers": {
    "open-design": {
      "command": "/Users/iuliusprodan/.nvm/versions/node/v24.16.0/bin/node",
      "args": [
        "/Users/iuliusprodan/.cursor/open-design/apps/daemon/dist/cli.js",
        "mcp"
      ],
      "type": "stdio",
      "env": {
        "OD_DATA_DIR": "/Users/iuliusprodan/.cursor/open-design/.od",
        "OD_SIDECAR_IPC_PATH": "/tmp/open-design/ipc/default/daemon.sock"
      }
    }
  }
}
```

If Open Design is started with a fixed daemon port instead of tools-dev sidecar:

```json
"args": [
  "/Users/iuliusprodan/.cursor/open-design/apps/daemon/dist/cli.js",
  "mcp",
  "--daemon-url",
  "http://127.0.0.1:7456"
]
```

## What Open Design can output

| Format | Use for WebForTrades |
|--------|----------------------|
| Single-page **HTML** (inlined CSS) | Fast prototype, reference layout |
| **HTML + CSS + assets** bundle via `get_artifact` | Primary handoff input |
| **React / Next.js export** via `od-nextjs-export` / `od-react-export` plugins | Target for `sites/<slug>/` |
| PDF / PPTX / MP4 | Not needed for prospect sites |
| `DESIGN.md` tokens | Brand contract for variation control |

Artifacts are real CSS/fonts/components, not canvas mocks. The `get_artifact` tool bundles entry HTML plus referenced siblings (CSS, JSX imports, images) up to depth 3.

## Recommended architecture

### A. WebForTrades keeps (orchestration + trust)

- Prospecting and lead dedupe (`leads.db`)
- Source evidence gathering and verification (`site:evidence`, `source-evidence.json`)
- Contactability gates and outreach safety (`sending_enabled`, `test_recipient_only`)
- Site strategy, section plan, pitch insight (`site:strategy`, `site:sections`, `site:pitch`)
- Clone review and business specificity scoring (`review:clone`)
- Deploy, alias verification, logging
- Outreach gating and contacted-leads audit trail

### B. Open Design handles (visual design engine)

- Design system selection from 150+ `DESIGN.md` catalogs or custom trade-specific system
- Layout generation and component structure via skills (`web-prototype`, `saas-landing`, etc.)
- Page composition and responsive polish inside OD Studio preview
- Creative variation across palette, type, hero composition, section rhythm
- Optional `od-nextjs-export` handoff into App Router components

### C. Cursor bridges them

1. WebForTrades `site:prepare` produces evidence + strategy + section plan (already implemented).
2. Cursor maps section plan + evidence into an **Open Design brief** (see `open-design-webfortrades-brief-format.md`).
3. Cursor calls OD MCP: `create_project` → `start_run` with skill + design system + brief.
4. Poll `get_run` until succeeded; pull bundle with `get_artifact`.
5. Adapt HTML/React output into `sites/<slug>/` Next.js static export template.
6. Run WebForTrades `review:clone`, `review`, `deploy` unchanged.

### What to replace vs keep in current builder

| Current WebForTrades | Recommendation |
|---------------------|----------------|
| `PlanPage.tsx` / fixed template skeleton | **Replace** visual layout generation with OD output |
| `design_direction.ts` palette/font picking | **Hybrid** - OD picks design system; WebForTrades constrains batch uniqueness |
| `site-strategy`, `section-plan`, `source-evidence` | **Keep** - these are business-trust inputs OD does not own |
| `build.ts` artifact gates | **Keep** - require OD project id + artifact hash in build-notes |
| `creative-brief.json` | **Evolve** - becomes OD brief + chosen `DESIGN.md` id |
| Gallery/image pipeline | **Keep** - verified photos stay WebForTrades-controlled; pass paths to OD |

## Risks and limitations

1. **Node 24 required** - default shell was Node 20; OD enforces `engines.node: ~24`.
2. **Daemon must be running** - MCP tools fail clearly if daemon is down. tools-dev sidecar IPC only works while dev server is up.
3. **Generation needs an agent** - this machine has `claude`, `hermes`, `antigravity` available; `cursor-agent` not on PATH. `start_run` requires authenticated agent or OD AMR (0.9.0 built-in router with sign-in).
4. **Run time** - OD docs warn 5-30 minutes per generation; batch builds need queueing.
5. **Ephemeral dev ports** - unlike Docker `:7456`, `tools-dev` picks free ports; MCP sidecar IPC handles this when using tools-dev.
6. **Template clone risk shifts** - OD can still produce generic SaaS landing pages if brief is weak; WebForTrades section plan + clone review must remain gates.
7. **No Docker MCP yet** - container install docs note MCP needs local/source install for now.
8. **Two-repo workflow** - OD lives at `~/.cursor/open-design`, WebForTrades at `~/.cursor/website`; CI must start OD daemon before MCP-driven builds.

## Open Design agent policy (mandatory)

- **Preferred agent:** `cursor-agent` when available and logged in.
- **Stop and ask Julius** when generation fails due to auth, missing CLI, missing agent, or manual login/setup.
- **Do not** repeatedly switch agents (Claude, Hermes, Antigravity, etc.) without explicit approval.
- **Retry once** for clear transient errors, then stop and report.
- Save artifacts to `open-design-artifacts/<slug>/` and review before integrating into `sites/<slug>/`.

## Corvell cursor-agent test (2026-06-10)

- Project: `webfortrades-corvell-ltd-test`
- Run: `8ec04196-733c-4300-850b-a02f11002dc2` - **succeeded** in ~4.6 min
- Output: `corvell-ltd.html` (25 KB single-file HTML + inlined CSS)
- Review: `open-design-artifacts/corvell-ltd/review.md` - **revise then integrate**
- Not integrated into `sites/corvell-ltd/` yet

## Next steps

1. Fix MCP daemon URL when sidecar IPC is stale (use `--daemon-url` matching active `tools-dev` port, or reload MCP after restart).
2. Add `scripts/open_design_handoff.ts` to map brief format → OD run payload.
3. Store OD metadata in `briefs/<slug>/open-design.json`.
4. Wire optional `--use-open-design` on `build:site` after Julius approves integration.

## Safety confirmations (this task)

- No WebForTrades sites rebuilt
- No deploy
- No outreach
- `config.yaml`: `outreach.sending_enabled: false`, `outreach.test_recipient_only: true` unchanged
