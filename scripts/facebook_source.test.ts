import assert from "node:assert/strict";
import {
  namesMatch,
  phonesMatch,
  verifyFacebookPageForLead,
  type FacebookPageData,
} from "./facebook_source.js";

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

assert.equal(phonesMatch("07309 553552", "+44 7309 553552"), true);
assert.equal(phonesMatch("07309 553552", "07804 693411"), false);

assert.equal(
  namesMatch("Greens Precise Plumbing & Heating ltd", "Greens Precise Plumbing & Heating Ltd"),
  true
);
assert.equal(namesMatch("Greens Plumbing", "Totally Different Ltd"), false);

const high = verifyFacebookPageForLead({
  businessName: "Greens Precise Plumbing & Heating ltd",
  googlePhone: "07309 553552",
  googleAddress: "Swansea SA1 8QT",
  town: "Swansea",
  page: page({
    business_name: "Greens Precise Plumbing & Heating Ltd",
    phone: "07309 553552",
    location: "Swansea, United Kingdom",
    intro: "A local Plumbing & Heating company in the area of Swansea.",
  }),
});
assert.equal(high.facebook_verified, true);
assert.equal(high.facebook_confidence, "high");
assert.equal(high.facebook_phone_match, true);

const reject = verifyFacebookPageForLead({
  businessName: "Greens Precise Plumbing & Heating ltd",
  googlePhone: "07309 553552",
  googleAddress: "Swansea SA1 8QT",
  town: "Swansea",
  page: page({
    business_name: "Bristol Emergency Plumbers Ltd",
    phone: "07804 693411",
    location: "Bristol",
  }),
});
assert.equal(reject.facebook_verified, false);
assert.equal(reject.facebook_phone_match, false);

console.log("facebook_source tests passed");
