import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  extractGalleryImageUrls,
  extractOpenGraph,
  extractTitle,
  extractUkPhones,
} from "./html_extract.js";
import { GALLERY_MIN_WIDTH } from "./image_priority.js";
import { namesMatch } from "./facebook_source.js";
import { buildSearchQuery, getSourceById } from "./source_registry.js";
import { verifySource } from "./source_verification.js";
import { lightweightFetch } from "./website_discovery.js";

export type DirectoryProbeStatus =
  | "FOUND_VERIFIED"
  | "FOUND_UNVERIFIED"
  | "NOT_FOUND"
  | "BLOCKED_OR_MANUAL_REVIEW";

export interface DirectoryProbeResult {
  platform: string;
  candidate_url: string | null;
  status: DirectoryProbeStatus;
  confidence: "high" | "medium" | "low" | "rejected";
  title: string | null;
  rating: string | null;
  review_count: string | null;
  phone_visible: boolean;
  verification_reasons: string[];
  note: string;
  login_required?: boolean;
  image_probe?: DirectoryImageProbeSummary;
}

export interface DirectoryImageCandidate {
  url: string;
  width: number;
  height: number;
  downloaded: boolean;
  local: string | null;
  failure_reason: string | null;
}

export interface DirectoryImageProbeSummary {
  profile_url: string;
  verified_match_confidence: DirectoryProbeResult["confidence"];
  photos_found: number;
  photos_downloaded: number;
  largest_width: number;
  largest_height: number;
  failure_reason: string | null;
  login_required: boolean;
  safe_for_draft_design: boolean;
  candidates: DirectoryImageCandidate[];
}

const DIRECTORY_PLATFORMS = [
  "checkatrade",
  "trustatrader",
  "yell",
  "mybuilder",
  "rated_people",
  "houzz",
  "bark",
  "nextdoor",
] as const;

const USER_AGENT = "Mozilla/5.0 (compatible; WebForTradesProspector/1.0)";

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function buildCandidateUrls(platform: string, businessName: string, city: string): string[] {
  const slug = slugifyName(businessName);
  const citySlug = slugifyName(city);
  const urls: string[] = [];

  if (platform === "checkatrade") {
    urls.push(`https://www.checkatrade.com/trades/${slug}`);
    urls.push(`https://www.checkatrade.com/trades/${slug}-${citySlug}`);
  }
  if (platform === "yell") {
    urls.push(`https://www.yell.com/biz/${slug}-${citySlug}/`);
    urls.push(`https://www.yell.com/s/plumbers-${citySlug}.html`);
  }
  if (platform === "trustatrader") {
    urls.push(`https://www.trustatrader.com/traders/${slug}`);
  }
  if (platform === "mybuilder") {
    urls.push(`https://www.mybuilder.com/profile/${slug}`);
  }
  if (platform === "rated_people") {
    urls.push(`https://www.ratedpeople.com/profile/${slug}`);
  }
  if (platform === "houzz") {
    urls.push(`https://www.houzz.co.uk/professionals/${slug}`);
  }
  if (platform === "bark") {
    urls.push(`https://www.bark.com/en/gb/company/${slug}/`);
  }
  if (platform === "nextdoor") {
    urls.push(`https://nextdoor.co.uk/pages/${slug}/`);
  }

  return urls;
}

function loginWallDetected(html: string): boolean {
  const blob = html.slice(0, 12000).toLowerCase();
  return (
    blob.includes("sign in to continue") ||
    blob.includes("log in to continue") ||
    blob.includes("create an account") ||
    blob.includes("members only")
  );
}

async function probeImageDimensions(url: string): Promise<{ width: number; height: number } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const raw = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(raw).metadata();
    return { width: meta.width ?? 0, height: meta.height ?? 0 };
  } catch {
    return null;
  }
}

