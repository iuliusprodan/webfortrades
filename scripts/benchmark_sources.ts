import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { briefDir, ROOT } from "./site_config.js";
import {
  discoverFacebookForLead,
  loadFacebookPageData,
  verifyFacebookPageForLead,
} from "./facebook_source.js";
import { evaluateLeadValidity } from "./lead_validity.js";
import { discoverLogos } from "./logo_discovery.js";
import { discoverPhotos } from "./photo_discovery.js";
import { summarizeSourceConfidence, verifySource } from "./source_verification.js";
import {
  discoverBestWebsite,
  discoverWebsiteFromEmailDomain,
  extractDomainFromEmail,
  isInvalidProspectWebsiteUrl,
} from "./website_discovery.js";
import { crawlWebsite } from "./website_crawler.js";
import {
  formatGraphStatusForLog,
  getMetaGraphConfig,
  MIN_FACEBOOK_GALLERY_WIDTH,
} from "./facebook_graph.js";
import {
  formatApifyStatusForLog,
  getApifyConfig,
} from "./apify_facebook.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const KNOWN_SLUGS = [
  "corvell-ltd",
  "greens-precise-plumbing-heating-ltd",
  "bristol-plumbing-co",
  "jt-plumbing",
  "nfs-plumbing-heating",
];

export interface BenchmarkCaseResult {
  slug: string;
  business_name: string;
  ran_at: string;
  read_only: boolean;
  extraction: {
    phone: string | null;
    email: string | null;
    website_url: string | null;
    website_classification: string | null;
    facebook_url: string | null;
    facebook_verified: boolean;
    logo_found: boolean;
    logo_source: string | null;
    logo_score: number | null;
    cover_image: boolean;
    photo_count_found: number;
    photo_count_selected: number;
    review_count: number | null;
    google_rating: number | null;
    services_count: number;
    location: string | null;
    source_confidence: string | null;
    layout_recommendation: string | null;
    meta_graph_api_configured: boolean;
    meta_graph_api_status: string | null;
    facebook_largest_width: number | null;
    facebook_media_quality: string | null;
    manual_asset_review_recommended: boolean;
    apify_configured: boolean;
    apify_status: string | null;
  };
  lead_validity: {
    status: string;
    ready_for_build: boolean;
    ready_for_design: boolean;
    pitch_type: string;
    warnings: string[];
  };
  failures: string[];
  duration_ms: number;
}

interface BriefRow {
  business_name: string;
  phone: string | null;
  email: string | null;
  address: string;
  website_url?: string | null;
  website_status?: string | null;
  google_rating?: number | null;
  google_review_count?: number | null;
  google_maps_url?: string | null;
  reviews?: { text: string; reviewer: string; rating: number }[];
  services?: string[];
  photos?: { local: string; source_url?: string; source_type?: string; width?: number; height?: number }[];
  social?: { facebook?: string | null };
  facebook?: { url?: string | null };
  contactability_status?: string;
}

function parseArgs(): { slug?: string; allKnown?: boolean; writeBrief?: boolean; facebookUrl?: string } {
  const args = process.argv.slice(2);
  const opts: { slug?: string; allKnown?: boolean; writeBrief?: boolean; facebookUrl?: string } = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) opts.slug = args[++i];
    else if (args[i] === "--all-known") opts.allKnown = true;
    else if (args[i] === "--write-brief") opts.writeBrief = true;
    else if (args[i] === "--facebook-url" && args[i + 1]) opts.facebookUrl = args[++i];
  }
  return opts;
}

function cityFromAddress(address: string): string {
  return address.split(",").slice(-2, -1)[0]?.trim() ?? address.split(",")[0]?.trim() ?? "";
}

const FB_OVERRIDES: Record<string, string> = {
  "corvell-ltd": "https://www.facebook.com/p/Corvell-Bathrooms-61560222691293/",
  "greens-precise-plumbing-heating-ltd": "https://www.facebook.com/GPPlumbingandHeatingLtd/",
};

