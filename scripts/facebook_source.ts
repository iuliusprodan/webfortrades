import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { chromium, type Page } from "playwright";
import sharp from "sharp";
import { normalizeUkPhoneDigits } from "./phone_utils.js";
import { extractPalette } from "./palette.js";
import { upscaleFacebookCdnUrl } from "./image_utils.js";
import { downloadFacebookImageWithRetry, downloadFacebookImagesBatch } from "./photo_discovery_helpers.js";
import {
  assessFacebookMediaQuality,
  downloadFacebookGraphPhotos,
  formatGraphStatusForLog,
  getMetaGraphConfig,
  MIN_FACEBOOK_GALLERY_WIDTH,
  type FacebookGraphEvidence,
} from "./facebook_graph.js";
import {
  downloadApifyFacebookImages,
  formatApifyStatusForLog,
  getApifyConfig,
  isApifyHighResAvailable,
} from "./apify_facebook.js";
import type { FacebookApifyEvidence } from "./apify_facebook.js";

export type FacebookStatus = "OK" | "BLOCKED_OR_LOGIN_REQUIRED" | "NOT_FOUND";
export type FacebookConfidence = "high" | "medium" | "low";

export type FacebookAssetSourceType =
  | "facebook_logo"
  | "facebook_cover"
  | "facebook_photo"
  | "facebook_graph_photo"
  | "facebook_apify_photo"
  | "facebook_post_photo";

export interface FacebookPageData {
  page_url: string;
  page_title: string | null;
  business_name: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  website: string | null;
  intro: string | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  photo_urls: string[];
  post_image_urls: string[];
  service_hints: string[];
  facebook_status: FacebookStatus;
  facebook_needs_manual_review: boolean;
  raw_evidence: string[];
}

export interface FacebookVerification {
  facebook_verified: boolean;
  facebook_confidence: FacebookConfidence;
  facebook_verification_reasons: string[];
  facebook_source_url: string | null;
  facebook_phone_match: boolean;
  facebook_name_match: boolean;
  facebook_location_match: boolean;
}

export interface FacebookAssetMeta {
  local: string;
  source_url: string;
  source_type: FacebookAssetSourceType;
  width: number;
  height: number;
  hash: string;
  cluster_id: string | null;
  selected: boolean;
  selection_reason: string;
  classification: "logo_or_brand" | "completed_project" | "team_or_van" | "skip";
}

export interface FacebookBriefRecord {
  url: string | null;
  verified: boolean;
  confidence: FacebookConfidence | null;
  verification_reasons: string[];
  phone_match: boolean;
  name_match: boolean;
  location_match: boolean;
  status: FacebookStatus;
  needs_manual_review: boolean;
  logo_path: string | null;
  logo_source: "facebook" | null;
  logo_palette: string[];
  assets: FacebookAssetMeta[];
  photos_found: number;
  photos_selected: number;
  photos_attempted?: number;
  photos_downloaded?: number;
  photos_rejected?: number;
  photo_download_failures?: { url: string; reason: string }[];
  evidence: string[];
  graph?: import("./facebook_graph.js").FacebookGraphEvidence;
  apify?: FacebookApifyEvidence;
  facebook_media_quality?: import("./facebook_graph.js").FacebookMediaQuality;
  manual_asset_review_recommended?: boolean;
}

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function normalizeFacebookPageUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.search = "";
    let pathname = u.pathname.replace(/\/+$/, "");
    if (pathname.endsWith("/photos") || pathname.endsWith("/about")) {
      pathname = pathname.replace(/\/(photos|about)$/, "");
    }
    u.pathname = pathname || "/";
    return u.toString().replace(/\/$/, "");
  } catch {
    return url.split("?")[0]!.replace(/\/$/, "");
  }
}

export function isFacebookPageUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return host === "facebook.com" || host === "m.facebook.com" || host === "fb.com";
  } catch {
    return /facebook\.com|fb\.com/i.test(url);
  }
}

