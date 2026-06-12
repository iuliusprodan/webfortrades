import assert from "node:assert/strict";
import {
  namesMatch,
  phonesMatch,
  verifyFacebookPageForLead,
  type FacebookPageData,
} from "./facebook_source.js";
import { verifySource } from "./source_verification.js";
import { evaluateLeadValidity } from "./lead_validity.js";
import {
  extractDomainFromEmail,
  discoverWebsiteFromEmailDomain,
  type WebsiteDiscoveryResult,
} from "./website_discovery.js";
import { classifyProbeResult, type FetchProbe } from "./website_classify.js";
import { buildImageManifestFromPhotos, recommendLayoutForImageSet } from "./image_gallery.js";
import { SOURCE_REGISTRY, getSourceById } from "./source_registry.js";

function page(overrides: Partial<FacebookPageData> = {}): FacebookPageData {
  return {
    page_url: "https://www.facebook.com/example",
    page_title: "Example Plumbing | Bristol",
    business_name: "Example Plumbing",
    phone: null,
    email: null,
    location: null,
    website: null,
    intro: null,
    profile_image_url: null,
    cover_image_url: null,
    photo_urls: [],
    post_image_urls: [],
    service_hints: [],
    facebook_status: "OK",
    facebook_needs_manual_review: false,
    raw_evidence: [],
    ...overrides,
  };
}

function probe(overrides: Partial<FetchProbe>): FetchProbe {
  return {
    ok: true,
    statusCode: 200,
    finalUrl: "https://example.com/",
    title: null,
    bodyText: "Contact us about plumbing services in Bristol.",
    error: null,
    ...overrides,
  };
}

// Email domain extraction
assert.equal(extractDomainFromEmail("info@corvellbathrooms.co.uk"), "corvellbathrooms.co.uk");
assert.equal(extractDomainFromEmail("jack@gmail.com"), null);

// Email domain redirects to Facebook (simulated via classifyProbeResult)
const fbRedirect = classifyProbeResult({
  initialUrl: "https://corvellbathrooms.co.uk",
  businessName: "Corvell ltd",
  probe: probe({
    finalUrl: "https://www.facebook.com/p/Corvell-Bathrooms-61560222691293/",
    bodyText: "Facebook page",
  }),
  finalUrlIsSocialOrDirectory: true,
  appearsToBelongToBusiness: true,
  hasServicesOrContact: false,
});
assert.equal(fbRedirect.status, "SOCIAL_OR_DIRECTORY_ONLY");

// Parked domain
const parked = classifyProbeResult({
  initialUrl: "https://parked-example.co.uk",
  businessName: "Parked Co",
  probe: probe({
    title: "Domain for sale",
    bodyText:
      "Buy this domain today from GoDaddy. This domain is for sale. Contact the owner for pricing and transfer details.",
  }),
  finalUrlIsSocialOrDirectory: false,
  appearsToBelongToBusiness: false,
  hasServicesOrContact: false,
});
assert.equal(parked.status, "BROKEN_OR_BAD_SITE");
assert.match(parked.notes, /parked_domain/);

// Facebook verified by phone/email
const corvellFb = verifyFacebookPageForLead({
  businessName: "Corvell ltd",
  googlePhone: "07804 693411",
  googleAddress: "34 Pool Rd, Kingswood, Bristol BS15 1XN, UK",
  town: "Bristol",
  page: page({
    business_name: "Corvell Bathrooms",
    phone: "07804 693411",
    email: "info@corvellbathrooms.co.uk",
    location: "Kingswood, Bristol, United Kingdom",
    intro: "Bathroom installations and renovations in Bristol",
    profile_image_url: "https://scontent.xx.fbcdn.net/logo.jpg",
  }),
});
assert.equal(corvellFb.facebook_verified, true);
assert.equal(corvellFb.facebook_phone_match, true);

// Similar Facebook page rejected
const reject = verifyFacebookPageForLead({
  businessName: "Corvell ltd",
  googlePhone: "07804 693411",
  googleAddress: "Kingswood, Bristol",
  town: "Bristol",
  page: page({
    business_name: "Bristol Emergency Plumbers Ltd",
    phone: "07811 111111",
    location: "Bristol",
  }),
});
assert.equal(reject.facebook_verified, false);

// Name match only is low confidence
const nameOnly = verifySource({
  platform: "bark",
  url: "https://bark.com/profile/example",
  business_name: "Smith Plumbing Ltd",
  google_phone: "07804 693411",
  google_email: null,
  google_address: "Manchester M1 1AA",
  town: "Manchester",
  extracted: { business_name: "Smith Plumbing" },
});
assert.equal(nameOnly.confidence, "low");
assert.equal(nameOnly.verified, false);

// Hidden real website blocks build
const hiddenSiteValidity = evaluateLeadValidity({
  business_name: "Corvell ltd",
  website_status: "SOCIAL_OR_DIRECTORY_ONLY",
  website_url: "https://www.facebook.com/share/1BVAEdhja3/",
  website_discovery: {
    classification: "HAS_REAL_SITE",
    db_status: "HAS_REAL_SITE",
    domain: "corvellbathrooms.co.uk",
    initial_url: "https://corvellbathrooms.co.uk",
    final_url: "https://www.corvellbathrooms.co.uk/",
    status_code: 200,
    title: "Corvell Bathrooms",
    reason: "working_site",
    probes: [],
    text_snippet: "Bathroom installations Bristol",
  },
  email_domain_discovery: null,
  source_confidence: { overall: "high", verified_platforms: ["facebook"], rejected_platforms: [], notes: [] },
  enrichment_complete: true,
  facebook_verified: true,
});
assert.equal(hiddenSiteValidity.ready_for_build, false);
assert.equal(hiddenSiteValidity.lead_validity_status, "HAS_REAL_SITE_SKIP");

// Verified logo saved as brand asset (manifest)
const manifest = buildImageManifestFromPhotos(
  [
    { local: "images/logo/logo.webp", classification: "logo_or_brand", source_type: "facebook_logo" },
    { local: "images/01-places.webp", source_type: "google_places", selected: true },
  ],
  true
);
assert.equal(manifest.find((m) => m.local.includes("logo"))?.purpose, "logo");
assert.equal(manifest.find((m) => m.local.includes("logo"))?.selected, false);

// Weak image set changes layout recommendation
const weakLayout = recommendLayoutForImageSet(
  buildImageManifestFromPhotos([{ local: "images/01.webp", source_type: "google_places" }])
);
assert.equal(weakLayout.layout_family, "stacked-hero-proof");
assert.match(weakLayout.note, /proof-led/i);

// Source registry
assert.ok(getSourceById("facebook"));
assert.ok(SOURCE_REGISTRY.length >= 20);
assert.ok(SOURCE_REGISTRY.every((s) => s.id && s.display_name));

console.log("sources intelligence tests passed");
