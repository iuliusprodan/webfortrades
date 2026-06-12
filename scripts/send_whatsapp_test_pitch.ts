import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { getLeadBySlug, updateLead } from "./db.js";
import {
  disableSendingEnabled,
  enableSendingEnabled,
  requireTestRecipientNumber,
} from "./test_recipient.js";
import {
  checkWhatsAppAvailable,
  getOpenWAStatus,
  getSessionStatus,
  loadEnv,
  OPENWA_CONTACT_SAVE_SUPPORTED,
  resetWhatsAppVideoSendGuards,
  saveWhatsAppContact,
} from "./whatsapp_gateway.js";
import { PitchSendGuard } from "./whatsapp_send_guard.js";
import { formatWhatsAppTouch1 } from "./outreach_message_format.js";

import { formatPhoneForWhatsApp } from "./phone_utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const BRISTOL_CLIENT_PHONE = "07972176630";
const INTENDED_CONTACT_NAME = "Jack - Bristol Plumbing Co.";

const PITCH_MESSAGES = formatWhatsAppTouch1({
  contactFirstName: "Jack",
  businessName: "Bristol Plumbing Co.",
  siteUrl: "https://bristol-plumbing-co.vercel.app/",
  videoAttachment: true,
}).messages;

interface Config {
  outreach: {
    sending_enabled: boolean;
    test_recipient_only: boolean;
  };
}

function loadConfig(): Config {
  return parseYaml(fs.readFileSync(path.join(ROOT, "config.yaml"), "utf8")) as Config;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***${digits.slice(-4)}`;
}

function phonesMatch(a: string, b: string): boolean {
  return formatPhoneForWhatsApp(a) === formatPhoneForWhatsApp(b);
}

function writePendingVCard(clientPhone: string, outDir: string): string {
  const vcardPath = path.join(outDir, "jack-bristol-plumbing-co.vcf");
  const formatted = formatPhoneForWhatsApp(clientPhone);
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${INTENDED_CONTACT_NAME}`,
    `N:Plumbing Co.;Jack - Bristol;;;`,
    `TEL;TYPE=CELL:+${formatted}`,
    "ORG:Bristol Plumbing Co.",
    "END:VCARD",
    "",
  ].join("\n");
  fs.writeFileSync(vcardPath, vcard);
  return vcardPath;
}

