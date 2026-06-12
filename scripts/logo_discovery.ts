import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  extractLinkIcons,
  extractOpenGraph,
  extractSchemaLocalBusiness,
  type LinkIcon,
} from "./html_extract.js";
import { lightweightFetch } from "./website_discovery.js";
import { upscaleFacebookCdnUrl } from "./image_utils.js";
import { fetchFacebookMetaHttp, type FacebookPageData } from "./facebook_source.js";

export type LogoSourceType =
  | "facebook_profile"
  | "facebook_og"
  | "website_header"
  | "website_schema"
  | "website_og"
  | "favicon"
  | "apple_touch_icon"
  | "manifest_icon"
  | "google_places";

export interface LogoCandidate {
  source_url: string;
  source_type: LogoSourceType;
  source_confidence: "high" | "medium" | "low";
  width: number;
  height: number;
  score: number;
  has_transparency: boolean;
  aspect_ratio: number;
  likely_logo: boolean;
  notes: string;
}

export interface LogoDiscoveryResult {
  found: boolean;
  selected: LogoCandidate | null;
  candidates: LogoCandidate[];
  local_path: string | null;
  metadata_path: string | null;
  failures: string[];
}

const USER_AGENT =
  "Mozilla/5.0 (compatible; WebForTradesProspector/1.0; +https://www.webfortradesuk.co.uk)";

