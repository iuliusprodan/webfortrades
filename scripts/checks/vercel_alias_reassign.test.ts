import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { resolveVerifiedAlias } from "../vercel_alias.js";

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

console.log("vercel_alias_reassign");

await test("reassigns alias when preflight is already_ours (stale deployment)", async () => {
  const staleUrl = "https://stale-slug-abc123.vercel.app";
  const freshUrl = "https://fresh-slug-xyz789.vercel.app";
  const hostname = "fixture-slug";
  const assignCalls: Array<{ deploymentUrl: string; aliasHostname: string }> = [];

  const result = await resolveVerifiedAlias(
    {
      slug: "fixture-slug",
      deploymentUrl: freshUrl,
      candidates: [hostname],
      expected: {
        slug: "fixture-slug",
        businessName: "Fixture Co",
        phone: "07000 000000",
        buildId: "fixture-slug:20260612-test",
      },
      auth: {},
      siteDir: os.tmpdir(),
    },
    {
      assignDelayMs: 0,
      preflightPublicAlias: async () => ({
        status: "already_ours",
        detail: "Build marker fixture-slug:20260611-old (stale)",
      }),
      assignVercelAlias: (deploymentUrl, aliasHostname) => {
        assignCalls.push({ deploymentUrl, aliasHostname });
        return { ok: true };
      },
      verifyDeployedSite: async (url) => ({
        ok: true,
        httpStatus: 200,
        markerFound: true,
        businessNameFound: true,
        phoneFound: true,
        marker: { slug: "fixture-slug", buildId: "fixture-slug:20260612-test" },
        errors: [],
      }),
    }
  );

  assert.equal(assignCalls.length, 1, "assignVercelAlias must run on already_ours");
  assert.equal(assignCalls[0]!.deploymentUrl, freshUrl);
  assert.equal(assignCalls[0]!.aliasHostname, hostname);
  assert.notEqual(assignCalls[0]!.deploymentUrl, staleUrl);
  assert.equal(result.aliasStatus, "VERIFIED");
  assert.equal(result.verifiedUrl, `https://${hostname}.vercel.app`);
  assert.equal(result.deploymentUrl, freshUrl);
  const candidate = result.candidates[0];
  assert.equal(candidate?.preflight, "already_ours");
  assert.equal(candidate?.assign, "alias_assigned");
});

await test("does not skip assign on first-claim available alias", async () => {
  const freshUrl = "https://new-deploy.vercel.app";
  const assignCalls: string[] = [];

  await resolveVerifiedAlias(
    {
      slug: "new-slug",
      deploymentUrl: freshUrl,
      candidates: ["new-slug"],
      expected: {
        slug: "new-slug",
        businessName: "New Co",
        phone: null,
        buildId: "new-slug:20260612-test",
      },
      auth: {},
      siteDir: path.join(os.tmpdir(), "wft-alias-test"),
    },
    {
      assignDelayMs: 0,
      preflightPublicAlias: async () => ({ status: "available" }),
      assignVercelAlias: (deploymentUrl) => {
        assignCalls.push(deploymentUrl);
        return { ok: true };
      },
      verifyDeployedSite: async () => ({
        ok: true,
        httpStatus: 200,
        markerFound: true,
        businessNameFound: true,
        phoneFound: false,
        marker: { slug: "new-slug", buildId: "new-slug:20260612-test" },
        errors: [],
      }),
    }
  );

  assert.deepEqual(assignCalls, [freshUrl]);
});

console.log("\nAll vercel_alias_reassign tests passed.");
