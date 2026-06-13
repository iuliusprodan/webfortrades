import fs from "node:fs";
import path from "node:path";
import type { Lead } from "./db.js";
import { loadCreativeBrief } from "./creative_brief.js";
import { loadDeployManifest } from "./vercel_alias.js";
import { loadStyleVerifyManifest } from "./style_verify.js";
import { outreachAssetPaths } from "./site_metadata.js";

export interface PitchGateResult {
  ready: boolean;
  blockers: string[];
  warnings: string[];
}

export function evaluatePitchReadiness(
  root: string,
  lead: Lead,
  options?: { allowManualReview?: boolean; allowRedesignPitch?: boolean }
): PitchGateResult {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const slug = lead.slug ?? "";

  if (lead.state !== "DEPLOYED" && lead.state !== "PITCHED") {
    blockers.push(`Lead state is ${lead.state}, expected DEPLOYED`);
  }

  const deploy = loadDeployManifest(root, slug);
  const verifiedUrl =
    (lead as Lead & { verified_site_url?: string | null }).verified_site_url ??
    deploy?.verified_url ??
    null;
  const aliasStatus =
    (lead as Lead & { alias_status?: string | null }).alias_status ??
    deploy?.alias_status ??
    null;

  if (!verifiedUrl) {
    blockers.push("No verified_site_url (deploy alias verification required)");
  }
  if (aliasStatus === "NEEDS_MANUAL_ALIAS") {
    blockers.push("alias_status is NEEDS_MANUAL_ALIAS");
  }
  if (lead.site_url && verifiedUrl && lead.site_url.replace(/\/$/, "") !== verifiedUrl.replace(/\/$/, "")) {
    blockers.push(`site_url (${lead.site_url}) differs from verified_url (${verifiedUrl})`);
  }

  // Live style/visual verification gate. A marker-verified URL is not enough:
  // the deployed page must have passed live style verification (CSS, fonts,
  // layout, no raw-HTML appearance). Block if it failed or was never run.
  const styleVerifiedFlag =
    (lead as Lead & { style_verified?: number | null }).style_verified;
  const styleManifest = loadStyleVerifyManifest(root, slug);
  const styleVerified =
    styleVerifiedFlag === 1 || styleManifest?.ok === true;
  if (styleVerifiedFlag === 0 || styleManifest?.ok === false) {
    blockers.push("style_verified is false (live visual verification failed)");
  } else if (!styleVerified) {
    blockers.push(
      "style not verified (run deploy or `deploy --verify-url-only` to run live style verification)"
    );
  }
  if (verifiedUrl && styleManifest?.url && styleManifest.ok === true) {
    if (styleManifest.url.replace(/\/$/, "") !== verifiedUrl.replace(/\/$/, "")) {
      blockers.push(
        `final_url not verified: style check ran on ${styleManifest.url}, not ${verifiedUrl}`
      );
    }
  }

  const siteDir = path.join(root, "sites", slug);
  if (!fs.existsSync(path.join(siteDir, "build-notes.md"))) {
    blockers.push("Review not confirmed (build-notes.md missing)");
  }

  const cb = loadCreativeBrief(root, slug);
  if (!cb) {
    blockers.push("creative-brief.json missing");
  } else if (cb.location_validation_status === "LOCATION_MISMATCH_NEEDS_REVIEW") {
    if (!options?.allowManualReview) {
      blockers.push(
        `Location mismatch needs manual review (${cb.location_validation_notes})`
      );
    } else {
      warnings.push("Location mismatch flagged; manual review override active");
    }
  }

  if (lead.contactability_status && lead.contactability_status !== "CONTACTABLE") {
    blockers.push(`contactability_status=${lead.contactability_status}`);
  }

  const assets = outreachAssetPaths(slug, root);
  if (!fs.existsSync(assets.ogPublic)) {
    blockers.push("OG image missing (run preview:site)");
  }
  if (!fs.existsSync(assets.heroMobile)) {
    blockers.push("Hero mobile screenshot missing (run preview:site)");
  }

  const batchStatusPath = path.join(root, "briefs", slug, "batch-status.json");
  if (fs.existsSync(batchStatusPath)) {
    const batchStatus = JSON.parse(fs.readFileSync(batchStatusPath, "utf8")) as {
      build_id?: string;
      clone_review?: string;
    };
    const buildId = batchStatus.build_id ?? "";
    if (!buildId || buildId === ":pending" || buildId.endsWith(":pending")) {
      blockers.push(`batch-status build_id is pending (${buildId || "missing"})`);
    }
  }

  const validityPath = path.join(root, "briefs", slug, "lead-validity.json");
  if (fs.existsSync(validityPath)) {
    const validity = JSON.parse(fs.readFileSync(validityPath, "utf8")) as {
      has_real_website?: boolean;
      pitch_type?: string;
      lead_validity_status?: string;
    };
    if (
      validity.has_real_website &&
      validity.pitch_type !== "redesign" &&
      !options?.allowRedesignPitch
    ) {
      blockers.push(
        `Lead has a real website (${validity.lead_validity_status ?? "HAS_REAL_SITE"}); use redesign pitch framing or --allow-redesign-pitch`
      );
    }
  }

  // Clone-review gate: a site that reads as a template clone of prior builds must not pitch.
  const cloneReviewPath = path.join(root, "briefs", slug, "clone-review.json");
  if (fs.existsSync(cloneReviewPath)) {
    const clone = JSON.parse(fs.readFileSync(cloneReviewPath, "utf8")) as {
      passed?: boolean;
      clone_score?: number;
    };
    if (clone.passed === false) {
      blockers.push(
        `clone-review failed (clone_score=${clone.clone_score ?? "?"}); site too similar to other builds`
      );
    }
  }

  // Source-quality gate: the lead's source enrichment must clear the quality bar.
  // FAIL is a hard blocker; NEEDS_MANUAL_REVIEW blocks unless --allow-manual-review.
  const sourceQualityPath = path.join(root, "briefs", slug, "source-quality.json");
  if (fs.existsSync(sourceQualityPath)) {
    const sourceQuality = JSON.parse(fs.readFileSync(sourceQualityPath, "utf8")) as {
      source_quality_status?: string;
      source_quality_reason?: string;
    };
    const status = sourceQuality.source_quality_status;
    const reason = sourceQuality.source_quality_reason ?? "source enrichment incomplete";
    if (status === "FAIL") {
      blockers.push(`source-quality FAIL (${reason})`);
    } else if (status === "NEEDS_MANUAL_REVIEW") {
      if (!options?.allowManualReview) {
        blockers.push(`source-quality NEEDS_MANUAL_REVIEW (${reason})`);
      } else {
        warnings.push(
          "source-quality NEEDS_MANUAL_REVIEW; manual review override active"
        );
      }
    }
  }

  return {
    ready: blockers.length === 0,
    blockers,
    warnings,
  };
}
