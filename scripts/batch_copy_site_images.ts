#!/usr/bin/env tsx
/**
 * Copy briefs/<slug>/images into sites/<slug>/public for OD-ported sites.
 * Matches filenames referenced in app/page.tsx under /assets/images/ or /images/.
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./site_config.js";
import { copyBriefImagesToSite } from "./port_site_images.js";

const SLUGS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "rm-electrical",
      "a-m-t-roofing-penarth",
      "ellis-plumbing-heating-services-birmingham",
      "heattech-gas-services-ltd",
      "the-lock-dr",
      "chestnut-trees-fencing",
      "edgar-landscapes-driveways-ltd",
      "painters-force-ltd",
      "tom-baker-plumbing-and-gas-solutions",
      "m-ross-building-services",
    ];

function main(): void {
  for (const slug of SLUGS) {
    const siteDir = path.join(ROOT, "sites", slug);
    if (!fs.existsSync(siteDir)) {
      console.log(`${slug}: SKIP (no sites/${slug})`);
      continue;
    }
    const { copied, missing } = copyBriefImagesToSite(slug);
    console.log(
      `${slug}: copied=${copied}${missing.length ? ` missing=${missing.join(",")}` : ""}`
    );
    if (missing.length) process.exitCode = 1;
  }
}

main();
