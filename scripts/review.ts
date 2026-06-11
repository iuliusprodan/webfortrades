import fs from "node:fs";
import path from "node:path";
import { type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "playwright";
import { getLeadBySlug, getNextBuiltLead, updateLead, type Lead } from "./db.js";
import {
  serviceAreaHasAddressErrors,
  servicesIncludeBroadTrade,
  headerBrandLooksLikeService,
  resolveBusinessName,
} from "./site_content.js";
import {
  buildNotesMentionsChecklist,
  requireSiteBuildChecklist,
} from "./site_checklist.js";
import sharp from "sharp";
import { imageHasBottomLeftDevBadge } from "./preview_capture.js";
import {
  buildSiteMetadata,
  outreachAssetPaths,
  validateSiteMetadata,
} from "./site_metadata.js";
import {
  extractLikelyContactNameFromReviews,
  bodyHasOwnerClaims,
} from "./contact_name.js";
import {
  loadDesignFingerprint,
  runLocationCopyChecks,
  runGalleryDiversityChecks,
  runFacebookBriefChecks,
  compareFingerprints,
  creativeUniquenessScore,
} from "./design_review.js";
import { loadCreativeBrief } from "./creative_brief.js";
import { BUILD_MARKER_BUILD_ID, BUILD_MARKER_SLUG } from "./build_marker.js";
import { loadDeployManifest } from "./vercel_alias.js";
import { collectStyleMetrics, evaluateComputedStyle } from "./style_verify.js";
import { loadSiteDesignConfig } from "./site_config.js";
import {
  evaluateOwnerNameSectionTitleBanHtml,
  evaluateTextOnlyWordmarksHtml,
} from "./site_design_checks.js";
import { startStaticPreviewServer, ensureStaticBuild, stopStaticPreviewServer } from "./preview_server.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const REVIEW_PORT = Number(process.env.WFT_REVIEW_PORT) || 4311;
const REVIEW_URL = `http://localhost:${REVIEW_PORT}`;

const SECTIONS = [
  { name: "00-utility", selector: '[data-review="utility"]' },
  { name: "01-hero", selector: '[data-review="hero"]' },
  { name: "02-stats", selector: '[data-review="stats"]' },
  { name: "03-owner-note", selector: '[data-review="owner-note"]' },
  { name: "04-gallery", selector: '[data-review="gallery"]' },
  { name: "05-services", selector: '[data-review="services"]' },
  { name: "06-about", selector: '[data-review="about"]' },
  { name: "07-marquee", selector: '[data-review="marquee"]' },
  { name: "08-reviews", selector: '[data-review="reviews"]' },
  { name: "09-service-area", selector: '[data-review="service-area"]' },
  { name: "10-faq", selector: '[data-review="faq"]' },
  { name: "11-contact", selector: '[data-review="contact"]' },
  { name: "12-footer", selector: '[data-review="footer"]' },
  { name: "13-mobile-call", selector: '[data-review="mobile-call"]' },
];

const VIEWPORTS = [
  { label: "mobile", width: 390, height: 844 },
  { label: "desktop", width: 1440, height: 900 },
];

const PLACEHOLDER_PATTERNS = [
  /PLACEHOLDER/i,
  /lorem ipsum/i,
  /your name here/i,
  /sample site/i,
  /TODO/i,
  /FIXME/i,
];

interface ReviewIssue {
  severity: "error" | "warn";
  message: string;
}

const HERO_SELECTOR =
  '[data-review="hero"], [data-review="review-led-hero"], [data-section-id="review-led-hero"], [data-section-id="proof-led-hero"], [data-section-id="photo-led-hero"]';

const TEMPLATE_HEADING_BLACKLIST = [
  "Questions before you ring.",
  "Pick up the phone, or write.",
  "One van. One trade. A name on a list.",
  "services. Done plainly.",
  "A note from the plumber",
];

function parseArgs(): { slug?: string; skipPreviewAssets?: boolean } {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  let skipPreviewAssets = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    else if (args[i] === "--skip-preview-assets" || args[i] === "--skip-og" || args[i] === "--no-preview") {
      skipPreviewAssets = true;
    }
  }
  return { slug, skipPreviewAssets };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(
  url: string,
  timeoutMs = Number(process.env.WFT_REVIEW_SERVER_TIMEOUT_MS) || 180000
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await sleep(500);
  }
  throw new Error(`Review server did not start at ${url}`);
}