/** Resolve facebook.com/share/ short links to canonical page URLs when possible. */
export async function resolveFacebookShareUrl(url: string): Promise<string> {
  if (!isFacebookPageUrl(url)) return url;
  const normalized = normalizeFacebookPageUrl(url);
  if (!/\/share\//i.test(normalized)) return normalized;
  try {
    const res = await fetch(normalized, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: AbortSignal.timeout(15000),
    });
    const final = res.url || normalized;
    if (isFacebookPageUrl(final) && !/\/share\//i.test(final)) {
      return normalizeFacebookPageUrl(final);
    }
    const html = await res.text();
    const ogUrl =
      html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
    if (ogUrl && isFacebookPageUrl(ogUrl)) {
      return normalizeFacebookPageUrl(decodeHtmlEntities(ogUrl));
    }
  } catch {
    /* fall through */
  }
  return normalized;
}

export function phonesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a?.trim() || !b?.trim()) return false;
  return normalizeUkPhoneDigits(a) === normalizeUkPhoneDigits(b);
}

function normalizeNameKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\bltd\b|\blimited\b|\bplc\b|\b&\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function namesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a?.trim() || !b?.trim()) return false;
  const ka = normalizeNameKey(a);
  const kb = normalizeNameKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  if (ka.includes(kb) || kb.includes(ka)) return true;
  const shorter = ka.length <= kb.length ? ka : kb;
  const longer = ka.length > kb.length ? ka : kb;
  return shorter.length >= 8 && longer.includes(shorter.slice(0, Math.min(12, shorter.length)));
}

export function locationsMatch(
  fbLocation: string | null | undefined,
  googleAddress: string | null | undefined,
  town: string | null | undefined
): boolean {
  const haystack = [fbLocation, googleAddress, town].filter(Boolean).join(" ").toLowerCase();
  if (!haystack.trim()) return false;
  const cityTokens = [
    "swansea",
    "bristol",
    "kingswood",
    "bath",
    "cardiff",
    "newport",
    "mumbles",
    "port tennant",
    "south wales",
    "south glos",
    "south gloucestershire",
    "bs15",
  ];
  return cityTokens.some((city) => haystack.includes(city));
}

function extractPhones(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(/(?:\+44|0)\s*7\d{3}[\s-]?\d{3}[\s-]?\d{3,4}/g)) {
    found.add(m[0].replace(/\s+/g, " ").trim());
  }
  for (const m of text.matchAll(/07\d{3}\s?\d{6}/g)) {
    found.add(m[0].replace(/\s+/g, " ").trim());
  }
  return [...found];
}

function extractEmails(text: string): string[] {
  return [
    ...new Set(
      [...text.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)].map((m) =>
        m[0].toLowerCase()
      )
    ),
  ].filter((e) => !e.includes("facebook.com") && !e.includes("fb.com"));
}

function extractOgMeta(html: string): Partial<FacebookPageData> {
  const title =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ??
    null;
  const description =
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    null;
  const profile =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? null;
  const pageUrl =
    html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? null;
  return {
    page_title: title ? decodeHtmlEntities(title) : null,
    business_name: title ? decodeHtmlEntities(title.split("|")[0]?.trim() ?? title) : null,
    intro: description ? decodeHtmlEntities(description) : null,
    profile_image_url: profile ? decodeHtmlEntities(profile) : null,
    page_url: pageUrl ? normalizeFacebookPageUrl(decodeHtmlEntities(pageUrl)) : undefined,
  };
}

export async function fetchFacebookMetaHttp(pageUrl: string): Promise<Partial<FacebookPageData>> {
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    });
    if (!res.ok) return { facebook_status: "BLOCKED_OR_LOGIN_REQUIRED" };
    const html = await res.text();
    if (/login_form|You must log in|login_dialog/i.test(html) && !/Page ·/i.test(html)) {
      return { facebook_status: "BLOCKED_OR_LOGIN_REQUIRED" };
    }
    return extractOgMeta(html);
  } catch {
    return { facebook_status: "BLOCKED_OR_LOGIN_REQUIRED" };
  }
}

