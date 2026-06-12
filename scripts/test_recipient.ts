import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

export function requireTestRecipientNumber(
  env: Record<string, string | undefined>
): string {
  const number = env.MY_OWN_TEST_NUMBER?.trim();
  if (!number) {
    throw new Error(
      "MY_OWN_TEST_NUMBER is required when outreach.test_recipient_only=true."
    );
  }
  return number;
}

export function formatTestWhatsAppMessage(
  businessName: string,
  draftText: string
): string {
  return `TEST COPY - this would be sent to ${businessName}.\n\n${draftText}`;
}

/** Set outreach.sending_enabled to true for a one-off test send. */
export function enableSendingEnabled(): boolean {
  const configPath = path.join(ROOT, "config.yaml");
  const content = fs.readFileSync(configPath, "utf8");
  if (/^(\s*sending_enabled:\s*)true\b/m.test(content)) {
    return false;
  }
  const updated = content.replace(
    /^(\s*sending_enabled:\s*)false\b/m,
    "$1true"
  );
  if (updated === content) return false;
  fs.writeFileSync(configPath, updated);
  return true;
}

/** Set outreach.sending_enabled back to false after a test send. */
export function disableSendingEnabled(): boolean {
  const configPath = path.join(ROOT, "config.yaml");
  const content = fs.readFileSync(configPath, "utf8");
  if (!/^(\s*sending_enabled:\s*)true\b/m.test(content)) {
    return false;
  }
  const updated = content.replace(
    /^(\s*sending_enabled:\s*)true\b/m,
    "$1false"
  );
  fs.writeFileSync(configPath, updated);
  return true;
}

/** Set outreach.test_recipient_only for live or test sends. */
export function setTestRecipientOnly(enabled: boolean): boolean {
  const configPath = path.join(ROOT, "config.yaml");
  const content = fs.readFileSync(configPath, "utf8");
  const target = enabled ? "true" : "false";
  const pattern = /^(\s*test_recipient_only:\s*)(true|false)\b/m;
  const match = content.match(pattern);
  if (!match) return false;
  const current = match[2] === "true";
  if (current === enabled) return false;
  const updated = content.replace(pattern, `$1${target}`);
  fs.writeFileSync(configPath, updated);
  return true;
}

/** Preferred safe defaults after any send attempt. */
export function resetOutreachSafety(): { sendingReset: boolean; testOnlyReset: boolean } {
  return {
    sendingReset: disableSendingEnabled(),
    testOnlyReset: setTestRecipientOnly(true),
  };
}

/** Enable live outreach: sending on, test redirect off. */
export function enableLiveOutreach(): {
  sendingEnabled: boolean;
  testRecipientDisabled: boolean;
} {
  return {
    sendingEnabled: enableSendingEnabled(),
    testRecipientDisabled: setTestRecipientOnly(false),
  };
}
