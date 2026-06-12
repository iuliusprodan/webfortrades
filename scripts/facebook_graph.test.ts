#!/usr/bin/env tsx
/**
 * Unit tests for Meta Graph API Facebook photo helpers.
 * Does not use logged-in scraping or real API tokens.
 */
import assert from "node:assert/strict";
import {
  assessFacebookMediaQuality,
  extractFacebookPageSlug,
  formatGraphStatusForLog,
  getMetaGraphConfig,
  isGraphPermissionError,
  selectBestFacebookImageVariant,
  MIN_FACEBOOK_GALLERY_WIDTH,
} from "./facebook_graph.js";

// selectBestFacebookImageVariant
{
  const best = selectBestFacebookImageVariant([
    { width: 315, height: 315, source: "https://example.com/small.jpg" },
    { width: 1200, height: 900, source: "https://example.com/large.jpg" },
    { width: 800, height: 600, source: "https://example.com/mid.jpg" },
  ]);
  assert.equal(best?.width, 1200);
  assert.equal(best?.source, "https://example.com/large.jpg");
}

// reject 315 when larger exists (via assess)
{
  const q = assessFacebookMediaQuality([
    { width: 315, height: 315, source_type: "facebook_photo", classification: "completed_project" },
    { width: 1200, height: 900, source_type: "facebook_graph_photo", classification: "completed_project" },
  ]);
  assert.equal(q.facebook_media_quality, "HIGH_RES");
  assert.equal(q.manual_asset_review_recommended, false);
}

// low-res only flag
{
  const q = assessFacebookMediaQuality([
    { width: 315, height: 315, source_type: "facebook_photo", classification: "completed_project" },
    { width: 320, height: 320, source_type: "facebook_photo", classification: "completed_project" },
  ]);
  assert.equal(q.facebook_media_quality, "LOW_RES_ONLY");
  assert.equal(q.manual_asset_review_recommended, true);
  assert.ok((q.largest_width ?? 0) < MIN_FACEBOOK_GALLERY_WIDTH);
}

// permission error detection
{
  assert.equal(isGraphPermissionError(10, "Application does not have permission"), true);
  assert.equal(isGraphPermissionError(200, "Requires Page Public Content Access"), true);
  assert.equal(isGraphPermissionError(404, "Unsupported get request"), false);
}

// page slug extraction
{
  assert.equal(
    extractFacebookPageSlug("https://www.facebook.com/GPPlumbingandHeatingLtd"),
    "GPPlumbingandHeatingLtd"
  );
  assert.equal(extractFacebookPageSlug("123456789"), "123456789");
}

// no token in logs
{
  const prev = process.env.META_GRAPH_API_TOKEN;
  process.env.META_GRAPH_API_TOKEN = "secret-test-token-do-not-print";
  const cfg = getMetaGraphConfig();
  const msg = formatGraphStatusForLog(
    {
      attempted: true,
      success: false,
      page_id: "123",
      photos_found: 0,
      photos_downloaded: 0,
      largest_width: null,
      largest_height: null,
      failure_reason: "GRAPH_API_PERMISSION_REQUIRED",
      permission_required: true,
    },
    cfg.configured
  );
  assert.ok(!msg.includes("secret-test-token"));
  assert.ok(!msg.includes("META_GRAPH_API_TOKEN"));
  assert.ok(msg.includes("PERMISSION"));
  if (prev === undefined) delete process.env.META_GRAPH_API_TOKEN;
  else process.env.META_GRAPH_API_TOKEN = prev;
}

// not configured path
{
  const prev = process.env.META_GRAPH_API_TOKEN;
  delete process.env.META_GRAPH_API_TOKEN;
  const cfg = getMetaGraphConfig();
  assert.equal(cfg.configured, false);
  const msg = formatGraphStatusForLog(
    {
      attempted: false,
      success: false,
      page_id: null,
      photos_found: 0,
      photos_downloaded: 0,
      largest_width: null,
      largest_height: null,
      failure_reason: null,
      permission_required: false,
    },
    cfg.configured
  );
  assert.ok(msg.includes("not configured"));
  if (prev !== undefined) process.env.META_GRAPH_API_TOKEN = prev;
}

// Graph API not configured: downloadFacebookGraphPhotos skips API (public HTML fallback path)
{
  const prev = process.env.META_GRAPH_API_TOKEN;
  delete process.env.META_GRAPH_API_TOKEN;
  const { evidence, assets } = await import("./facebook_graph.js").then((m) =>
    m.downloadFacebookGraphPhotos({
      pageUrl: "https://www.facebook.com/example",
      outDir: "/tmp/wft-graph-test",
      maxPhotos: 1,
    })
  );
  assert.equal(evidence.attempted, false);
  assert.equal(evidence.success, false);
  assert.equal(assets.length, 0);
  assert.equal(evidence.failure_reason, "META_GRAPH_API_TOKEN not configured");
  if (prev !== undefined) process.env.META_GRAPH_API_TOKEN = prev;
}

// facebook_graph module must not use logged-in browser scraping (no playwright import)
{
  const src = await import("node:fs/promises").then((fs) =>
    fs.readFile(new URL("./facebook_graph.ts", import.meta.url), "utf8")
  );
  assert.ok(!src.includes("playwright"), "facebook_graph must not import playwright");
  assert.ok(!/logged.?in|login.?session/i.test(src.replace(/\/\*[\s\S]*?\*\//g, "")), "facebook_graph must not automate logged-in sessions");
}

console.log("facebook_graph tests passed");
