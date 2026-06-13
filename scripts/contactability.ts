import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import type { Lead, LeadState } from "./db.js";
import { classifyUkPhone, type PhoneType } from "./phone_utils.js";
import { isUkMobileCandidate } from "./lib/uk_mobile.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

export type ContactabilityStatus =
  | "CONTACTABLE"
  | "DISQUALIFIED_NO_CONTACT_METHOD"
  | "NEEDS_MANUAL_REVIEW";

export type WhatsAppAvailability =
  | "available"
  | "unavailable"
  | "unknown"
  | "not_checked";

export type PreferredChannel = "whatsapp" | "email" | null;

export interface QualificationConfig {
  require_contact_method: boolean;
  no_email_requires_whatsapp: boolean;
  disqualify_no_email_no_whatsapp: boolean;
  whatsapp_errors_manual_review: boolean;
}

export interface ContactabilityResult {
  email_available: boolean;
  phone_type: PhoneType;
  whatsapp_candidate: boolean;
  whatsapp_available: WhatsAppAvailability;
  whatsapp_checked: boolean;
  contactability_status: ContactabilityStatus;
  contactability_reason: string;
  preferred_channel: PreferredChannel;
  whatsapp_check_detail: string | null;
}

interface QualifyInput {
  email: string | null | undefined;
  phone: string | null | undefined;
  config?: Partial<QualificationConfig>;
}

const DEFAULT_CONFIG: QualificationConfig = {
  require_contact_method: true,
  no_email_requires_whatsapp: true,
  disqualify_no_email_no_whatsapp: true,
  whatsapp_errors_manual_review: true,
};

export function loadQualificationConfig(): QualificationConfig {
  const configPath = path.join(ROOT, "config.yaml");
  if (!fs.existsSync(configPath)) return DEFAULT_CONFIG;
  const raw = parseYaml(fs.readFileSync(configPath, "utf8")) as {
    qualification?: Partial<QualificationConfig>;
  };
  return {
    ...DEFAULT_CONFIG,
    ...raw.qualification,
  };
}

/**
 * Pure, synchronous contactability decision.
 *
 * ARCH-5: WhatsApp is permanently manual, so there is no longer any network availability
 * ping (the OpenWA `checkWhatsAppAvailable` path was torn out on 2026-06-13). The single
 * source of truth is now `isUkMobileCandidate`, a pure format predicate. The no-email case
 * collapses to a binary: a UK-mobile candidate routes to manual WhatsApp contact
 * (NEEDS_MANUAL_REVIEW), anything else is DISQUALIFIED_NO_CONTACT_METHOD.
 *
 * Never sends messages; never touches the network.
 */
export function qualifyContactability(input: QualifyInput): ContactabilityResult {
  const email = input.email?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const emailAvailable = Boolean(email);
  const phoneType = classifyUkPhone(phone || null);
  const mobileCandidate = isUkMobileCandidate(phone || null);

  const base = {
    email_available: emailAvailable,
    phone_type: phoneType,
    whatsapp_candidate: mobileCandidate,
    whatsapp_available: "not_checked" as WhatsAppAvailability,
    whatsapp_checked: false,
    whatsapp_check_detail: null as string | null,
  };

  if (emailAvailable) {
    return {
      ...base,
      contactability_status: "CONTACTABLE",
      contactability_reason: mobileCandidate
        ? "email found; UK mobile also present for optional manual WhatsApp"
        : "email found",
      preferred_channel: "email",
    };
  }

  if (!phone) {
    return {
      ...base,
      contactability_status: "DISQUALIFIED_NO_CONTACT_METHOD",
      contactability_reason: "no email found and no phone number",
      preferred_channel: null,
    };
  }

  if (mobileCandidate) {
    return {
      ...base,
      contactability_status: "NEEDS_MANUAL_REVIEW",
      contactability_reason:
        "no email found; UK mobile present, requires manual WhatsApp contact",
      preferred_channel: "whatsapp",
    };
  }

  return {
    ...base,
    contactability_status: "DISQUALIFIED_NO_CONTACT_METHOD",
    contactability_reason:
      phoneType === "landline"
        ? "no email found and phone is landline, not WhatsApp eligible"
        : "no email found and phone is not a UK mobile",
    preferred_channel: null,
  };
}

