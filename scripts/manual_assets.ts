import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { briefDir } from "./site_config.js";
import {
  GALLERY_MIN_WIDTH,
  GALLERY_PREFERRED_WIDTH,
  HERO_MIN_WIDTH,
  recommendImageUse,
  type RecommendedImageUse,
} from "./image_priority.js";
import { assessAssetReadiness } from "./asset_readiness.js";

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;
const SKIP_FILES = new Set(["manifest.json", "manifest.md", "sources.json", "README.md"]);

export interface ManualAssetSourceSidecar {
  file: string;
  source_url?: string;
  note?: string;
}

export interface ManualAssetEntry {
  filename: string;
  width: number;
  height: number;
  file_size_bytes: number;
  format: string;
  quality_status: "pass" | "warn" | "reject";
  recommended_use: RecommendedImageUse;
  warning_notes: string[];
  source_url: string | null;
  source_note: string | null;
  preview: string | null;
  perceptual_hash: string | null;
  duplicate_of: string | null;
}

export interface ManualAssetManifest {
  slug: string;
  scanned_at: string;
  folder: string;
  images: ManualAssetEntry[];
  summary: {
    total: number;
    pass: number;
    warn: number;
    reject: number;
    usable_count: number;
    hero_candidates: number;
    duplicates_removed: number;
  };
  sidecar_sources_loaded: boolean;
  license_warning: string;
}

function manualDir(slug: string): string {
  return path.join(briefDir(slug), "images", "manual");
}

function previewsDir(slug: string): string {
  return path.join(manualDir(slug), "previews");
}

async function perceptualHash(filePath: string): Promise<string | null> {
  try {
    const buf = await sharp(filePath).resize(32, 32, { fit: "cover" }).greyscale().raw().toBuffer();
    return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
  } catch {
    return null;
  }
}

function looksLikeScreenshot(width: number, height: number, filename: string): boolean {
  const ratio = width / Math.max(height, 1);
  const mobileRatios = [9 / 19.5, 9 / 16, 3 / 4];
  const nearMobile = mobileRatios.some((r) => Math.abs(ratio - r) < 0.04);
  if (nearMobile && (width <= 430 || height <= 950)) return true;
  if (/screenshot|screen-?shot|fb-?ui|facebook-?ui/i.test(filename)) return true;
  return false;
}

function loadSidecarSources(slug: string): Map<string, ManualAssetSourceSidecar> {
  const p = path.join(manualDir(slug), "sources.json");
  const map = new Map<string, ManualAssetSourceSidecar>();
  if (!fs.existsSync(p)) return map;
  try {
    const arr = JSON.parse(fs.readFileSync(p, "utf8")) as ManualAssetSourceSidecar[];
    for (const item of arr) {
      if (item.file) map.set(item.file, item);
    }
  } catch {
    /* ignore invalid sidecar */
  }
  return map;
}

