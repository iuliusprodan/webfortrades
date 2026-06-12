/**
 * End-to-end smoke test for port worker durable fixes:
 * install gate, image copy gate, alias reassignment on already_ours.
 * Uses local fixtures only — no Vercel or OpenWA calls.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PORT_INSTALL_REQUIRED_MSG, runPortSiteBuild } from "../port_site_install.js";
import {
  PORT_IMAGE_MISSING_MSG_PREFIX,
  imageRefsFromPageContent,
  runPortSiteImageGate,
} from "../port_site_images.js";
import { resolveVerifiedAlias } from "../vercel_alias.js";
import { OD_PORT_MARKER } from "../site_config.js";

const FIXTURE_ROOT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "fixtures",
  "port-worker-e2e"
);
const SLUG = "port-worker-e2e-fixture";
const MINIMAL_WEBP = Buffer.from(
  "UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",
  "base64"
);

function step(name: string): void {
  console.log(`  → ${name}`);
}

function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function setupE2eRoot(root: string): string {
  const siteDir = path.join(root, "sites", SLUG);
  const briefImg = path.join(root, "briefs", SLUG, "images");
  fs.rmSync(root, { recursive: true, force: true });
  copyDir(path.join(FIXTURE_ROOT, "site"), siteDir);
  fs.mkdirSync(briefImg, { recursive: true });
  fs.writeFileSync(path.join(briefImg, "01-places.webp"), MINIMAL_WEBP);
  fs.writeFileSync(path.join(siteDir, OD_PORT_MARKER), `e2e ${new Date().toISOString()}\n`);
  return siteDir;
}

async function regressionInstallGate(root: string, siteDir: string): Promise<void> {
  step("regression: install gate blocks build when install skipped");
  const result = await runPortSiteBuild(siteDir, { skipInstall: true });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, PORT_INSTALL_REQUIRED_MSG);
}

async function regressionImageGate(root: string): Promise<void> {
  step("regression: image gate catches deliberately removed brief image");
  fs.unlinkSync(path.join(root, "briefs", SLUG, "images", "01-places.webp"));
  const result = runPortSiteImageGate(SLUG, root);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.error.startsWith(PORT_IMAGE_MISSING_MSG_PREFIX));
    assert.ok(result.error.includes("01-places.webp"));
  }
}

async function regressionAliasReassign(): Promise<void> {
  step("regression: already_ours preflight triggers alias reassignment");
  let assignCount = 0;
  const freshUrl = "https://port-worker-e2e-fixture-new.vercel.app";
  await resolveVerifiedAlias(
    {
      slug: SLUG,
      deploymentUrl: freshUrl,
      candidates: [SLUG],
      expected: {
        slug: SLUG,
        businessName: "Port Worker E2E Fixture",
        phone: "07000 000001",
        buildId: `${SLUG}:20260612-e2e`,
      },
      auth: {},
      siteDir: os.tmpdir(),
    },
    {
      assignDelayMs: 0,
      preflightPublicAlias: async () => ({
        status: "already_ours",
        detail: "stale deployment still on alias",
      }),
      assignVercelAlias: (deploymentUrl) => {
        assignCount++;
        assert.equal(deploymentUrl, freshUrl);
        return { ok: true };
      },
      verifyDeployedSite: async () => ({
        ok: true,
        httpStatus: 200,
        markerFound: true,
        businessNameFound: true,
        phoneFound: true,
        marker: { slug: SLUG, buildId: `${SLUG}:20260612-e2e` },
        errors: [],
      }),
    }
  );
  assert.equal(assignCount, 1, "alias reassignment must run on already_ours");
}

async function fullPortWorkerChain(root: string, siteDir: string): Promise<void> {
  step("full chain: image copy gate");
  const imageGate = runPortSiteImageGate(SLUG, root);
  assert.equal(imageGate.ok, true, imageGate.ok ? "" : imageGate.error);

  step("full chain: npm install + next build");
  const build = await runPortSiteBuild(siteDir);
  assert.equal(build.ok, true, build.ok ? "" : build.error);

  step("full chain: mock deploy — static export contains gallery files");
  const outImage = path.join(siteDir, "out", "assets", "images", "01-places.webp");
  assert.ok(fs.existsSync(outImage), "out/assets/images/01-places.webp missing after build");

  step("full chain: mock deploy alias reassignment on stale already_ours");
  let reassigned = false;
  const deploymentUrl = "https://port-worker-e2e-fixture-deploy.vercel.app";
  const aliasResult = await resolveVerifiedAlias(
    {
      slug: SLUG,
      deploymentUrl,
      candidates: [SLUG],
      expected: {
        slug: SLUG,
        businessName: "Port Worker E2E Fixture",
        phone: "07000 000001",
        buildId: `${SLUG}:20260612-e2e`,
      },
      auth: {},
      siteDir,
    },
    {
      assignDelayMs: 0,
      preflightPublicAlias: async () => ({ status: "already_ours", detail: "stale" }),
      assignVercelAlias: () => {
        reassigned = true;
        return { ok: true };
      },
      verifyDeployedSite: async () => ({
        ok: true,
        httpStatus: 200,
        markerFound: true,
        businessNameFound: true,
        phoneFound: true,
        marker: { slug: SLUG, buildId: `${SLUG}:20260612-e2e` },
        errors: [],
      }),
    }
  );
  assert.equal(reassigned, true);
  assert.equal(aliasResult.aliasStatus, "VERIFIED");

  step("full chain: mock live verify — exported HTML image refs exist on disk");
  const indexHtml = path.join(siteDir, "out", "index.html");
  assert.ok(fs.existsSync(indexHtml));
  const refs = imageRefsFromPageContent(fs.readFileSync(indexHtml, "utf8"));
  assert.ok(refs.length > 0, "expected image refs in exported HTML");
  for (const ref of refs) {
    const p = path.join(siteDir, "out", "assets", "images", ref);
    assert.ok(fs.existsSync(p), `mock live verify missing ${ref} in out/`);
  }
}

async function main(): Promise<void> {
  const started = Date.now();
  console.log("port_worker_e2e");

  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wft-port-e2e-"));
  try {
    const siteDir = setupE2eRoot(root);

    await regressionInstallGate(root, siteDir);
    setupE2eRoot(root);
    await regressionImageGate(root);

    setupE2eRoot(root);
    await regressionAliasReassign();

    setupE2eRoot(root);
    await fullPortWorkerChain(root, path.join(root, "sites", SLUG));

    const elapsedSec = Math.round((Date.now() - started) / 1000);
    console.log(`\n✓ port_worker_e2e passed in ${elapsedSec}s`);
    if (elapsedSec > 90) {
      console.warn(`  WARN: exceeded 90s target (${elapsedSec}s)`);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
