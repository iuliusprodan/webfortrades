import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { briefDir, ROOT } from "./site_config.js";
import type { WebsiteStatus } from "./db.js";
import { isInvalidProspectWebsiteUrl } from "./website_discovery.js";

export type WebsiteUrlIssue =
  | "google_photo_api"
  | "google_image"
  | "google_maps"
  | "social_as_official"
  | "directory_as_official"
  | "empty"
  | "invalid_redirect"
  | "valid";

export interface WebsiteUrlValidation {
  original: string | null;
  issue: WebsiteUrlIssue | null;
  corrected_website_url: string | null;
  corrected_website_status: WebsiteStatus | null;
  note: string;
  moved_to: "source_urls" | "invalid_website_candidates" | null;
}

const SOCIAL_HOSTS = ["facebook.com", "fb.com", "instagram.com", "youtube.com", "tiktok.com", "twitter.com", "x.com", "linkedin.com"];
const DIRECTORY_HOSTS = [
  "checkatrade.com",
  "trustatrader.com",
  "trust-a-trader.com",
  "yell.com",
  "yell.co.uk",
  "mybuilder.com",
  "ratedpeople.com",
  "bark.com",
  "houzz.",
  "freeindex.co.uk",
];

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function classifyWebsiteUrl(url: string | null | undefined): WebsiteUrlValidation {
  if (!url?.trim()) {
    return {
      original: url ?? null,
      issue: "empty",
      corrected_website_url: null,
      corrected_website_status: "NO_WEBSITE",
      note: "website_url empty",
      moved_to: null,
    };
  }

  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  const host = hostOf(trimmed);

  if (isInvalidProspectWebsiteUrl(trimmed)) {
    const issue: WebsiteUrlIssue = lower.includes("maps.googleapis.com")
      ? "google_photo_api"
      : lower.includes("googleusercontent.com")
        ? "google_image"
        : lower.includes("maps.google")
          ? "google_maps"
          : "invalid_redirect";
    return {
      original: trimmed,
      issue,
      corrected_website_url: null,
      corrected_website_status: issue === "google_maps" ? "SOCIAL_OR_DIRECTORY_ONLY" : "NO_WEBSITE",
      note: `Invalid website_url: ${issue}`,
      moved_to: "invalid_website_candidates",
    };
  }

  if (SOCIAL_HOSTS.some((d) => host === d || host.endsWith(`.${d}`) || host.includes(d))) {
    return {
      original: trimmed,
      issue: "social_as_official",
      corrected_website_url: null,
      corrected_website_status: "SOCIAL_OR_DIRECTORY_ONLY",
      note: "Social URL stored as website_url - reclassified as SOCIAL_OR_DIRECTORY_ONLY",
      moved_to: "invalid_website_candidates",
    };
  }

  if (DIRECTORY_HOSTS.some((d) => host.includes(d))) {
    return {
      original: trimmed,
      issue: "directory_as_official",
      corrected_website_url: null,
      corrected_website_status: "SOCIAL_OR_DIRECTORY_ONLY",
      note: "Directory URL stored as website_url - reclassified as DIRECTORY_ONLY",
      moved_to: "invalid_website_candidates",
    };
  }

  if (/\/share\//i.test(trimmed) && host.includes("facebook")) {
    return {
      original: trimmed,
      issue: "invalid_redirect",
      corrected_website_url: null,
      corrected_website_status: "SOCIAL_OR_DIRECTORY_ONLY",
      note: "Facebook share redirect stored as website_url",
      moved_to: "invalid_website_candidates",
    };
  }

  return {
    original: trimmed,
    issue: null,
    corrected_website_url: trimmed,
    corrected_website_status: null,
    note: "website_url valid",
    moved_to: null,
  };
}

interface BriefQualityRow {
  slug: string;
  changed: boolean;
  validation: WebsiteUrlValidation;
  notes: string[];
}

export function fixBriefWebsiteUrl(brief: Record<string, unknown>, slug: string): BriefQualityRow {
  const notes: string[] = [];
  const validation = classifyWebsiteUrl(brief.website_url as string | null);
  let changed = false;

  if (validation.issue) {
    const sourceUrls = new Set<string>((brief.source_urls as string[] | undefined) ?? []);
    const invalidCandidates = new Set<string>(
      (brief.invalid_website_candidates as string[] | undefined) ?? []
    );

    if (validation.original) {
      invalidCandidates.add(validation.original);
      sourceUrls.add(validation.original);
    }

    brief.invalid_website_candidates = [...invalidCandidates];
    brief.source_urls = [...sourceUrls];
    brief.website_url = validation.corrected_website_url;
    if (validation.corrected_website_status) {
      brief.website_status = validation.corrected_website_status;
    }
    brief.website_url_validation = {
      validated_at: new Date().toISOString(),
      issue: validation.issue,
      note: validation.note,
      previous_url: validation.original,
    };
    if (!brief.website_check_notes) {
      brief.website_check_notes = validation.note;
    } else if (!String(brief.website_check_notes).includes(validation.note)) {
      brief.website_check_notes = `${brief.website_check_notes}; ${validation.note}`;
    }
    notes.push(validation.note);
    changed = true;
  } else if (!brief.website_url_validation) {
    brief.website_url_validation = {
      validated_at: new Date().toISOString(),
      issue: null,
      note: "website_url valid",
      previous_url: validation.original,
    };
    changed = true;
  }

  return { slug, changed, validation, notes };
}

const KNOWN_SLUGS = [
  "bristol-plumbing-co",
  "greens-precise-plumbing-heating-ltd",
  "corvell-ltd",
  "bbr-plumbing-heating-bristol-bristol-boiler-repairs",
  "jt-plumbing",
  "nfs-plumbing-heating",
];

export function runBriefQuality(slugs: string[]): BriefQualityRow[] {
  const results: BriefQualityRow[] = [];
  for (const slug of slugs) {
    const briefPath = path.join(briefDir(slug), "brief.json");
    if (!fs.existsSync(briefPath)) continue;
    const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as Record<string, unknown>;
    const row = fixBriefWebsiteUrl(brief, slug);
    results.push(row);
    if (row.changed) {
      fs.writeFileSync(briefPath, JSON.stringify(brief, null, 2) + "\n");
    }
  }
  return results;
}

function parseArgs(): { allKnown?: boolean; slug?: string } {
  const args = process.argv.slice(2);
  const opts: { allKnown?: boolean; slug?: string } = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--all-known") opts.allKnown = true;
    else if (args[i] === "--slug" && args[i + 1]) opts.slug = args[++i];
  }
  return opts;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const opts = parseArgs();
  const slugs = opts.allKnown ? KNOWN_SLUGS : opts.slug ? [opts.slug] : [];
  if (!slugs.length) {
    console.error("Usage: npm run brief:quality -- --all-known | --slug <slug>");
    process.exit(1);
  }
  const results = runBriefQuality(slugs);
  console.log(`Brief quality: ${results.length} checked, ${results.filter((r) => r.changed).length} updated`);
  for (const r of results) {
    console.log(
      `  ${r.slug}: ${r.validation.issue ?? "ok"} ${r.changed ? "(fixed)" : ""} ${r.validation.note}`
    );
  }
}

export { KNOWN_SLUGS };
