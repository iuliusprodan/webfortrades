import fs from "node:fs";
import path from "node:path";
import type { DesignDirectionSelection } from "./design_direction.js";
import type { LocationValidationResult } from "./location_validation.js";
import type { GallerySelectionResult } from "./image_gallery.js";
import { recommendLayoutForImageSet, buildImageManifestFromPhotos } from "./image_gallery.js";

export interface CreativeBrief {
  slug: string;
  business_name: string;
  trade_niche: string;
  actual_city_town: string | null;
  verified_based_location: string | null;
  location_confidence: string;
  location_validation_status: string;
  logo_available: boolean;
  dominant_colours_logo: string[];
  dominant_colours_photos: string[];
  chosen_colour_palette: string;
  chosen_fonts: string;
  chosen_layout_direction: string;
  chosen_tone_of_voice: string;
  reason_for_design_choices: string;
  inspired_by_template: string | null;
  deliberately_different_from: string[];
  image_selection_strategy: string;
  service_selection_strategy: string;
  location_validation_notes: string;
  risks_or_manual_review_flags: string[];
  hero_headline: string;
  services: string[];
  gallery_cluster_notes: string[];
  facebook_verified: boolean;
  facebook_url: string | null;
  facebook_verification_reasons: string[];
  facebook_logo_found: boolean;
  facebook_logo_used: boolean;
  facebook_logo_path: string | null;
  facebook_photos_found: number;
  facebook_photos_selected: number;
  facebook_design_notes: string;
  layout_recommendation_note: string;
  image_manifest_summary: string;
  created_at: string;
}

export function buildCreativeBrief(input: {
  slug: string;
  businessName: string;
  niche: string | null;
  location: LocationValidationResult;
  design: DesignDirectionSelection;
  logoColors: string[];
  photoColors: string[];
  logoAvailable: boolean;
  services: string[];
  serviceStrategy: string;
  gallery: GallerySelectionResult;
  paletteKey: string;
  facebook?: {
    url: string | null;
    verified: boolean;
    verification_reasons: string[];
    logo_path: string | null;
    logo_used: boolean;
    photos_found: number;
    photos_selected: number;
    logo_palette: string[];
  } | null;
}): CreativeBrief {
  const loc = input.location;
  const risks: string[] = [];
  if (loc.status === "LOCATION_MISMATCH_NEEDS_REVIEW") {
    risks.push(loc.mismatchReason ?? "Location mismatch needs review");
  }
  if (input.gallery.photos.length <= 4) {
    risks.push("Limited photo count: gallery kept compact");
  }
  if (input.gallery.clusterNotes.some((n) => /: [4-9] image/.test(n))) {
    risks.push("Multiple photos from same project detected; gallery capped per cluster");
  }
  const fb = input.facebook;
  const manifest = buildImageManifestFromPhotos(
    input.gallery.photos.map((p) => ({
      local: p.local,
      source_url: p.source_url,
      classification: p.classification,
      source_type: p.source_type,
      selected: p.selected,
      selection_reason: p.selection_reason,
    })),
    Boolean(fb?.verified)
  );
  const layoutRec = recommendLayoutForImageSet(manifest);
  if (input.gallery.photos.length <= 2) {
    risks.push("Very few photos - proof-led layout required, no placeholder gallery boxes");
  }

  const fbNotes = fb?.verified
    ? `Verified Facebook page (${fb.url}). ${fb.photos_selected} Facebook photo(s) selected from ${fb.photos_found} found.${
        fb.logo_path ? " Logo sampled for palette." : ""
      }`
    : fb?.url
      ? `Facebook page found but not verified for automatic asset use (${fb.url})`
      : "No verified Facebook page used";

  return {
    slug: input.slug,
    business_name: input.businessName,
    trade_niche: input.niche ?? "local trade",
    actual_city_town: loc.basedCity,
    verified_based_location: loc.basedLocation,
    location_confidence: loc.confidence,
    location_validation_status: loc.status,
    logo_available: input.logoAvailable,
    dominant_colours_logo: input.logoColors,
    dominant_colours_photos: input.photoColors,
    chosen_colour_palette: input.paletteKey,
    chosen_fonts: `${input.design.fonts.display} + ${input.design.fonts.body}`,
    chosen_layout_direction: input.design.layoutFamily,
    chosen_tone_of_voice: input.design.toneOfVoice,
    reason_for_design_choices: input.design.reasonForChoices,
    inspired_by_template: input.design.inspiredBy,
    deliberately_different_from: input.design.deliberatelyDifferentFrom,
    image_selection_strategy: input.gallery.strategy,
    service_selection_strategy: input.serviceStrategy,
    location_validation_notes: loc.mismatchReason
      ? `${loc.mismatchReason}. Site uses Google address city (${loc.basedCity}), not prospect region (${loc.prospectRegion}).`
      : `Based location verified from Google address: ${loc.basedLocation ?? loc.basedCity ?? "unknown"}`,
    risks_or_manual_review_flags: risks,
    hero_headline: input.design.heroHeadline,
    services: input.services,
    gallery_cluster_notes: input.gallery.clusterNotes,
    facebook_verified: Boolean(fb?.verified),
    facebook_url: fb?.url ?? null,
    facebook_verification_reasons: fb?.verification_reasons ?? [],
    facebook_logo_found: Boolean(fb?.logo_path),
    facebook_logo_used: Boolean(fb?.logo_used),
    facebook_logo_path: fb?.logo_path ?? null,
    facebook_photos_found: fb?.photos_found ?? 0,
    facebook_photos_selected: fb?.photos_selected ?? 0,
    facebook_design_notes: fbNotes,
    layout_recommendation_note: layoutRec.note,
    image_manifest_summary: `${manifest.filter((m) => m.selected && m.purpose === "gallery").length} gallery images, ${manifest.filter((m) => m.purpose === "logo").length} logo asset(s)`,
    created_at: new Date().toISOString(),
  };
}

