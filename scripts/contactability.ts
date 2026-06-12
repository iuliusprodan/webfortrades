import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import type { Lead, LeadState } from "./db.js";
import {
  classifyUkPhone,
  isWhatsAppCandidate,
  type PhoneType,
} from "./phone_utils.js";
import {
  checkWhatsAppAvailable,
  type WhatsAppCheckResult,
} from "./whatsapp_gateway.js";

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
  whatsapp_check_enabled: boolean;
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
  whatsappCheck?: WhatsAppCheckResult | null;
  config?: Partial<QualificationConfig>;
}

const DEFAULT_CONFIG: QualificationConfig = {
  require_contact_method: true,
  no_email_requires_whatsapp: true,
  disqualify_no_email_no_whatsapp: true,
  whatsapp_errors_manual_review: true,
  whatsapp_check_enabled: true,
};

export function loadQualificationConfig(): QualificationConfig {
  const configPath = path.join(ROOT, "config.yaml");
  if (!fs.existsSync(configPath)) return DEFAULT_CONFIG;
  const raw = parseYaml(fs.readFileSync(configPath, "utf8")) as {
    qualification?: Partial<QualificationConfig>;
    outreach?: { whatsapp_check_enabled?: boolean };
  };
  return {
    ...DEFAULT_CONFIG,
    ...raw.qualification,
    whatsapp_check_enabled:
      raw.outreach?.whatsapp_check_enabled ?? DEFAULT_CONFIG.whatsapp_check_enabled,
  };
}

function isWhatsAppCheckError(result: WhatsAppCheckResult): boolean {
  if (result.status !== "unknown") return false;
  if (!result.checked) {
    return result.detail !== "whatsapp_check_enabled=false";
  }
  return Boolean(result.detail);
}

function whatsappAvailabilityFromCheck(
  check: WhatsAppCheckResult | null | undefined,
  phoneType: PhoneType,
  checkAttempted: boolean
): WhatsAppAvailability {
  if (!checkAttempted) return "not_checked";
  if (!check) return "not_checked";
  if (check.status === "available") return "available";
  if (check.status === "unavailable") return "unavailable";
  return "unknown";
}

/**
 * Pure contactability decision. Pass whatsappCheck when email is missing and phone is UK mobile.
 * Does not call OpenWA. Never sends messages.
 */
