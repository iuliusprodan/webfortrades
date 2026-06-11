import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { parse as parseYaml } from "yaml";
import { getLeadBySlug, getNextGatheredLead, updateLead } from "./db.js";
import { syncLibraryFromSite } from "./library_sync.js";
import {
  basedLocationLabel,
  resolveBusinessName,
} from "./site_content.js";
import { generateBuildId } from "./build_marker.js";
import { requireSiteBuildChecklist } from "./site_checklist.js";
import { requireSiteDesignSkillRead } from "./site_design_skill.js";
import {
  formatArtifactNotes,
  requireSiteArtifacts,
} from "./site_artifacts.js";
import { buildSiteMetadata } from "./site_metadata.js";
import { extractLikelyContactNameFromReviews } from "./contact_name.js";
import { contactabilityBlocksPipeline } from "./contactability.js";
import {
  validateBusinessLocation,
  buildVerifiedServiceArea,
} from "./location_validation.js";
import {
  chooseDesignDirection,
  PALETTE_PRESETS,
  type CreativeConstraint,
} from "./design_direction.js";
import { selectGalleryPhotos } from "./image_gallery.js";
import { buildCreativeBrief, saveCreativeBrief } from "./creative_brief.js";
import { deriveBusinessServices } from "./business_services.js";
import { hasOpenDesignPort, loadSiteDesignConfig, OD_PORT_MARKER } from "./site_config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const TEMPLATE = path.join(__dirname, "templates", "site");

interface Brief {
  business_name: string;
  owner_name: string | null;
  contact_name?: string | null;
  contact_name_source?: "google_reviews" | null;
  contact_name_confidence?: "high" | "medium" | "low" | null;
  contact_name_evidence_count?: number;
  contact_name_usage_allowed?: boolean;
  possible_contact_name?: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  opening_hours: string[];
  services: string[];
  service_area: string[];
  based_location?: string | null;
  google_rating?: number | null;
  google_review_count?: number | null;
  google_review_count_sourced?: boolean;
  service_areas_inferred?: boolean;
  google_maps_url?: string | null;
  website_status?: string | null;
  website_url?: string | null;
  photos: {
    local: string;
    source_url: string;
    width: number;
    height: number;
    classification?: string;
    pair_id?: string | null;
    caption?: string;
    cluster_id?: string;
  }[];
  reviews: { text: string; reviewer: string; rating: number }[];
  social: {
    facebook: string | null;
    instagram: string | null;
    youtube?: string | null;
    tiktok?: string | null;
  };
  gallery_layout?: "before_after_pairs" | "completed_project_gallery";
  brand: { colours: string[]; logo_url: string | null; logo_local?: string | null };
  facebook?: {
    url: string | null;
    verified: boolean;
    verification_reasons: string[];
    logo_path: string | null;
    logo_palette: string[];
    photos_found: number;
    photos_selected: number;
  };
  source_urls?: string[];
  sources?: string[];
  notes?: string[];
  location_validation_status?: string;
}

function parseArgs(): {
  slug?: string;
  allowManualReview?: boolean;
  allowLocationMismatch?: boolean;
  enforceSiteSkill?: boolean;
} {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  let allowManualReview = false;
  let allowLocationMismatch = false;
  let enforceSiteSkill = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    else if (args[i] === "--allow-manual-review") allowManualReview = true;
    else if (args[i] === "--allow-location-mismatch") allowLocationMismatch = true;
    else if (args[i] === "--enforce-site-skill") enforceSiteSkill = true;
  }
  return { slug, allowManualReview, allowLocationMismatch, enforceSiteSkill };
}

function loadCreativeConstraint(slug: string): CreativeConstraint | null {
  const p = path.join(ROOT, "briefs", slug, "creative-constraint.json");
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as CreativeConstraint;
  } catch {
    return null;
  }
}

function copySkillArtifacts(slug: string, dataDir: string): void {
  const briefDirPath = path.join(ROOT, "briefs", slug);
  for (const file of ["section-plan.json", "site-strategy.json", "source-evidence.json"]) {
    const src = path.join(briefDirPath, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(dataDir, file));
    }
  }
}

function loadSectionPlanHeroHeadline(slug: string): string | null {
  const planPath = path.join(ROOT, "briefs", slug, "section-plan.json");
  if (!fs.existsSync(planPath)) return null;
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8")) as {
    sections?: { id: string; heading: string | null }[];
  };
  const hero = plan.sections?.find((s) => /hero/.test(s.id));
  return hero?.heading?.trim() ?? null;
}

