#!/usr/bin/env tsx
/**
 * Unit tests for evaluateSourceQuality - verified-secondary-source vs free-mail email-domain.
 * Run: npx tsx scripts/source_quality.test.ts
 *
 * Regression target: a lead with a VERIFIED Facebook (genuinely multi-source) but a gmail contact
 * email used to FAIL because the email-domain crawl could not run on a free-mail address. A verified
 * secondary source must be sufficient for PASS_WITH_WARNINGS; own-domain email is a positive signal,
 * not a blocking gate.
 */
import { evaluateSourceQuality } from "./source_quality.js";

let failures = 0;
function check(name: string, cond: boolean, detail = ""): void {
  if (cond) console.log(`  ok   - ${name}`);
  else {
    console.error(`  FAIL - ${name}${detail ? " :: " + detail : ""}`);
    failures++;
  }
}

// Minimal LeadValidityResult-shaped stub carrying the verified-platform signal.
// manualReview=true adds the "Lead validity requires manual review" warning (the common spec-site case);
// pass false for a clean lead with no warnings.
function leadValidity(verifiedPlatforms: string[], manualReview = true) {
  return {
    source_confidence_summary: {
      overall: "low",
      verified_platforms: verifiedPlatforms,
      rejected_platforms: [],
      notes: [],
    },
    manual_review_required: manualReview,
    ready_for_build: !manualReview,
  } as never;
}

const base = {
  website_url_validated_flag: true,
  enrichment_complete: true,
  logo_discovery_attempted: true,
  photo_discovery_attempted: true,
  directory_probe_results: [],
};

// 1. THE FIX (D.G. scenario): gmail email + verified Facebook + enrichment complete -> not FAIL.
const dg = evaluateSourceQuality({
  ...base,
  email: "dgdecoratingservices@gmail.com",
  email_domain_checked: false,
  lead_validity: leadValidity(["facebook"]),
});
check("D.G. (gmail + verified FB) is NOT FAIL", dg.source_quality_status !== "FAIL", `${dg.source_quality_status} / ${dg.source_quality_reason}`);
check("D.G. lands at PASS_WITH_WARNINGS", dg.source_quality_status === "PASS_WITH_WARNINGS", dg.source_quality_status);

// 2. REGRESSION GUARD: own-domain email, unchecked, NO verified secondary -> still FAIL.
const ownNoFb = evaluateSourceQuality({
  ...base,
  email: "info@acme-roofing.co.uk",
  email_domain_checked: false,
  lead_validity: leadValidity([]),
});
check("own-domain unchecked + no verified secondary STILL FAILs", ownNoFb.source_quality_status === "FAIL", ownNoFb.source_quality_status);

// 3. own-domain email, unchecked, WITH verified secondary -> not FAIL (downgraded to warning).
const ownFb = evaluateSourceQuality({
  ...base,
  email: "info@acme-roofing.co.uk",
  email_domain_checked: false,
  lead_validity: leadValidity(["facebook"]),
});
check("own-domain unchecked + verified secondary is NOT FAIL", ownFb.source_quality_status !== "FAIL", `${ownFb.source_quality_status} / ${ownFb.source_quality_reason}`);

// 4. CLAMP: 3+ warnings + verified secondary -> PASS_WITH_WARNINGS (not NEEDS_MANUAL_REVIEW).
const manyWarnFb = evaluateSourceQuality({
  ...base,
  email: "shop@gmail.com",
  email_domain_checked: false,
  logo_discovery_attempted: false,
  photo_discovery_attempted: false,
  facebook_image_stats: { images_found: 5, images_attempted: 5, images_downloaded: 0, images_rejected: 5, failures: [] } as never,
  lead_validity: leadValidity(["facebook"]),
});
check("3+ warnings + verified secondary clamps to PASS_WITH_WARNINGS", manyWarnFb.source_quality_status === "PASS_WITH_WARNINGS", `${manyWarnFb.source_quality_status} (warnings=${manyWarnFb.warnings.length})`);

// 5. CLAMP does NOT fire without a verified secondary: 3+ warnings -> NEEDS_MANUAL_REVIEW.
const manyWarnNoFb = evaluateSourceQuality({
  ...base,
  email: "shop@gmail.com",
  email_domain_checked: false,
  logo_discovery_attempted: false,
  photo_discovery_attempted: false,
  facebook_image_stats: { images_found: 5, images_attempted: 5, images_downloaded: 0, images_rejected: 5, failures: [] } as never,
  lead_validity: leadValidity([]),
});
check("3+ warnings without verified secondary stays NEEDS_MANUAL_REVIEW", manyWarnNoFb.source_quality_status === "NEEDS_MANUAL_REVIEW", manyWarnNoFb.source_quality_status);

// 6. own-domain email that WAS checked + no other warnings (manual_review false) -> clean PASS.
const cleanPass = evaluateSourceQuality({
  ...base,
  email: "hello@acme-roofing.co.uk",
  email_domain_checked: true,
  lead_validity: leadValidity(["facebook"], false),
});
check("own-domain checked + no warnings is PASS", cleanPass.source_quality_status === "PASS", cleanPass.source_quality_status);

if (failures) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log("\nAll source_quality tests passed.");
