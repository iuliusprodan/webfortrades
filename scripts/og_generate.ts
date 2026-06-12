#!/usr/bin/env tsx
/**
 * Fast OG generation: shared Playwright browser, 1200x630 hero clip.
 *
 * Usage:
 *   npm run og:generate -- --slug <slug> [--live-url <url>]
 *   npm run og:batch -- --batch <batch-id|slug,slug,...> [--concurrency 4] [--benchmark]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { getLeadBySlug } from "./db.js";
import { captureOgForSite, type OgCaptureResult } from "./og_capture.js";
import { ROOT } from "./site_config.js";
import { loadDeployManifest } from "./vercel_alias.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FIVE_SITE_SLUGS = [
  "nfs-plumbing-heating",
  "bbr-plumbing-heating-bristol-bristol-boiler-repairs",
  "west-park-electrics",
  "stay-dry-roofing",
  "alexander-s-painters-decorators",
];

const OLD_OG_MS: Record<string, number> = {
  "west-park-electrics": 134_757,
  "stay-dry-roofing": 172_299,
  "bbr-plumbing-heating-bristol-bristol-boiler-repairs": 270_221,
  "nfs-plumbing-heating": 310_013,
  "alexander-s-painters-decorators": 332_278,
};

function parseArgs(): {
  slug?: string;
  liveUrl?: string;
  batchSlugs: string[];
  concurrency: number;
  benchmark: boolean;
} {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  let liveUrl: string | undefined;
  let batch = "";
  let concurrency = 4;
  let benchmark = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    else if (args[i] === "--live-url" && args[i + 1]) liveUrl = args[++i];
    else if (args[i] === "--batch" && args[i + 1]) batch = args[++i]!;
    else if (args[i] === "--concurrency" && args[i + 1]) {
      concurrency = Math.max(1, Math.min(8, Number(args[++i]) || 4));
    } else if (args[i] === "--benchmark") benchmark = true;
  }

  let batchSlugs: string[] = [];
  if (batch) {
    if (batch.includes(",")) {
      batchSlugs = batch.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (fs.existsSync(path.join(ROOT, "data", "batches", batch, "jobs.json"))) {
      const jobs = JSON.parse(
        fs.readFileSync(path.join(ROOT, "data", "batches", batch, "jobs.json"), "utf8")
      ) as { slug: string }[];
      batchSlugs = jobs.map((j) => j.slug);
    } else if (batch === "five-site") {
      batchSlugs = [...FIVE_SITE_SLUGS];
    } else {
      batchSlugs = [batch];
    }
  }

  return { slug, liveUrl, batchSlugs, concurrency, benchmark };
}

function resolveLiveUrl(slug: string, override?: string): string {
  if (override) return override.replace(/\/$/, "");
  const deploy = loadDeployManifest(ROOT, slug);
  if (deploy?.verified_url) return deploy.verified_url.replace(/\/$/, "");
  const lead = getLeadBySlug(slug);
  const url = lead?.site_url ?? `https://${slug}.vercel.app`;
  return url.replace(/\/$/, "");
}

function chunk<T>(items: T[], parts: number): T[][] {
  const out: T[][] = Array.from({ length: parts }, () => []);
  items.forEach((item, i) => out[i % parts]!.push(item));
  return out.filter((g) => g.length > 0);
}

async function runSequentialBatch(
  items: Array<{ slug: string; liveUrl: string }>,
  label: string
): Promise<{ results: OgCaptureResult[]; coldMs: number; warmTotalMs: number }> {
  const browser = await chromium.launch();
  const results: OgCaptureResult[] = [];
  try {
    for (const item of items) {
      results.push(await captureOgForSite(browser, item.slug, item.liveUrl, ROOT));
    }
  } finally {
    await browser.close();
  }
  const coldMs = results[0]?.elapsedMs ?? 0;
  const warmTotalMs = results.slice(1).reduce((sum, r) => sum + r.elapsedMs, 0);
  console.log(`\n${label}: cold=${coldMs}ms warm_sum=${warmTotalMs}ms total=${results.reduce((s, r) => s + r.elapsedMs, 0)}ms`);
  return { results, coldMs, warmTotalMs };
}

async function runParallelBatch(
  items: Array<{ slug: string; liveUrl: string }>,
  concurrency: number
): Promise<OgCaptureResult[]> {
  const groups = chunk(items, Math.min(concurrency, items.length));
  const all: OgCaptureResult[] = [];

  await Promise.all(
    groups.map(async (group, workerIndex) => {
      const browser = await chromium.launch();
      try {
        for (const item of group) {
          const result = await captureOgForSite(browser, item.slug, item.liveUrl, ROOT);
          all.push(result);
          console.log(
            `  worker ${workerIndex + 1}: ${item.slug} ${result.elapsedMs}ms (${(result.jpgBytes / 1024).toFixed(0)}KB jpg)`
          );
        }
      } finally {
        await browser.close();
      }
    })
  );

  return all.sort(
    (a, b) => items.findIndex((i) => i.slug === a.slug) - items.findIndex((i) => i.slug === b.slug)
  );
}

function printBenchmarkTable(results: OgCaptureResult[]): void {
  console.log("\n--- OG speed comparison (new fast path vs old og_scroll batch) ---");
  console.log("| Site | Old (ms) | New (ms) | Saved |");
  console.log("|------|----------|----------|-------|");
  let oldSum = 0;
  let newSum = 0;
  for (const r of results) {
    const oldMs = OLD_OG_MS[r.slug] ?? 0;
    oldSum += oldMs;
    newSum += r.elapsedMs;
    const saved = oldMs ? `${Math.round((1 - r.elapsedMs / oldMs) * 100)}%` : "-";
    console.log(`| ${r.slug} | ${oldMs || "-"} | ${r.elapsedMs} | ${saved} |`);
  }
  console.log(`| **Total** | **${oldSum}** | **${newSum}** | **${Math.round((1 - newSum / oldSum) * 100)}%** |`);
  const cold = results[0]?.elapsedMs ?? 0;
  const warmAvg =
    results.length > 1
      ? Math.round(results.slice(1).reduce((s, r) => s + r.elapsedMs, 0) / (results.length - 1))
      : cold;
  console.log(`\nCold (first site, shared browser): ${cold}ms`);
  console.log(`Warm average (sites 2+, same browser): ${warmAvg}ms`);
}

function printTwentySiteEstimate(): void {
  console.log("\n--- 20-site batch estimate (scroll video off, new OG, parallelism) ---");
  console.log("| Stage | Per site (typical) | Parallelism | Wall for 20 |");
  console.log("|-------|-------------------|-------------|-------------|");
  console.log("| Prospect + select | 2-5 min batch | serial | ~5 min |");
  console.log("| Gather | 16-22 s | 3 workers | ~2.5 min |");
  console.log("| Enrich + prepare | 30-60 s | 3 workers | ~7 min |");
  console.log("| Open Design | 25-40 min | 5 parallel | ~40 min wall |");
  console.log("| Port + build | 90-120 s | 3 workers | ~14 min |");
  console.log("| OG (new) | 2-8 s warm | 4 browsers | ~40 s |");
  console.log("| Deploy + verify | 80-120 s | 2 workers | ~20 min |");
  console.log("| **Estimated total wall** | | | **~90-100 min** |");
  console.log(
    "\nNext bottleneck after OG: **deploy + live style verification** (~80-120 s per site, limited to deploy_concurrency 2). OG+scroll is no longer the cap; parallel deploy slots and style verify dominate a 20-site day."
  );
}

async function main(): Promise<void> {
  const { slug, liveUrl, batchSlugs, concurrency, benchmark } = parseArgs();

  if (slug) {
    const url = resolveLiveUrl(slug, liveUrl);
    const browser = await chromium.launch();
    try {
      const result = await captureOgForSite(browser, slug, url, ROOT);
      console.log(JSON.stringify(result, null, 2));
    } finally {
      await browser.close();
    }
    return;
  }

  if (batchSlugs.length === 0) {
    console.error(
      "Usage: npm run og:generate -- --slug <slug> [--live-url <url>]\n" +
        "       npm run og:batch -- --batch five-site|slug1,slug2 [--concurrency 4] [--benchmark]"
    );
    process.exit(1);
  }

  const items = batchSlugs.map((s) => ({ slug: s, liveUrl: resolveLiveUrl(s) }));
  console.log(`OG batch: ${items.length} site(s), concurrency=${concurrency}`);

  if (benchmark) {
    const seq = await runSequentialBatch(items, "Sequential shared browser");
    printBenchmarkTable(seq.results);
    printTwentySiteEstimate();
    return;
  }

  const results = await runParallelBatch(items, concurrency);
  for (const r of results) {
    console.log(`✓ ${r.slug}: ${r.ogPng} (${r.elapsedMs}ms)`);
  }
  printTwentySiteEstimate();
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