/**
 * Serve the site for review. We prefer the production static export (out/),
 * which is what actually ships and is far more reliable under concurrency than
 * spinning a fresh `next dev` compile per worker. Falls back to building the
 * static export if a prior preview step did not produce one.
 */
function startReviewServer(siteDir: string): ChildProcess {
  const outIndex = path.join(siteDir, "out", "index.html");
  if (!fs.existsSync(outIndex)) {
    ensureStaticBuild(siteDir);
  }
  return startStaticPreviewServer(siteDir, REVIEW_PORT);
}

async function screenshotSections(
  page: Page,
  outDir: string,
  viewport: (typeof VIEWPORTS)[number]
): Promise<void> {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(REVIEW_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);

  const vpDir = path.join(outDir, viewport.label);
  fs.mkdirSync(vpDir, { recursive: true });

  await page.screenshot({
    path: path.join(vpDir, "full-page.png"),
    fullPage: true,
  });

  for (const section of SECTIONS) {
    const loc = page.locator(section.selector).first();
    const count = await loc.count();
    if (count === 0) continue;
    if (!(await loc.isVisible())) continue;
    await loc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await loc.screenshot({
      path: path.join(vpDir, `${section.name}.png`),
    });
  }
}

interface SiteBrief {
  business_name: string;
  owner_name: string | null;
  contact_name?: string | null;
  contact_name_source?: "google_reviews" | null;
  contact_name_confidence?: "high" | "medium" | "low" | null;
  contact_name_evidence_count?: number;
  contact_name_usage_allowed?: boolean;
  possible_contact_name?: string | null;
  address: string;
  services: string[];
  service_area: string[];
  based_location?: string | null;
  google_rating?: number | null;
  google_review_count?: number | null;
  google_review_count_sourced?: boolean;
  service_areas_inferred?: boolean;
  google_maps_url?: string | null;
  reviews?: { text: string; reviewer: string; rating: number }[];
}

const DISALLOWED_STAT_LABEL =
  /photos|images|gallery|project photos|services listed|core services/i;

function buildNotesAllowsWeakStats(notes: string): boolean {
  return /weak stat.*allowed|allow.*weak stat|filler stat.*allowed/i.test(notes);
}

function loadSiteBrief(siteDir: string): SiteBrief | null {
  const briefPath = path.join(siteDir, "data", "brief.json");
  if (!fs.existsSync(briefPath)) return null;
  return JSON.parse(fs.readFileSync(briefPath, "utf8")) as SiteBrief;
}

function runBriefChecks(brief: SiteBrief, lead: Lead): ReviewIssue[] {
  const issues: ReviewIssue[] = [];

  for (const msg of serviceAreaHasAddressErrors(brief.service_area)) {
    issues.push({ severity: "error", message: msg });
  }

  for (const msg of servicesIncludeBroadTrade(brief.services, lead.niche)) {
    issues.push({ severity: "error", message: msg });
  }

  if (lead.slug && lead.site_url) {
    const slugToken = lead.slug.toLowerCase();
    const urlHost = lead.site_url.replace(/^https?:\/\//, "").split("/")[0] ?? "";
    if (!urlHost.includes(slugToken.replace(/[^a-z0-9-]/g, ""))) {
      issues.push({
        severity: "warn",
        message: `Deploy alias may not include business slug (${lead.slug})`,
      });
    }
  }

  return issues;
}

async function runPreviewAssetDevChecks(slug: string): Promise<ReviewIssue[]> {
  const issues: ReviewIssue[] = [];
  const assets = outreachAssetPaths(slug, ROOT);

  const checks: { path: string; label: string }[] = [
    { path: assets.ogPublic, label: "OG image" },
    { path: assets.heroMobile, label: "Hero mobile screenshot" },
  ];

  for (const check of checks) {
    if (!fs.existsSync(check.path)) continue;
    const buf = fs.readFileSync(check.path);
    const meta = await sharp(buf).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    if (width <= 0 || height <= 0) continue;
    if (await imageHasBottomLeftDevBadge(buf, width, height)) {
      issues.push({
        severity: "error",
        message: `${check.label} shows a Next.js dev indicator. Regenerate with preview:site (production mode).`,
      });
    }
  }

  return issues;
}

function runMetadataAndPreviewChecks(
  siteDir: string,
  slug: string,
  brief: SiteBrief | null,
  lead: Lead,
  options?: { skipPreviewAssets?: boolean }
): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  const metaPath = path.join(siteDir, "data", "site-metadata.json");
  if (!fs.existsSync(metaPath)) {
    issues.push({ severity: "error", message: "site-metadata.json missing" });
    return issues;
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
    title: string;
    description: string;
    ogImage: string | null;
    metadataBase: string;
  };

  if (brief) {
    for (const issue of validateSiteMetadata(meta, brief)) {
      issues.push(issue);
    }
  }

  if (meta.ogImage && /\/images\//.test(meta.ogImage) && !meta.ogImage.includes("og-image")) {
    issues.push({
      severity: "error",
      message: "Open Graph image must not use a random business/project photo",
    });
  }

  const assets = outreachAssetPaths(slug, ROOT);
  if (!options?.skipPreviewAssets) {
    if (!fs.existsSync(assets.ogPublic)) {
      issues.push({
        severity: "error",
        message: "OG image missing at sites/.../public/og-image.png (run preview:site)",
      });
    }
    if (!fs.existsSync(assets.heroMobile)) {
      issues.push({
        severity: "error",
        message: "Hero mobile outreach screenshot missing (run preview:site)",
      });
    }
  }

  const notesPath = path.join(siteDir, "build-notes.md");
  if (fs.existsSync(notesPath)) {
    const notes = fs.readFileSync(notesPath, "utf8");
    if (!notes.includes("Metadata title:")) {
      issues.push({
        severity: "warn",
        message: "build-notes.md does not log metadata title",
      });
    }
  }

  if (lead.slug && !lead.site_url) {
    /* ok for first deploy */
  }

  return issues;
}

