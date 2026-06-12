#!/usr/bin/env tsx
/**
 * Compare Facebook image extraction paths for a lead (read-only by default).
 * Does not rebuild sites or send outreach.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { briefDir, ROOT } from "./site_config.js";
import {
  loadFacebookPageData,
  verifyFacebookPageForLead,
} from "./facebook_source.js";
import {
  downloadFacebookGraphPhotos,
  formatGraphStatusForLog,
  getMetaGraphConfig,
  MIN_FACEBOOK_GALLERY_WIDTH,
  PREFERRED_FACEBOOK_GALLERY_WIDTH,
} from "./facebook_graph.js";
import {
  benchmarkApifyActors,
  formatApifyStatusForLog,
  getApifyConfig,
  isApifyConfigured,
  isApifyHeroReady,
  isApifyHighResAvailable,
  type ApifyActorBenchmarkResult,
} from "./apify_facebook.js";
import { upscaleFacebookCdnUrl } from "./image_utils.js";
import { downloadFacebookImageWithRetry } from "./photo_discovery_helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface FacebookAssetsBenchmark {
  slug: string;
  business_name: string;
  facebook_url: string | null;
  facebook_verified: boolean;
  ran_at: string;
  read_only: boolean;
  public_html: {
    attempted: boolean;
    max_width: number | null;
    max_height: number | null;
    image_count: number;
  };
  meta_graph: {
    configured: boolean;
    status: string;
    max_width: number | null;
    photos_downloaded: number;
    permission_required: boolean;
  };
  apify: {
    configured: boolean;
    status: string;
    max_width: number | null;
    photos_downloaded: number;
    actor: string | null;
    cost_estimate: string | null;
    requires_login: boolean;
    via_mcp: boolean;
  };
  apify_actors?: ApifyActorBenchmarkResult[];
  google_places: {
    max_width: number | null;
    image_count: number;
  };
  website: {
    max_width: number | null;
    image_count: number;
  };
  manual_assets: {
    recommended: boolean;
    note: string;
  };
  facebook_before_max_width: number | null;
  facebook_after_max_width: number | null;
  beats_320px_limit: boolean;
  gallery_ready: boolean;
  hero_ready: boolean;
  recommendation: string;
  failures: string[];
}

interface BriefRow {
  business_name: string;
  address: string;
  phone: string | null;
  photos?: { local: string; source_url?: string; source_type?: string; width?: number; height?: number }[];
  social?: { facebook?: string | null };
  facebook?: { url?: string | null; verified?: boolean };
}

function parseArgs(): { slug?: string; dryRun?: boolean; tryActors?: boolean } {
  const args = process.argv.slice(2);
  const opts: { slug?: string; dryRun?: boolean; tryActors?: boolean } = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) opts.slug = args[++i];
    else if (args[i] === "--dry-run") opts.dryRun = true;
    else if (args[i] === "--try-actors") opts.tryActors = true;
  }
  return opts;
}

function cityFromAddress(address: string): string {
  return address.split(",").slice(-2, -1)[0]?.trim() ?? address.split(",")[0]?.trim() ?? "";
}

async function probeLocalImage(briefPath: string, local: string): Promise<{ width: number; height: number } | null> {
  const full = path.join(briefPath, local.replace(/^images\//, "images/"));
  if (!fs.existsSync(full)) return null;
  try {
    const meta = await sharp(full).metadata();
    return { width: meta.width ?? 0, height: meta.height ?? 0 };
  } catch {
    return null;
  }
}

function maxWidthFromPhotos(
  photos: { width?: number; source_type?: string; source_url?: string }[],
  filter?: (p: { source_type?: string; source_url?: string }) => boolean
): number | null {
  const filtered = filter ? photos.filter(filter) : photos;
  const widths = filtered.map((p) => p.width ?? 0).filter((w) => w > 0);
  return widths.length ? Math.max(...widths) : null;
}

function pickRecommendation(input: {
  googleMax: number | null;
  facebookAfterMax: number | null;
  actorResults: ApifyActorBenchmarkResult[];
  galleryReady: boolean;
  heroReady: boolean;
}): string {
  const winner = input.actorResults
    .filter((a) => a.success && (a.largest_saved_width ?? 0) >= MIN_FACEBOOK_GALLERY_WIDTH)
    .sort((a, b) => (b.largest_saved_width ?? 0) - (a.largest_saved_width ?? 0))[0];

  if (winner && (winner.largest_saved_width ?? 0) >= 1000) {
    return `USE_APIFY_ACTOR_${winner.actor_id.replace(/\//g, "_")}`;
  }
  if (winner && (winner.largest_saved_width ?? 0) >= 800) {
    return `USE_APIFY_ACTOR_${winner.actor_id.replace(/\//g, "_")}`;
  }
  if (winner && (winner.largest_saved_width ?? 0) >= MIN_FACEBOOK_GALLERY_WIDTH) {
    return `USE_APIFY_ACTOR_${winner.actor_id.replace(/\//g, "_")}`;
  }
  if ((input.googleMax ?? 0) >= MIN_FACEBOOK_GALLERY_WIDTH) {
    return "USE_GOOGLE_PLACES";
  }
  if (input.actorResults.some((a) => a.failure_reason === "APIFY_POSTS_IMAGES_TOO_SMALL")) {
    return "DO_NOT_USE_FACEBOOK_IMAGES_FOR_GALLERY";
  }
  if (!input.galleryReady) {
    return "MANUAL_ASSET_REVIEW";
  }
  return "DO_NOT_USE_FACEBOOK_IMAGES_FOR_GALLERY";
}

export async function runFacebookAssetsBenchmark(
  slug: string,
  options: { dryRun?: boolean; tryActors?: boolean } = {}
): Promise<FacebookAssetsBenchmark> {
  const failures: string[] = [];
  const dir = briefDir(slug);
  const briefPath = path.join(dir, "brief.json");
  if (!fs.existsSync(briefPath)) {
    throw new Error(`Missing brief.json for ${slug}`);
  }
  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as BriefRow;
  const city = cityFromAddress(brief.address);
  const fbUrl =
    brief.facebook?.url ??
    brief.social?.facebook ??
    (slug === "greens-precise-plumbing-heating-ltd"
      ? "https://www.facebook.com/GPPlumbingandHeatingLtd/"
      : null);

  const existingPhotos = brief.photos ?? [];
  const facebookExisting = existingPhotos.filter(
    (p) =>
      (p.source_type ?? "").includes("facebook") ||
      (p.source_url ?? "").includes("facebook") ||
      (p.source_url ?? "").includes("fbcdn")
  );

  let facebookBeforeMax: number | null = null;
  for (const p of facebookExisting) {
    let w = p.width ?? 0;
    if (!w && p.local) {
      const probed = await probeLocalImage(dir, p.local);
      w = probed?.width ?? 0;
    }
    if (w > (facebookBeforeMax ?? 0)) facebookBeforeMax = w;
  }

  const googlePhotos = existingPhotos.filter(
    (p) =>
      (p.source_url ?? "").includes("google") ||
      (p.source_type ?? "") === "google_places" ||
      !(p.source_url ?? "").includes("facebook")
  );
  let googleMax: number | null = null;
  for (const p of googlePhotos) {
    let w = p.width ?? 0;
    if (!w && p.local) {
      const probed = await probeLocalImage(dir, p.local);
      w = probed?.width ?? 0;
    }
    if (w > (googleMax ?? 0)) googleMax = w;
  }

  const websitePhotos = existingPhotos.filter((p) => (p.source_type ?? "").includes("website"));
  const websiteMax = maxWidthFromPhotos(websitePhotos);

  let facebookVerified = Boolean(brief.facebook?.verified);
  let publicHtmlMax: number | null = null;
  let publicHtmlCount = 0;

  if (fbUrl && !options.dryRun) {
    try {
      const page = await loadFacebookPageData(fbUrl);
      const verification = verifyFacebookPageForLead({
        businessName: brief.business_name,
        googlePhone: brief.phone,
        googleAddress: brief.address,
        town: city,
        page,
      });
      facebookVerified = verification.facebook_verified;

      const urls = [...page.photo_urls, ...page.post_image_urls].map(upscaleFacebookCdnUrl).slice(0, 8);
      for (const url of urls) {
        const tmp = path.join(dir, ".benchmark-probe.webp");
        const dl = await downloadFacebookImageWithRetry({
          sourceUrl: url,
          outPath: tmp,
          minWidth: 100,
          refererPageUrl: page.page_url,
          allowPlaywright: false,
        });
        if (dl) {
          publicHtmlCount++;
          if (dl.width > (publicHtmlMax ?? 0)) publicHtmlMax = dl.width;
        }
        if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      }
    } catch (e) {
      failures.push(`Public HTML probe failed: ${e instanceof Error ? e.message : "unknown"}`);
    }
  } else if (facebookBeforeMax) {
    publicHtmlMax = facebookBeforeMax;
    publicHtmlCount = facebookExisting.length;
  }

  const graphConfig = getMetaGraphConfig();
  let graphMax: number | null = null;
  let graphDownloaded = 0;
  let graphPermission = false;
  let graphEvidence = {
    attempted: false,
    success: false,
    page_id: null as string | null,
    photos_found: 0,
    photos_downloaded: 0,
    largest_width: null as number | null,
    largest_height: null as number | null,
    failure_reason: null as string | null,
    permission_required: false,
  };

  if (fbUrl && graphConfig.configured && facebookVerified && !options.dryRun) {
    const graphDl = await downloadFacebookGraphPhotos({
      pageUrl: fbUrl,
      outDir: path.join(dir, "images", "facebook-benchmark-graph"),
      config: graphConfig,
      maxPhotos: 10,
      minWidth: MIN_FACEBOOK_GALLERY_WIDTH,
    });
    graphEvidence = graphDl.evidence;
    graphMax = graphDl.evidence.largest_width;
    graphDownloaded = graphDl.evidence.photos_downloaded;
    graphPermission = graphDl.evidence.permission_required;
  }

  const apifyConfig = getApifyConfig();
  let apifyActorResults: ApifyActorBenchmarkResult[] = [];
  let apifyMax: number | null = null;
  let apifyDownloaded = 0;
  let apifyEvidence = {
    attempted: false,
    success: false,
    actor: null as string | null,
    photos_found: 0,
    photos_downloaded: 0,
    largest_width: null as number | null,
    largest_height: null as number | null,
    failure_reason: apifyConfig.configured ? null : "APIFY_TOKEN not configured",
    cost_estimate: null as string | null,
    requires_login: false,
    via_mcp: false,
  };

  if (apifyConfig.configured && facebookVerified && fbUrl && !options.dryRun && options.tryActors) {
    apifyActorResults = await benchmarkApifyActors(slug, fbUrl, { limit: 20, stopEarly: true });
    const best = apifyActorResults
      .filter((a) => a.success)
      .sort((a, b) => (b.largest_saved_width ?? 0) - (a.largest_saved_width ?? 0))[0];
    if (best) {
      apifyMax = best.largest_saved_width;
      apifyDownloaded = best.images_downloaded;
      apifyEvidence = {
        attempted: true,
        success: best.success,
        actor: best.actor_id,
        photos_found: best.images_found,
        photos_downloaded: best.images_downloaded,
        largest_width: best.largest_saved_width,
        largest_height: null,
        failure_reason: best.failure_reason,
        cost_estimate: best.cost_estimate,
        requires_login: best.requires_login,
        via_mcp: false,
      };
    } else {
      const last = apifyActorResults[apifyActorResults.length - 1];
      apifyEvidence = {
        attempted: true,
        success: false,
        actor: last?.actor_id ?? null,
        photos_found: last?.images_found ?? 0,
        photos_downloaded: 0,
        largest_width: last?.largest_metadata_width ?? null,
        largest_height: null,
        failure_reason: last?.failure_reason ?? "all_apify_actors_failed",
        cost_estimate: last?.cost_estimate ?? null,
        requires_login: apifyActorResults.some((a) => a.requires_login),
        via_mcp: false,
      };
      apifyMax = last?.largest_metadata_width ?? null;
    }
  }

  const facebookAfterMax = Math.max(
    publicHtmlMax ?? 0,
    graphMax ?? 0,
    apifyMax ?? 0,
    facebookBeforeMax ?? 0
  ) || null;

  const beats320 = (facebookAfterMax ?? 0) > 320;
  const galleryReady = (facebookAfterMax ?? 0) >= MIN_FACEBOOK_GALLERY_WIDTH;
  const heroReady = (facebookAfterMax ?? 0) >= PREFERRED_FACEBOOK_GALLERY_WIDTH;

  const recommendation = pickRecommendation({
    googleMax,
    facebookAfterMax,
    actorResults: apifyActorResults,
    galleryReady,
    heroReady,
  });

  const manualRecommended =
    recommendation === "MANUAL_ASSET_REVIEW" ||
    recommendation === "DO_NOT_USE_FACEBOOK_IMAGES_FOR_GALLERY";

  return {
    slug,
    business_name: brief.business_name,
    facebook_url: fbUrl,
    facebook_verified: facebookVerified,
    ran_at: new Date().toISOString(),
    read_only: Boolean(options.dryRun),
    public_html: {
      attempted: Boolean(fbUrl),
      max_width: publicHtmlMax,
      max_height: null,
      image_count: publicHtmlCount,
    },
    meta_graph: {
      configured: graphConfig.configured,
      status: formatGraphStatusForLog(graphEvidence, graphConfig.configured),
      max_width: graphMax,
      photos_downloaded: graphDownloaded,
      permission_required: graphPermission,
    },
    apify: {
      configured: apifyConfig.configured,
      status: formatApifyStatusForLog(apifyEvidence, apifyConfig.configured),
      max_width: apifyMax,
      photos_downloaded: apifyDownloaded,
      actor: apifyEvidence.actor,
      cost_estimate: apifyEvidence.cost_estimate,
      requires_login: apifyEvidence.requires_login,
      via_mcp: apifyEvidence.via_mcp,
    },
    apify_actors: apifyActorResults.length ? apifyActorResults : undefined,
    google_places: {
      max_width: googleMax,
      image_count: googlePhotos.length,
    },
    website: {
      max_width: websiteMax,
      image_count: websitePhotos.length,
    },
    manual_assets: {
      recommended: manualRecommended,
      note: manualRecommended
        ? "Facebook sources did not yield gallery-ready saved images. Export from owner or use Google Places."
        : "Not required if recommendation uses Apify or Google Places.",
    },
    facebook_before_max_width: facebookBeforeMax,
    facebook_after_max_width: facebookAfterMax,
    beats_320px_limit: beats320,
    gallery_ready: galleryReady,
    hero_ready: heroReady,
    recommendation,
    failures,
  };
}

function renderMd(report: FacebookAssetsBenchmark): string {
  const lines = [
    `# Facebook assets benchmark - ${report.slug}`,
    "",
    `- Ran: ${report.ran_at}`,
    `- Facebook: ${report.facebook_url ?? "-"} (verified=${report.facebook_verified})`,
    "",
    "## Comparison",
    "",
    "| Source | Max width | Saved | Notes |",
    "|--------|-----------|-------|-------|",
    `| Existing Facebook (before) | ${report.facebook_before_max_width ?? "-"}px | - | brief/images |`,
    `| Public HTML fallback | ${report.public_html.max_width ?? "-"}px | - | ${report.public_html.image_count} probed |`,
    `| Meta Graph API | ${report.meta_graph.max_width ?? "-"}px | ${report.meta_graph.photos_downloaded} | ${report.meta_graph.status} |`,
    `| Apify (best) | ${report.apify.max_width ?? "-"}px | ${report.apify.photos_downloaded} | ${report.apify.status} |`,
    `| Google Places | ${report.google_places.max_width ?? "-"}px | - | ${report.google_places.image_count} in brief |`,
    `| Website | ${report.website.max_width ?? "-"}px | - | ${report.website.image_count} in brief |`,
    `| Manual assets | - | - | ${report.manual_assets.recommended ? "recommended" : "not needed"} |`,
  ];

  if (report.apify_actors?.length) {
    lines.push("", "## Apify actors", "", "| Actor | Meta max | Saved max | >=600 | >=800 | >=1000 | Result |", "|-------|----------|-----------|-------|-------|--------|--------|");
    for (const a of report.apify_actors) {
      lines.push(
        `| ${a.actor_id} | ${a.largest_metadata_width ?? "-"}px | ${a.largest_saved_width ?? "-"}px | ${a.count_gte_600} | ${a.count_gte_800} | ${a.count_gte_1000} | ${a.failure_reason ?? (a.success ? "ok" : "fail")} |`
      );
    }
  }

  lines.push(
    "",
    `- Beats 320px limit: ${report.beats_320px_limit ? "yes" : "no"}`,
    `- Gallery ready (>=600px): ${report.gallery_ready ? "yes" : "no"}`,
    `- Hero ready (>=1000px): ${report.hero_ready ? "yes" : "no"}`,
    `- Facebook after max: ${report.facebook_after_max_width ?? "-"}px`,
    "",
    "## Recommendation",
    "",
    report.recommendation,
    "",
    report.failures.length ? `## Failures\n\n${report.failures.map((f) => `- ${f}`).join("\n")}\n` : ""
  );

  return lines.join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const opts = parseArgs();
  if (!opts.slug) {
    console.error("Usage: npm run benchmark:facebook-assets -- --slug <slug> [--try-actors] [--dry-run]");
    process.exit(1);
  }

  const apifyConfigured = isApifyConfigured();
  if (!apifyConfigured) {
    console.log("Apify: not configured. Set APIFY_TOKEN in .env to run paid actor benchmark.");
    console.log("See docs/apify-mcp-setup.md for setup steps.");
  }

  runFacebookAssetsBenchmark(opts.slug, { dryRun: opts.dryRun, tryActors: opts.tryActors ?? apifyConfigured })
    .then((report) => {
      const outDir = path.join(ROOT, "data", "facebook-assets-benchmarks");
      fs.mkdirSync(outDir, { recursive: true });
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const base = path.join(outDir, `${ts}-${opts.slug}${opts.tryActors ? "-actors" : ""}`);
      fs.writeFileSync(`${base}.json`, JSON.stringify(report, null, 2) + "\n");
      fs.writeFileSync(`${base}.md`, renderMd(report));

      console.log(`Facebook assets benchmark: ${base}.json`);
      console.log(`  Before max: ${report.facebook_before_max_width ?? "-"}px`);
      console.log(`  Public HTML max: ${report.public_html.max_width ?? "-"}px`);
      console.log(`  Graph max: ${report.meta_graph.max_width ?? "-"}px (${report.meta_graph.configured ? "configured" : "off"})`);
      console.log(`  Apify max: ${report.apify.max_width ?? "-"}px (${report.apify.configured ? "configured" : "off"})`);
      console.log(`  After max: ${report.facebook_after_max_width ?? "-"}px`);
      console.log(`  Beats 320px: ${report.beats_320px_limit ? "yes" : "no"}`);
      console.log(`  Recommendation: ${report.recommendation}`);
      if (report.apify_actors?.length) {
        for (const a of report.apify_actors) {
          console.log(
            `  Actor ${a.actor_id}: meta=${a.largest_metadata_width ?? "-"}px saved=${a.largest_saved_width ?? "-"}px dl=${a.images_downloaded} ${a.failure_reason ?? "ok"}`
          );
        }
      }
    })
    .catch((e) => {
      console.error(e instanceof Error ? e.message : e);
      process.exit(1);
    });
}