async function resolveOpenWASessionId(env: Record<string, string>): Promise<string | null> {
  const base = env.OPENWA_API_URL?.replace(/\/$/, "");
  const key = env.OPENWA_API_KEY;
  const sessionName = env.OPENWA_SESSION_ID;
  if (!base || !key || !sessionName) return null;

  const direct = await fetch(`${base}/api/sessions/${encodeURIComponent(sessionName)}`, {
    headers: { "X-API-Key": key, Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
  });
  if (direct.ok) {
    const data = (await direct.json()) as { id?: string };
    if (data.id) return data.id;
  }

  const list = await fetch(`${base}/api/sessions`, {
    headers: { "X-API-Key": key, Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
  });
  if (!list.ok) return null;
  const sessions = (await list.json()) as { id: string; name: string }[];
  return sessions.find((s) => s.id === sessionName || s.name === sessionName)?.id ?? null;
}

async function saveOpenWAQrImage(
  env: Record<string, string>,
  outPath: string
): Promise<boolean> {
  const base = env.OPENWA_API_URL?.replace(/\/$/, "");
  const key = env.OPENWA_API_KEY;
  if (!base || !key) return false;

  const sessionId = await resolveOpenWASessionId(env);
  if (!sessionId) return false;

  const res = await fetch(`${base}/api/sessions/${encodeURIComponent(sessionId)}/qr`, {
    headers: { "X-API-Key": key, Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return false;

  const data = (await res.json()) as { qrCode?: string };
  const qr = data.qrCode;
  if (!qr?.startsWith("data:image/png;base64,")) return false;

  fs.writeFileSync(outPath, Buffer.from(qr.replace(/^data:image\/png;base64,/, ""), "base64"));
  return true;
}

async function waitForReadySession(timeoutMs: number): Promise<boolean> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const session = await getSessionStatus();
    if (session.connected || session.status === "ready") return true;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  return false;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const slug = args[0] ?? "bristol-plumbing-co";
  const videoRel =
    args.find((a) => a.endsWith(".mp4")) ??
    "briefs/bristol-plumbing-co/outreach/site-scroll.mp4";
  const videoPath = path.resolve(ROOT, videoRel);

  const config = loadConfig();
  if (config.outreach.test_recipient_only !== true) {
    console.error("Refusing to run: outreach.test_recipient_only must be true.");
    process.exit(1);
  }

  const env = { ...process.env, ...loadEnv() };
  const testNumber = requireTestRecipientNumber(env);

  const lead = getLeadBySlug(slug);
  if (!lead) {
    console.error(`Lead not found: ${slug}`);
    process.exit(1);
  }

  if (lead.phone && phonesMatch(lead.phone, testNumber)) {
    console.error("Refusing to run: lead phone matches MY_OWN_TEST_NUMBER.");
    process.exit(1);
  }

  if (lead.phone && !phonesMatch(lead.phone, BRISTOL_CLIENT_PHONE)) {
    console.warn(
      `Warning: lead phone ${lead.phone} differs from expected client ${BRISTOL_CLIENT_PHONE}.`
    );
  }

  if (!fs.existsSync(videoPath)) {
    console.error(`Video not found: ${videoPath}`);
    process.exit(1);
  }

  const outreachDir = path.dirname(videoPath);

  const health = await getOpenWAStatus();
  const session = await getSessionStatus();
  const availability = await checkWhatsAppAvailable(testNumber);

  console.log("--- Preflight ---");
  console.log(`OpenWA reachable: ${health.reachable ? "yes" : "no"}`);
  console.log(`Session status: ${session.status ?? "unknown"}`);
  console.log(`Session connected: ${session.connected ? "yes" : "no"}`);
  console.log(`Test number WhatsApp: ${availability.status}`);
  console.log(`Recipient (test only): ${maskPhone(testNumber)}`);
  console.log(`Client phone will NOT be used: ${maskPhone(BRISTOL_CLIENT_PHONE)}`);
  console.log(`Video: ${videoRel}`);

  if (!session.connected) {
    const qrPath = path.join(outreachDir, "openwa-qr.png");
    if (await saveOpenWAQrImage(env as Record<string, string>, qrPath)) {
      console.log(
        `OpenWA needs QR scan. Saved QR image: ${path.relative(ROOT, qrPath)}`
      );
      console.log("Waiting up to 90s for session to become ready...");
      const ready = await waitForReadySession(90000);
      if (!ready) {
        console.log("Session still not ready after wait.");
      }
    }
  }

  if (!session.connected || session.status !== "ready") {
    console.error("Refusing to send: OpenWA session is not ready.");
    process.exit(1);
  }

  if (availability.status === "unavailable") {
    console.error("Refusing to send: MY_OWN_TEST_NUMBER is not WhatsApp available.");
    process.exit(1);
  }

  const contactSave = await saveWhatsAppContact({
    phone: lead.phone ?? BRISTOL_CLIENT_PHONE,
    contactName: INTENDED_CONTACT_NAME,
    ownerFirstName: "Jack",
    businessName: lead.business_name,
  });
  console.log(
    `OpenWA contact save supported: ${OPENWA_CONTACT_SAVE_SUPPORTED ? "yes" : "no"} (${contactSave.reason})`
  );

  const vcardPath = writePendingVCard(BRISTOL_CLIENT_PHONE, outreachDir);
  console.log(`Pending vCard for manual import: ${path.relative(ROOT, vcardPath)}`);

  updateLead(lead.id, {
    contact_name: INTENDED_CONTACT_NAME,
    owner_first_name: "Jack",
    notes: [
      lead.notes,
      `intended_whatsapp_contact_name=${INTENDED_CONTACT_NAME}`,
      "openwa_contact_save=unsupported",
      `pending_vcard=${path.relative(ROOT, vcardPath)}`,
    ]
      .filter(Boolean)
      .join("; "),
  });

  const guard = new PitchSendGuard();
  resetWhatsAppVideoSendGuards();
  let enabledForTest = false;

  try {
    enabledForTest = enableSendingEnabled();
    if (enabledForTest) {
      console.log("Temporarily enabled outreach.sending_enabled for this test.");
    }

    const configAfterEnable = loadConfig();
    if (!configAfterEnable.outreach.sending_enabled) {
      throw new Error("Could not enable outreach.sending_enabled for test send.");
    }

    await guard.sendPitchSequence(testNumber, PITCH_MESSAGES, {
      touch: 1,
      videoPath,
      siteUrl: "https://bristol-plumbing-co.vercel.app/",
    });
  } catch (err) {
    console.error((err as Error).message);
  } finally {
    if (disableSendingEnabled()) {
      console.log("Reset outreach.sending_enabled to false.");
    }
  }

  const { textSentCount, videoSentCount, videoSendAttempts } = guard.counts;
  const textSent = textSentCount >= 1;
  const videoSent = videoSentCount === 1;

  const finalConfig = loadConfig();
  const refreshedLead = getLeadBySlug(slug);

  console.log("\n--- Result ---");
  console.log(`Test send sent: ${textSent && videoSent ? "yes" : "no"}`);
  console.log(`Text sent count: ${textSentCount}`);
  console.log(`Video sent count: ${videoSentCount}`);
  console.log(`Video send attempts: ${videoSendAttempts}`);
  console.log(`Recipient used: ${maskPhone(testNumber)}`);
  console.log(`Client contacted: no (${maskPhone(BRISTOL_CLIENT_PHONE)} not used)`);
  console.log(`Video path: ${videoRel}`);
  console.log(`Lead state: ${refreshedLead?.state ?? "unknown"}`);
  console.log(`Intended contact name: ${INTENDED_CONTACT_NAME}`);
  console.log(`sending_enabled final: ${finalConfig.outreach.sending_enabled}`);
  console.log(
    `test_recipient_only final: ${finalConfig.outreach.test_recipient_only === true}`
  );

  if (!textSent || !videoSent) {
    if (session.status === "qr_ready") {
      console.log(
        "\nOpenWA session needs QR scan (status=qr_ready). Link the session, then re-run this script."
      );
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  disableSendingEnabled();
  process.exit(1);
});