async function runMetadataHtmlChecks(page: Page): Promise<ReviewIssue[]> {
  const issues: ReviewIssue[] = [];
  const title = await page.title();
  const description =
    (await page.locator('meta[name="description"]').getAttribute("content")) ?? "";
  const ogImage =
    (await page.locator('meta[property="og:image"]').first().getAttribute("content")) ?? "";

  if (/—/.test(`${title} ${description}`)) {
    issues.push({ severity: "error", message: "Metadata HTML contains em dash" });
  }

  if (ogImage && /\/images\/\d+-places|\/images\/0[1-9]-/.test(ogImage)) {
    issues.push({
      severity: "error",
      message: "HTML og:image points to a business project photo instead of og-image.png",
    });
  }

  if (ogImage && !ogImage.includes("og-image")) {
    issues.push({
      severity: "warn",
      message: `HTML og:image may not be the generated preview (${ogImage})`,
    });
  }

  return issues;
}

function runContactNameChecks(brief: SiteBrief, bodyText: string, slug: string): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  const reviews = brief.reviews ?? [];
  const extracted = extractLikelyContactNameFromReviews(reviews, brief.business_name);
  const contactName = brief.contact_name?.trim() ?? null;
  const usageAllowed = brief.contact_name_usage_allowed === true && Boolean(contactName);
  const hasOwner = Boolean(brief.owner_name?.trim());

  if (extracted.contact_name_usage_allowed && extracted.contact_name) {
    if (!contactName || contactName.toLowerCase() !== extracted.contact_name.toLowerCase()) {
      issues.push({
        severity: "error",
        message: `Review snippets suggest contact_name "${extracted.contact_name}" (${extracted.contact_name_evidence_count} mentions) but brief is missing or mismatched`,
      });
    } else if (!usageAllowed) {
      issues.push({
        severity: "error",
        message: `contact_name "${contactName}" has ${extracted.contact_name_evidence_count} review mentions but contact_name_usage_allowed is not true`,
      });
    }
  } else if (
    extracted.possible_contact_name &&
    !contactName &&
    extracted.contact_name_evidence_count === 1
  ) {
    issues.push({
      severity: "warn",
      message: `Single review mention of "${extracted.possible_contact_name}"; store as possible_contact_name only, do not use in public copy`,
    });
  }

  if (slug === "bristol-plumbing-co") {
    const jackMentions = reviews.filter((r) => /\bJack\b/i.test(r.text)).length;
    if (jackMentions >= 2 && contactName?.toLowerCase() !== "jack") {
      issues.push({
        severity: "error",
        message: `Bristol brief must include contact_name "Jack" (${jackMentions} review bodies mention Jack)`,
      });
    }
  }

  if (!hasOwner) {
    if (bodyHasOwnerClaims(bodyText, contactName)) {
      issues.push({
        severity: "error",
        message: "owner_name is null but visible copy contains owner/founder/ownership claims",
      });
    }
    const ownerPatterns = [
      /\bowner\s+[A-Z][a-z]+/i,
      /\bfounder\s+[A-Z][a-z]+/i,
      /\bfamily[- ]run by\b/i,
      /\bowned by\b/i,
    ];
    for (const re of ownerPatterns) {
      if (re.test(bodyText)) {
        issues.push({
          severity: "error",
          message: `owner_name is null but copy matches ${re}`,
        });
        break;
      }
    }
    if (contactName && !hasOwner) {
      if (new RegExp(`\\bowner\\s+${contactName}\\b`, "i").test(bodyText)) {
        issues.push({
          severity: "error",
          message: `Must not say "owner ${contactName}" when only contact_name is sourced from reviews`,
        });
      }
      if (new RegExp(`\\bfounder\\s+${contactName}\\b`, "i").test(bodyText)) {
        issues.push({
          severity: "error",
          message: `Must not say "founder ${contactName}" when only contact_name is sourced from reviews`,
        });
      }
      if (new RegExp(`${contactName}\\s+owns\\b`, "i").test(bodyText)) {
        issues.push({
          severity: "error",
          message: `Must not claim "${contactName} owns" the business without verified owner_name`,
        });
      }
      const surnameRe = new RegExp(`${contactName} ([A-Z][a-z]{2,})`);
      if (surnameRe.test(bodyText)) {
        const surnameMatch = bodyText.match(surnameRe);
        if (surnameMatch && !brief.owner_name?.includes(surnameMatch[1])) {
          issues.push({
            severity: "error",
            message: `Invented surname "${contactName} ${surnameMatch[1]}" in copy without verified owner_name`,
          });
        }
      }
    }
  }

  if (usageAllowed && contactName) {
    const hero = bodyText.includes(`Call ${contactName}`);
    if (!hero && brief.phone) {
      issues.push({
        severity: "warn",
        message: `contact_name_usage_allowed but no "Call ${contactName}" found in visible copy`,
      });
    }
  }

  return issues;
}

