import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import type { OutreachApprovalMode } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const WEBSITE_ROOT = path.join(__dirname, "..", "..");

export interface OutreachConfig {
  from_name: string;
  agency_name: string;
  from_email: string;
  sending_enabled: boolean;
  test_recipient_only: boolean;
  /** per_send (default) | batch */
  approval_mode: OutreachApprovalMode;
  whatsapp_check_enabled: boolean;
  daily_send_cap: number;
}

export interface WebsiteConfig {
  approval_mode: string;
  outreach: OutreachConfig;
}

const VALID_APPROVAL_MODES: OutreachApprovalMode[] = ["per_send", "batch"];

export function normaliseApprovalMode(value: unknown): OutreachApprovalMode {
  if (value === "batch") return "batch";
  return "per_send";
}

export function loadWebsiteConfig(root = WEBSITE_ROOT): WebsiteConfig {
  const raw = parseYaml(
    fs.readFileSync(path.join(root, "config.yaml"), "utf8")
  ) as WebsiteConfig;
  return {
    ...raw,
    outreach: {
      ...raw.outreach,
      approval_mode: normaliseApprovalMode(raw.outreach?.approval_mode),
    },
  };
}

export function assertValidApprovalMode(mode: string): OutreachApprovalMode {
  if (!VALID_APPROVAL_MODES.includes(mode as OutreachApprovalMode)) {
    throw new Error(
      `Invalid outreach.approval_mode "${mode}". Use per_send or batch.`
    );
  }
  return mode as OutreachApprovalMode;
}

/** Snapshot safety flags for drift detection mid-batch. */
export function readSafetyFlags(root = WEBSITE_ROOT): {
  sending_enabled: boolean;
  test_recipient_only: boolean;
} {
  const cfg = loadWebsiteConfig(root);
  return {
    sending_enabled: cfg.outreach.sending_enabled,
    test_recipient_only: cfg.outreach.test_recipient_only,
  };
}

export function safetyFlagsDrifted(
  expected: { sending_enabled: boolean; test_recipient_only: boolean },
  root = WEBSITE_ROOT
): boolean {
  const current = readSafetyFlags(root);
  return (
    current.sending_enabled !== expected.sending_enabled ||
    current.test_recipient_only !== expected.test_recipient_only
  );
}
