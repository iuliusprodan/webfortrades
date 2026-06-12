#!/usr/bin/env tsx
/**
 * Unit tests for Apify Facebook helpers. No token or paid runs required.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  APIFY_BENCHMARK_MAX_ITEMS,
  buildActorInput,
  classifyApifyImageQuality,
  estimateApifyCost,
  formatApifyStatusForLog,
  getApifyConfig,
  isApifyConfigured,
  isApifyGalleryReady,
  isApifyHighResAvailable,
  isApifyHeroReady,
  normalizeApifyActorId,
  normalizeApifyFacebookImages,
  normalizeCommonFacebookImageFields,
  selectBestApifyImages,
} from "./apify_facebook.js";
import { MIN_FACEBOOK_GALLERY_WIDTH } from "./facebook_graph.js";

// no token fallback
{
  const prev = process.env.APIFY_TOKEN;
  delete process.env.APIFY_TOKEN;
  assert.equal(isApifyConfigured(), false);
  const cfg = getApifyConfig();
  assert.equal(cfg.configured, false);
  const msg = formatApifyStatusForLog(
    {
      attempted: false,
      success: false,
      actor: null,
      photos_found: 0,
      photos_downloaded: 0,
      largest_width: null,
      largest_height: null,
      failure_reason: "APIFY_TOKEN not configured",
      cost_estimate: null,
      requires_login: false,
      via_mcp: false,
    },
    cfg.configured
  );
  assert.ok(msg.includes("not configured"));
  if (prev !== undefined) process.env.APIFY_TOKEN = prev;
}

// token never logged
{
  const prev = process.env.APIFY_TOKEN;
  process.env.APIFY_TOKEN = "secret-apify-token-do-not-print";
  const cfg = getApifyConfig();
  const msg = formatApifyStatusForLog(
    {
      attempted: true,
      success: false,
      actor: "apify/facebook-posts-scraper",
      photos_found: 0,
      photos_downloaded: 0,
      largest_width: null,
      largest_height: null,
      failure_reason: "actor_failed",
      cost_estimate: estimateApifyCost("apify/facebook-posts-scraper", 20),
      requires_login: false,
      via_mcp: false,
    },
    cfg.configured
  );
  assert.ok(!msg.includes("secret-apify-token"));
  assert.ok(!msg.includes("APIFY_TOKEN"));
  if (prev === undefined) delete process.env.APIFY_TOKEN;
  else process.env.APIFY_TOKEN = prev;
}

// multiple actor result shapes
{
  const posts = normalizeCommonFacebookImageFields(
    [{ media: [{ photo_image: { uri: "https://cdn.example.com/a.jpg", width: 960, height: 720 } }] }],
    "apify/facebook-posts-scraper"
  );
  assert.ok(posts.some((p) => p.width === 960));

  const photos = normalizeCommonFacebookImageFields(
    [{ image: "https://cdn.example.com/b.jpg", imageUrl: "https://cdn.example.com/c.jpg", width: 850 }],
    "apify/facebook-photos-scraper"
  );
  assert.ok(photos.length >= 2);

  const downloader = normalizeCommonFacebookImageFields(
    [{ downloadUrl: "https://api.apify.com/v2/key-value-stores/abc/records/photo-1", storageKey: "photo-1" }],
    "igview-owner/facebook-page-photos-downloader"
  );
  assert.ok(downloader.some((p) => p.storage_key === "photo-1" || p.apify_record_url?.includes("api.apify.com")));
}

// reject 526 as not gallery-ready
{
  const q = classifyApifyImageQuality(526, "apify/facebook-posts-scraper");
  assert.equal(q.gallery_ready, false);
  assert.equal(q.code, "APIFY_POSTS_IMAGES_TOO_SMALL");
}

// accept 800px plus
{
  const q = classifyApifyImageQuality(960, "apify/facebook-photos-scraper");
  assert.equal(q.gallery_ready, true);
  assert.equal(q.preferred_gallery, true);
  assert.ok(isApifyGalleryReady(960));
  assert.ok(isApifyHeroReady(1200));
}

// fbcdn 403 handled via quality code
{
  const q = classifyApifyImageQuality(526, "apify/facebook-photos-scraper", { downloadBlocked: true });
  assert.equal(q.code, "FBCDN_DOWNLOAD_BLOCKED");
}

// actor requiring cookies rejected
{
  const input = buildActorInput("apify/facebook-photos-scraper", "https://www.facebook.com/example", 20);
  input.cookies = "c_user=123";
  const { actorInputRequiresLogin } = await import("./apify_facebook.js");
  assert.equal(actorInputRequiresLogin(input), true);
}

// cost limit constant
assert.equal(APIFY_BENCHMARK_MAX_ITEMS, 20);

// normalize actor id
assert.equal(normalizeApifyActorId("apify/facebook-posts-scraper"), "apify~facebook-posts-scraper");

// reject 315 when larger exists
{
  const selected = selectBestApifyImages([
    { url: "https://cdn.example.com/a.jpg", width: 315, height: 315, actor: "test", source_field: "t" },
    { url: "https://cdn.example.com/b.jpg", width: 1200, height: 900, actor: "test", source_field: "t" },
  ]);
  assert.ok(selected.every((i) => (i.width ?? 0) >= MIN_FACEBOOK_GALLERY_WIDTH));
}

// LOW_RES only when all small
assert.equal(isApifyHighResAvailable(320), false);
assert.equal(isApifyHighResAvailable(640), true);

// no cookie/login path in module
{
  const src = fs.readFileSync(new URL("./apify_facebook.ts", import.meta.url), "utf8");
  assert.ok(!src.includes("playwright"), "apify_facebook must not import playwright");
  assert.ok(!/facebook.?cookie|setCookie/i.test(src), "apify_facebook must not use Facebook cookies");
}

console.log("apify_facebook tests passed");