async function runBuildMarkerChecks(
  page: Page,
  siteDir: string,
  slug: string,
  lead: Lead
): Promise<ReviewIssue[]> {
  const issues: ReviewIssue[] = [];
  const metaPath = path.join(siteDir, "data", "site-metadata.json");
  if (!fs.existsSync(metaPath)) {
    issues.push({ severity: "error", message: "site-metadata.json missing build marker fields" });
    return issues;
  }
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
    buildId?: string;
    webfortradesSlug?: string;
  };
  if (!meta.buildId || !meta.webfortradesSlug) {
    issues.push({
      severity: "error",
      message: "site-metadata.json missing buildId or webfortradesSlug (rebuild required)",
    });
  }

  const html = await page.content();
  if (!html.includes(BUILD_MARKER_BUILD_ID) || !html.includes(BUILD_MARKER_SLUG)) {
    issues.push({
      severity: "error",
      message: "Page HTML missing WebForTrades build marker meta tags",
    });
  }
  if (meta.buildId && !html.includes(meta.buildId)) {
    issues.push({
      severity: "error",
      message: `Page HTML missing buildId ${meta.buildId}`,
    });
  }

  if (lead.site_url && lead.verified_site_url && lead.site_url !== lead.verified_site_url) {
    issues.push({
      severity: "error",
      message: `Lead site_url differs from verified_site_url (${lead.site_url} vs ${lead.verified_site_url})`,
    });
  }

  const deploy = loadDeployManifest(ROOT, slug);
  if (lead.state === "DEPLOYED" && deploy?.alias_status === "NEEDS_MANUAL_ALIAS") {
    issues.push({
      severity: "error",
      message: "Deploy alias_status is NEEDS_MANUAL_ALIAS",
    });
  }

  return issues;
}

