import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { getLeadBySlug, logWhatsAppSend, updateLead } from "./db.js";
import {
  enableLiveOutreach,
  resetOutreachSafety,
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
import { formatPhoneForWhatsApp } from "./phone_utils.js";
import {
  logFailedOutreachSend,
  logSuccessfulOutreachSend,
  type OutreachSendResult,
} from "./outreach_log.js";
import { formatContactName } from "./outreach_sequence.js";
import { formatWhatsAppTouch1 } from "./outreach_message_format.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const RECOMMENDED_PRICE = 250;
const TOUCH = 1;

function buildPitchMessages(
  contactFirstName: string,
  businessName: string,
  siteUrl: string
): string[] {
  return formatWhatsAppTouch1({
    contactFirstName,
    businessName,
    siteUrl,
    videoAttachment: true,
  }).messages;
}

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

function writeClientVCard(
  clientPhone: string,
  outDir: string,
  contactFirstName: string,
  businessName: string,
  filename: string
): string {
  const vcardPath = path.join(outDir, filename);
  const formatted = formatPhoneForWhatsApp(clientPhone);
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${contactFirstName}`,
    `N:${contactFirstName};${businessName};;;`,
    `ORG:${businessName}`,
    `TEL;TYPE=CELL:+${formatted}`,
    "NOTE:WebForTrades outreach contact",
    "END:VCARD",
    "",
  ].join("\n");
  fs.writeFileSync(vcardPath, vcard);
  return vcardPath;
}

async function main(): Promise<void> {
  if (!process.argv.includes("--live")) {
    console.error("Refusing to run without --live. Real client sends require explicit approval.");
    process.exit(1);
  }

  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const slug = args[0] ?? "bristol-plumbing-co";
  const videoRel =
    args.find((a) => a.endsWith(".mp4")) ??
    "briefs/bristol-plumbing-co/outreach/site-scroll.mp4";
  const videoPath = path.resolve(ROOT, videoRel);

  const lead = getLeadBySlug(slug);
  if (!lead) {
    console.error(`Lead not found: ${slug}`);
    process.exit(1);
  }

  if (!lead.phone?.trim()) {
    console.error("Lead has no phone number.");
    process.exit(1);
  }

  if (lead.state === "PITCHED") {
    console.error("Refusing to send: lead is already PITCHED.");
    process.exit(1);
  }

  if (!fs.existsSync(videoPath)) {
    console.error(`Video not found: ${videoPath}`);
    process.exit(1);
  }

  const env = { ...process.env, ...loadEnv() };
  const recipient = lead.phone.trim();
  const outreachDir = path.dirname(videoPath);
  const leadStateBefore = lead.state;
  const contactFirstName = lead.owner_first_name ?? "there";
  const intendedContactName =
    lead.contact_name ??
    formatContactName(lead.owner_first_name, lead.business_name);
  const siteUrl = lead.site_url ?? "";
  const pitchMessages = buildPitchMessages(contactFirstName, lead.business_name, siteUrl);
  const message = pitchMessages[0] ?? "";
  const videoRelPath = path.relative(ROOT, videoPath);
  const vcardFilename = `${slug.replace(/[^a-z0-9-]+/gi, "-")}-contact.vcf`;

  const health = await getOpenWAStatus();
  const session = await getSessionStatus();
  const availability = await checkWhatsAppAvailable(recipient);

  console.log("--- Preflight ---");
  console.log(`OpenWA reachable: ${health.reachable ? "yes" : "no"}`);
  console.log(`Session status: ${session.status ?? "unknown"}`);
  console.log(`Session connected: ${session.connected ? "yes" : "no"}`);
  console.log(`Recipient WhatsApp: ${availability.status}`);
  console.log(`Real recipient: ${maskPhone(recipient)}`);
  console.log(`Lead state before send: ${lead.state}`);
  console.log(`Video: ${videoRel}`);
  console.log(`Duplicate guard: PitchSendGuard active`);

  if (!session.connected || session.status !== "ready") {
    console.error("Refusing to send: OpenWA session is not ready.");
    process.exit(1);
  }

  if (availability.status === "unavailable") {
    console.error("Refusing to send: recipient is not WhatsApp available.");
    process.exit(1);
  }

  const contactSave = await saveWhatsAppContact({
    phone: recipient,
    contactName: intendedContactName,
    ownerFirstName: lead.owner_first_name,
    businessName: lead.business_name,
  });
  console.log(
    `Contact save supported: ${OPENWA_CONTACT_SAVE_SUPPORTED ? "yes" : "no"} (${contactSave.reason})`
  );

  const vcardPath = writeClientVCard(
    recipient,
    outreachDir,
    contactFirstName === "there" ? lead.business_name : contactFirstName,
    lead.business_name,
    vcardFilename
  );
  console.log(`VCard path: ${path.relative(ROOT, vcardPath)}`);

  updateLead(lead.id, {
    contact_name: intendedContactName,
    owner_first_name: lead.owner_first_name ?? contactFirstName,
    notes: [
      lead.notes,
      `intended_whatsapp_contact_name=${intendedContactName}`,
      "openwa_contact_save=unsupported",
      `pending_vcard=${path.relative(ROOT, vcardPath)}`,
    ]
      .filter(Boolean)
      .join("; "),
  });

  const guard = new PitchSendGuard();
  resetWhatsAppVideoSendGuards();
  let sendError: string | null = null;
  let liveFlagsEnabled = false;

  try {
    const flags = enableLiveOutreach();
    liveFlagsEnabled = flags.sendingEnabled || flags.testRecipientDisabled;
    console.log("Live outreach enabled (sending_enabled=true, test_recipient_only=false).");

    const configAfterEnable = loadConfig();
    if (!configAfterEnable.outreach.sending_enabled) {
      throw new Error("Could not enable outreach.sending_enabled.");
    }
    if (configAfterEnable.outreach.test_recipient_only !== false) {
      throw new Error("Could not disable outreach.test_recipient_only for live send.");
    }

    await guard.sendPitchSequence(recipient, pitchMessages, {
      touch: TOUCH,
      videoPath: videoPath,
      siteUrl,
    });
  } catch (err) {
    sendError = err instanceof Error ? err.message : String(err);
    console.error(sendError);
  } finally {
    const safety = resetOutreachSafety();
    console.log(
      `Safety reset: sending_enabled=false (${safety.sendingReset ? "updated" : "already false"}), test_recipient_only=true (${safety.testOnlyReset ? "updated" : "already true"}).`
    );
    void liveFlagsEnabled;
  }

  const { textSentCount, videoSentCount, videoSendAttempts } = guard.counts;
  const pitchSucceeded = textSentCount >= 1 && videoSentCount === 1;
  const pitchedAt = new Date().toISOString();
  const finalConfig = loadConfig();
  const sendResult: OutreachSendResult = pitchSucceeded
    ? "success"
    : textSentCount === 1 && videoSentCount === 0
      ? "partial_text_only"
      : textSentCount === 0 && videoSentCount === 1
        ? "partial_video_only"
        : "failed";

  const logBase = {
    timestamp: pitchSucceeded ? pitchedAt : new Date().toISOString(),
    slug,
    business_name: lead.business_name,
    contact_name: lead.owner_first_name,
    intended_whatsapp_contact_name: intendedContactName,
    phone: recipient,
    channel: "whatsapp" as const,
    touch: TOUCH,
    site_url: siteUrl || null,
    video_path: videoRelPath,
    message_body: message,
    price_note: `£${RECOMMENDED_PRICE}, not mentioned in first message`,
    lead_state_before: leadStateBefore,
    lead_state_after: pitchSucceeded ? "PITCHED" : leadStateBefore,
    send_result: sendResult,
    text_sent_count: textSentCount,
    video_sent_count: videoSentCount,
    video_attempts: videoSendAttempts,
    test_prefix_used: false,
    duplicate_prevented: videoSentCount <= 1,
    vcard_path: path.relative(ROOT, vcardPath),
    openwa_contact_save_supported: OPENWA_CONTACT_SAVE_SUPPORTED,
    sending_enabled_final: finalConfig.outreach.sending_enabled,
    test_recipient_only_final: finalConfig.outreach.test_recipient_only === true,
    sequence_path: "whatsapp_only" as const,
  };

  if (pitchSucceeded) {
    logWhatsAppSend(lead.id, TOUCH);
    updateLead(lead.id, {
      state: "PITCHED",
      pitched_at: pitchedAt,
      last_touch: TOUCH,
      primary_outreach_channel: "whatsapp",
      quoted_price: RECOMMENDED_PRICE,
      whatsapp_status: availability.status,
      whatsapp_available: 1,
      reply_status: "waiting",
      notes: [
        lead.notes,
        `whatsapp_pitch_sent=${pitchedAt}`,
        `whatsapp_recipient=${recipient}`,
        `whatsapp_attachment=${videoRelPath}`,
        `whatsapp_touch=${TOUCH}`,
        `recommended_price_gbp=${RECOMMENDED_PRICE}`,
      ]
        .filter(Boolean)
        .join("; "),
    });

    const logResult = logSuccessfulOutreachSend(logBase);
    console.log(
      logResult.logged
        ? `Outreach log written (${logResult.send_id}).`
        : `Outreach log skipped (${logResult.reason}).`
    );
  } else if (sendError || textSentCount > 0 || videoSentCount > 0) {
    updateLead(lead.id, {
      notes: [
        lead.notes,
        `whatsapp_pitch_failed=${new Date().toISOString()}`,
        `whatsapp_pitch_error=${sendError ?? sendResult}`,
        `whatsapp_text_sent_count=${textSentCount}`,
        `whatsapp_video_sent_count=${videoSentCount}`,
        `whatsapp_video_attempts=${videoSendAttempts}`,
      ]
        .filter(Boolean)
        .join("; "),
    });

    const failureResult = logFailedOutreachSend({
      ...logBase,
      error: sendError,
    });
    console.log(
      failureResult.logged
        ? `Failure log written (${failureResult.failure_id}).`
        : `Failure log skipped (duplicate).`
    );
  }

  const refreshedLead = getLeadBySlug(slug);

  console.log("\n--- Result ---");
  console.log(`Real send attempted: yes`);
  console.log(`Real recipient: ${maskPhone(recipient)}`);
  console.log(`Text sent count: ${textSentCount}`);
  console.log(`Video sent count: ${videoSentCount}`);
  console.log(`Video send attempts: ${videoSendAttempts}`);
  console.log(`Pitch succeeded: ${pitchSucceeded ? "yes" : "no"}`);
  console.log(`Lead state after send: ${refreshedLead?.state ?? "unknown"}`);
  console.log(`pitched_at set: ${pitchSucceeded ? "yes" : "no"}`);
  console.log(`sending_enabled final: ${finalConfig.outreach.sending_enabled}`);
  console.log(
    `test_recipient_only final: ${finalConfig.outreach.test_recipient_only === true}`
  );
  console.log(`TEST prefix used: no`);
  console.log(`Duplicate video guard: ${videoSentCount <= 1 ? "ok" : "FAILED"}`);

  if (!pitchSucceeded) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  resetOutreachSafety();
  process.exit(1);
});
