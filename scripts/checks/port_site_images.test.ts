import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  PORT_IMAGE_MISSING_MSG_PREFIX,
  copyBriefImagesToSite,
  runPortSiteImageGate,
} from "../port_site_images.js";

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

function setupFixture(root: string, slug: string): { siteDir: string; briefImg: string } {
  const siteDir = path.join(root, "sites", slug);
  const briefImg = path.join(root, "briefs", slug, "images");
  fs.mkdirSync(path.join(siteDir, "app"), { recursive: true });
  fs.mkdirSync(briefImg, { recursive: true });
  fs.writeFileSync(
    path.join(siteDir, "app", "page.tsx"),
    `export default function Page() {
  return <img src="/assets/images/01-places.webp" alt="job" />;
}\n`
  );
  fs.writeFileSync(path.join(briefImg, "01-places.webp"), "fake-webp-bytes");
  fs.writeFileSync(path.join(briefImg, "02-places.webp"), "other-webp");
  return { siteDir, briefImg };
}

console.log("port_site_images");

test("copyBriefImagesToSite copies referenced files", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wft-port-img-"));
  const slug = "test-copy";
  try {
    setupFixture(root, slug);
    const { copied } = copyBriefImagesToSite(slug, root);
    assert.equal(copied, 2);
    assert.ok(
      fs.existsSync(path.join(root, "sites", slug, "public", "assets", "images", "01-places.webp"))
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("runPortSiteImageGate fails when referenced image deliberately removed from brief", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wft-port-img-"));
  const slug = "test-gate-fail";
  try {
    const { briefImg } = setupFixture(root, slug);
    fs.unlinkSync(path.join(briefImg, "01-places.webp"));
    const result = runPortSiteImageGate(slug, root);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.error.startsWith(PORT_IMAGE_MISSING_MSG_PREFIX));
      assert.ok(result.error.includes("01-places.webp"));
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("runPortSiteImageGate passes when all referenced images present", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wft-port-img-"));
  const slug = "test-gate-ok";
  try {
    setupFixture(root, slug);
    const result = runPortSiteImageGate(slug, root);
    assert.equal(result.ok, true);
    if (result.ok) assert.ok(result.copied >= 1);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

console.log("\nAll port_site_images tests passed.");
