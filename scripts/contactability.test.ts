import assert from "node:assert/strict";
import {
  contactabilityBlocksPipeline,
  qualifyContactability,
} from "./contactability.js";
import type { Lead } from "./db.js";

// ARCH-5: WhatsApp is permanently manual. There is no network availability check any more,
// so the no-email case is a pure binary on UK-mobile shape (isUkMobileCandidate):
//   UK mobile  -> NEEDS_MANUAL_REVIEW (manual WhatsApp), preferred_channel "whatsapp"
//   otherwise  -> DISQUALIFIED_NO_CONTACT_METHOD
// whatsapp_available is always "not_checked"; whatsapp_checked is always false.

function testNoEmailMobile(): void {
  const result = qualifyContactability({
    email: null,
    phone: "07972 176630",
  });
  assert.equal(result.contactability_status, "NEEDS_MANUAL_REVIEW");
  assert.equal(result.preferred_channel, "whatsapp");
  assert.equal(result.whatsapp_candidate, true);
  assert.equal(result.whatsapp_available, "not_checked");
  assert.equal(result.whatsapp_checked, false);
  assert.match(result.contactability_reason, /manual WhatsApp/i);
}

function testNoEmailMobileE164(): void {
  const result = qualifyContactability({
    email: null,
    phone: "+447972176630",
  });
  assert.equal(result.contactability_status, "NEEDS_MANUAL_REVIEW");
  assert.equal(result.preferred_channel, "whatsapp");
}

function testNoEmailLandline(): void {
  const result = qualifyContactability({
    email: null,
    phone: "0117 496 0123",
  });
  assert.equal(result.phone_type, "landline");
  assert.equal(result.contactability_status, "DISQUALIFIED_NO_CONTACT_METHOD");
  assert.equal(result.whatsapp_candidate, false);
  assert.equal(result.whatsapp_checked, false);
  assert.equal(result.whatsapp_available, "not_checked");
  assert.match(result.contactability_reason, /landline/);
}

function testNoEmailNoPhone(): void {
  const result = qualifyContactability({ email: null, phone: null });
  assert.equal(result.contactability_status, "DISQUALIFIED_NO_CONTACT_METHOD");
  assert.match(result.contactability_reason, /no phone number/);
}

// Semantic shift (2026-06-13 teardown): foreign numbers with no email used to be
// NEEDS_MANUAL_REVIEW; they are now DISQUALIFIED because they are not UK-mobile candidates.
function testForeignPhoneNoEmail(): void {
  const result = qualifyContactability({
    email: null,
    phone: "+1 415 555 0100",
  });
  assert.equal(result.phone_type, "foreign");
  assert.equal(result.contactability_status, "DISQUALIFIED_NO_CONTACT_METHOD");
  assert.match(result.contactability_reason, /not a UK mobile/);
}

// Semantic shift (2026-06-13 teardown): unknown-shape numbers with no email used to be
// NEEDS_MANUAL_REVIEW; they are now DISQUALIFIED.
function testUnknownPhoneNoEmail(): void {
  const result = qualifyContactability({ email: null, phone: "12345" });
  assert.equal(result.contactability_status, "DISQUALIFIED_NO_CONTACT_METHOD");
}

function testEmailMobile(): void {
  const result = qualifyContactability({
    email: "hello@example.com",
    phone: "07972 176630",
  });
  assert.equal(result.contactability_status, "CONTACTABLE");
  assert.equal(result.preferred_channel, "email");
  assert.equal(result.whatsapp_candidate, true);
  assert.equal(result.whatsapp_checked, false);
}

function testEmailLandline(): void {
  const result = qualifyContactability({
    email: "hello@example.com",
    phone: "0117 496 0123",
  });
  assert.equal(result.contactability_status, "CONTACTABLE");
  assert.equal(result.preferred_channel, "email");
  assert.equal(result.whatsapp_checked, false);
}

function testPipelineBlocksDisqualified(): void {
  const lead = {
    contactability_status: "DISQUALIFIED_NO_CONTACT_METHOD",
    contactability_reason: "no email found and phone is not a UK mobile",
  } as Lead;
  assert.ok(contactabilityBlocksPipeline(lead));
}

function testPipelineBlocksManualReviewByDefault(): void {
  const lead = {
    contactability_status: "NEEDS_MANUAL_REVIEW",
    contactability_reason: "no email found; UK mobile present, requires manual WhatsApp contact",
  } as Lead;
  assert.ok(contactabilityBlocksPipeline(lead));
  assert.equal(
    contactabilityBlocksPipeline(lead, { allowManualReview: true }),
    null
  );
}

function testPipelineAllowsLegacyNullStatus(): void {
  const lead = { contactability_status: null } as Lead;
  assert.equal(contactabilityBlocksPipeline(lead), null);
}

function run(): void {
  testNoEmailMobile();
  testNoEmailMobileE164();
  testNoEmailLandline();
  testNoEmailNoPhone();
  testForeignPhoneNoEmail();
  testUnknownPhoneNoEmail();
  testEmailMobile();
  testEmailLandline();
  testPipelineBlocksDisqualified();
  testPipelineBlocksManualReviewByDefault();
  testPipelineAllowsLegacyNullStatus();
  console.log("contactability.test.ts: all tests passed");
}

run();