async function runChecks(page: Page, brief: SiteBrief | null, lead: Lead, siteDir: string): Promise<ReviewIssue[]> {
  const issues: ReviewIssue[] = brief ? runBriefChecks(brief, lead) : [];
  const bodyText = await page.locator("body").innerText();

  const buildNotesPath = path.join(siteDir, "build-notes.md");
  if (!fs.existsSync(buildNotesPath)) {
    issues.push({
      severity: "error",
      message: "build-notes.md missing (checklist confirmation required)",
    });
  } else {
    const notes = fs.readFileSync(buildNotesPath, "utf8");
    if (!buildNotesMentionsChecklist(notes)) {
      issues.push({
        severity: "error",
        message: "build-notes.md does not confirm site-build-checklist.md was read",
      });
    }
  }

  const hero = page.locator(HERO_SELECTOR);
  const heroQuote = hero.locator('a[href="#contact"]');
  if ((await heroQuote.count()) === 0) {
    issues.push({ severity: "error", message: "Hero missing primary quote CTA linking to #contact" });
  } else {
    const quoteText = (await heroQuote.first().innerText()).toLowerCase();
    if (!/get (a )?quote|free quote/.test(quoteText)) {
      issues.push({
        severity: "error",
        message: `Hero primary CTA text must be "Get a quote" or "Get a free quote" (found: ${quoteText})`,
      });
    }
  }

  const heroPhone = hero.locator('a[href^="tel:"]');
  if ((await heroPhone.count()) === 0) {
    issues.push({ severity: "error", message: "Hero missing secondary phone CTA (tel: link)" });
  }

  const headerBrand = page.locator('[data-review="header-brand"]');
  if ((await headerBrand.count()) === 0) {
    issues.push({ severity: "error", message: "Header brand link missing (data-review=header-brand)" });
  } else {
    const brandText = (await headerBrand.first().innerText()).trim();
    const brandHref = await headerBrand.first().getAttribute("href");
    if (!brandHref || brandHref === "#contact") {
      issues.push({
        severity: "error",
        message: "Header brand must link to top of page (# or /)",
      });
    }

    if (brief?.business_name?.trim()) {
      const expectedName = resolveBusinessName(brief, lead);
      if (!brandText.includes(expectedName)) {
        issues.push({
          severity: "error",
          message: `Header brand "${brandText}" does not include business name "${expectedName}"`,
        });
      }
      const serviceMatch = headerBrandLooksLikeService(
        brandText,
        expectedName,
        brief.services ?? []
      );
      if (serviceMatch) {
        issues.push({ severity: "error", message: serviceMatch });
      }
      if (lead.slug === "bristol-plumbing-co" && !brandText.includes("Bristol Plumbing Co.")) {
        issues.push({
          severity: "error",
          message: 'Bristol site header must show "Bristol Plumbing Co."',
        });
      }
    }
  }

  const mobileBar = page.locator('[data-review="mobile-call"]');
  if ((await mobileBar.count()) === 0) {
    issues.push({ severity: "error", message: "Mobile sticky bar missing" });
  } else {
    const mobileQuote = mobileBar.locator('a[href="#contact"]');
    const mobileCall = mobileBar.locator('a[href^="tel:"]');
    if ((await mobileQuote.count()) === 0) {
      issues.push({ severity: "error", message: "Mobile sticky bar missing Get quote CTA" });
    }
    if ((await mobileCall.count()) === 0) {
      issues.push({ severity: "error", message: "Mobile sticky bar missing Call CTA" });
    }
  }

  const midPageCtaCount = await page.locator('[data-review="mid-page-cta"]').count();
  if (midPageCtaCount === 0) {
    issues.push({ severity: "error", message: "No mid-page CTAs found (need 2-3)" });
  } else if (midPageCtaCount < 2) {
    issues.push({
      severity: "warn",
      message: `Only ${midPageCtaCount} mid-page CTA(s) found (target 2-3)`,
    });
  } else if (midPageCtaCount > 3) {
    issues.push({
      severity: "warn",
      message: `${midPageCtaCount} mid-page CTAs found (target 2-3)`,
    });
  }

  const reviewsSection = page.locator('[data-review="reviews"]');
  if ((await reviewsSection.count()) > 0) {
    const reviewsMidCta = reviewsSection.locator('[data-review="mid-page-cta"]');
    if ((await reviewsMidCta.count()) > 0) {
      issues.push({
        severity: "error",
        message: "Reviews section must not contain a generic mid-page quote CTA",
      });
    }

    const mapsUrl = brief?.google_maps_url?.trim();
    const isGoogleMapsUrl =
      mapsUrl &&
      /google\.(com|[a-z]{2,3})\/maps|maps\.google|g\.page|goo\.gl\/maps|business\.google/i.test(
        mapsUrl
      );
    if (isGoogleMapsUrl) {
      const googleBtn = reviewsSection.locator('[data-review="google-reviews-btn"]');
      if ((await googleBtn.count()) === 0) {
        issues.push({
          severity: "error",
          message: "Reviews section missing Read all Google reviews button",
        });
      } else {
        const href = await googleBtn.first().getAttribute("href");
        if (!href || href !== mapsUrl) {
          issues.push({
            severity: "error",
            message: "Google reviews button href must match brief google_maps_url",
          });
        }
      }
    }
  }

  const statsText = await page.locator('[data-review="stats"]').innerText().catch(() => "");
  if (statsText && DISALLOWED_STAT_LABEL.test(statsText)) {
    const notes = fs.existsSync(buildNotesPath)
      ? fs.readFileSync(buildNotesPath, "utf8")
      : "";
    if (!buildNotesAllowsWeakStats(notes)) {
      issues.push({
        severity: "error",
        message:
          "Disallowed weak stat label (photos, images, gallery, services listed, etc.)",
      });
    } else {
      issues.push({
        severity: "warn",
        message: "Weak stat label used with explicit allow in build-notes",
      });
    }
  }

  if (brief?.service_areas_inferred !== false) {
    const coveragePattern = /towns covered|areas covered/i;
    if (coveragePattern.test(bodyText) || coveragePattern.test(statsText)) {
      issues.push({
        severity: "error",
        message: 'Inferred service areas must not appear as a "towns covered" or "areas covered" stat',
      });
    }
  }

  if (brief) {
    if (brief.google_review_count_sourced && typeof brief.google_review_count === "number") {
      const expected = String(brief.google_review_count);
      const statMatch = statsText.match(/(\d+)\s*\n?\s*Google reviews/i);
      if (statMatch && statMatch[1] !== expected) {
        issues.push({
          severity: "error",
          message: `Review count stat (${statMatch[1]}) does not match brief Google total (${expected})`,
        });
      }
      const snippetCount = brief.reviews?.length ?? 0;
      if (snippetCount > 0 && snippetCount !== brief.google_review_count) {
        const snippetInStats = statsText.match(new RegExp(`\\b${snippetCount}\\b`));
        if (snippetInStats && statMatch?.[1] === String(snippetCount)) {
          issues.push({
            severity: "error",
            message: `Stat shows snippet count (${snippetCount}) instead of sourced Google total (${expected})`,
          });
        }
      }
    } else if (/(\d+)\s*\n?\s*Google reviews/i.test(statsText)) {
      issues.push({
        severity: "error",
        message: "Numeric Google review count shown but brief has no sourced total",
      });
    }
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);

  const footerCreditVisible = await page.evaluate(() => {
    const credit = document.querySelector('[data-review="footer"] a[href*="webfortradesuk"]');
    if (!credit) return { ok: false, reason: "Footer credit link missing" };
    const rect = credit.getBoundingClientRect();
    const style = getComputedStyle(credit);
    if (style.visibility === "hidden" || style.display === "none" || rect.height === 0) {
      return { ok: false, reason: "Footer credit not visible" };
    }
    const mobileBar = document.querySelector('[data-review="mobile-call"]');
    if (mobileBar) {
      const barRect = mobileBar.getBoundingClientRect();
      const overlap = rect.bottom > barRect.top && rect.top < barRect.bottom;
      if (overlap) return { ok: false, reason: "Mobile sticky bar overlaps footer credit" };
    }
    return { ok: true, reason: "" };
  });

  if (!footerCreditVisible.ok) {
    issues.push({
      severity: "error",
      message: footerCreditVisible.reason ?? "Footer credit not fully visible on mobile",
    });
  }

  const footerCredit = page.locator('[data-review="footer"] a[href*="webfortradesuk"]');
  if ((await footerCredit.count()) === 0) {
    issues.push({
      severity: "error",
      message: "Footer credit must link to https://www.webfortradesuk.co.uk",
    });
  }

  if (/—/.test(bodyText)) {
    issues.push({ severity: "error", message: "Em dash found in visible page copy" });
  }

  if (brief) {
    issues.push(...runContactNameChecks(brief, bodyText, lead.slug ?? ""));
  }

  if (brief && !brief.owner_name?.trim() && brief.service_area[0]) {
    const city = brief.service_area[0];
    if (bodyText.includes(`A note from ${city}`)) {
      issues.push({
        severity: "error",
        message: `Owner missing but copy says "A note from ${city}"`,
      });
    }
  }

  if (brief?.address) {
    const streetPart = brief.address.split(",")[0]?.trim() ?? "";
    if (streetPart && /^\d/.test(streetPart)) {
      const occurrences = bodyText.split(streetPart).length - 1;
      if (occurrences > 0) {
        issues.push({
          severity: "error",
          message: `Full street address repeated ${occurrences} time(s) in visible copy`,
        });
      }
    }
  }

  if (brief && lead.slug) {
    const metaPath = path.join(siteDir, "data", "site-metadata.json");
    const metaTitle = fs.existsSync(metaPath)
      ? (JSON.parse(fs.readFileSync(metaPath, "utf8")) as { title: string }).title
      : "";
    for (const locIssue of runLocationCopyChecks({
      root: ROOT,
      slug: lead.slug,
      address: brief.address,
      basedLocation: brief.based_location ?? null,
      serviceArea: brief.service_area,
      bodyText,
      metadataTitle: metaTitle,
    })) {
      issues.push(locIssue);
    }
    for (const galIssue of runGalleryDiversityChecks(ROOT, lead.slug, bodyText)) {
      issues.push(galIssue);
    }
    for (const fbIssue of runFacebookBriefChecks(ROOT, lead.slug)) {
      issues.push(fbIssue);
    }

    const fp = loadDesignFingerprint(ROOT, lead.slug);
    if (fp) {
      const batchSlugs = ["jt-plumbing", "nfs-plumbing-heating", "greens-precise-plumbing-heating-ltd"].filter(
        (s) => s !== lead.slug
      );
      for (const otherSlug of batchSlugs) {
        const other = loadDesignFingerprint(ROOT, otherSlug);
        if (other) {
          for (const u of compareFingerprints(fp, other)) {
            issues.push(u);
          }
        }
      }
      const fps = batchSlugs
        .map((s) => loadDesignFingerprint(ROOT, s))
        .filter(Boolean) as NonNullable<ReturnType<typeof loadDesignFingerprint>>[];
      fps.push(fp);
      const score = creativeUniquenessScore(fps);
      if (score < 50) {
        issues.push({
          severity: "error",
          message: `Creative uniqueness score too low (${score}/100) vs batch peers`,
        });
      } else if (score < 65) {
        issues.push({
          severity: "warn",
          message: `Creative uniqueness score moderate (${score}/100)`,
        });
      }
    }

    if (!loadCreativeBrief(ROOT, lead.slug)) {
      issues.push({
        severity: "error",
        message: "Missing creative-brief.json (required for all prospect builds)",
      });
    }

    if (/Plumbing sorted properly/i.test(bodyText)) {
      const cb = loadCreativeBrief(ROOT, lead.slug);
      if (cb?.hero_headline !== "Plumbing sorted properly.") {
        issues.push({
          severity: "warn",
          message: 'Overused headline "Plumbing sorted properly" found in page',
        });
      }
    }
  }

  const headerSticky = await page.evaluate(() => {
    const header = document.querySelector('[data-review="header"]');
    if (!header) return false;
    const style = getComputedStyle(header);
    return style.position === "sticky" || style.position === "fixed";
  });
  if (!headerSticky) {
    issues.push({ severity: "error", message: "Header is not sticky or fixed" });
  }

  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(bodyText)) {
      issues.push({ severity: "error", message: `Placeholder text matched: ${pattern}` });
    }
  }

  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img"));
    return imgs
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.getAttribute("alt") ?? img.getAttribute("src") ?? "unknown");
  });
  if (brokenImages.length) {
    issues.push({
      severity: "error",
      message: `Broken images: ${brokenImages.join(", ")}`,
    });
  }

  const phoneLinks = page.locator('a[href^="tel:"]');
  if ((await phoneLinks.count()) === 0) {
    issues.push({ severity: "error", message: "No click-to-call tel: links found" });
  } else {
    const href = await phoneLinks.first().getAttribute("href");
    if (!href || href === "tel:" || href === "tel:#contact") {
      issues.push({ severity: "error", message: "Invalid tel: href on primary CTA" });
    }
  }

  const form = page.locator('[data-review="contact"] form');
  if ((await form.count()) === 0) {
    issues.push({ severity: "error", message: "Contact form missing" });
  } else {
    const emailField = form.locator('input[name="email"]');
    if ((await emailField.count()) === 0) {
      issues.push({ severity: "error", message: "Contact form missing email field" });
    }
    const photoField = form.locator('input[type="file"][name="photos"]');
    if ((await photoField.count()) === 0) {
      issues.push({ severity: "error", message: "Contact form missing optional photo upload" });
    }
    const required = await form.locator("[required]").count();
    if (required < 3) {
      issues.push({ severity: "warn", message: "Contact form has few required fields" });
    }
  }

  const overflows = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 2;
  });
  if (overflows) {
    issues.push({ severity: "error", message: "Horizontal layout overflow detected" });
  }

  const ctaVisible = await page.locator(`${HERO_SELECTOR} a`).first().isVisible();
  if (!ctaVisible) {
    issues.push({ severity: "error", message: "Primary hero CTA not visible" });
  }

  // Computed-style integrity: catch an unstyled build (e.g. globals.css not
  // imported) before it can ever deploy. These read what the browser applied,
  // so they fail the raw-HTML / default-font / no-preflight failure mode.
  const styleMetrics = await collectStyleMetrics(page);
  for (const styleIssue of evaluateComputedStyle(styleMetrics)) {
    issues.push(styleIssue);
  }

  return issues;
}