function cleanFacebookImageUrl(url: string): string {
  const u = decodeHtmlEntities(url);
  if (u.includes("static.xx.fbcdn.net/rsrc.php")) return "";
  if (u.includes("emoji")) return "";
  return u;
}

function uniqueImageUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    const url = cleanFacebookImageUrl(raw);
    if (!url || !url.includes("fbcdn.net")) continue;
    const key = url.split("?")[0]!;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(url);
  }
  return out;
}

async function dismissCookieBanner(page: Page): Promise<void> {
  for (const label of ["Allow all cookies", "Decline optional cookies", "Only allow essential cookies"]) {
    const btn = page.getByRole("button", { name: label });
    if (await btn.count()) {
      try {
        await btn.first().click({ timeout: 2000 });
        await sleep(500);
        return;
      } catch {
        /* try next */
      }
    }
  }
}

async function extractFacebookViaPlaywright(pageUrl: string): Promise<FacebookPageData> {
  const normalized = normalizeFacebookPageUrl(pageUrl);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ userAgent: USER_AGENT });
  const evidence: string[] = [];

  try {
    await page.goto(normalized, { waitUntil: "domcontentloaded", timeout: 35000 });
    await sleep(3500);
    await dismissCookieBanner(page);
    await page.evaluate(() => window.scrollBy(0, 900));
    await sleep(1500);

    const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 12000));
    evidence.push(bodyText.slice(0, 1200));

    const blocked =
      /Log in/i.test(bodyText) &&
      !/Page ·/i.test(bodyText) &&
      !/followers/i.test(bodyText) &&
      !/Intro/i.test(bodyText);

    if (blocked) {
      return {
        page_url: normalized,
        page_title: null,
        business_name: null,
        phone: null,
        email: null,
        location: null,
        website: null,
        intro: null,
        profile_image_url: null,
        cover_image_url: null,
        photo_urls: [],
        post_image_urls: [],
        service_hints: [],
        facebook_status: "BLOCKED_OR_LOGIN_REQUIRED",
        facebook_needs_manual_review: true,
        raw_evidence: evidence,
      };
    }

    const imgs = await page.evaluate(() =>
      [...document.querySelectorAll('img[src*="fbcdn"], img[src*="scontent"]')]
        .map((i) => i.getAttribute("src"))
        .filter(Boolean) as string[]
    );

  const profileCandidates = imgs.filter((u) => /t39\.30808-1\//.test(u));
  const contentPhotos = imgs
    .filter((u) => /t39\.30808-6\//.test(u))
    .sort((a, b) => {
      const score = (u: string) =>
        (/_s320x320|fb50_s320/.test(u) ? 0 : 0) + (u.includes("1536") ? 2 : u.includes("946") ? 1 : 0);
      return score(b) - score(a);
    });

    const phones = extractPhones(bodyText);
    const emails = extractEmails(bodyText);
    const titleMatch = bodyText.match(/^(.+?)\s*\n\s*[\d.]+\s*[KkMm]?\s*followers/m);
    const introMatch = bodyText.match(/Intro\n([\s\S]*?)\n(?:Page ·|Photos|Reels)/);
    const locationMatch = bodyText.match(/Page ·[^\n]*\n([^\n]+(?:United Kingdom|UK)[^\n]*)/i);
    const websiteMatch = bodyText.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]+)?/i);

    const pageTitle = titleMatch?.[1]?.trim() ?? null;
    const businessName = pageTitle?.replace(/\s+$/, "") ?? null;

    const serviceHints: string[] = [];
    if (/plumb/i.test(bodyText)) serviceHints.push("Plumbing");
    if (/heat/i.test(bodyText)) serviceHints.push("Heating");
    if (/boiler/i.test(bodyText)) serviceHints.push("Boiler work");
    if (/bathroom/i.test(bodyText)) serviceHints.push("Bathroom installations");

    return {
      page_url: normalized,
      page_title: pageTitle,
      business_name: businessName,
      phone: phones[0] ?? null,
      email: emails[0] ?? null,
      location: locationMatch?.[1]?.trim() ?? null,
      website: websiteMatch?.[0] ?? null,
      intro: introMatch?.[1]?.trim() ?? null,
      profile_image_url: profileCandidates[0] ?? null,
      cover_image_url: null,
      photo_urls: uniqueImageUrls(contentPhotos),
      post_image_urls: uniqueImageUrls(contentPhotos),
      service_hints: serviceHints,
      facebook_status: "OK",
      facebook_needs_manual_review: false,
      raw_evidence: evidence,
    };
  } finally {
    await browser.close();
  }
}