function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function replaceInFile(filePath: string, replacements: Record<string, string>): void {
  let content = fs.readFileSync(filePath, "utf8");
  for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
  }
  fs.writeFileSync(filePath, content);
}

function appendMemory(direction: string, palette: object, slug: string): void {
  const memPath = path.join(ROOT, "memory.md");
  const entry = `\n## Build: ${slug} (${new Date().toISOString().slice(0, 10)})\n- Direction: ${direction}\n- Palette: ${JSON.stringify(palette)}\n`;
  fs.appendFileSync(memPath, entry);
}

function writeBuildNotes(
  siteDir: string,
  slug: string,
  brief: Brief,
  design: object,
  siteUrl: string,
  creativeBriefPath: string,
  siteMetadata: ReturnType<typeof buildSiteMetadata>,
  artifactNotes: string,
  skillPath: string
): void {
  const statLines: string[] = [];
  if (typeof brief.google_rating === "number" && brief.google_rating > 0) {
    statLines.push(`${brief.google_rating}★ average rating (Google Places)`);
  }
  if (brief.google_review_count_sourced && typeof brief.google_review_count === "number") {
    statLines.push(`${brief.google_review_count} Google reviews (Google Places)`);
  }
  const statsUsed =
    statLines.length > 0 ? statLines.join("; ") : "none (only strong sourced stats shown)";

  const notes = `# Build notes - ${brief.business_name}

- Slug: \`${slug}\`
- Checklist: read \`prompts/site-build-checklist.md\` before build
- Site design skill: read \`${skillPath}\` before build
- Plan-driven build: section plan from \`briefs/${slug}/section-plan.json\`
${artifactNotes}
- Creative brief: \`${creativeBriefPath}\`
- Metadata title: ${siteMetadata.title}
- Metadata description: ${siteMetadata.description}
- OG image strategy: run \`npm run preview:site -- --slug ${slug}\` after build
- Trade style: ${(design as { direction: string }).direction}
- Location validation: ${brief.location_validation_status ?? "OK"}
- Headline stats: ${statsUsed}
- Photos used: ${brief.photos.length} (not shown as stats)
- Services: ${brief.services.length}
- Review snippets: ${brief.reviews.length} (not used as total count)
- Google review count (sourced): ${brief.google_review_count_sourced ? brief.google_review_count : "not sourced"}
- Google Maps URL: ${brief.google_maps_url ?? "none"}
- Service areas inferred: ${brief.service_areas_inferred ? "yes" : "no"}
- Build ID: ${siteMetadata.buildId}
- Static export: \`output: 'export'\` for Vercel

## Design system
\`\`\`json
${JSON.stringify(design, null, 2)}
\`\`\`

## Run locally
\`\`\`bash
cd sites/${slug}
npm run dev
\`\`\`
`;
  fs.writeFileSync(path.join(siteDir, "build-notes.md"), notes);
}

function prepareBriefForSite(
  brief: Brief,
  lead: { region: string | null; niche: string | null }
): Brief {
  const reviewsBlob = brief.reviews.map((r) => r.text).join(" ");
  const location = validateBusinessLocation({
    address: brief.address,
    prospectRegion: lead.region,
  });

  const { services, strategy: serviceStrategy } = deriveBusinessServices({
    businessName: brief.business_name,
    rawServices: brief.services,
    reviewsBlob,
    niche: lead.niche,
    photoCount: brief.photos.length,
  });

  const service_area = buildVerifiedServiceArea(location, brief.service_area);
  const based_location =
    location.basedLocation ??
    basedLocationLabel(brief.address, location.basedCity ?? lead.region);

  const contactFields = extractLikelyContactNameFromReviews(
    brief.reviews.map((r) => ({ text: r.text, reviewer: r.reviewer })),
    brief.business_name
  );

  return {
    ...brief,
    ...contactFields,
    services,
    service_area,
    based_location,
    service_areas_inferred: brief.service_areas_inferred ?? true,
    location_validation_status: location.status,
    _serviceStrategy: serviceStrategy,
    _location: location,
  } as Brief & { _serviceStrategy: string; _location: ReturnType<typeof validateBusinessLocation> };
}

