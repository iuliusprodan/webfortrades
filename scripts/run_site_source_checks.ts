/**
 * Ordered hardlock source checks for build:site and port pipeline.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertNoEmDashesForSiteSlug } from "./checks/no_em_dashes.js";
import { assertVoiceReviewForSiteSlug } from "./checks/voice_review.js";
import { assertNoMetaProvenanceForSiteSlug } from "./checks/no_meta_provenance.js";
import { assertNoNegativeServicesForSiteSlug } from "./checks/no_negative_services.js";
import { assertBannedSectionsForSiteSlug } from "./checks/banned_sections.js";
import { assertNoServiceIconsForSiteSlug } from "./checks/no_service_icons.js";
import { assertStickyCtaForSiteSlug } from "./checks/sticky_cta.js";
import { assertHeroSubheadForSiteSlug } from "./checks/hero_subhead.js";
import { assertOwnerVoiceForSiteSlug } from "./checks/owner_voice.js";
import { assertMapEmbedForSiteSlug } from "./checks/map_embed.js";
import { evaluateSectionIntegrityHtml } from "./checks/section_integrity.js";
import { warnIdentityReviewNamesForSiteSlug } from "./checks/identity_review_names.js";
import { assertMobileHeaderForSiteSlug } from "./checks/mobile_header.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "..");

export interface SiteCheckStep {
  order: number;
  name: string;
  blocking: boolean;
  run: (slug: string) => void | Promise<void>;
}

export const SITE_SOURCE_CHECKS: SiteCheckStep[] = [
  { order: 1, name: "no_em_dashes", blocking: true, run: (s) => assertNoEmDashesForSiteSlug(s, ROOT) },
  { order: 2, name: "voice_review", blocking: true, run: (s) => assertVoiceReviewForSiteSlug(s, ROOT) },
  { order: 3, name: "no_meta_provenance", blocking: true, run: (s) => assertNoMetaProvenanceForSiteSlug(s, ROOT) },
  { order: 4, name: "no_negative_services", blocking: true, run: (s) => assertNoNegativeServicesForSiteSlug(s, ROOT) },
  { order: 5, name: "banned_sections", blocking: true, run: (s) => assertBannedSectionsForSiteSlug(s, ROOT) },
  { order: 6, name: "no_service_icons", blocking: true, run: (s) => assertNoServiceIconsForSiteSlug(s, ROOT) },
  { order: 7, name: "sticky_cta", blocking: true, run: (s) => assertStickyCtaForSiteSlug(s, ROOT) },
  { order: 8, name: "hero_subhead", blocking: true, run: (s) => assertHeroSubheadForSiteSlug(s, ROOT) },
  { order: 9, name: "owner_voice", blocking: true, run: (s) => assertOwnerVoiceForSiteSlug(s, ROOT) },
  { order: 10, name: "map_embed", blocking: true, run: (s) => assertMapEmbedForSiteSlug(s, ROOT) },
  {
    order: 11,
    name: "section_integrity",
    blocking: true,
    run: (slug) => {
      const htmlPath = path.join(ROOT, "sites", slug, "out", "index.html");
      if (!fs.existsSync(htmlPath)) {
        console.log("section_integrity: skipped (no out/index.html yet — runs after build)");
        return;
      }
      const issues = evaluateSectionIntegrityHtml(fs.readFileSync(htmlPath, "utf8")).filter(
        (i) => i.severity === "error"
      );
      if (issues.length) {
        throw new Error(`section_integrity failed:\n${issues.map((i) => `  - ${i.message}`).join("\n")}`);
      }
      console.log("section_integrity passed (built HTML).");
    },
  },
  { order: 12, name: "identity_review_names", blocking: false, run: (s) => warnIdentityReviewNamesForSiteSlug(s, ROOT) },
  { order: 13, name: "mobile_header", blocking: true, run: (s) => assertMobileHeaderForSiteSlug(s, ROOT) },
];

export async function runSiteSourceChecks(
  slug: string,
  options: { skipBuilt?: boolean; skipMobile?: boolean } = {}
): Promise<{ passed: string[]; failed: { name: string; error: string }[]; warned: string[] }> {
  const passed: string[] = [];
  const failed: { name: string; error: string }[] = [];
  const warned: string[] = [];

  for (const step of SITE_SOURCE_CHECKS) {
    if (options.skipBuilt && (step.name === "section_integrity" || step.name === "mobile_header")) continue;
    if (options.skipMobile && step.name === "mobile_header") continue;
    try {
      console.log(`[check ${step.order}] ${step.name}...`);
      await step.run(slug);
      passed.push(step.name);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (step.blocking) {
        failed.push({ name: step.name, error: msg });
        break;
      }
      warned.push(`${step.name}: ${msg}`);
    }
  }
  return { passed, failed, warned };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const slug = process.argv.find((a, i) => process.argv[i - 1] === "--slug");
  if (!slug) {
    console.error("Usage: tsx scripts/run_site_source_checks.ts --slug <slug>");
    process.exit(1);
  }
  runSiteSourceChecks(slug, { skipBuilt: process.argv.includes("--source-only") })
    .then((r) => {
      console.log(JSON.stringify(r, null, 2));
      process.exit(r.failed.length ? 1 : 0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