async function main(): Promise<void> {
  requireSiteBuildChecklist();
  console.log("Read site-build-checklist.md");

  const { slug: slugArg, skipPreviewAssets } = parseArgs();
  const lead = slugArg ? getLeadBySlug(slugArg) : getNextBuiltLead();

  if (!lead?.slug) {
    console.error("No BUILT lead found. Run build:site first, or pass --slug.");
    process.exit(1);
  }

  const slug = lead.slug;
  const siteDir = path.join(ROOT, "sites", slug);
  if (!fs.existsSync(path.join(siteDir, "package.json"))) {
    console.error(`Site not found: ${siteDir}`);
    process.exit(1);
  }

  const outDir = path.join(ROOT, "screenshots", slug);
  fs.mkdirSync(outDir, { recursive: true });
  const siteBrief = loadSiteBrief(siteDir);

  console.log(`Reviewing sites/${slug}...${skipPreviewAssets ? " (preview assets skipped)" : ""}`);
  const dev = startReviewServer(siteDir);

  try {
    await waitForServer(REVIEW_URL);
    const browser = await chromium.launch();
    const page = await browser.newPage();

    if (!skipPreviewAssets) {
      for (const viewport of VIEWPORTS) {
        console.log(`Screenshotting ${viewport.label} (${viewport.width}px)...`);
        await screenshotSections(page, outDir, viewport);
      }
    } else {
      console.log("Skipping outreach screenshots ( --skip-preview-assets )");
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(REVIEW_URL, { waitUntil: "domcontentloaded" });

    const issues = await runChecks(page, siteBrief, lead, siteDir);

    const planPath = path.join(siteDir, "data", "section-plan.json");
    if (!fs.existsSync(planPath)) {
      issues.push({ severity: "error", message: "section-plan.json missing in site data (plan-driven build required)" });
    }

    const bodyText = await page.locator("body").innerText();
    for (const heading of TEMPLATE_HEADING_BLACKLIST) {
      if (bodyText.includes(heading)) {
        issues.push({
          severity: "error",
          message: `Template heading found on page: ${heading}`,
        });
      }
    }
    if (/A note from /i.test(bodyText) && /owner-note/.test(await page.content())) {
      issues.push({ severity: "error", message: "Generic owner-note pattern found on page" });
    }

    issues.push(...runMetadataAndPreviewChecks(siteDir, slug, siteBrief, lead, { skipPreviewAssets }));
    if (!skipPreviewAssets) {
      issues.push(...(await runPreviewAssetDevChecks(slug)));
    }
    issues.push(...(await runMetadataHtmlChecks(page)));
    issues.push(...(await runBuildMarkerChecks(page, siteDir, slug, lead)));

    const siteDesign = loadSiteDesignConfig();
    const pageHtml = await page.content();
    if (siteDesign.text_only_wordmarks) {
      for (const issue of evaluateTextOnlyWordmarksHtml(pageHtml)) {
        issues.push(issue);
      }
    }
    if (siteDesign.ban_owner_name_section_titles) {
      for (const issue of evaluateOwnerNameSectionTitleBanHtml(pageHtml)) {
        issues.push(issue);
      }
    }

    const errors = issues.filter((i) => i.severity === "error");

    await browser.close();

    if (errors.length) {
      console.error("\nReview FAILED:");
      for (const issue of issues) {
        console.error(`  [${issue.severity}] ${issue.message}`);
      }
      console.error("\nFix issues in sites/" + slug + " and re-run: npm run review");
      process.exit(1);
    }

    if (issues.length) {
      console.warn("\nWarnings:");
      for (const issue of issues) console.warn(`  ${issue.message}`);
    }

    updateLead(lead.id, { state: "REVIEWED" });
    console.log(`\n✓ Screenshots saved to screenshots/${slug}/`);
    console.log(`✓ State → REVIEWED (lead id=${lead.id})`);
  } finally {
    stopStaticPreviewServer(dev);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
