import assert from "node:assert/strict";
import {
  extractBuildMarkerFromHtml,
  generateBuildId,
  htmlContainsPhone,
} from "./build_marker.js";
import {
  generateAliasCandidates,
  extractDeploymentUrl,
  verifyDeployedSite,
  isDeploymentProtectionResponse,
} from "./vercel_alias.js";

function testGenerateAliasCandidates() {
  const candidates = generateAliasCandidates({
    slug: "jt-plumbing",
    city: "Bristol",
    outwardPostcode: "BS5",
  });
  assert.deepEqual(candidates, [
    "jt-plumbing",
    "jt-plumbing-bristol",
    "jt-plumbing-bs5",
    "jt-plumbing-bristol-bs5",
    "jt-plumbing-uk",
    "jt-plumbing-web",
  ]);
  assert.ok(!candidates.some((c) => c.includes("demo")));
}

function testExtractDeploymentUrl() {
  const output = JSON.stringify({
    deployment: { url: "jt-plumbing-abc123.vercel.app" },
  });
  assert.equal(
    extractDeploymentUrl(output),
    "https://jt-plumbing-abc123.vercel.app"
  );
  assert.equal(
    extractDeploymentUrl('{"deployment":{"url":"https://foo.vercel.app"}}'),
    "https://foo.vercel.app"
  );
}

function testBuildMarkerExtraction() {
  const buildId = generateBuildId("jt-plumbing");
  const html = `<html><head>
    <meta name="webfortrades-build-id" content="${buildId}" />
    <meta name="webfortrades-business-slug" content="jt-plumbing" />
  </head><body>JT Plumbing 07817 850729</body></html>`;
  const marker = extractBuildMarkerFromHtml(html);
  assert.ok(marker);
  assert.equal(marker!.slug, "jt-plumbing");
  assert.equal(marker!.buildId, buildId);
}

async function testVerifyWithoutMarkerFails() {
  const html = `<html><head><title>JT Plumbing</title></head><body>JT Plumbing 07817 850729</body></html>`;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    ({
      status: 200,
      url: "https://jt-plumbing-bs5.vercel.app",
      text: async () => html,
    }) as Response;

  const result = await verifyDeployedSite("https://jt-plumbing-bs5.vercel.app", {
    slug: "jt-plumbing",
    businessName: "JT Plumbing",
    phone: "07817 850729",
    buildId: "jt-plumbing:20260609-deadbeef",
  });
  globalThis.fetch = originalFetch;

  assert.equal(result.ok, false);
  assert.equal(result.markerFound, false);
}

async function testVerifyWithMarkerPasses() {
  const buildId = "jt-plumbing:20260609-deadbeef";
  const html = `<html><head>
    <meta name="webfortrades-build-id" content="${buildId}" />
    <meta name="webfortrades-business-slug" content="jt-plumbing" />
  </head><body>JT Plumbing 07817 850729</body></html>`;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    ({
      status: 200,
      url: "https://jt-plumbing-bs5.vercel.app",
      text: async () => html,
    }) as Response;

  const result = await verifyDeployedSite("https://jt-plumbing-bs5.vercel.app", {
    slug: "jt-plumbing",
    businessName: "JT Plumbing",
    phone: "07817 850729",
    buildId,
  });
  globalThis.fetch = originalFetch;

  assert.equal(result.ok, true);
  assert.equal(result.markerFound, true);
}

function testPhoneMatch() {
  assert.equal(htmlContainsPhone("Call 07817 850729 today", "07817 850729"), true);
  assert.equal(htmlContainsPhone("No phone here", "07817 850729"), false);
}

function testDeploymentProtectionDetection() {
  assert.equal(
    isDeploymentProtectionResponse(401, "<title>Authentication Required</title>"),
    true
  );
  assert.equal(isDeploymentProtectionResponse(200, "<html>ok</html>"), false);
}

async function main(): Promise<void> {
  testGenerateAliasCandidates();
  testExtractDeploymentUrl();
  testBuildMarkerExtraction();
  testDeploymentProtectionDetection();
  await testVerifyWithoutMarkerFails();
  await testVerifyWithMarkerPasses();
  testPhoneMatch();
  console.log("deploy alias tests: all passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
