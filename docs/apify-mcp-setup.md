# Apify MCP setup for Cursor

Research date: 2026-06-10.

## Does Apify MCP exist?

**Yes.** Apify provides an official MCP server:

- Docs: https://docs.apify.com/platform/integrations/mcp
- GitHub: https://github.com/apify/apify-mcp-server
- Configurator: https://mcp.apify.com

It exposes Apify Actors, docs search, and optional pre-selected tools to MCP clients including **Cursor**.

## MCP vs API for WebForTrades

| Use case | Recommended path |
|----------|------------------|
| Cursor agent manual actor tests | Apify MCP in Cursor |
| Automated pipeline (`enrich:lead`, batch, benchmarks) | **Apify REST API** via `scripts/apify_facebook.ts` |

The pipeline module uses the **direct Apify API** with `APIFY_TOKEN` from `.env`. MCP is not available inside `tsx` scripts. MCP is for interactive Cursor testing only.

## Required token

- Env var: `APIFY_TOKEN`
- Get it from: Apify Console → Settings → Integrations → API tokens
- **Never paste the token in chat or commit it.**

### Where to store the token

| Location | Purpose |
|----------|---------|
| `.env` in project root | Pipeline scripts (`enrich:lead`, `benchmark:facebook-assets`) |
| `~/.cursor/mcp.json` headers or env | Cursor MCP connection only |

Add to local `.env` (see `.env.example`):

```
APIFY_TOKEN=
APIFY_FACEBOOK_POSTS_ACTOR=apify/facebook-posts-scraper
APIFY_FACEBOOK_PHOTOS_ACTOR=
APIFY_FACEBOOK_PAGES_ACTOR=apify/facebook-pages-scraper
```

## Connect Apify MCP to Cursor

### Option A: One-click install (recommended)

1. Open https://mcp.apify.com
2. Add tools: `actors`, `docs`, and `apify/facebook-posts-scraper`
3. Click **Install in Cursor**
4. Restart Cursor
5. Connect via OAuth when prompted, or use Bearer token header

### Option B: Manual `~/.cursor/mcp.json` (remote HTTP)

```json
{
  "mcpServers": {
    "apify": {
      "url": "https://mcp.apify.com/?tools=actors,docs,apify/facebook-posts-scraper",
      "headers": {
        "Authorization": "Bearer YOUR_APIFY_TOKEN"
      }
    }
  }
}
```

Replace `YOUR_APIFY_TOKEN` locally. Do not commit this file with a real token.

### Option C: Local stdio server

```json
{
  "mcpServers": {
    "apify": {
      "command": "npx",
      "args": ["-y", "@apify/actors-mcp-server"],
      "env": {
        "APIFY_TOKEN": "YOUR_APIFY_TOKEN"
      }
    }
  }
}
```

## MCP tools exposed

Typical tools (depends on configurator selection):

- Run Apify Actors by ID
- Search Actor store and docs
- Retrieve dataset items from completed runs
- Browse actor input schemas

Exact tool list varies by URL query params on `mcp.apify.com`.

## Test MCP connection in Cursor

1. Restart Cursor after config change
2. Open Agent chat
3. Ask: "List available Apify tools" or "Run apify/facebook-posts-scraper on https://www.facebook.com/GPPlumbingandHeatingLtd/ with resultsLimit 5"
4. Confirm the agent can start a run and return dataset preview

## Small actor test (manual, via MCP)

Suggested input for Greens test page:

```json
{
  "startUrls": [{ "url": "https://www.facebook.com/GPPlumbingandHeatingLtd/" }],
  "resultsLimit": 5
}
```

Actor: `apify/facebook-posts-scraper`

Check output `media[].photo_image.uri` widths. Values around 960px or higher beat the 320px public HTML fallback.

## Test pipeline integration (no MCP)

```bash
npm run test:apify-facebook
npm run benchmark:facebook-assets -- --slug greens-precise-plumbing-heating-ltd
```

Without `APIFY_TOKEN`, both commands report setup needed and do not fail.

## Security notes

- Do not use personal Facebook cookies or login sessions with Apify or MCP
- Reject actors that require `cookies` or logged-in Facebook sessions for pipeline use
- Keep `APIFY_TOKEN` in `.env` only (gitignored)
- Limit `resultsLimit` to 20 or less for benchmarks to control cost
- Apify posts scraper pricing: about **$2 / 1,000 posts** (pay per event)

## Fallback if MCP is unavailable

1. Add `APIFY_TOKEN` to `.env`
2. Run `npm run benchmark:facebook-assets -- --slug <slug>`
3. Pipeline order: Meta Graph API → Apify API → public HTML fallback

See also: `docs/apify-facebook-tools-research.md`