export async function scanManualAssets(slug: string): Promise<ManualAssetManifest> {
  const dir = manualDir(slug);
  const sidecar = loadSidecarSources(slug);
  const entries: ManualAssetEntry[] = [];
  const hashGroups = new Map<string, string>();

  if (!fs.existsSync(dir)) {
    return emptyManifest(slug, dir, sidecar.size > 0);
  }

  fs.mkdirSync(previewsDir(slug), { recursive: true });

  const files = fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.test(f) && !SKIP_FILES.has(f))
    .sort();

  for (const filename of files) {
    const filePath = path.join(dir, filename);
    const stat = fs.statSync(filePath);
    const warnings: string[] = [];
    let width = 0;
    let height = 0;
    let format = path.extname(filename).replace(".", "").toLowerCase();

    try {
      const meta = await sharp(filePath).metadata();
      width = meta.width ?? 0;
      height = meta.height ?? 0;
      format = meta.format ?? format;
    } catch {
      entries.push({
        filename,
        width: 0,
        height: 0,
        file_size_bytes: stat.size,
        format,
        quality_status: "reject",
        recommended_use: "reject",
        warning_notes: ["Could not read image metadata"],
        source_url: sidecar.get(filename)?.source_url ?? null,
        source_note: sidecar.get(filename)?.note ?? null,
        preview: null,
        perceptual_hash: null,
        duplicate_of: null,
      });
      continue;
    }

    if (width < GALLERY_MIN_WIDTH) {
      warnings.push(`Under ${GALLERY_MIN_WIDTH}px wide - rejected for gallery or hero`);
    } else if (width < GALLERY_PREFERRED_WIDTH) {
      warnings.push(`Under ${GALLERY_PREFERRED_WIDTH}px preferred gallery width - supporting use only`);
    }
    if (width < HERO_MIN_WIDTH) {
      warnings.push(`Under ${HERO_MIN_WIDTH}px hero preference`);
    }
    if (looksLikeScreenshot(width, height, filename)) {
      warnings.push("Possible screenshot or mobile UI capture");
    }
    if (/logo|avatar|profile|cover/i.test(filename)) {
      warnings.push("Filename suggests logo or profile image, not project work");
    }

    const phash = await perceptualHash(filePath);
    let duplicate_of: string | null = null;
    if (phash) {
      const existing = hashGroups.get(phash);
      if (existing) {
        duplicate_of = existing;
        warnings.push(`Possible duplicate of ${existing}`);
      } else {
        hashGroups.set(phash, filename);
      }
    }

    let recommended = recommendImageUse(width, "manual_asset", true);
    if (duplicate_of) recommended = "reject";
    if (warnings.some((w) => w.startsWith("Possible screenshot"))) {
      recommended = recommended === "hero" ? "gallery" : recommended;
    }
    if (width < GALLERY_MIN_WIDTH) recommended = "reject";

    let quality_status: ManualAssetEntry["quality_status"] = "pass";
    if (recommended === "reject") quality_status = "reject";
    else if (warnings.length) quality_status = "warn";

    let previewRel: string | null = null;
    if (quality_status !== "reject") {
      const previewName = `${path.basename(filename, path.extname(filename))}-preview.webp`;
      const previewPath = path.join(previewsDir(slug), previewName);
      try {
        await sharp(filePath).resize(480, 480, { fit: "inside" }).webp({ quality: 80 }).toFile(previewPath);
        previewRel = `images/manual/previews/${previewName}`;
      } catch {
        warnings.push("Preview thumbnail generation failed");
      }
    }

    const side = sidecar.get(filename);
    entries.push({
      filename,
      width,
      height,
      file_size_bytes: stat.size,
      format,
      quality_status,
      recommended_use: recommended,
      warning_notes: warnings,
      source_url: side?.source_url ?? null,
      source_note: side?.note ?? null,
      preview: previewRel,
      perceptual_hash: phash,
      duplicate_of,
    });
  }

  const pass = entries.filter((e) => e.quality_status === "pass").length;
  const warn = entries.filter((e) => e.quality_status === "warn").length;
  const reject = entries.filter((e) => e.quality_status === "reject").length;
  const usable = entries.filter(
    (e) =>
      e.quality_status !== "reject" &&
      (e.recommended_use === "hero" || e.recommended_use === "gallery" || e.recommended_use === "supporting")
  ).length;
  const heroCandidates = entries.filter((e) => e.recommended_use === "hero" && e.quality_status !== "reject").length;
  const dupes = entries.filter((e) => e.duplicate_of).length;

  return {
    slug,
    scanned_at: new Date().toISOString(),
    folder: `briefs/${slug}/images/manual/`,
    images: entries,
    summary: {
      total: entries.length,
      pass,
      warn,
      reject,
      usable_count: usable,
      hero_candidates: heroCandidates,
      duplicates_removed: dupes,
    },
    sidecar_sources_loaded: sidecar.size > 0,
    license_warning:
      "AI cannot independently prove license or original source unless source_url is provided in sources.json. Use only for internal preview unless public use is confirmed.",
  };
}

function emptyManifest(slug: string, dir: string, sidecarLoaded: boolean): ManualAssetManifest {
  return {
    slug,
    scanned_at: new Date().toISOString(),
    folder: `briefs/${slug}/images/manual/`,
    images: [],
    summary: {
      total: 0,
      pass: 0,
      warn: 0,
      reject: 0,
      usable_count: 0,
      hero_candidates: 0,
      duplicates_removed: 0,
    },
    sidecar_sources_loaded: sidecarLoaded,
    license_warning:
      "AI cannot independently prove license or original source unless source_url is provided in sources.json. Use only for internal preview unless public use is confirmed.",
  };
}

export function renderManualManifestMd(m: ManualAssetManifest): string {
  const lines = [
    `# Manual assets - ${m.slug}`,
    "",
    `- Scanned: ${m.scanned_at}`,
    `- Folder: \`${m.folder}\``,
    `- Total files: ${m.summary.total}`,
    `- Usable: ${m.summary.usable_count}`,
    `- Hero candidates: ${m.summary.hero_candidates}`,
    "",
    m.license_warning,
    "",
  ];

  if (!m.images.length) {
    lines.push("No manual image files found.", "");
    return lines.join("\n");
  }

  lines.push("## Images", "");
  for (const img of m.images) {
    lines.push(
      `### ${img.filename}`,
      `- Size: ${img.width} x ${img.height} (${img.format}, ${img.file_size_bytes} bytes)`,
      `- Status: ${img.quality_status}`,
      `- Recommended use: ${img.recommended_use}`,
      ...(img.source_url ? [`- Source URL: ${img.source_url}`] : []),
      ...(img.warning_notes.length ? [`- Notes: ${img.warning_notes.join("; ")}`] : []),
      ""
    );
  }
  return lines.join("\n");
}