export async function loadFacebookPageData(pageUrl: string): Promise<FacebookPageData> {
  const resolved = await resolveFacebookShareUrl(pageUrl);
  const normalized = normalizeFacebookPageUrl(resolved);
  const httpMeta = await fetchFacebookMetaHttp(normalized);
  const playwrightData = await extractFacebookViaPlaywright(normalized);

  if (playwrightData.facebook_status === "BLOCKED_OR_LOGIN_REQUIRED" && httpMeta.profile_image_url) {
    return {
      page_url: normalized,
      page_title: httpMeta.page_title ?? null,
      business_name: httpMeta.business_name ?? null,
      phone: null,
      email: null,
      location: null,
      website: null,
      intro: httpMeta.intro ?? null,
      profile_image_url: httpMeta.profile_image_url ?? null,
      cover_image_url: null,
      photo_urls: [],
      post_image_urls: [],
      service_hints: [],
      facebook_status: "BLOCKED_OR_LOGIN_REQUIRED",
      facebook_needs_manual_review: true,
      raw_evidence: [`http_meta_only:${httpMeta.page_title ?? "unknown"}`],
    };
  }

  return {
    ...playwrightData,
    page_title: playwrightData.page_title ?? httpMeta.page_title ?? null,
    business_name: playwrightData.business_name ?? httpMeta.business_name ?? null,
    intro: playwrightData.intro ?? httpMeta.intro ?? null,
    profile_image_url:
      playwrightData.profile_image_url ?? httpMeta.profile_image_url ?? null,
    page_url: normalized,
  };
}

export function verifyFacebookPageForLead(input: {
  businessName: string;
  googlePhone: string | null;
  googleAddress: string | null;
  googleMapsUrl?: string | null;
  town?: string | null;
  page: FacebookPageData;
}): FacebookVerification {
  const reasons: string[] = [];
  const phoneMatch = phonesMatch(input.page.phone, input.googlePhone);
  const nameMatch = namesMatch(input.page.business_name, input.businessName);
  const locationMatch = locationsMatch(
    input.page.location ?? input.page.intro,
    input.googleAddress,
    input.town ?? null
  );

  if (phoneMatch) reasons.push("Phone number matches Google/lead phone");
  if (nameMatch) reasons.push("Business name matches or clearly aliases Google listing");
  if (locationMatch) reasons.push("Location or service area matches Google address/city");
  if (input.page.email) reasons.push(`Public email visible on page (${input.page.email})`);
  if (
    input.page.intro &&
    (/plumb|bathroom|heat|boiler|tiling|renovation/i.test(input.page.intro) ||
      /bristol|kingswood|swansea|bath/i.test(input.page.intro))
  ) {
    reasons.push("Intro text matches trade and local area");
  }
  if (input.page.service_hints.length >= 1 && (nameMatch || locationMatch)) {
    reasons.push(`Service hints match trade: ${input.page.service_hints.join(", ")}`);
  }

  const signalCount =
    Number(phoneMatch) + Number(nameMatch) + Number(locationMatch) + Number(Boolean(input.page.email));

  let confidence: FacebookConfidence = "low";
  if (phoneMatch && (nameMatch || locationMatch)) confidence = "high";
  else if (nameMatch && locationMatch) confidence = "medium";
  else if (phoneMatch && nameMatch) confidence = "high";
  else if (signalCount >= 2) confidence = "medium";

  const verified = signalCount >= 2 && confidence !== "low";

  return {
    facebook_verified: verified,
    facebook_confidence: confidence,
    facebook_verification_reasons: reasons,
    facebook_source_url: input.page.page_url,
    facebook_phone_match: phoneMatch,
    facebook_name_match: nameMatch,
    facebook_location_match: locationMatch,
  };
}

