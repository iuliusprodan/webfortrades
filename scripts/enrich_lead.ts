import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { briefDir } from "./site_config.js";
import { getLeadBySlug, updateLead, type WebsiteStatus } from "./db.js";
import {
  discoverFacebookForLead,
  downloadVerifiedFacebookAssets,
  loadFacebookPageData,
  normalizeFacebookPageUrl,
  verifyFacebookPageForLead,
  type FacebookBriefRecord,
} from "./facebook_source.js";
import { evaluateLeadValidity, isEmailDomainBrokenOrInaccessible, type LeadValidityResult } from "./lead_validity.js";
import {
  automaticSources,
  buildSearchQuery,
  manualReviewSources,
  SOURCE_REGISTRY,
} from "./source_registry.js";
import {
  buildSourceEvidence,
  saveSourceEvidence,
  type EnrichedSourceEvidence,
} from "./source_evidence.js";
import {
  summarizeSourceConfidence,
  verifySource,
  type SourceVerificationResult,
} from "./source_verification.js";
import {
  discoverBestWebsite,
  discoverWebsiteFromEmailDomain,
  extractDomainFromEmail,
  type WebsiteDiscoveryResult,
} from "./website_discovery.js";
import { crawlWebsite } from "./website_crawler.js";
import { discoverLogos } from "./logo_discovery.js";
import { discoverPhotos } from "./photo_discovery.js";
import { fixBriefWebsiteUrl } from "./brief_data_quality.js";
import { probeDirectoriesForLead, probeDirectoryImagesForLead } from "./directory_probe.js";
import { validateBusinessLocation } from "./location_validation.js";
import { evaluateSourceQuality, type SourceQualityResult } from "./source_quality.js";
import { scanManualAssets, ensureManualAssetReadme } from "./manual_assets.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface EnrichOptions {
  slug: string;
  facebookUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  force?: boolean;
  noBuild?: boolean;
}

interface BriefLike {
  business_name: string;
  phone: string | null;
  email: string | null;
  address: string;
  website_url?: string | null;
  website_status?: WebsiteStatus | null;
  website_check_notes?: string | null;
  google_maps_url?: string | null;
  photos?: { local: string; source_url?: string; source_type?: string; classification?: string; selected?: boolean }[];
  social?: { facebook?: string | null; instagram?: string | null };
  facebook?: FacebookBriefRecord;
  brand?: { colours: string[]; logo_url: string | null; logo_local?: string | null };
  source_urls?: string[];
  notes?: string[];
  contactability_status?: string;
  location_validation_status?: string;
  prospect_region?: string | null;
  lead_validity?: LeadValidityResult;
  source_quality?: SourceQualityResult;
  directory_probes?: import("./directory_probe.js").DirectoryProbeResult[];
  enrichment?: {
    enriched_at: string;
    email_domain_checked: boolean;
    website_discovery_run: boolean;
  };
}

function parseArgs(): EnrichOptions {
  const args = process.argv.slice(2);
  const opts: EnrichOptions = { slug: "", noBuild: true };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) opts.slug = args[++i];
    else if (args[i] === "--facebook-url" && args[i + 1]) opts.facebookUrl = args[++i];
    else if (args[i] === "--instagram-url" && args[i + 1]) opts.instagramUrl = args[++i];
    else if (args[i] === "--website-url" && args[i + 1]) opts.websiteUrl = args[++i];
    else if (args[i] === "--force") opts.force = true;
    else if (args[i] === "--no-build") opts.noBuild = true;
  }
  return opts;
}

function cityFromAddress(address: string): string {
  const parts = address.split(",").map((p) => p.trim());
  return parts.slice(-2, -1)[0] ?? parts[0] ?? "";
}

function countGalleryPhotos(brief: BriefLike): number {
  return (brief.photos ?? []).filter((p) => p.classification !== "logo_or_brand").length;
}

function logoFound(brief: BriefLike): boolean {
  return Boolean(
    brief.facebook?.logo_path ||
      brief.brand?.logo_local ||
      (brief.photos ?? []).some((p) => p.classification === "logo_or_brand")
  );
}

