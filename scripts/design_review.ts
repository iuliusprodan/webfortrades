import fs from "node:fs";
import path from "node:path";
import { loadCreativeBrief } from "./creative_brief.js";
import { addressCityFromGoogle } from "./location_validation.js";
import { servicesOverlapScore } from "./business_services.js";

export interface DesignFingerprint {
  slug: string;
  paletteAccent: string | null;
  fontPairKey: string | null;
  layoutFamily: string | null;
  heroHeadline: string | null;
  heroHeadlineKey: string | null;
  services: string[];
  sectionOrder: string[];
}

export interface UniquenessIssue {
  severity: "error" | "warn";
  message: string;
}

export function loadDesignFingerprint(root: string, slug: string): DesignFingerprint | null {
  const dsPath = path.join(root, "sites", slug, "data", "design-system.json");
  const briefPath = path.join(root, "sites", slug, "data", "brief.json");
  if (!fs.existsSync(dsPath) || !fs.existsSync(briefPath)) return null;

  const ds = JSON.parse(fs.readFileSync(dsPath, "utf8")) as {
    colors?: { accent?: string };
    fontPairKey?: string;
    layoutFamily?: string;
    heroHeadline?: string;
    heroHeadlineKey?: string;
  };
  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as { services?: string[] };

  return {
    slug,
    paletteAccent: ds.colors?.accent ?? null,
    fontPairKey: ds.fontPairKey ?? null,
    layoutFamily: ds.layoutFamily ?? null,
    heroHeadline: ds.heroHeadline ?? null,
    heroHeadlineKey: ds.heroHeadlineKey ?? null,
    services: brief.services ?? [],
    sectionOrder: [
      "hero",
      "stats",
      "owner-note",
      "gallery",
      "services",
      "about",
      "reviews",
      "service-area",
      "faq",
      "contact",
    ],
  };
}

export function compareFingerprints(a: DesignFingerprint, b: DesignFingerprint): UniquenessIssue[] {
  const issues: UniquenessIssue[] = [];
  if (a.paletteAccent && b.paletteAccent && a.paletteAccent === b.paletteAccent) {
    issues.push({
      severity: "error",
      message: `${a.slug} and ${b.slug} share the same accent colour (${a.paletteAccent})`,
    });
  }
  if (a.fontPairKey && b.fontPairKey && a.fontPairKey === b.fontPairKey) {
    issues.push({
      severity: "error",
      message: `${a.slug} and ${b.slug} share the same font pair (${a.fontPairKey})`,
    });
  }
  if (a.layoutFamily && b.layoutFamily && a.layoutFamily === b.layoutFamily) {
    issues.push({
      severity: "warn",
      message: `${a.slug} and ${b.slug} share layout family (${a.layoutFamily})`,
    });
  }
  if (a.heroHeadlineKey && b.heroHeadlineKey && a.heroHeadlineKey === b.heroHeadlineKey) {
    issues.push({
      severity: "error",
      message: `${a.slug} and ${b.slug} share hero headline key (${a.heroHeadlineKey})`,
    });
  }
  const overlap = servicesOverlapScore(a.services, b.services);
  if (overlap >= 0.85 && a.services.length >= 4) {
    issues.push({
      severity: "warn",
      message: `${a.slug} and ${b.slug} have ${Math.round(overlap * 100)}% service list overlap`,
    });
  }
  return issues;
}

export function creativeUniquenessScore(fingerprints: DesignFingerprint[]): number {
  if (fingerprints.length <= 1) return 100;
  let penalties = 0;
  let comparisons = 0;
  for (let i = 0; i < fingerprints.length; i++) {
    for (let j = i + 1; j < fingerprints.length; j++) {
      comparisons++;
      const issues = compareFingerprints(fingerprints[i]!, fingerprints[j]!);
      for (const issue of issues) {
        penalties += issue.severity === "error" ? 25 : 10;
      }
    }
  }
  const maxPenalty = comparisons * 75;
  return Math.max(0, Math.round(100 - (penalties / Math.max(maxPenalty, 1)) * 100));
}

