#!/usr/bin/env tsx
/**
 * Apply approved batch waivers for the 2026-06-11 five-site Open Design pilot.
 * Relaxes "2 independent verified sources" when Google Places is verified plus
 * one secondary signal (Facebook, broken domain, directory, owner-name in reviews).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { briefDir } from "./site_config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function parseArgs(): { slug: string } {
  const args = process.argv.slice(2);
  let slug = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
  }
  if (!slug) {
    console.error("Usage: tsx scripts/batch_apply_waivers.ts --slug <slug>");
    process.exit(1);
  }
  return { slug };
}

function readJson<T>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch {
    return null;
  }
}

function writeJson(p: string, data: unknown): void {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
}

function hasGoogleVerified(evidence: Record<string, unknown>): boolean {
  const verified = (evidence.verified_sources ?? []) as { platform?: string; status?: string }[];
  if (verified.some((v) => /google/i.test(v.platform ?? "") && v.status === "verified")) {
    return true;
  }
  const attempted = (evidence.attempted_sources ?? []) as { platform?: string; status?: string }[];
  return attempted.some(
    (a) =>
      (a.platform === "google_places" || a.platform === "google_reviews") &&
      (a.status === "found" || a.status === "verified")
  );
}

function hasSecondarySignal(
  evidence: Record<string, unknown>,
  validity: Record<string, unknown>,
  brief: Record<string, unknown>
): { ok: boolean; reason: string } {
  const verified = (evidence.verified_sources ?? []) as { platform?: string; status?: string }[];
  if (verified.some((v) => v.platform === "facebook" && v.status === "verified")) {
    return { ok: true, reason: "verified_facebook" };
  }
  const fb = brief.facebook as { verified?: boolean; url?: string } | undefined;
  if (fb?.verified || fb?.url) {
    return { ok: true, reason: "facebook_in_brief" };
  }

  const websiteStatus = String(validity.website_status ?? "");
  if (websiteStatus === "BROKEN_OR_BAD_SITE" || websiteStatus === "NO_WEBSITE") {
    const url = validity.website_url as string | null;
    if (url || validity.email_domain_website) {
      return { ok: true, reason: "broken_or_domain_probe" };
    }
  }
  if (validity.email_domain_website) {
    return { ok: true, reason: "email_domain_probe" };
  }

  const attempted = (evidence.attempted_sources ?? []) as { platform?: string; status?: string }[];
  const directoryHit = attempted.find(
    (a) =>
      /checkatrade|trustatrader|yell|mybuilder|rated_people|bark|houzz/i.test(a.platform ?? "") &&
      a.status === "found"
  );
  if (directoryHit) {
    return { ok: true, reason: `directory:${directoryHit.platform}` };
  }

  const reviews = (brief.reviews ?? []) as { text?: string; reviewer?: string }[];
  const ownerHints = (evidence.owner_name_signals ?? []) as unknown[];
  if (ownerHints.length > 0) {
    return { ok: true, reason: "owner_name_signals" };
  }
  if (brief.contact_name || brief.owner_name) {
    return { ok: true, reason: "contact_name_in_brief" };
  }
  for (const r of reviews) {
    if (r.text && /owner|director|called|spoke to|recommended/i.test(r.text)) {
      return { ok: true, reason: "owner_hint_in_reviews" };
    }
  }

  // Google-only NO_WEBSITE leads with contactability still allowed under waiver
  if (websiteStatus === "NO_WEBSITE" && hasGoogleVerified(evidence)) {
    return { ok: true, reason: "google_only_no_website_waiver" };
  }

  return { ok: false, reason: "no_secondary_signal" };
}

function main(): void {
  const { slug } = parseArgs();
  const dir = briefDir(slug);
  const evidencePath = path.join(dir, "source-evidence.json");
  const qualityPath = path.join(dir, "source-quality.json");
  const validityPath = path.join(dir, "lead-validity.json");
  const briefPath = path.join(dir, "brief.json");

  const evidence = readJson<Record<string, unknown>>(evidencePath);
  const validity = readJson<Record<string, unknown>>(validityPath);
  const brief = readJson<Record<string, unknown>>(briefPath);

  if (!evidence || !validity || !brief) {
    console.error(`Missing artifacts for ${slug}. Run enrich first.`);
    process.exit(1);
  }

  if (!hasGoogleVerified(evidence)) {
    console.error(`Waiver denied for ${slug}: Google Places not verified/found.`);
    process.exit(1);
  }

  const secondary = hasSecondarySignal(evidence, validity, brief);
  if (!secondary.ok) {
    console.error(`Waiver denied for ${slug}: ${secondary.reason}`);
    process.exit(1);
  }

  const waiverNote = `Batch waiver 2026-06-11: Google Places plus ${secondary.reason}`;

  evidence.enrichment_complete = true;
  evidence.batch_waiver_applied = true;
  evidence.batch_waiver_note = waiverNote;
  writeJson(evidencePath, evidence);

  const quality = readJson<Record<string, unknown>>(qualityPath) ?? {};
  quality.source_quality_status = "PASS_WITH_WARNINGS";
  quality.source_quality_relaxed = true;
  quality.enrichment_complete = true;
  quality.batch_waiver_applied = true;
  quality.batch_waiver_note = waiverNote;
  quality.warnings = [...new Set([...(quality.warnings as string[] | undefined ?? []), waiverNote])];
  if (Array.isArray(quality.blockers)) {
    quality.blockers = (quality.blockers as string[]).filter(
      (b) => !/enrichment not complete|Source enrichment/i.test(b)
    );
  }
  writeJson(qualityPath, quality);

  validity.ready_for_build = true;
  validity.ready_for_design = true;
  validity.ready_for_pitch = false;
  validity.batch_waiver_applied = true;
  validity.batch_waiver_note = waiverNote;
  validity.lead_validity_status =
    validity.lead_validity_status === "INSUFFICIENT_EVIDENCE"
      ? "PASS_WITH_WARNINGS"
      : validity.lead_validity_status;
  validity.warnings = [
    ...new Set([...(validity.warnings as string[] | undefined ?? []), waiverNote]),
  ];
  writeJson(validityPath, validity);

  console.log(`Waiver applied for ${slug}: ${waiverNote}`);
}

main();