async function main(): Promise<void> {
  requireSiteBuildChecklist();
  console.log("Read site-build-checklist.md");
  const skill = requireSiteDesignSkillRead();
  console.log(`Read site design skill: ${skill.path}`);
  const { slug: slugArg, allowManualReview, allowLocationMismatch, enforceSiteSkill } = parseArgs();
  const lead = slugArg ? getLeadBySlug(slugArg) : getNextGatheredLead();

  if (!lead?.slug) {
    console.error(
      "No GATHERED lead found. Run prospect → gather first, or pass --slug <slug>."
    );
    process.exit(1);
  }

  const blockReason = contactabilityBlocksPipeline(lead, { allowManualReview });
  if (blockReason) {
    console.error(
      `Build blocked for ${lead.business_name}: ${blockReason}\nUse --allow-manual-review to override NEEDS_MANUAL_REVIEW only.`
    );
    process.exit(1);
  }

  const slug = lead.slug;
  const artifactStatus = requireSiteArtifacts(slug, { enforce: enforceSiteSkill });
  const briefPath = path.join(ROOT, "briefs", slug, "brief.json");
  if (!fs.existsSync(briefPath)) {
    console.error(`Missing brief: ${briefPath}`);
    process.exit(1);
  }

  const briefRaw = JSON.parse(fs.readFileSync(briefPath, "utf8")) as Brief;
  const businessName = resolveBusinessName(briefRaw, lead);
  const briefPrepared = prepareBriefForSite(
    { ...briefRaw, business_name: briefRaw.business_name?.trim() || businessName },
    lead
  ) as Brief & {
    _serviceStrategy: string;
    _location: ReturnType<typeof validateBusinessLocation>;
  };

  const location = briefPrepared._location;
  if (
    location.status === "MISSING_ADDRESS" &&
    !allowManualReview
  ) {
    console.error(`Build blocked: no verifiable location for ${lead.business_name}`);
    process.exit(1);
  }

  if (location.status === "LOCATION_MISMATCH_NEEDS_REVIEW" && location.addressCity) {
    console.warn(
      `Location note: using Google address city (${location.addressCity}), not prospect region (${location.prospectRegion}).`
    );
  }

  const imagesSrc = path.join(ROOT, "briefs", slug, "images");
  const gallery = await selectGalleryPhotos(briefPrepared.photos, imagesSrc, {
    maxGallery: briefPrepared.photos.length <= 4 ? 3 : 6,
    maxPerCluster: 2,
    basedCity: location.basedCity,
    preferFacebookWhenRepetitive: Boolean(briefPrepared.facebook?.verified),
  });

  const constraint = loadCreativeConstraint(slug);
  if (constraint) {
    console.log(
      `Creative constraint: ${constraint.label ?? "custom"} (palette=${constraint.paletteKey ?? "-"}, fonts=${constraint.fontPairKey ?? "-"}, layout=${constraint.layoutFamily ?? "-"})`
    );
  }

  const logoColors = briefPrepared.brand.colours?.length
    ? briefPrepared.brand.colours
    : briefPrepared.facebook?.logo_palette ?? [];

  const reviewsBlob = briefPrepared.reviews.map((r) => r.text).join(" ");
  const designSelection = chooseDesignDirection({
    slug,
    businessName: briefPrepared.business_name,
    services: briefPrepared.services,
    reviewsBlob,
    niche: lead.niche,
    basedCity: location.basedCity,
    photoCount: briefPrepared.photos.length,
    logoColors,
    root: ROOT,
    constraint,
  });

  const paletteKey =
    PALETTE_PRESETS.find((p) => p.colors.accent === designSelection.colors.accent)?.key ??
    designSelection.direction;

  const creativeBrief = buildCreativeBrief({
    slug,
    businessName: briefPrepared.business_name,
    niche: lead.niche,
    location,
    design: designSelection,
    logoColors,
    photoColors: [designSelection.colors.accent],
    logoAvailable: Boolean(briefPrepared.brand.logo_url || briefPrepared.brand.logo_local),
    services: briefPrepared.services,
    serviceStrategy: briefPrepared._serviceStrategy,
    gallery,
    paletteKey,
    facebook: briefPrepared.facebook
      ? {
          url: briefPrepared.facebook.url,
          verified: briefPrepared.facebook.verified,
          verification_reasons: briefPrepared.facebook.verification_reasons,
          logo_path: briefPrepared.facebook.logo_path,
          logo_used: Boolean(briefPrepared.brand.logo_local),
          photos_found: briefPrepared.facebook.photos_found,
          photos_selected: gallery.photos.filter((p) =>
            p.source_type?.startsWith("facebook")
          ).length,
          logo_palette: briefPrepared.facebook.logo_palette ?? logoColors,
        }
      : null,
  });
  saveCreativeBrief(ROOT, creativeBrief);
  console.log(`Creative brief saved: briefs/${slug}/creative-brief.json`);

  const planHero = loadSectionPlanHeroHeadline(slug);
  if (planHero) {
    designSelection.heroHeadline = planHero.replace(/\.$/, "");
    designSelection.heroHeadlineKey = `${slug}-plan-hero`;
    console.log(`Plan-driven hero: ${designSelection.heroHeadline}`);
  }

  const brief: Brief = {
    ...briefPrepared,
    photos: gallery.photos,
  };
  delete (brief as { _serviceStrategy?: string })._serviceStrategy;
  delete (brief as { _location?: unknown })._location;

  const siteDir = path.join(ROOT, "sites", slug);
  const dataDir = path.join(siteDir, "data");
  const publicImages = path.join(siteDir, "public", "images");
  const siteDesign = loadSiteDesignConfig();
  const preserveOdPort =
    siteDesign.od_port_use_next_build_only && hasOpenDesignPort(siteDir);

  if (fs.existsSync(siteDir)) {
    if (preserveOdPort) {
      console.log(
        `Open Design port detected (${OD_PORT_MARKER}). Skipping template wipe for sites/${slug}.`
      );
    } else {
      fs.rmSync(siteDir, { recursive: true, force: true });
      copyDir(TEMPLATE, siteDir);
    }
  } else {
    copyDir(TEMPLATE, siteDir);
  }

  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(publicImages, { recursive: true });
  copySkillArtifacts(slug, dataDir);

  const siteUrl = lead.site_url ?? `https://${slug}.vercel.app`;
  const buildId = generateBuildId(slug);
  const siteMetadata = buildSiteMetadata(brief, siteUrl, buildId, slug);
  fs.writeFileSync(
    path.join(dataDir, "site-metadata.json"),
    JSON.stringify(siteMetadata, null, 2) + "\n"
  );

  fs.writeFileSync(path.join(dataDir, "brief.json"), JSON.stringify(brief, null, 2) + "\n");
  fs.writeFileSync(briefPath, JSON.stringify(brief, null, 2) + "\n");

  if (fs.existsSync(imagesSrc)) {
    copyDir(imagesSrc, publicImages);
  }

  const designSystem = {
    slug,
    business_name: brief.business_name,
    direction: designSelection.direction,
    trade: "custom",
    fontPairKey: designSelection.fontPairKey,
    layoutFamily: designSelection.layoutFamily,
    statsStyle: designSelection.statsStyle,
    reviewsStyle: designSelection.reviewsStyle,
    galleryStyle: designSelection.galleryStyle,
    ctaStyle: designSelection.ctaStyle,
    heroHeadline: designSelection.heroHeadline,
    heroHeadlineKey: designSelection.heroHeadlineKey,
    fonts: designSelection.fonts,
    separator: designSelection.separator,
    colors: designSelection.colors,
  };

  fs.writeFileSync(
    path.join(dataDir, "design-system.json"),
    JSON.stringify(designSystem, null, 2) + "\n"
  );
  fs.writeFileSync(
    path.join(siteDir, "design-system.json"),
    JSON.stringify(designSystem, null, 2) + "\n"
  );

  replaceInFile(path.join(siteDir, "package.json"), {
    "{{SLUG}}": slug,
    "{{BUSINESS_NAME}}": brief.business_name,
  });

  writeBuildNotes(
    siteDir,
    slug,
    brief,
    designSystem,
    siteUrl,
    `briefs/${slug}/creative-brief.md`,
    siteMetadata,
    formatArtifactNotes(artifactStatus),
    skill.path.replace(ROOT + path.sep, "")
  );
  appendMemory(designSelection.direction, designSelection.colors, slug);

  console.log(`Installing dependencies in sites/${slug}...`);
  execSync("npm install", { cwd: siteDir, stdio: "inherit" });

  console.log("Building static site...");
  execSync("npm run build", { cwd: siteDir, stdio: "inherit" });

  updateLead(lead.id, { state: "BUILT" });

  syncLibraryFromSite(slug, siteDir, lead, null);

  const config = parseYaml(fs.readFileSync(path.join(ROOT, "config.yaml"), "utf8")) as {
    daily_build_cap: number;
  };

  console.log(`\n✓ Built sites/${slug}`);
  console.log(`✓ Design: ${designSelection.fonts.display} + ${designSelection.fonts.body}, ${paletteKey}`);
  console.log(`✓ Location: ${brief.based_location} (${location.status})`);
  console.log(`✓ State → BUILT (lead id=${lead.id})`);
  console.log(`\nLocal dev URL: http://localhost:3000`);
  console.log(`Run: cd sites/${slug} && npm run dev`);
  console.log(`\nRespecting daily_build_cap: ${config.daily_build_cap}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