export async function probeDirectoryImages(input: {
  slug: string;
  briefDir: string;
  probe: DirectoryProbeResult;
  maxImages?: number;
  minWidth?: number;
  writeFiles?: boolean;
}): Promise<DirectoryImageProbeSummary | null> {
  const url = input.probe.candidate_url;
  if (!url || input.probe.status === "NOT_FOUND") return null;

  const base: DirectoryImageProbeSummary = {
    profile_url: url,
    verified_match_confidence: input.probe.confidence,
    photos_found: 0,
    photos_downloaded: 0,
    largest_width: 0,
    largest_height: 0,
    failure_reason: null,
    login_required: false,
    safe_for_draft_design: false,
    candidates: [],
  };

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    const html = res.ok ? await res.text() : "";

    if (!res.ok || isBlocked(html, res.status)) {
      return {
        ...base,
        failure_reason: res.ok ? "bot_or_captcha_block" : `http_${res.status}`,
        login_required: loginWallDetected(html),
      };
    }

    if (loginWallDetected(html)) {
      return { ...base, failure_reason: "login_required", login_required: true };
    }

    const og = extractOpenGraph(html);
    const fromHtml = extractGalleryImageUrls(html, res.url || url);
    const imageUrls = [...new Set([...(og.image ? [og.image] : []), ...fromHtml])].slice(
      0,
      input.maxImages ?? 12
    );

    base.photos_found = imageUrls.length;
    if (!imageUrls.length) {
      return { ...base, failure_reason: "no_public_images_found" };
    }

    const minWidth = input.minWidth ?? GALLERY_MIN_WIDTH;
    const outDir = path.join(input.briefDir, "images", "directory", input.probe.platform);
    if (input.writeFiles !== false) fs.mkdirSync(outDir, { recursive: true });

    let seq = 1;
    for (const imageUrl of imageUrls) {
      const dims = await probeImageDimensions(imageUrl);
      const width = dims?.width ?? 0;
      const height = dims?.height ?? 0;
      if (width > base.largest_width) {
        base.largest_width = width;
        base.largest_height = height;
      }

      const candidate: DirectoryImageCandidate = {
        url: imageUrl,
        width,
        height,
        downloaded: false,
        local: null,
        failure_reason: width < minWidth ? `under_${minWidth}px` : null,
      };

      if (width >= minWidth && input.writeFiles !== false) {
        try {
          const resImg = await fetch(imageUrl, {
            headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
            signal: AbortSignal.timeout(20000),
          });
          if (resImg.ok) {
            const raw = Buffer.from(await resImg.arrayBuffer());
            const fname = `${String(seq).padStart(2, "0")}-${input.probe.platform}.webp`;
            const outPath = path.join(outDir, fname);
            await sharp(raw).webp({ quality: 85 }).toFile(outPath);
            candidate.downloaded = true;
            candidate.local = `images/directory/${input.probe.platform}/${fname}`;
            base.photos_downloaded++;
            seq++;
          } else {
            candidate.failure_reason = `download_http_${resImg.status}`;
          }
        } catch (e) {
          candidate.failure_reason = e instanceof Error ? e.message : "download_failed";
        }
      }

      base.candidates.push(candidate);
    }

    base.safe_for_draft_design =
      input.probe.status === "FOUND_VERIFIED" &&
      base.photos_downloaded > 0 &&
      base.largest_width >= minWidth;

    if (!base.photos_downloaded && base.photos_found > 0) {
      base.failure_reason = base.largest_width
        ? `images_too_small_max_${base.largest_width}px`
        : "image_probe_failed";
    }

    return base;
  } catch (e) {
    return {
      ...base,
      failure_reason: e instanceof Error ? e.message : "probe_error",
    };
  }
}

export async function probeDirectoryImagesForLead(input: {
  slug: string;
  briefDir: string;
  probes: DirectoryProbeResult[];
  writeFiles?: boolean;
}): Promise<DirectoryProbeResult[]> {
  const updated: DirectoryProbeResult[] = [];
  for (const probe of input.probes) {
    if (probe.status !== "FOUND_VERIFIED" && probe.status !== "FOUND_UNVERIFIED") {
      updated.push(probe);
      continue;
    }
    const image_probe = await probeDirectoryImages({
      slug: input.slug,
      briefDir: input.briefDir,
      probe,
      writeFiles: input.writeFiles,
    });
    updated.push({
      ...probe,
      login_required: image_probe?.login_required ?? probe.login_required,
      image_probe: image_probe ?? undefined,
    });
  }
  return updated;
}