export async function enrichLead(opts: EnrichOptions): Promise<{
  brief: BriefLike;
  evidence: EnrichedSourceEvidence;
  validity: LeadValidityResult;
  sourceQuality: SourceQualityResult;
}> {
  const dir = briefDir(opts.slug);
  const briefPath = path.join(dir, "brief.json");
  if (!fs.existsSync(briefPath)) {
    throw new Error(`Missing brief.json for ${opts.slug}`);
  }

  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as BriefLike;
  const urlFix = fixBriefWebsiteUrl(brief as Record<string, unknown>, opts.slug);
  if (urlFix.changed) {
    fs.writeFileSync(briefPath, JSON.stringify(brief, null, 2) + "\n");
  }

  const lead = getLeadBySlug(opts.slug);
  const prospectRegion = lead?.region ?? brief.prospect_region ?? null;
  brief.prospect_region = prospectRegion;

  const city = cityFromAddress(brief.address);
  const sourceUrls = new Set(brief.source_urls ?? []);
  const notes = [...(brief.notes ?? [])];

  const locationValidation = validateBusinessLocation({
    address: brief.address,
    prospectRegion,
  });
  brief.location_validation_status = locationValidation.status;
  if (locationValidation.mismatchReason) {
    notes.push(locationValidation.mismatchReason);
  }

  // Registry: log attempted automatic vs manual sources
  const attemptedFromRegistry = [
    ...automaticSources().map((s) => ({
      platform: s.id,
      status: "not_attempted" as const,
      search_query: buildSearchQuery(s, brief.business_name, city),
      reason: "Automated search not run in enrich pass unless URL provided",
    })),
    ...manualReviewSources().map((s) => ({
      platform: s.id,
      status: "not_attempted" as const,
      search_query: buildSearchQuery(s, brief.business_name, city),
      reason: s.requires_login ? "Requires login - manual review only" : "Manual search required",
    })),
  ];

  // Facebook enrichment
  let facebookRecord = brief.facebook;
  let facebookPage = null;
  const manualFb = opts.facebookUrl ?? brief.social?.facebook ?? null;
  const googleWebsite =
    opts.websiteUrl ??
    (brief.website_url && !brief.website_url.includes("facebook.com") ? brief.website_url : null);

  const fbDiscovery = await discoverFacebookForLead({
    businessName: brief.business_name,
    googlePhone: brief.phone,
    googleAddress: brief.address,
    googleMapsUrl: brief.google_maps_url,
    town: city,
    websiteUrl: brief.website_url,
    manualUrl: manualFb,
  });

  if (manualFb && !fbDiscovery.page) {
    const direct = await loadFacebookPageData(manualFb);
    if (direct.facebook_status !== "NOT_FOUND") {
      const verification = verifyFacebookPageForLead({
        businessName: brief.business_name,
        googlePhone: brief.phone,
        googleAddress: brief.address,
        town: city,
        page: direct,
      });
      facebookPage = direct;
      facebookRecord = await downloadVerifiedFacebookAssets({
        slug: opts.slug,
        briefDir: dir,
        page: direct,
        verification,
      });
    }
  } else if (fbDiscovery.page && fbDiscovery.verification) {
    facebookPage = fbDiscovery.page;
    facebookRecord = await downloadVerifiedFacebookAssets({
      slug: opts.slug,
      briefDir: dir,
      page: fbDiscovery.page,
      verification: fbDiscovery.verification,
    });
  }

  if (facebookRecord?.url) {
    brief.social = { ...brief.social, facebook: facebookRecord.url };
    sourceUrls.add(facebookRecord.url);
    if (facebookRecord.verified) {
      notes.push(`Facebook verified (${facebookRecord.confidence}): ${facebookRecord.verification_reasons.join("; ")}`);
    } else if (facebookRecord.status === "BLOCKED_OR_LOGIN_REQUIRED") {
      notes.push("Facebook blocked or login required - manual review");
    } else {
      notes.push("Facebook page found but not verified automatically");
    }
  }

  // Email from Facebook or brief
  let email = brief.email;
  if (!email && facebookPage?.email) {
    email = facebookPage.email;
    brief.email = email;
    sourceUrls.add(facebookPage.page_url);
    notes.push(`Email found on Facebook: ${email}`);
  }

  // Website discovery
  const emails = [email, facebookPage?.email].filter(Boolean) as string[];
  const discovery = await discoverBestWebsite({
    businessName: brief.business_name,
    googleWebsiteUrl: brief.website_url ?? googleWebsite,
    emails,
  });

  let emailDomainDiscovery: WebsiteDiscoveryResult | null = discovery.email_domain;
  if (email && !emailDomainDiscovery) {
    emailDomainDiscovery = await discoverWebsiteFromEmailDomain(email, brief.business_name);
  }

  const primaryDiscovery = discovery.primary;

  if (emailDomainDiscovery?.domain) {
    notes.push(
      `Email domain checked: ${emailDomainDiscovery.domain} -> ${emailDomainDiscovery.classification}`
    );
    if (emailDomainDiscovery.final_url) sourceUrls.add(emailDomainDiscovery.final_url);
  }

  if (primaryDiscovery && primaryDiscovery.classification === "HAS_REAL_SITE") {
    brief.website_status = "HAS_REAL_SITE";
    brief.website_url = primaryDiscovery.final_url ?? brief.website_url;
    brief.website_check_notes = primaryDiscovery.reason;
    notes.push("Hidden or official website classified as HAS_REAL_SITE");
  } else if (emailDomainDiscovery && emailDomainDiscovery.classification !== "NO_WEBSITE") {
    const emailBroken = isEmailDomainBrokenOrInaccessible(emailDomainDiscovery);
    if (
      emailDomainDiscovery.classification === "BROKEN_OR_BAD_SITE" ||
      emailBroken
    ) {
      brief.website_status = "BROKEN_OR_BAD_SITE";
      brief.website_check_notes = `email_domain: ${emailDomainDiscovery.reason}`;
    } else if (
      emailDomainDiscovery.classification === "REDIRECTS_TO_SOCIAL" ||
      emailDomainDiscovery.classification === "SOCIAL_OR_DIRECTORY_ONLY" ||
      emailDomainDiscovery.classification === "REDIRECTS_TO_DIRECTORY"
    ) {
      brief.website_status = "SOCIAL_OR_DIRECTORY_ONLY";
      brief.website_check_notes = `email_domain: ${emailDomainDiscovery.reason}`;
    } else if (emailDomainDiscovery.classification === "NEEDS_MANUAL_REVIEW") {
      brief.website_status = "NEEDS_MANUAL_REVIEW";
      brief.website_check_notes = emailDomainDiscovery.reason;
    }
  }

  // Logo from Facebook
  if (facebookRecord?.logo_path) {
    brief.brand = {
      colours: facebookRecord.logo_palette.length ? facebookRecord.logo_palette : brief.brand?.colours ?? [],
      logo_url: facebookRecord.assets.find((a) => a.source_type === "facebook_logo")?.source_url ?? null,
      logo_local: facebookRecord.logo_path,
    };
  }

  const resolvedWebsiteUrl =
    primaryDiscovery?.final_url ??
    emailDomainDiscovery?.final_url ??
    (brief.website_url && !brief.website_url.includes("facebook.com") ? brief.website_url : null);

  let websiteCrawl = null;
  if (resolvedWebsiteUrl && /^https?:\/\//i.test(resolvedWebsiteUrl)) {
    try {
      websiteCrawl = await crawlWebsite(resolvedWebsiteUrl, brief.business_name);
      if (websiteCrawl.services.length) {
        notes.push(`Website crawl found ${websiteCrawl.services.length} service hint(s)`);
      }
      if (websiteCrawl.emails.length && !email) {
        email = websiteCrawl.emails[0]!;
        brief.email = email;
        notes.push(`Email from website crawl: ${email}`);
      }
    } catch {
      notes.push("Website crawl failed - manual review if website matters");
    }
  }

  const logoDiscovery = await discoverLogos({
    slug: opts.slug,
    briefDir: dir,
    websiteUrl: resolvedWebsiteUrl,
    facebookPage: facebookPage ?? null,
    facebookVerified: facebookRecord?.verified ?? false,
    writeFiles: true,
  });
  if (logoDiscovery.found && logoDiscovery.local_path) {
    brief.brand = {
      colours: brief.brand?.colours ?? [],
      logo_url: logoDiscovery.selected?.source_url ?? brief.brand?.logo_url ?? null,
      logo_local: logoDiscovery.local_path,
    };
    notes.push(`Logo discovered via ${logoDiscovery.selected?.source_type} (score ${logoDiscovery.selected?.score})`);
  } else if (logoDiscovery.failures.length) {
    notes.push(`Logo discovery: ${logoDiscovery.failures.join("; ")}`);
  }

  const directoryProbes = await probeDirectoriesForLead({
    businessName: brief.business_name,
    googlePhone: brief.phone,
    googleAddress: brief.address,
    city,
    existingSourceUrls: [...sourceUrls],
  });
  const directoryProbesWithImages = await probeDirectoryImagesForLead({
    slug: opts.slug,
    briefDir: dir,
    probes: directoryProbes,
    writeFiles: true,
  });
  brief.directory_probes = directoryProbesWithImages;
  for (const probe of directoryProbesWithImages) {
    if (probe.candidate_url && probe.status === "FOUND_VERIFIED") {
      sourceUrls.add(probe.candidate_url);
      notes.push(`${probe.platform} profile verified: ${probe.candidate_url}`);
    }
    if (probe.image_probe?.photos_downloaded) {
      notes.push(
        `${probe.platform} directory images: ${probe.image_probe.photos_downloaded} saved (max ${probe.image_probe.largest_width}px)`
      );
    }
  }

  const manualAssets = await scanManualAssets(opts.slug);

  const photoDiscovery = await discoverPhotos({
    slug: opts.slug,
    briefDir: dir,
    existingPhotos: brief.photos,
    facebookPage: facebookPage ?? null,
    facebookVerified: facebookRecord?.verified ?? false,
    websiteCrawl,
    directoryProbes: directoryProbesWithImages,
    writeFiles: true,
  });
  if (photoDiscovery.photos_selected > 0) {
    notes.push(
      `Photo discovery: ${photoDiscovery.photos_selected}/${photoDiscovery.photos_found} selected (${photoDiscovery.layout_recommendation.note})`
    );
  }

  if (photoDiscovery.manual_asset_review_recommended) {
    ensureManualAssetReadme(opts.slug, {
      business_name: brief.business_name,
      why:
        "Automatic sources found only low-res Facebook thumbnails or not enough usable project photos.",
      facebook_url: facebookRecord?.url ?? null,
      website_url: brief.website_url ?? null,
      directory_urls: directoryProbesWithImages
        .filter((p) => p.candidate_url)
        .map((p) => p.candidate_url!),
    });
  }

  brief.facebook = facebookRecord;
  brief.source_urls = [...sourceUrls];
  brief.enrichment = {
    enriched_at: new Date().toISOString(),
    email_domain_checked: Boolean(email && extractDomainFromEmail(email)),
    website_discovery_run: true,
  };

  // Source verification
  const verifications: SourceVerificationResult[] = [];

  verifications.push(
    verifySource({
      platform: "google_places",
      url: brief.google_maps_url ?? null,
      business_name: brief.business_name,
      google_phone: brief.phone,
      google_email: email,
      google_address: brief.address,
      town: city,
    })
  );

  if (facebookRecord?.url) {
    verifications.push(
      verifySource({
        platform: "facebook",
        url: facebookRecord.url,
        business_name: brief.business_name,
        google_phone: brief.phone,
        google_email: email,
        google_address: brief.address,
        town: city,
        extracted: {
          phone: facebookPage?.phone,
          email: facebookPage?.email,
          website: facebookPage?.website,
          business_name: facebookPage?.business_name,
          location: facebookPage?.location,
          logo_url: facebookPage?.profile_image_url,
        },
      })
    );
  }

  if (primaryDiscovery?.final_url) {
    verifications.push(
      verifySource({
        platform: primaryDiscovery.classification === "HAS_REAL_SITE" ? "official_website" : "email_domain_website",
        url: primaryDiscovery.final_url,
        business_name: brief.business_name,
        google_phone: brief.phone,
        google_email: email,
        google_address: brief.address,
        town: city,
        extracted: { website: primaryDiscovery.final_url },
      })
    );
  }

  const sourceConfidence = summarizeSourceConfidence(verifications);

  // Build evidence with enrichment fields
  const evidence = buildSourceEvidence(opts.slug, brief as Parameters<typeof buildSourceEvidence>[1], {
    website_discovery: primaryDiscovery,
    email_domain_discovery: emailDomainDiscovery,
    source_verifications: verifications,
    source_confidence: sourceConfidence,
    logo_found: logoDiscovery.found || logoFound(brief),
    registry_attempts: attemptedFromRegistry,
    facebook_url: facebookRecord?.url ?? manualFb,
    facebook_verified: facebookRecord?.verified ?? false,
    facebook_graph: facebookRecord?.graph,
    facebook_apify: facebookRecord?.apify,
    facebook_media_quality: facebookRecord?.facebook_media_quality,
    manual_asset_review_recommended: facebookRecord?.manual_asset_review_recommended,
    directory_image_probes: directoryProbesWithImages
      .map((p) => p.image_probe)
      .filter((p): p is NonNullable<typeof p> => Boolean(p)),
    manual_assets: manualAssets.summary.total ? manualAssets : null,
  });

  const validity = evaluateLeadValidity({
    business_name: brief.business_name,
    slug: opts.slug,
    photos: brief.photos as { local?: string; source_type?: string; width?: number; classification?: string }[],
    website_status: brief.website_status ?? null,
    website_url: brief.website_url ?? null,
    website_discovery: primaryDiscovery,
    email_domain_discovery: emailDomainDiscovery,
    website_crawl: websiteCrawl,
    source_confidence: sourceConfidence,
    contactability_status: brief.contactability_status ?? lead?.contactability_status,
    location_validation_status: brief.location_validation_status,
    prospect_region: prospectRegion,
    enrichment_complete: evidence.enrichment_complete,
    logo_found: logoDiscovery.found,
    gallery_photo_count: photoDiscovery.photos_selected || countGalleryPhotos(brief),
    facebook_verified: facebookRecord?.verified ?? false,
    manual_review_flags: evidence.manual_review_flags,
    manual_asset_review_recommended:
      facebookRecord?.manual_asset_review_recommended ?? photoDiscovery.manual_asset_review_recommended,
    low_res_facebook_only: evidence.facebook_media_quality === "LOW_RES_ONLY",
  });

  const facebookImageStats =
    facebookRecord?.photos_found != null
      ? {
          images_found: facebookRecord.photos_found,
          images_attempted: facebookRecord.photos_attempted ?? facebookRecord.photos_found,
          images_downloaded: facebookRecord.photos_downloaded ?? facebookRecord.photos_selected,
          images_rejected: facebookRecord.photos_rejected ?? 0,
          failures: facebookRecord.photo_download_failures ?? [],
        }
      : null;

  const sourceQuality = evaluateSourceQuality({
    website_url_validation: urlFix.validation,
    website_url_validated_flag: Boolean(brief.website_url_validation),
    email,
    email_domain_checked: Boolean(email && extractDomainFromEmail(email)),
    enrichment_complete: evidence.enrichment_complete,
    logo_discovery_attempted: true,
    photo_discovery_attempted: true,
    facebook_image_stats: facebookImageStats,
    directory_probes: directoryProbesWithImages,
    lead_validity: validity,
  });

  brief.lead_validity = validity;
  brief.source_quality = sourceQuality;
  brief.notes = [...new Set(notes)];

  fs.writeFileSync(briefPath, JSON.stringify(brief, null, 2) + "\n");
  saveSourceEvidence(opts.slug, evidence);
  fs.writeFileSync(
    path.join(dir, "lead-validity.json"),
    JSON.stringify(validity, null, 2) + "\n"
  );
  fs.writeFileSync(
    path.join(dir, "source-quality.json"),
    JSON.stringify(sourceQuality, null, 2) + "\n"
  );

  if (lead) {
    updateLead(lead.id, {
      email: email ?? lead.email,
      website_status: brief.website_status ?? lead.website_status,
      website_check_notes: brief.website_check_notes ?? lead.website_check_notes,
      notes: [...new Set([...(lead.notes?.split(";") ?? []), ...notes])].join("; "),
    });
  }

  return { brief, evidence, validity, sourceQuality };
}