async function downloadAndScoreLogo(
  sourceUrl: string,
  sourceType: LogoSourceType,
  sourceConfidence: LogoCandidate["source_confidence"],
  referer?: string
): Promise<LogoCandidate | null> {
  try {
    const res = await fetch(sourceUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Referer: referer ?? sourceUrl,
        Accept: "image/*",
      },
      signal: AbortSignal.timeout(20000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const raw = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(raw).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (w < 32 || h < 32) return null;

    const aspect = w / Math.max(h, 1);
    const hasAlpha = meta.hasAlpha ?? false;
    const likelyLogo =
      sourceType !== "favicon" ||
      w >= 128 ||
      /logo|brand|apple-touch|schema|facebook_profile|facebook_og/.test(sourceType);

    let score = 0;
    if (sourceConfidence === "high") score += 40;
    else if (sourceConfidence === "medium") score += 25;
    else score += 10;

    if (w >= 200) score += 25;
    else if (w >= 120) score += 15;
    else if (w >= 64) score += 8;
    else score += 2;

    if (aspect >= 0.7 && aspect <= 1.4) score += 10;
    if (hasAlpha) score += 8;
    if (sourceType === "website_schema") score += 15;
    if (sourceType === "facebook_profile" || sourceType === "facebook_og") score += 12;
    if (sourceType === "apple_touch_icon") score += 10;
    if (sourceType === "favicon" && w < 128) score -= 20;

    return {
      source_url: sourceUrl,
      source_type: sourceType,
      source_confidence: sourceConfidence,
      width: w,
      height: h,
      score,
      has_transparency: hasAlpha,
      aspect_ratio: Math.round(aspect * 100) / 100,
      likely_logo: likelyLogo,
      notes: `${w}x${h}${hasAlpha ? ", alpha" : ""}`,
    };
  } catch {
    return null;
  }
}

function iconScore(icon: LinkIcon): number {
  const sizes = icon.sizes?.match(/(\d+)x(\d+)/);
  const w = sizes ? Number(sizes[1]) : 0;
  if (/apple-touch-icon/.test(icon.rel)) return 80 + w;
  if (/icon/.test(icon.rel) && w >= 192) return 70 + w;
  if (/icon/.test(icon.rel) && w >= 128) return 50 + w;
  return 20 + w;
}

export async function discoverLogos(input: {
  slug: string;
  briefDir: string;
  websiteUrl?: string | null;
  facebookPage?: FacebookPageData | null;
  facebookVerified?: boolean;
  writeFiles?: boolean;
}): Promise<LogoDiscoveryResult> {
  const candidates: LogoCandidate[] = [];
  const failures: string[] = [];
  const fbConf: LogoCandidate["source_confidence"] = input.facebookVerified ? "high" : "medium";

  if (input.facebookPage?.profile_image_url) {
    const url = upscaleFacebookCdnUrl(input.facebookPage.profile_image_url);
    const c = await downloadAndScoreLogo(url, "facebook_profile", fbConf, input.facebookPage.page_url);
    if (c) candidates.push(c);
    else failures.push("Facebook profile image download failed");
  }

  if (input.facebookPage?.page_url) {
    const meta = await fetchFacebookMetaHttp(input.facebookPage.page_url);
    if (meta.profile_image_url) {
      const url = upscaleFacebookCdnUrl(meta.profile_image_url);
      const c = await downloadAndScoreLogo(url, "facebook_og", fbConf, input.facebookPage.page_url);
      if (c && !candidates.some((x) => x.source_url.split("?")[0] === c.source_url.split("?")[0])) {
        candidates.push(c);
      }
    }
  }

  if (input.websiteUrl && /^https?:\/\//i.test(input.websiteUrl)) {
    const probe = await lightweightFetch(input.websiteUrl);
    if (probe.ok && probe.bodyText) {
      const html = probe.bodyText;
      const fullHtmlProbe = await fetch(input.websiteUrl, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(15000),
      }).catch(() => null);
      const rawHtml = fullHtmlProbe?.ok ? await fullHtmlProbe.text() : html;

      const schema = extractSchemaLocalBusiness(rawHtml);
      if (schema?.logo) {
        const c = await downloadAndScoreLogo(schema.logo, "website_schema", "high", input.websiteUrl);
        if (c) candidates.push(c);
      }

      const og = extractOpenGraph(rawHtml);
      if (og.image && /logo|brand|icon/i.test(og.image + (og.title ?? ""))) {
        const c = await downloadAndScoreLogo(og.image, "website_og", "medium", input.websiteUrl);
        if (c) candidates.push(c);
      } else if (og.image && og.image.includes("logo")) {
        const c = await downloadAndScoreLogo(og.image, "website_og", "medium", input.websiteUrl);
        if (c) candidates.push(c);
      }

      const icons = extractLinkIcons(rawHtml, probe.finalUrl || input.websiteUrl);
      icons.sort((a, b) => iconScore(b) - iconScore(a));
      for (const icon of icons.slice(0, 4)) {
        const type: LogoSourceType = /apple-touch/.test(icon.rel)
          ? "apple_touch_icon"
          : "favicon";
        const c = await downloadAndScoreLogo(icon.href, type, "medium", input.websiteUrl);
        if (c && c.likely_logo) candidates.push(c);
      }
    } else {
      failures.push(`Website fetch failed for logo discovery: ${probe.error ?? probe.statusCode}`);
    }
  }

  const deduped = dedupeCandidates(candidates);
  deduped.sort((a, b) => b.score - a.score);
  const selected = deduped.find((c) => c.likely_logo && c.score >= 25) ?? deduped[0] ?? null;

  let local_path: string | null = null;
  let metadata_path: string | null = null;

  if (selected && input.writeFiles !== false) {
    const brandDir = path.join(input.briefDir, "brand");
    fs.mkdirSync(brandDir, { recursive: true });
    local_path = `brand/logo.webp`;
    const outFile = path.join(brandDir, "logo.webp");
    try {
      const res = await fetch(selected.source_url, {
        headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const raw = Buffer.from(await res.arrayBuffer());
        await sharp(raw).webp({ quality: 90 }).toFile(outFile);
        metadata_path = "brand/logo-metadata.json";
        fs.writeFileSync(
          path.join(brandDir, "logo-metadata.json"),
          JSON.stringify({ selected, candidates: deduped, failures }, null, 2) + "\n"
        );
      }
    } catch (e) {
      failures.push(`Logo save failed: ${e instanceof Error ? e.message : "unknown"}`);
      local_path = null;
    }
  }

  return {
    found: Boolean(selected),
    selected,
    candidates: deduped,
    local_path,
    metadata_path,
    failures,
  };
}

function dedupeCandidates(candidates: LogoCandidate[]): LogoCandidate[] {
  const seen = new Set<string>();
  const out: LogoCandidate[] = [];
  for (const c of candidates) {
    const key = crypto.createHash("md5").update(`${c.width}x${c.height}:${c.source_type}`).digest("hex").slice(0, 12);
    const urlKey = c.source_url.split("?")[0]!;
    if (seen.has(urlKey) || seen.has(key)) continue;
    seen.add(urlKey);
    seen.add(key);
    out.push(c);
  }
  return out;
}