function extractRatingFromHtml(html: string): { rating: string | null; review_count: string | null } {
  const rating =
    html.match(/(\d+(?:\.\d+)?)\s*(?:\/\s*5|out of 5|stars?)/i)?.[1] ??
    html.match(/rating["']?\s*[:>]\s*(\d+(?:\.\d+)?)/i)?.[1] ??
    null;
  const review_count =
    html.match(/(\d+)\s+reviews?/i)?.[1] ??
    html.match(/review[s-]?count["']?\s*[:>]\s*(\d+)/i)?.[1] ??
    null;
  return { rating, review_count };
}

function isBlocked(html: string, statusCode: number | null): boolean {
  if (statusCode === 403 || statusCode === 401) return true;
  const blob = html.slice(0, 8000).toLowerCase();
  return (
    blob.includes("captcha") ||
    blob.includes("access denied") ||
    blob.includes("just a moment") ||
    blob.includes("cloudflare")
  );
}

export async function probeDirectoryUrl(input: {
  platform: string;
  url: string;
  businessName: string;
  googlePhone: string | null;
  googleAddress: string | null;
  city: string;
}): Promise<DirectoryProbeResult> {
  const base: DirectoryProbeResult = {
    platform: input.platform,
    candidate_url: input.url,
    status: "NOT_FOUND",
    confidence: "rejected",
    title: null,
    rating: null,
    review_count: null,
    phone_visible: false,
    verification_reasons: [],
    note: "",
  };

  try {
    const res = await fetch(input.url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    const html = res.ok ? await res.text() : "";

    if (!res.ok || isBlocked(html, res.status)) {
      return {
        ...base,
        status: "BLOCKED_OR_MANUAL_REVIEW",
        note: res.ok ? "bot_or_captcha_block" : `http_${res.status}`,
      };
    }

    if (res.status === 404 || /page not found|404/i.test(html.slice(0, 2000))) {
      return { ...base, note: "profile_not_found" };
    }

    const title = extractTitle(html) ?? extractOpenGraph(html).title;
    const bodyText = html.replace(/<[^>]+>/g, " ").slice(0, 12000);
    const phones = extractUkPhones(bodyText);
    const phone_visible = phones.some(
      (p) => input.googlePhone && p.replace(/\D/g, "") === input.googlePhone.replace(/\D/g, "")
    );
    const nameMatch = title ? namesMatch(title, input.businessName) : namesMatch(bodyText.slice(0, 500), input.businessName);
    const { rating, review_count } = extractRatingFromHtml(bodyText);

    const verification = verifySource({
      platform: input.platform,
      url: res.url || input.url,
      business_name: input.businessName,
      google_phone: input.googlePhone,
      google_email: null,
      google_address: input.googleAddress,
      town: input.city,
      extracted: {
        business_name: title,
        phone: phone_visible ? input.googlePhone : null,
      },
    });

    const status: DirectoryProbeStatus =
      verification.verified ? "FOUND_VERIFIED" : nameMatch ? "FOUND_UNVERIFIED" : "NOT_FOUND";

    return {
      platform: input.platform,
      candidate_url: res.url || input.url,
      status,
      confidence: verification.confidence,
      title,
      rating,
      review_count,
      phone_visible,
      verification_reasons: verification.verification_reasons,
      note: status === "NOT_FOUND" ? "name_match_failed" : verification.rejected_reason ?? "probe_ok",
    };
  } catch (e) {
    return {
      ...base,
      status: "BLOCKED_OR_MANUAL_REVIEW",
      note: e instanceof Error ? e.message : "fetch_error",
    };
  }
}

export async function probeDirectoriesForLead(input: {
  businessName: string;
  googlePhone: string | null;
  googleAddress: string | null;
  city: string;
  existingSourceUrls?: string[];
}): Promise<DirectoryProbeResult[]> {
  const platforms = [...DIRECTORY_PLATFORMS];
  const results: DirectoryProbeResult[] = [];
  const tried = new Set<string>();

  for (const url of input.existingSourceUrls ?? []) {
    const lower = url.toLowerCase();
    for (const platform of platforms) {
      if (lower.includes(platform.replace("_", "")) || (platform === "yell" && lower.includes("yell.com"))) {
        if (tried.has(url)) continue;
        tried.add(url);
        results.push(
          await probeDirectoryUrl({
            platform,
            url,
            businessName: input.businessName,
            googlePhone: input.googlePhone,
            googleAddress: input.googleAddress,
            city: input.city,
          })
        );
      }
    }
  }

  for (const platform of platforms) {
    const def = getSourceById(platform);
    const searchNote = def ? buildSearchQuery(def, input.businessName, input.city) : "";
    const candidates = buildCandidateUrls(platform, input.businessName, input.city);
    let best: DirectoryProbeResult | null = null;

    for (const url of candidates) {
      if (tried.has(url)) continue;
      tried.add(url);
      const probe = await probeDirectoryUrl({
        platform,
        url,
        businessName: input.businessName,
        googlePhone: input.googlePhone,
        googleAddress: input.googleAddress,
        city: input.city,
      });
      if (probe.status === "FOUND_VERIFIED") {
        best = probe;
        break;
      }
      if (probe.status === "FOUND_UNVERIFIED" && !best) best = probe;
    }

    results.push(
      best ?? {
        platform,
        candidate_url: candidates[0] ?? null,
        status: "NOT_FOUND",
        confidence: "rejected",
        title: null,
        rating: null,
        review_count: null,
        phone_visible: false,
        verification_reasons: [],
        note: searchNote ? `search_deferred: ${searchNote}` : "no_public_profile_found",
      }
    );
  }

  return results;
}
