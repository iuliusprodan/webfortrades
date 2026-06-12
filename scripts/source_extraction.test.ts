import assert from "node:assert/strict";
import { extractSchemaLocalBusiness, extractOpenGraph, extractLinkIcons } from "./html_extract.js";
import { upscaleFacebookCdnUrl } from "./image_utils.js";
import { buildImageManifestFromPhotos, recommendLayoutForImageSet } from "./image_gallery.js";
import { evaluateLeadValidity } from "./lead_validity.js";
import { extractDomainFromEmail } from "./website_discovery.js";
import { verifyFacebookPageForLead, normalizeFacebookPageUrl } from "./facebook_source.js";
import { dedupeByHash } from "./photo_discovery_helpers.js";
import { classifyWebsiteUrl } from "./brief_data_quality.js";
import { evaluateSourceQuality, buildAllowedForBatch } from "./source_quality.js";
import { facebookPhotoUrlVariants } from "./image_utils.js";

// Email domain
assert.equal(extractDomainFromEmail("info@corvell.co.uk"), "corvell.co.uk");

// Schema.org logo extraction
const schemaHtml = `<script type="application/ld+json">{"@type":"Plumber","name":"Test Co","logo":"https://example.com/logo.png","telephone":"07804 693411"}</script>`;
const schema = extractSchemaLocalBusiness(schemaHtml);
assert.equal(schema?.logo, "https://example.com/logo.png");

// OG extraction
const ogHtml = `<meta property="og:image" content="https://example.com/og-logo.png" />`;
assert.equal(extractOpenGraph(ogHtml).image, "https://example.com/og-logo.png");

// Favicon fallback detection
const iconHtml = `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch.png" />`;
const icons = extractLinkIcons(iconHtml, "https://example.com/");
assert.ok(icons.some((i) => i.rel.includes("apple-touch-icon")));

// Facebook phone verification
const fb = verifyFacebookPageForLead({
  businessName: "Corvell ltd",
  googlePhone: "07804 693411",
  googleAddress: "Kingswood, Bristol",
  town: "Bristol",
  page: {
    page_url: "https://www.facebook.com/p/Corvell-Bathrooms-61560222691293/",
    page_title: "Corvell Bathrooms",
    business_name: "Corvell Bathrooms",
    phone: "07804 693411",
    email: "info@corvell.co.uk",
    location: "Bristol",
    website: null,
    intro: "Bathroom work",
    profile_image_url: "https://scontent.xx.fbcdn.net/t39.30808-1/123.jpg",
    cover_image_url: null,
    photo_urls: [],
    post_image_urls: [],
    service_hints: ["Bathroom installations"],
    facebook_status: "OK",
    facebook_needs_manual_review: false,
    raw_evidence: [],
  },
});
assert.equal(fb.facebook_verified, true);
assert.equal(fb.facebook_phone_match, true);

// Share URL normalization path
assert.ok(normalizeFacebookPageUrl("https://www.facebook.com/share/abc/").includes("facebook.com"));

// Image dedupe
const deduped = dedupeByHash([
  { hash: "aaa", source_url: "https://a.com/1.jpg" } as never,
  { hash: "aaa", source_url: "https://a.com/2.jpg" } as never,
]);
assert.equal(deduped.length, 1);

// HAS_REAL_SITE_SKIP
const realSite = evaluateLeadValidity({
  business_name: "Corvell ltd",
  website_status: "HAS_REAL_SITE",
  website_url: "https://corvell.co.uk/",
  website_discovery: {
    classification: "HAS_REAL_SITE",
    db_status: "HAS_REAL_SITE",
    domain: "corvell.co.uk",
    initial_url: "https://corvell.co.uk",
    final_url: "https://corvell.co.uk/",
    status_code: 200,
    title: "Corvell Bathrooms",
    reason: "working_site",
    probes: [],
    text_snippet: null,
  },
  email_domain_discovery: null,
  source_confidence: { overall: "high", verified_platforms: [], rejected_platforms: [], notes: [] },
  enrichment_complete: true,
  facebook_verified: true,
});
assert.equal(realSite.lead_validity_status, "HAS_REAL_SITE_SKIP");
assert.equal(realSite.ready_for_build, false);

// SOCIAL_ONLY_READY
const social = evaluateLeadValidity({
  business_name: "Greens",
  website_status: "SOCIAL_OR_DIRECTORY_ONLY",
  website_url: "https://www.facebook.com/GPPlumbingandHeatingLtd/",
  website_discovery: {
    classification: "SOCIAL_OR_DIRECTORY_ONLY",
    db_status: "SOCIAL_OR_DIRECTORY_ONLY",
    domain: null,
    initial_url: "https://www.facebook.com/GPPlumbingandHeatingLtd/",
    final_url: "https://www.facebook.com/GPPlumbingandHeatingLtd/",
    status_code: null,
    title: null,
    reason: "social",
    probes: [],
    text_snippet: null,
  },
  email_domain_discovery: null,
  source_confidence: { overall: "high", verified_platforms: ["facebook"], rejected_platforms: [], notes: [] },
  enrichment_complete: true,
  facebook_verified: true,
  gallery_photo_count: 6,
});
assert.equal(social.lead_validity_status, "SOCIAL_ONLY_READY");
assert.equal(social.pitch_type, "social_only");