export function ensureManualAssetReadme(
  slug: string,
  context: {
    business_name: string;
    why: string;
    facebook_url?: string | null;
    website_url?: string | null;
    directory_urls?: string[];
  }
): string {
  const dir = manualDir(slug);
  fs.mkdirSync(dir, { recursive: true });
  const readmePath = path.join(dir, "README.md");

  const directoryList =
    context.directory_urls?.length ? context.directory_urls.map((u) => `- ${u}`).join("\n") : "- (none verified yet)";

  const content = `# Manual images needed for ${context.business_name}

## Why

${context.why}

## Please manually download 4 to 8 good public images from

- Facebook: ${context.facebook_url ?? "(none verified)"}
- Website: ${context.website_url ?? "(none)"}
- Directory profiles:
${directoryList}
- Google Business profile if available

## Preferred images

- Finished work
- Bathrooms, kitchens, heating installs, before/after if public
- Wide shots and close-up detail shots
- Avoid blurry, tiny or duplicate images
- Avoid screenshots with Facebook UI
- Avoid profile pictures, cover graphics, logos as gallery images
- Avoid customer faces, private people, number plates, personal addresses if visible

## Save images here

\`briefs/${slug}/images/manual/\`

## Suggested filenames

- manual-01-bathroom.jpg
- manual-02-shower.jpg
- manual-03-kitchen.jpg
- manual-04-detail.jpg

## Optional source tracking

Create \`sources.json\` alongside images:

\`\`\`json
[
  {
    "file": "manual-01-bathroom.jpg",
    "source_url": "https://www.facebook.com/...",
    "note": "Downloaded manually from public Facebook page"
  }
]
\`\`\`

## After adding images

Tell Cursor:

Manual assets added for ${slug}. Validate them and continue.

Then run:

\`\`\`bash
npm run assets:manual -- --slug ${slug}
\`\`\`
`;

  fs.writeFileSync(readmePath, content);
  return readmePath;
}

export async function runManualAssetsCli(slug: string): Promise<ManualAssetManifest> {
  const manifest = await scanManualAssets(slug);
  const dir = manualDir(slug);
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  fs.writeFileSync(path.join(dir, "manifest.md"), renderManualManifestMd(manifest));

  const readiness = loadAssetReadinessAfterScan(slug, manifest);
  console.log(`Manual assets scan: ${slug}`);
  console.log(`  Folder: ${manifest.folder}`);
  console.log(`  Files found: ${manifest.summary.total}`);
  console.log(`  Usable: ${manifest.summary.usable_count}`);
  console.log(`  Rejected: ${manifest.summary.reject}`);
  console.log(`  Warnings: ${manifest.summary.warn}`);
  console.log(`  Manual asset status: ${readiness?.manual_asset_status ?? "OK"}`);
  console.log(`  Wrote manifest.json and manifest.md`);

  if (manifest.summary.total === 0) {
    console.log("  No manual files found (this is OK when automatic sources are sufficient).");
  }

  if (readiness?.pause_before_open_design) {
    console.warn(`\n${readiness.pause_message}`);
  }

  return manifest;
}

function loadAssetReadinessAfterScan(slug: string, manifest: ManualAssetManifest) {
  const briefPath = path.join(briefDir(slug), "brief.json");
  if (!fs.existsSync(briefPath)) return null;
  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as {
    photos?: { local?: string; source_type?: string; width?: number; classification?: string }[];
    facebook?: { verified?: boolean; manual_asset_review_recommended?: boolean; url?: string };
    website_url?: string;
    directory_probes?: { candidate_url?: string; status?: string }[];
  };
  return assessAssetReadiness({
    slug,
    photos: brief.photos,
    facebook_verified: brief.facebook?.verified,
    facebook_url: brief.facebook?.url,
    website_url: brief.website_url,
    directory_urls: (brief.directory_probes ?? [])
      .filter((p) => p.status === "FOUND_VERIFIED" && p.candidate_url)
      .map((p) => p.candidate_url!),
    manual_asset_review_recommended: brief.facebook?.manual_asset_review_recommended,
    manual_manifest: manifest,
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let slug = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
  }
  if (!slug) {
    console.error("Usage: npm run assets:manual -- --slug <slug>");
    process.exit(1);
  }
  runManualAssetsCli(slug)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    });
}