export function printEnrichSummary(
  slug: string,
  evidence: EnrichedSourceEvidence,
  validity: LeadValidityResult,
  sourceQuality?: SourceQualityResult
): void {
  console.log(`\nEnrichment complete: ${slug}`);
  console.log(`  Facebook verified: ${evidence.facebook_verified ? "yes" : "no"}`);
  console.log(`  Facebook URL: ${evidence.facebook_url ?? "-"}`);
  console.log(`  Email found: ${evidence.email_found ? "yes" : "no"} (${evidence.email ?? "-"})`);
  console.log(`  Email domain checked: ${evidence.email_domain_checked ? "yes" : "no"}`);
  console.log(
    `  Website via email domain: ${evidence.email_domain_website?.classification ?? "not checked"}`
  );
  console.log(`  Website status: ${validity.website_status ?? "-"}`);
  console.log(`  Logo found: ${evidence.logo_found ? "yes" : "no"}`);
  console.log(`  Lead validity: ${validity.lead_validity_status}`);
  console.log(`  Ready for build: ${validity.ready_for_build ? "yes" : "no"}`);
  console.log(`  Ready for pitch: ${validity.ready_for_pitch ? "yes" : "no"}`);
  if (sourceQuality) {
    console.log(`  Source quality: ${sourceQuality.source_quality_status}`);
  }
  if (validity.warnings.length) {
    console.log(`  Warnings: ${validity.warnings.join(" | ")}`);
  }
  console.log(`  Evidence: briefs/${slug}/source-evidence.json`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const opts = parseArgs();
  if (!opts.slug) {
    console.error(
      "Usage: npm run enrich:lead -- --slug <slug> [--facebook-url <url>] [--instagram-url <url>] [--website-url <url>] [--force] [--no-build]"
    );
    process.exit(1);
  }
  enrichLead(opts)
    .then(({ evidence, validity, sourceQuality }) => {
      printEnrichSummary(opts.slug, evidence, validity, sourceQuality);
    })
    .catch((err) => {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    });
}