// BROKEN_SITE_READY
const broken = evaluateLeadValidity({
  business_name: "Broken Co",
  website_status: "BROKEN_OR_BAD_SITE",
  website_url: "https://broken.example/",
  website_discovery: {
    classification: "BROKEN_OR_BAD_SITE",
    db_status: "BROKEN_OR_BAD_SITE",
    domain: "broken.example",
    initial_url: "https://broken.example/",
    final_url: "https://broken.example/",
    status_code: 404,
    title: "Not Found",
    reason: "http_404",
    probes: [],
    text_snippet: null,
  },
  email_domain_discovery: null,
  source_confidence: { overall: "medium", verified_platforms: ["google_places"], rejected_platforms: [], notes: [] },
  enrichment_complete: true,
  gallery_photo_count: 4,
});
assert.equal(broken.lead_validity_status, "BROKEN_SITE_READY");

// Google photo URL rejected as website_url
const googlePhoto = classifyWebsiteUrl(
  "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=abc"
);
assert.equal(googlePhoto.issue, "google_photo_api");
assert.equal(googlePhoto.corrected_website_url, null);

// Facebook URL classified as social, not official website
const fbSite = classifyWebsiteUrl("https://www.facebook.com/GPPlumbingandHeatingLtd/");
assert.equal(fbSite.issue, "social_as_official");
assert.equal(fbSite.corrected_website_status, "SOCIAL_OR_DIRECTORY_ONLY");

// Directory URL classified as directory
const dirSite = classifyWebsiteUrl("https://www.checkatrade.com/trades/example-plumbing");
assert.equal(dirSite.issue, "directory_as_official");

// Email-domain bot block with verified Facebook -> BROKEN_SITE_READY
const botBlocked = evaluateLeadValidity({
  business_name: "Greens Precise Plumbing",
  website_status: "BROKEN_OR_BAD_SITE",
  website_url: "https://gpplumbingltd.com/",
  website_discovery: null,
  email_domain_discovery: {
    classification: "NEEDS_MANUAL_REVIEW",
    db_status: "NEEDS_MANUAL_REVIEW",
    domain: "gpplumbingltd.com",
    initial_url: "https://gpplumbingltd.com",
    final_url: "https://gpplumbingltd.com/",
    status_code: 202,
    title: null,
    reason: "reason=bot_or_access_blocked; status=202",
    probes: [],
    text_snippet: null,
  },
  source_confidence: { overall: "high", verified_platforms: ["facebook"], rejected_platforms: [], notes: [] },
  enrichment_complete: true,
  facebook_verified: true,
  gallery_photo_count: 10,
});
assert.equal(botBlocked.lead_validity_status, "BROKEN_SITE_READY");

// Email-domain 403 with verified Facebook -> BROKEN_SITE_READY
const greensLike = evaluateLeadValidity({
  business_name: "Greens Precise Plumbing",
  website_status: "BROKEN_OR_BAD_SITE",
  website_url: null,
  website_discovery: null,
  email_domain_discovery: {
    classification: "BROKEN_OR_BAD_SITE",
    db_status: "BROKEN_OR_BAD_SITE",
    domain: "gpplumbingltd.com",
    initial_url: "https://gpplumbingltd.com",
    final_url: "https://gpplumbingltd.com/",
    status_code: 403,
    title: null,
    reason: "http_403_bot_or_access",
    probes: [],
    text_snippet: null,
  },
  source_confidence: { overall: "high", verified_platforms: ["facebook"], rejected_platforms: [], notes: [] },
  enrichment_complete: true,
  facebook_verified: true,
  gallery_photo_count: 10,
});
assert.equal(greensLike.lead_validity_status, "BROKEN_SITE_READY");
assert.match(greensLike.lead_validity_reason, /Verified Facebook page and email found/);
assert.equal(greensLike.ready_for_build, true);
assert.equal(greensLike.ready_for_pitch, true);

// Location mismatch blocks pitch and build
const greensMismatch = evaluateLeadValidity({
  business_name: "Greens Precise Plumbing",
  website_status: "BROKEN_OR_BAD_SITE",
  website_url: null,
  website_discovery: null,
  email_domain_discovery: {
    classification: "BROKEN_OR_BAD_SITE",
    db_status: "BROKEN_OR_BAD_SITE",
    domain: "gpplumbingltd.com",
    initial_url: "https://gpplumbingltd.com",
    final_url: "https://gpplumbingltd.com/",
    status_code: 403,
    title: null,
    reason: "http_403",
    probes: [],
    text_snippet: null,
  },
  source_confidence: { overall: "high", verified_platforms: ["facebook"], rejected_platforms: [], notes: [] },
  enrichment_complete: true,
  facebook_verified: true,
  gallery_photo_count: 10,
  location_validation_status: "LOCATION_MISMATCH_NEEDS_REVIEW",
  prospect_region: "Bristol",
});
assert.equal(greensMismatch.lead_validity_status, "BROKEN_SITE_READY");
assert.equal(greensMismatch.ready_for_build, false);
assert.equal(greensMismatch.ready_for_pitch, false);

// HAS_REAL_SITE_SKIP blocks batch build
const sqFail = evaluateSourceQuality({
  enrichment_complete: true,
  email_domain_checked: true,
  logo_discovery_attempted: true,
  photo_discovery_attempted: true,
  lead_validity: realSite,
});
assert.equal(sqFail.source_quality_status, "FAIL");
assert.equal(buildAllowedForBatch(sqFail, realSite), false);

// Facebook URL variants preserve query params
const variants = facebookPhotoUrlVariants(
  "https://scontent.xx.fbcdn.net/v/t39.30808-6/123.jpg?stp=dst-jpg&oh=00_abc"
);
assert.ok(variants.length >= 2);

// Weak image layout
const weak = recommendLayoutForImageSet(buildImageManifestFromPhotos([{ local: "images/01.webp" }]));
assert.match(weak.note, /proof-led/i);

// Facebook CDN upscale
assert.ok(upscaleFacebookCdnUrl("https://x.fbcdn.net/img?s720x720&stp=dst-jpg").includes("fbcdn.net"));

console.log("source extraction tests passed");