export function runLocationCopyChecks(input: {
  root: string;
  slug: string;
  address: string;
  basedLocation: string | null;
  serviceArea: string[];
  bodyText: string;
  metadataTitle: string;
}): UniquenessIssue[] {
  const issues: UniquenessIssue[] = [];
  const addressCity = addressCityFromGoogle(input.address);
  const basedCity = input.basedLocation?.split(",")[0]?.trim() ?? null;

  if (addressCity && basedCity && addressCity.toLowerCase() !== basedCity.toLowerCase()) {
    issues.push({
      severity: "error",
      message: `Based location (${basedCity}) does not match Google address city (${addressCity})`,
    });
  }

  if (addressCity) {
    const wrongCity = input.serviceArea.find(
      (a) =>
        a.toLowerCase() !== addressCity.toLowerCase() &&
        /bristol|swansea|cardiff|bath|london/i.test(a) &&
        !input.bodyText.toLowerCase().includes(a.toLowerCase())
    );
    if (
      addressCity.toLowerCase() === "swansea" &&
      (input.bodyText.match(/\bBristol\b/g) ?? []).length >= 3
    ) {
      issues.push({
        severity: "error",
        message: "Google address is Swansea but visible copy mentions Bristol repeatedly",
      });
    }
    if (
      addressCity.toLowerCase() === "bristol" &&
      input.metadataTitle.toLowerCase().includes("swansea") &&
      !input.metadataTitle.toLowerCase().includes("bristol")
    ) {
      issues.push({
        severity: "error",
        message: "Metadata location does not match Bristol-based business",
      });
    }
    void wrongCity;
  }

  const badCaptionPatterns = [
    /K&R Construction/i,
    /Cemex/i,
    /No\.\s*\d{2}:/i,
    /Materials/i,
  ];
  for (const re of badCaptionPatterns) {
    if (re.test(input.bodyText)) {
      issues.push({
        severity: "error",
        message: `Gallery or copy contains unsafe caption/location pattern: ${re}`,
      });
    }
  }

  const cb = loadCreativeBrief(input.root, input.slug);
  if (!cb) {
    issues.push({
      severity: "error",
      message: "creative-brief.json missing (required before build)",
    });
  }

  return issues;
}

export function runGalleryDiversityChecks(
  root: string,
  slug: string,
  bodyText: string
): UniquenessIssue[] {
  const issues: UniquenessIssue[] = [];
  const cb = loadCreativeBrief(root, slug);
  if (!cb) return issues;

  const largeCluster = cb.gallery_cluster_notes.some((n) => /: [5-9] image/.test(n));
  if (largeCluster && !cb.risks_or_manual_review_flags.some((r) => /Limited photo/i.test(r))) {
    issues.push({
      severity: "warn",
      message: "Gallery may be dominated by one image cluster",
    });
  }

  if (/same project/i.test(bodyText) && (bodyText.match(/same project/gi) ?? []).length > 3) {
    issues.push({
      severity: "warn",
      message: "Many gallery captions mark same project; check diversity",
    });
  }

  if (cb.facebook_verified && cb.facebook_photos_found > 0 && cb.facebook_photos_selected === 0) {
    issues.push({
      severity: "warn",
      message:
        "Verified Facebook photos exist but none selected for gallery; check Google duplicate issue",
    });
  }

  if (cb.facebook_verified && cb.facebook_logo_found && !cb.facebook_logo_used) {
    issues.push({
      severity: "warn",
      message: "Verified Facebook logo exists but creative brief says it was not used in the site",
    });
  }

  return issues;
}

export function runFacebookBriefChecks(root: string, slug: string): UniquenessIssue[] {
  const issues: UniquenessIssue[] = [];
  const briefPath = path.join(root, "briefs", slug, "brief.json");
  if (!fs.existsSync(briefPath)) return issues;
  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as {
    facebook?: { verified?: boolean; confidence?: string; url?: string | null };
    source_urls?: string[];
  };
  const cb = loadCreativeBrief(root, slug);

  if (brief.facebook?.url && !brief.source_urls?.some((u) => u.includes("facebook.com"))) {
    issues.push({
      severity: "warn",
      message: "Facebook URL missing from brief source_urls provenance list",
    });
  }

  if (brief.facebook?.verified === false && brief.facebook?.confidence === "low") {
    issues.push({
      severity: "warn",
      message: "Low-confidence Facebook page must not be used automatically",
    });
  }

  if (cb?.facebook_verified && !cb.facebook_url) {
    issues.push({
      severity: "error",
      message: "Creative brief marks Facebook verified but has no Facebook URL",
    });
  }

  return issues;
}
