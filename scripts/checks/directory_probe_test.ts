import assert from "node:assert/strict";
import {
  extractPostcodeOutward,
  namesMatchExact,
  normalizePhoneDigits,
  verifyDirectoryIdentity,
  type BriefIdentity,
  type ProfileIdentity,
} from "../directory_identity.js";
import {
  extractRatingFromText,
  probePlatformForLead,
  resetDirectoryProbeSession,
} from "../directory_probe.js";

function testIdentityFullMatch(): void {
  const brief: BriefIdentity = {
    business_name: "Heattech Gas Services Ltd",
    phone: "07506042175",
    address: "6 Hoffmann Pl, Edinburgh EH15 3FD, UK",
    town: "Edinburgh",
    postcode_outward: "EH15",
    website_url: "https://heattech.example.com",
  };
  const profile: ProfileIdentity = {
    business_name: "Heattech Gas Services Ltd",
    phone: "07506 042175",
    address_text: "Edinburgh EH15 3FD",
    town: "Edinburgh",
    postcode_outward: "EH15",
    website_url: "https://www.heattech.example.com",
  };
  const result = verifyDirectoryIdentity(brief, profile);
  assert.equal(result.verified, true);
  assert.ok(result.match_count >= 2);
  assert.ok(result.signals.includes("phone"));
}

function testIdentityPhoneOnlyUnverified(): void {
  const brief: BriefIdentity = {
    business_name: "Kirkstall Electricians Ltd",
    phone: "07807319073",
    address: "Leeds LS4 2QR",
    town: "Leeds",
    postcode_outward: "LS4",
    website_url: null,
  };
  const profile: ProfileIdentity = {
    business_name: "Reigate Wiring Services",
    phone: "07807319073",
    address_text: "Reigate Surrey RH2",
    town: "Reigate",
    postcode_outward: "RH2",
    website_url: null,
  };
  const result = verifyDirectoryIdentity(brief, profile);
  assert.equal(result.verified, false);
  assert.equal(result.unverified_only, true);
  assert.equal(result.homonym, false);
}

function testIdentityHomonym(): void {
  const brief: BriefIdentity = {
    business_name: "Heattech Gas Services Ltd",
    phone: "07506042175",
    address: "Edinburgh EH15 3FD",
    town: "Edinburgh",
    postcode_outward: "EH15",
    website_url: null,
  };
  const profile: ProfileIdentity = {
    business_name: "Heat Tech Scotland LTD",
    phone: "07931387330",
    address_text: "Penicuik EH26",
    town: "Penicuik",
    postcode_outward: "EH26",
    website_url: "https://heattechscotland.com",
  };
  const result = verifyDirectoryIdentity(brief, profile);
  assert.equal(result.homonym, true);
  assert.equal(result.match_count, 0);
}

function testTownMismatch(): void {
  const brief: BriefIdentity = {
    business_name: "Edgar Landscapes Ltd",
    phone: "07504684804",
    address: "Liverpool L11 1EP",
    town: "Liverpool",
    postcode_outward: "L11",
    website_url: "https://edgarlandscapesdriveways.co.uk",
  };
  const profile: ProfileIdentity = {
    business_name: "Edgar Landscapes Ltd",
    phone: "02079460958",
    address_text: "London SW1",
    town: "London",
    postcode_outward: "SW1",
    website_url: "https://other-edgar.co.uk",
  };
  const result = verifyDirectoryIdentity(brief, profile);
  assert.equal(result.verified, false);
}

function testExtractRatingFromSnippet(): void {
  const snippet = "TSC Plumbing and Heating | 9.88 rating based on 42 reviews on Checkatrade";
  const { rating, review_count } = extractRatingFromText(snippet);
  assert.ok(rating);
  assert.equal(review_count, "42");
}

async function testSnippetFallbackDoesNotCrash(): Promise<void> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("duckduckgo.com") || url.includes("serpapi.com")) {
      return new Response(
        `<html><body><a class="result__a" href="https://www.yell.com/biz/test-co-liverpool/">Test Co</a><a class="result__snippet">Test Co Liverpool L11 4.8 stars 12 reviews</a></body></html>`,
        { status: 200, headers: { "content-type": "text/html" } }
      );
    }
    return new Response("", { status: 403 });
  };

  try {
    resetDirectoryProbeSession();
    const probe = await probePlatformForLead({
      platform: "yell",
      businessName: "Test Co Liverpool",
      googlePhone: "07504684804",
      googleAddress: "232 Muirhead Ave E, Liverpool L11 1EP",
      city: "Liverpool",
      websiteUrl: null,
    });
    assert.ok(probe.probed);
    assert.ok(
      probe.status === "FOUND_FROM_SNIPPET" ||
        probe.status === "BLOCKED" ||
        probe.status === "NOT_FOUND" ||
        probe.status === "NOT_FOUND_HOMONYM"
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function testLiveCheckatradeOptional(): Promise<void> {
  if (process.env.DIRECTORY_PROBE_LIVE !== "1") {
    console.log("  (skip live Checkatrade integration — set DIRECTORY_PROBE_LIVE=1 to run)");
    return;
  }
  resetDirectoryProbeSession();
  const probe = await probePlatformForLead({
    platform: "checkatrade",
    businessName: "Bristol And Southwest Plumbing And Heating Ltd",
    googlePhone: null,
    googleAddress: "Bristol",
    city: "Bristol",
    websiteUrl: null,
  });
  assert.ok(probe.probed);
  if (probe.status === "FOUND_VERIFIED" || probe.status === "FOUND_UNVERIFIED") {
    assert.ok(Number(probe.review_count ?? probe.rating ?? 0) >= 0);
  }
}

function testNormalizePhone(): void {
  assert.equal(normalizePhoneDigits("+44 7807 319073"), normalizePhoneDigits("07807319073"));
  assert.equal(extractPostcodeOutward("Leeds LS4 2QR"), "LS4");
  assert.ok(namesMatchExact("Tom Baker Plumbing and Gas Solutions", "Tom Baker Plumbing & Gas Solutions"));
}

async function main(): Promise<void> {
  testIdentityFullMatch();
  testIdentityPhoneOnlyUnverified();
  testIdentityHomonym();
  testTownMismatch();
  testExtractRatingFromSnippet();
  testNormalizePhone();
  await testSnippetFallbackDoesNotCrash();
  await testLiveCheckatradeOptional();
  console.log("directory_probe_test: all passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