export function creativeBriefToMarkdown(brief: CreativeBrief): string {
  return `# Creative brief - ${brief.business_name}

- Slug: \`${brief.slug}\`
- Created: ${brief.created_at.slice(0, 10)}

## Business
- Name: ${brief.business_name}
- Trade/niche: ${brief.trade_niche}
- Actual city/town: ${brief.actual_city_town ?? "unknown"}
- Verified based location: ${brief.verified_based_location ?? "unknown"}
- Location confidence: ${brief.location_confidence}
- Location validation: ${brief.location_validation_status}

## Brand signals
- Logo available: ${brief.logo_available ? "yes" : "no"}
- Dominant colours (logo): ${brief.dominant_colours_logo.join(", ") || "none"}
- Dominant colours (photos): ${brief.dominant_colours_photos.join(", ") || "none"}

## Facebook
- Verified: ${brief.facebook_verified ? "yes" : "no"}
- URL: ${brief.facebook_url ?? "none"}
- Verification: ${brief.facebook_verification_reasons.join("; ") || "n/a"}
- Logo found: ${brief.facebook_logo_found ? "yes" : "no"}
- Logo used in site: ${brief.facebook_logo_used ? "yes" : "no"}
- Facebook photos found/selected: ${brief.facebook_photos_found}/${brief.facebook_photos_selected}
- Design notes: ${brief.facebook_design_notes}

## Design direction
- Colour palette: ${brief.chosen_colour_palette}
- Fonts: ${brief.chosen_fonts}
- Layout: ${brief.chosen_layout_direction}
- Tone: ${brief.chosen_tone_of_voice}
- Hero headline: ${brief.hero_headline}
- Inspired by: ${brief.inspired_by_template ?? "none (original direction)"}
- Deliberately different from: ${brief.deliberately_different_from.join(", ") || "n/a"}

## Rationale
${brief.reason_for_design_choices}

## Content strategy
- Services (${brief.services.length}): ${brief.services.join("; ")}
- Service selection: ${brief.service_selection_strategy}
- Image selection: ${brief.image_selection_strategy}
- Gallery clusters: ${brief.gallery_cluster_notes.join("; ") || "n/a"}

## Location validation
${brief.location_validation_notes}

## Risks / manual review
${brief.risks_or_manual_review_flags.length ? brief.risks_or_manual_review_flags.map((r) => `- ${r}`).join("\n") : "- none"}
`;
}

export function saveCreativeBrief(root: string, brief: CreativeBrief): void {
  const dir = path.join(root, "briefs", brief.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "creative-brief.json"),
    JSON.stringify(brief, null, 2) + "\n"
  );
  fs.writeFileSync(path.join(dir, "creative-brief.md"), creativeBriefToMarkdown(brief) + "\n");
}

export function loadCreativeBrief(root: string, slug: string): CreativeBrief | null {
  const p = path.join(root, "briefs", slug, "creative-brief.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8")) as CreativeBrief;
}
