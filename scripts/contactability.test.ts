import assert from "node:assert/strict";
import {
  contactabilityBlocksPipeline,
  qualifyContactability,
  type QualificationConfig,
} from "./contactability.js";
import type { Lead } from "./db.js";
import type { WhatsAppCheckResult } from "./whatsapp_gateway.js";

const ENABLED: Partial<QualificationConfig> = {
  whatsapp_check_enabled: true,
  whatsapp_errors_manual_review: true,
};

function wa(status: WhatsAppCheckResult["status"], detail: string | null = null): WhatsAppCheckResult {
  return { status, checked: true, detail };
}

function testNoEmailMobileWhatsAppAvailable(): void {
  const result = qualifyContactability({
    email: null,
    phone: "07972 176630",
    whatsappCheck: wa("available"),
    config: ENABLED,
  });
  assert.equal(result.contactability_status, "CONTACTABLE");
  assert.equal(result.preferred_channel, "whatsapp");
  assert.equal(result.whatsapp_available, "available");
}

function testNoEmailMobileWhatsAppUnavailable(): void {
  const result = qualifyContactability({
    email: null,
    phone: "07972 176630",
    whatsappCheck: wa("unavailable"),
    config: ENABLED,
  });
  assert.equal(result.contactability_status, "DISQUALIFIED_NO_CONTACT_METHOD");
  assert.match(result.contactability_reason, /not on WhatsApp/);
}

function testNoEmailLandline(): void {
  const result = qualifyContactability({
    email: null,
    phone: "0117 496 0123",
    config: ENABLED,
  });
  assert.equal(result.phone_type, "landline");
  assert.equal(result.contactability_status, "DISQUALIFIED_NO_CONTACT_METHOD");
  assert.equal(result.whatsapp_checked, false);
  assert.equal(result.whatsapp_available, "not_checked");
  assert.match(result.contactability_reason, /landline/);
}

function testNoEmailWhatsAppApiError(): void {
  const result = qualifyContactability({
    email: null,
    phone: "07972 176630",
    whatsappCheck: wa("unknown", "gateway_http_503"),
    config: ENABLED,
  });
  assert.equal(result.contactability_status, "NEEDS_MANUAL_REVIEW");
  assert.match(result.contactability_reason, /check failed/i);
}

function testEmailWhatsAppUnavailable(): void {
  const result = qualifyContactability({
    email: "hello@example.com",
    phone: "07972 176630",
    whatsappCheck: wa("unavailable"),
    config: ENABLED,
  });
  assert.equal(result.contactability_status, "CONTACTABLE");
  assert.equal(result.preferred_channel, "email");
}

function testEmailLandline(): void {
  const result = qualifyContactability({
    email: "hello@example.com",
    phone: "0117 496 0123",
    config: ENABLED,
  });
  assert.equal(result.contactability_status, "CONTACTABLE");
  assert.equal(result.preferred_channel, "email");
  assert.equal(result.whatsapp_checked, false);
}

function testForeignPhoneNoEmail(): void {
  const result = qualifyContactability({
    email: null,
    phone: "+1 415 555 0100",
    config: ENABLED,
  });
  assert.equal(result.phone_type, "foreign");
  assert.equal(result.contactability_status, "NEEDS_MANUAL_REVIEW");
}

function testUnknownPhoneNoEmail(): void {
  const result = qualifyContactability({
    email: null,
    phone: "12345",
    config: ENABLED,
  });
  assert.equal(result.contactability_status, "NEEDS_MANUAL_REVIEW");
}

function testPipelineBlocksDisqualified(): void {
  const lead = {
    contactability_status: "DISQUALIFIED_NO_CONTACT_METHOD",
    contactability_reason: "no email found and mobile is not on WhatsApp",
  } as Lead;
  assert.ok(contactabilityBlocksPipeline(lead));
}

function testPipelineAllowsLegacyNullStatus(): void {
  const lead = { contactability_status: null } as Lead;
  assert.equal(contactabilityBlocksPipeline(lead), null);
}

function run(): void {
  testNoEmailMobileWhatsAppAvailable();
  testNoEmailMobileWhatsAppUnavailable();
  testNoEmailLandline();
  testNoEmailWhatsAppApiError();
  testEmailWhatsAppUnavailable();
  testEmailLandline();
  testForeignPhoneNoEmail();
  testUnknownPhoneNoEmail();
  testPipelineBlocksDisqualified();
  testPipelineAllowsLegacyNullStatus();
  console.log("contactability.test.ts: all tests passed");
}

run();