export function qualifyContactability(input: QualifyInput): ContactabilityResult {
  const config = { ...DEFAULT_CONFIG, ...input.config };
  const email = input.email?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const emailAvailable = Boolean(email);
  const phoneType = classifyUkPhone(phone || null);
  const whatsappCandidate = isWhatsAppCandidate(phone || null);
  const check = input.whatsappCheck ?? null;

  const checkAttempted =
    Boolean(check?.checked) ||
    (whatsappCandidate && !emailAvailable && config.whatsapp_check_enabled);

  const whatsappAvailable = whatsappAvailabilityFromCheck(
    check,
    phoneType,
    checkAttempted
  );
  const whatsappChecked = checkAttempted && whatsappAvailable !== "not_checked";

  const base = {
    email_available: emailAvailable,
    phone_type: phoneType,
    whatsapp_candidate: whatsappCandidate,
    whatsapp_available: whatsappAvailable,
    whatsapp_checked: whatsappChecked,
    whatsapp_check_detail: check?.detail ?? null,
  };

  if (emailAvailable) {
    const preferWhatsApp =
      whatsappCandidate && whatsappAvailable === "available";
    return {
      ...base,
      contactability_status: "CONTACTABLE",
      contactability_reason: preferWhatsApp
        ? "email found, WhatsApp available on mobile"
        : "email found, email-only outreach if WhatsApp unavailable",
      preferred_channel: preferWhatsApp ? "whatsapp" : "email",
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

  if (phoneType === "landline") {
    return {
      ...base,
      whatsapp_available: "not_checked",
      whatsapp_checked: false,
      contactability_status: "DISQUALIFIED_NO_CONTACT_METHOD",
      contactability_reason:
        "no email found and phone is landline, not WhatsApp eligible",
      preferred_channel: null,
    };
  }

  if (phoneType === "foreign") {
    return {
      ...base,
      whatsapp_available: "not_checked",
      whatsapp_checked: false,
      contactability_status: "NEEDS_MANUAL_REVIEW",
      contactability_reason:
        "no email found and phone type is foreign, not auto-qualified",
      preferred_channel: null,
    };
  }

  if (phoneType === "unknown") {
    return {
      ...base,
      whatsapp_available: "not_checked",
      whatsapp_checked: false,
      contactability_status: "NEEDS_MANUAL_REVIEW",
      contactability_reason:
        "no email found and phone type is unknown, needs manual review",
      preferred_channel: null,
    };
  }

  if (!whatsappCandidate) {
    return {
      ...base,
      contactability_status: "NEEDS_MANUAL_REVIEW",
      contactability_reason: "no email found and phone is not a UK mobile",
      preferred_channel: null,
    };
  }

  if (!config.whatsapp_check_enabled) {
    return {
      ...base,
      whatsapp_available: "unknown",
      whatsapp_checked: false,
      contactability_status: "NEEDS_MANUAL_REVIEW",
      contactability_reason:
        "no email found, mobile present, WhatsApp check disabled in config",
      preferred_channel: null,
    };
  }

  if (!check) {
    return {
      ...base,
      whatsapp_available: "not_checked",
      whatsapp_checked: false,
      contactability_status: "NEEDS_MANUAL_REVIEW",
      contactability_reason:
        "no email found, UK mobile present, WhatsApp check not run yet",
      preferred_channel: null,
    };
  }

  if (isWhatsAppCheckError(check) && config.whatsapp_errors_manual_review) {
    return {
      ...base,
      whatsapp_available: "unknown",
      whatsapp_checked: true,
      contactability_status: "NEEDS_MANUAL_REVIEW",
      contactability_reason: "WhatsApp availability check failed",
      preferred_channel: null,
      whatsapp_check_detail: check.detail,
    };
  }

  if (check.status === "available") {
    return {
      ...base,
      whatsapp_available: "available",
      whatsapp_checked: true,
      contactability_status: "CONTACTABLE",
      contactability_reason: "no email found, WhatsApp available",
      preferred_channel: "whatsapp",
    };
  }

  if (check.status === "unavailable") {
    return {
      ...base,
      whatsapp_available: "unavailable",
      whatsapp_checked: true,
      contactability_status: "DISQUALIFIED_NO_CONTACT_METHOD",
      contactability_reason:
        "no email found and mobile is not on WhatsApp",
      preferred_channel: null,
    };
  }

  return {
    ...base,
    whatsapp_available: "unknown",
    whatsapp_checked: true,
    contactability_status: "NEEDS_MANUAL_REVIEW",
    contactability_reason: "WhatsApp availability check returned unknown",
    preferred_channel: null,
    whatsapp_check_detail: check.detail,
  };
}

/**
 * Run WhatsApp availability check when required, then qualify. Check-only, never sends messages.
 */
export async function qualifyContactabilityAsync(
  input: Omit<QualifyInput, "whatsappCheck"> & {
    skipWhatsAppCheck?: boolean;
  }
): Promise<ContactabilityResult> {
  const config = { ...DEFAULT_CONFIG, ...input.config, ...loadQualificationConfig() };
  const email = input.email?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const phoneType = classifyUkPhone(phone || null);
  const needsWhatsAppCheck =
    !email &&
    phoneType === "mobile" &&
    isWhatsAppCandidate(phone) &&
    config.whatsapp_check_enabled &&
    !input.skipWhatsAppCheck;

  let whatsappCheck: WhatsAppCheckResult | null = null;
  if (needsWhatsAppCheck) {
    whatsappCheck = await checkWhatsAppAvailable(phone);
  }

  return qualifyContactability({
    email: input.email,
    phone: input.phone,
    whatsappCheck,
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