async function imageHash(buffer: Buffer): Promise<string> {
  const thumb = await sharp(buffer).resize(32, 32, { fit: "cover" }).greyscale().raw().toBuffer();
  return crypto.createHash("sha256").update(thumb).digest("hex");
}

async function downloadImageToWebp(
  sourceUrl: string,
  outPath: string,
  minWidth: number,
  referer = "https://www.facebook.com/"
): Promise<{ width: number; height: number; hash: string } | null> {
  const res = await fetch(sourceUrl, {
    headers: {
      "User-Agent": USER_AGENT,
      Referer: referer,
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(25000),
    redirect: "follow",
  });
  if (!res.ok) return null;
  const raw = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(raw).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (w < minWidth) return null;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(raw).webp({ quality: 85 }).toFile(outPath);
  const hash = await imageHash(raw);
  const outMeta = await sharp(outPath).metadata();
  return { width: outMeta.width ?? w, height: outMeta.height ?? h, hash };
}

export async function downloadVerifiedFacebookAssets(input: {
  slug: string;
  briefDir: string;
  page: FacebookPageData;
  verification: FacebookVerification;
  existingHashes?: Set<string>;
  googlePhotoCount?: number;
}): Promise<FacebookBriefRecord> {
  const imagesDir = path.join(input.briefDir, "images");
  const facebookDir = path.join(imagesDir, "facebook");
  const logoDir = path.join(imagesDir, "logo");
  fs.mkdirSync(facebookDir, { recursive: true });

  const seen = new Set(input.existingHashes ?? []);
  const assets: FacebookAssetMeta[] = [];
  let logoPath: string | null = null;
  let logoPalette: string[] = [];

  if (!input.verification.facebook_verified) {
    return {
      url: input.page.page_url,
      verified: false,
      confidence: input.verification.facebook_confidence,
      verification_reasons: input.verification.facebook_verification_reasons,
      phone_match: input.verification.facebook_phone_match,
      name_match: input.verification.facebook_name_match,
      location_match: input.verification.facebook_location_match,
      status: input.page.facebook_status,
      needs_manual_review: true,
      logo_path: null,
      logo_source: null,
      logo_palette: [],
      assets: [],
      photos_found: input.page.photo_urls.length,
      photos_selected: 0,
      evidence: input.page.raw_evidence,
    };
  }

  let profileUrl = input.page.profile_image_url;
  if (!profileUrl) {
    const meta = await fetchFacebookMetaHttp(input.page.page_url);
    profileUrl = meta.profile_image_url ?? null;
  }

  if (profileUrl) {
    const logoOut = path.join(logoDir, "logo.webp");
    const logoDl = await downloadFacebookImageWithRetry({
      sourceUrl: profileUrl,
      outPath: logoOut,
      minWidth: 64,
      refererPageUrl: input.page.page_url,
    });
    if (logoDl && !seen.has(logoDl.hash)) {
      seen.add(logoDl.hash);
      logoPath = "images/logo/logo.webp";
      const palette = await extractPalette([logoOut]);
      logoPalette = [palette.accent, palette.foreground, palette.background];
      assets.push({
        local: logoPath,
        source_url: logoDl.source_url,
        source_type: "facebook_logo",
        width: logoDl.width,
        height: logoDl.height,
        hash: logoDl.hash,
        cluster_id: null,
        selected: true,
        selection_reason: `Verified Facebook profile image (${logoDl.method})`,
        classification: "logo_or_brand",
      });
    }
  }

  const photoUrls = uniqueImageUrls([
    ...input.page.photo_urls,
    ...input.page.post_image_urls,
  ]).slice(0, 18);

  const graphConfig = getMetaGraphConfig();
  let graphEvidence: FacebookGraphEvidence = {
    attempted: false,
    success: false,
    page_id: null,
    photos_found: 0,
    photos_downloaded: 0,
    largest_width: null,
    largest_height: null,
    failure_reason: graphConfig.configured ? null : "META_GRAPH_API_TOKEN not configured",
    permission_required: false,
  };

  let graphGalleryAssets: FacebookAssetMeta[] = [];
  if (graphConfig.configured) {
    const graphDl = await downloadFacebookGraphPhotos({
      pageUrl: input.page.page_url,
      outDir: facebookDir,
      config: graphConfig,
      existingHashes: seen,
      maxPhotos: 18,
      minWidth: MIN_FACEBOOK_GALLERY_WIDTH,
    });
    graphEvidence = graphDl.evidence;
    graphGalleryAssets = graphDl.assets;
    if (graphGalleryAssets.length) {
      for (const a of graphGalleryAssets) {
        assets.push(a);
      }
    }
  }

  const highResGraphCount = graphGalleryAssets.filter((a) => a.width >= MIN_FACEBOOK_GALLERY_WIDTH).length;

  const apifyConfig = getApifyConfig();
  let apifyEvidence: FacebookApifyEvidence = {
    attempted: false,
    success: false,
    actor: null,
    photos_found: 0,
    photos_downloaded: 0,
    largest_width: null,
    largest_height: null,
    failure_reason: apifyConfig.configured ? null : "APIFY_TOKEN not configured",
    cost_estimate: null,
    requires_login: false,
    via_mcp: false,
  };
  let apifyGalleryAssets: FacebookAssetMeta[] = [];

  if (highResGraphCount === 0 && apifyConfig.configured) {
    const apifyDl = await downloadApifyFacebookImages(input.slug, input.page.page_url, {
      outDir: facebookDir,
      existingHashes: seen,
      maxPosts: 20,
      minWidth: MIN_FACEBOOK_GALLERY_WIDTH,
    });
    apifyEvidence = apifyDl.evidence;
    apifyGalleryAssets = apifyDl.assets;
    for (const a of apifyGalleryAssets) {
      assets.push(a);
    }
  }

  const highResApifyCount = apifyGalleryAssets.filter((a) => a.width >= MIN_FACEBOOK_GALLERY_WIDTH).length;
  let batchStats = {
    images_found: photoUrls.length,
    images_attempted: 0,
    images_downloaded: 0,
    images_rejected: 0,
    failures: [] as { url: string; reason: string }[],
  };

  if (highResGraphCount === 0 && highResApifyCount === 0) {
    const batch = await downloadFacebookImagesBatch({
      urls: photoUrls,
      outDir: facebookDir,
      minWidth: 200,
      refererPageUrl: input.page.page_url,
      maxPhotos: 18,
      seenHashes: seen,
    });
    batchStats = batch.stats;

    let seq = assets.filter((a) => a.source_type !== "facebook_logo").length + 1;
    for (const dl of batch.downloads) {
      assets.push({
        local: `images/facebook/${String(seq).padStart(2, "0")}-facebook.webp`,
        source_url: dl.source_url,
        source_type: "facebook_photo",
        width: dl.width,
        height: dl.height,
        hash: dl.hash,
        cluster_id: null,
        selected: false,
        selection_reason: `Downloaded via ${dl.method} (public HTML/CDN)`,
        classification: "completed_project",
      });
      seq++;
    }
  }

  const mediaQuality = assessFacebookMediaQuality(assets);
  const evidenceNotes = [
    ...input.page.raw_evidence,
    formatGraphStatusForLog(graphEvidence, graphConfig.configured),
    formatApifyStatusForLog(apifyEvidence, apifyConfig.configured),
  ];
  if (mediaQuality.facebook_media_quality === "LOW_RES_ONLY") {
    evidenceNotes.push("LOW_RES_FACEBOOK_ONLY: public thumbnails only, manual asset review recommended");
  }
  if (isApifyHighResAvailable(apifyEvidence.largest_width)) {
    evidenceNotes.push("APIFY_HIGH_RES_AVAILABLE");
  }

  return {
    url: input.page.page_url,
    verified: true,
    confidence: input.verification.facebook_confidence,
    verification_reasons: input.verification.facebook_verification_reasons,
    phone_match: input.verification.facebook_phone_match,
    name_match: input.verification.facebook_name_match,
    location_match: input.verification.facebook_location_match,
    status: input.page.facebook_status,
    needs_manual_review:
      input.page.facebook_needs_manual_review || mediaQuality.manual_asset_review_recommended,
    logo_path: logoPath,
    logo_source: logoPath ? "facebook" : null,
    logo_palette: logoPalette,
    assets,
    photos_found: Math.max(batchStats.images_found, graphEvidence.photos_found, apifyEvidence.photos_found),
    photos_attempted: batchStats.images_attempted,
    photos_downloaded: batchStats.images_downloaded + graphEvidence.photos_downloaded + apifyEvidence.photos_downloaded,
    photos_rejected: batchStats.images_rejected,
    photo_download_failures: batchStats.failures,
    photos_selected: assets.filter((a) => a.source_type !== "facebook_logo").length,
    evidence: evidenceNotes,
    graph: graphEvidence,
    apify: apifyEvidence,
    facebook_media_quality: mediaQuality.facebook_media_quality,
    manual_asset_review_recommended: mediaQuality.manual_asset_review_recommended,
  };
}

export async function discoverFacebookForLead(input: {
  businessName: string;
  googlePhone: string | null;
  googleAddress: string | null;
  googleMapsUrl?: string | null;
  town?: string | null;
  websiteUrl?: string | null;
  manualUrl?: string | null;
  ddgSearch?: (query: string, limit: number) => Promise<string[]>;
}): Promise<{ page: FacebookPageData | null; verification: FacebookVerification | null }> {
  const candidates = new Set<string>();
  if (input.manualUrl && isFacebookPageUrl(input.manualUrl)) {
    candidates.add(normalizeFacebookPageUrl(input.manualUrl));
  }
  if (input.websiteUrl && isFacebookPageUrl(input.websiteUrl)) {
    candidates.add(normalizeFacebookPageUrl(input.websiteUrl));
  }
  if (input.ddgSearch) {
    const q = `${input.businessName} ${input.town ?? ""} Facebook`.trim();
    for (const link of await input.ddgSearch(q, 8)) {
      if (isFacebookPageUrl(link)) candidates.add(normalizeFacebookPageUrl(link));
    }
  }

  if (!candidates.size) {
    return { page: null, verification: null };
  }

  let best: { page: FacebookPageData; verification: FacebookVerification } | null = null;

  for (const url of candidates) {
    const page = await loadFacebookPageData(url);
    if (page.facebook_status === "BLOCKED_OR_LOGIN_REQUIRED" && !page.profile_image_url) continue;
    const verification = verifyFacebookPageForLead({
      businessName: input.businessName,
      googlePhone: input.googlePhone,
      googleAddress: input.googleAddress,
      googleMapsUrl: input.googleMapsUrl,
      town: input.town,
      page,
    });
    if (!best || (verification.facebook_verified && !best.verification.facebook_verified)) {
      best = { page, verification };
    } else if (
      verification.facebook_confidence === "high" &&
      best.verification.facebook_confidence !== "high"
    ) {
      best = { page, verification };
    }
  }

  return best ?? { page: null, verification: null };
}