export async function runBenchmarkForSlug(
  slug: string,
  opts: { writeBrief?: boolean; facebookUrl?: string } = {}
): Promise<BenchmarkCaseResult> {
  const start = Date.now();
  const failures: string[] = [];
  const dir = briefDir(slug);
  const briefPath = path.join(dir, "brief.json");
  if (!fs.existsSync(briefPath)) {
    throw new Error(`Missing brief.json for ${slug}`);
  }
  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as BriefRow;
  const city = cityFromAddress(brief.address);
  const readOnly = !opts.writeBrief;

  const manualFb = opts.facebookUrl ?? FB_OVERRIDES[slug] ?? brief.social?.facebook ?? brief.facebook?.url ?? null;

  let facebookUrl: string | null = null;
  let facebookVerified = false;
  let facebookPage = null;

  if (manualFb) {
    try {
      facebookPage = await loadFacebookPageData(manualFb);
      const verification = verifyFacebookPageForLead({
        businessName: brief.business_name,
        googlePhone: brief.phone,
        googleAddress: brief.address,
        town: city,
        page: facebookPage,
      });
      facebookVerified = verification.facebook_verified;
      facebookUrl = facebookPage.page_url;
      if (facebookPage.facebook_status === "BLOCKED_OR_LOGIN_REQUIRED") {
        failures.push("Facebook blocked or login required");
      }
    } catch (e) {
      failures.push(`Facebook load failed: ${e instanceof Error ? e.message : "unknown"}`);
    }
  } else {
    const discovered = await discoverFacebookForLead({
      businessName: brief.business_name,
      googlePhone: brief.phone,
      googleAddress: brief.address,
      town: city,
      websiteUrl: brief.website_url,
    });
    if (discovered.page) {
      facebookPage = discovered.page;
      facebookVerified = discovered.verification?.facebook_verified ?? false;
      facebookUrl = discovered.page.page_url;
    }
  }

  let email = brief.email;
  if (!email && facebookPage?.email) email = facebookPage.email;

  const discovery = await discoverBestWebsite({
    businessName: brief.business_name,
    googleWebsiteUrl:
      brief.website_url && !isInvalidProspectWebsiteUrl(brief.website_url) && !brief.website_url.includes("facebook")
        ? brief.website_url
        : null,
    emails: email ? [email] : [],
  });

  let emailDomainResult = discovery.email_domain;
  if (email && !emailDomainResult) {
    emailDomainResult = await discoverWebsiteFromEmailDomain(email, brief.business_name);
  }

  const websiteUrl =
    discovery.primary?.final_url ??
    emailDomainResult?.final_url ??
    (brief.website_url && !brief.website_url.includes("facebook") && !isInvalidProspectWebsiteUrl(brief.website_url)
      ? brief.website_url
      : null) ??
    null;

  let websiteCrawl = null;
  if (websiteUrl && /^https?:\/\//i.test(websiteUrl) && !websiteUrl.includes("facebook.com")) {
    try {
      websiteCrawl = await crawlWebsite(websiteUrl, brief.business_name);
    } catch (e) {
      failures.push(`Website crawl failed: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  const logoResult = await discoverLogos({
    slug,
    briefDir: dir,
    websiteUrl,
    facebookPage,
    facebookVerified,
    writeFiles: !readOnly,
  });
  if (logoResult.failures.length) failures.push(...logoResult.failures);

  const photoResult = await discoverPhotos({
    slug,
    briefDir: dir,
    existingPhotos: brief.photos,
    facebookPage,
    facebookVerified,
    websiteCrawl,
    writeFiles: !readOnly,
  });
  if (photoResult.failures.length) failures.push(...photoResult.failures);

  const graphConfig = getMetaGraphConfig();
  const fbPhotos = photoResult.photos.filter((p) => p.source_type.startsWith("facebook"));
  const facebookLargestWidth = fbPhotos.length ? Math.max(...fbPhotos.map((p) => p.width)) : null;
  const graphStatus = formatGraphStatusForLog(
    photoResult.facebook_graph ?? {
      attempted: graphConfig.configured,
      success: false,
      page_id: null,
      photos_found: 0,
      photos_downloaded: 0,
      largest_width: null,
      largest_height: null,
      failure_reason: graphConfig.configured ? null : "META_GRAPH_API_TOKEN not configured",
      permission_required: false,
    },
    graphConfig.configured
  );

  const apifyConfig = getApifyConfig();
  const apifyStatus = formatApifyStatusForLog(
    photoResult.facebook_apify ?? {
      attempted: apifyConfig.configured,
      success: false,
      actor: apifyConfig.postsActor,
      photos_found: 0,
      photos_downloaded: 0,
      largest_width: null,
      largest_height: null,
      failure_reason: apifyConfig.configured ? null : "APIFY_TOKEN not configured",
      cost_estimate: null,
      requires_login: false,
      via_mcp: false,
    },
    apifyConfig.configured
  );

  const verifications = [
    verifySource({
      platform: "google_places",
      url: brief.google_maps_url ?? null,
      business_name: brief.business_name,
      google_phone: brief.phone,
      google_email: email,
      google_address: brief.address,
      town: city,
    }),
  ];
  if (facebookUrl) {
    verifications.push(
      verifySource({
        platform: "facebook",
        url: facebookUrl,
        business_name: brief.business_name,
        google_phone: brief.phone,
        google_email: email,
        google_address: brief.address,
        town: city,
        extracted: {
          phone: facebookPage?.phone,
          email: facebookPage?.email,
          business_name: facebookPage?.business_name,
          location: facebookPage?.location,
          logo_url: facebookPage?.profile_image_url,
        },
      })
    );
  }
  const sourceConfidence = summarizeSourceConfidence(verifications);

  const validity = evaluateLeadValidity({
    business_name: brief.business_name,
    website_status: (discovery.primary?.db_status ?? brief.website_status) as never,
    website_url: websiteUrl,
    website_discovery: discovery.primary,
    email_domain_discovery: emailDomainResult,
    website_crawl: websiteCrawl,
    source_confidence: sourceConfidence,
    contactability_status: brief.contactability_status,
    enrichment_complete: true,
    logo_found: logoResult.found,
    gallery_photo_count: photoResult.photos_selected,
    facebook_verified: facebookVerified,
    manual_review_flags: failures.length ? failures : [],
  });

  const result: BenchmarkCaseResult = {
    slug,
    business_name: brief.business_name,
    ran_at: new Date().toISOString(),
    read_only: readOnly,
    extraction: {
      phone: brief.phone,
      email,
      website_url: websiteUrl,
      website_classification: discovery.primary?.classification ?? emailDomainResult?.classification ?? null,
      facebook_url: facebookUrl,
      facebook_verified: facebookVerified,
      logo_found: logoResult.found,
      logo_source: logoResult.selected?.source_type ?? null,
      logo_score: logoResult.selected?.score ?? null,
      cover_image: Boolean(facebookPage?.cover_image_url),
      photo_count_found: photoResult.photos_found,
      photo_count_selected: photoResult.photos_selected,
      review_count: brief.google_review_count ?? brief.reviews?.length ?? null,
      google_rating: brief.google_rating ?? null,
      services_count: websiteCrawl?.services.length ?? brief.services?.length ?? 0,
      location: brief.address,
      source_confidence: sourceConfidence.overall,
      layout_recommendation: photoResult.layout_recommendation.note,
      meta_graph_api_configured: graphConfig.configured,
      meta_graph_api_status: graphStatus,
      facebook_largest_width: facebookLargestWidth,
      facebook_media_quality: photoResult.facebook_media_quality ?? null,
      manual_asset_review_recommended: photoResult.manual_asset_review_recommended ?? false,
      apify_configured: apifyConfig.configured,
      apify_status: apifyStatus,
    },
    lead_validity: {
      status: validity.lead_validity_status,
      ready_for_build: validity.ready_for_build,
      ready_for_design: validity.ready_for_design,
      pitch_type: validity.pitch_type,
      warnings: validity.warnings,
    },
    failures,
    duration_ms: Date.now() - start,
  };

  if (opts.writeBrief) {
    const briefOut = JSON.parse(fs.readFileSync(briefPath, "utf8")) as Record<string, unknown>;
    if (email) briefOut.email = email;
    if (logoResult.local_path) {
      briefOut.brand = {
        ...(briefOut.brand as object),
        logo_local: logoResult.local_path,
      };
    }
    briefOut.lead_validity = validity;
    fs.writeFileSync(briefPath, JSON.stringify(briefOut, null, 2) + "\n");
  }

  return result;
}

export async function runBenchmarkBatch(slugs: string[], writeBrief = false): Promise<{
  results: BenchmarkCaseResult[];
  reportDir: string;
}> {
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const reportDir = path.join(ROOT, "data", "source-benchmarks", ts);
  fs.mkdirSync(reportDir, { recursive: true });

  const results: BenchmarkCaseResult[] = [];
  for (const slug of slugs) {
    try {
      results.push(await runBenchmarkForSlug(slug, { writeBrief }));
    } catch (e) {
      results.push({
        slug,
        business_name: slug,
        ran_at: new Date().toISOString(),
        read_only: !writeBrief,
        extraction: {
          phone: null,
          email: null,
          website_url: null,
          website_classification: null,
          facebook_url: null,
          facebook_verified: false,
          logo_found: false,
          logo_source: null,
          logo_score: null,
          cover_image: false,
          photo_count_found: 0,
          photo_count_selected: 0,
          review_count: null,
          google_rating: null,
          services_count: 0,
          location: null,
          source_confidence: null,
          layout_recommendation: null,
          meta_graph_api_configured: false,
          meta_graph_api_status: null,
          facebook_largest_width: null,
          facebook_media_quality: null,
          manual_asset_review_recommended: false,
          apify_configured: false,
          apify_status: null,
        },
        lead_validity: {
          status: "NEEDS_MANUAL_REVIEW",
          ready_for_build: false,
          ready_for_design: false,
          pitch_type: "manual_review",
          warnings: [e instanceof Error ? e.message : "benchmark failed"],
        },
        failures: [e instanceof Error ? e.message : "benchmark failed"],
        duration_ms: 0,
      });
    }
  }

  const report = { generated_at: new Date().toISOString(), read_only: !writeBrief, results };
  fs.writeFileSync(path.join(reportDir, "benchmark-report.json"), JSON.stringify(report, null, 2) + "\n");
  fs.writeFileSync(path.join(reportDir, "benchmark-report.md"), renderReportMd(report));
  return { results, reportDir };
}

function renderReportMd(report: { generated_at: string; read_only: boolean; results: BenchmarkCaseResult[] }): string {
  const lines = [
    "# Source extraction benchmark",
    "",
    `- Generated: ${report.generated_at}`,
    `- Mode: ${report.read_only ? "read-only" : "write-brief"}`,
    "",
    "| Slug | Website | FB verified | Logo | Photos | Validity | Build | Design |",
    "|------|---------|-------------|------|--------|----------|-------|--------|",
    ...report.results.map((r) =>
      `| ${r.slug} | ${r.extraction.website_classification ?? "-"} | ${r.extraction.facebook_verified ? "yes" : "no"} | ${r.extraction.logo_found ? "yes" : "no"} | ${r.extraction.photo_count_selected}/${r.extraction.photo_count_found} | ${r.lead_validity.status} | ${r.lead_validity.ready_for_build ? "yes" : "no"} | ${r.lead_validity.ready_for_design ? "yes" : "no"} |`
    ),
    "",
    "## Details",
    ...report.results.flatMap((r) => [
      "",
      `### ${r.slug}`,
      `- Business: ${r.business_name}`,
      `- Email: ${r.extraction.email ?? "-"}`,
      `- Website: ${r.extraction.website_url ?? "-"} (${r.extraction.website_classification ?? "-"})`,
      `- Facebook: ${r.extraction.facebook_url ?? "-"} verified=${r.extraction.facebook_verified}`,
      `- Logo: ${r.extraction.logo_found ? `yes (${r.extraction.logo_source}, score ${r.extraction.logo_score})` : "no"}`,
      `- Photos: ${r.extraction.photo_count_selected} selected / ${r.extraction.photo_count_found} found`,
      `- Meta Graph API: ${r.extraction.meta_graph_api_configured ? r.extraction.meta_graph_api_status ?? "configured" : "not configured (public HTML fallback only)"}`,
      `- Facebook largest width: ${r.extraction.facebook_largest_width ?? "-"}px${r.extraction.facebook_largest_width != null && r.extraction.facebook_largest_width < MIN_FACEBOOK_GALLERY_WIDTH ? " (LOW_RES)" : ""}`,
      `- Facebook media quality: ${r.extraction.facebook_media_quality ?? "-"}`,
      `- Manual asset review: ${r.extraction.manual_asset_review_recommended ? "recommended" : "no"}`,
      `- Apify: ${r.extraction.apify_configured ? r.extraction.apify_status ?? "configured" : "not configured (add APIFY_TOKEN to .env)"}`,
      `- Layout: ${r.extraction.layout_recommendation ?? "-"}`,
      `- Validity: ${r.lead_validity.status} pitch=${r.lead_validity.pitch_type}`,
      `- Failures: ${r.failures.length ? r.failures.join("; ") : "none"}`,
    ]),
  ];
  return lines.join("\n") + "\n";
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const opts = parseArgs();
  const slugs = opts.allKnown ? KNOWN_SLUGS : opts.slug ? [opts.slug] : [];
  if (!slugs.length) {
    console.error("Usage: npm run benchmark:sources -- --slug <slug> | --all-known [--write-brief]");
    process.exit(1);
  }
  runBenchmarkBatch(slugs, opts.writeBrief)
    .then(({ results, reportDir }) => {
      console.log(`Benchmark complete: ${reportDir}`);
      for (const r of results) {
        console.log(
          `  ${r.slug}: validity=${r.lead_validity.status} logo=${r.extraction.logo_found ? "yes" : "no"} photos=${r.extraction.photo_count_selected}/${r.extraction.photo_count_found} graph=${r.extraction.meta_graph_api_configured ? "configured" : "off"} fb_max=${r.extraction.facebook_largest_width ?? "-"}px (${r.duration_ms}ms)`
        );
      }
    })
    .catch((e) => {
      console.error(e instanceof Error ? e.message : e);
      process.exit(1);
    });
}