/**
 * Async wrapper retained for call-site compatibility. There is no network check any more
 * (ARCH-5); this applies config defaults and delegates to the synchronous decision.
 */
export async function qualifyContactabilityAsync(
  input: QualifyInput & {
    skipWhatsAppCheck?: boolean;
  }
): Promise<ContactabilityResult> {
  const config = { ...DEFAULT_CONFIG, ...input.config, ...loadQualificationConfig() };
  return qualifyContactability({
    email: input.email,
    phone: input.phone,
    config,
  });
}

export function leadStateForContactability(
  status: ContactabilityStatus
): LeadState {
  switch (status) {
    case "CONTACTABLE":
      return "GATHERED";
    case "DISQUALIFIED_NO_CONTACT_METHOD":
      return "PITCH_BLOCKED";
    case "NEEDS_MANUAL_REVIEW":
      return "NEEDS_MANUAL_CONTACT";
  }
}

export function contactabilityBlocksPipeline(
  lead: Lead,
  options: { allowManualReview?: boolean } = {}
): string | null {
  const status = lead.contactability_status as ContactabilityStatus | null;
  if (!status) return null;

  if (status === "CONTACTABLE") return null;

  if (status === "NEEDS_MANUAL_REVIEW") {
    if (options.allowManualReview) return null;
    return (
      lead.contactability_reason ??
      "Lead needs manual review before build, deploy, or outreach"
    );
  }

  return (
    lead.contactability_reason ??
    "Lead has no valid contact method for outreach"
  );
}

export function contactabilityToLeadFields(
  result: ContactabilityResult
): Record<string, string | number | null> {
  const whatsappStatus =
    result.whatsapp_available === "not_checked"
      ? null
      : result.whatsapp_available;

  let whatsappAvailableInt: number | null = null;
  if (result.whatsapp_available === "available") whatsappAvailableInt = 1;
  else if (result.whatsapp_available === "unavailable") whatsappAvailableInt = 0;

  return {
    email_available: result.email_available ? 1 : 0,
    phone_type: result.phone_type,
    whatsapp_status: whatsappStatus,
    whatsapp_available: whatsappAvailableInt,
    whatsapp_checked_at: result.whatsapp_checked
      ? new Date().toISOString()
      : null,
    primary_outreach_channel: result.preferred_channel,
    contactability_status: result.contactability_status,
    contactability_reason: result.contactability_reason,
  };
}

export function printContactabilitySummary(
  businessName: string,
  phone: string | null,
  result: ContactabilityResult
): void {
  console.log(`${businessName}`);
  console.log(`Email: ${result.email_available ? "found" : "missing"}`);
  console.log(`Phone: ${phone ?? "-"}`);
  console.log(`Phone type: ${result.phone_type}`);
  console.log(`WhatsApp checked: ${result.whatsapp_checked ? "yes" : "no"}`);
  const waLabel =
    result.whatsapp_available === "not_checked"
      ? "not checked"
      : result.whatsapp_available === "available"
        ? "yes"
        : result.whatsapp_available === "unavailable"
          ? "no"
          : "unknown";
  console.log(`WhatsApp available: ${waLabel}`);
  console.log(`Contactability: ${result.contactability_status}`);
  if (result.preferred_channel) {
    console.log(
      `Preferred channel: ${result.preferred_channel === "whatsapp" ? "WhatsApp" : "Email"}`
    );
  }
  console.log(`Reason: ${result.contactability_reason}`);
  if (result.whatsapp_check_detail) {
    console.log(`WhatsApp check detail: ${result.whatsapp_check_detail}`);
  }
}
