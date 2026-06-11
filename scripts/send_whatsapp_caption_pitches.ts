/**
 * Send approved WhatsApp pitches with scroll video + caption (or split fallback).
 * Usage: tsx scripts/send_whatsapp_caption_pitches.ts --live --confirm
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
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
  resetWhatsAppVideoSendGuards,
} from "./whatsapp_gateway.js";
import { ffprobeBin } from "./preview_video.js";
import { formatPhoneForWhatsApp } from "./phone_utils.js";
import { logSuccessfulOutreachSend } from "./outreach_log.js";
import { PitchSendGuard } from "./whatsapp_send_guard.js";
import { formatWhatsAppTouch1 } from "./outreach_message_format.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const TOUCH = 1;
const RECOMMENDED_PRICE = 250;

interface PitchTarget {
  slug: string;
  siteUrl: string;
  phone: string;
  videoPath: string;
  mobileVideoPath: string;
  posterPath: string;
  waivedBlockers: string[];
}

export function assertPitchTargetSendAllowed(lead: { state: string; slug?: string }): void {
  if (lead.state === "PITCHED") {
    throw new Error(`Lead ${lead.slug ?? "(unknown)"} is already PITCHED; refusing duplicate send.`);
  }
}

function loadTargetsFromManifest(manifestPath: string): PitchTarget[] {
  const abs = path.isAbsolute(manifestPath) ? manifestPath : path.join(ROOT, manifestPath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Manifest not found: ${abs}`);
  }
  const data = JSON.parse(fs.readFileSync(abs, "utf8")) as PitchTarget[] | { targets?: PitchTarget[] };
  const targets = Array.isArray(data) ? data : data.targets;
  if (!targets?.length) {
    throw new Error(`Manifest has no targets: ${abs}`);
  }
  return targets;
}

function parseManifestArg(): string | null {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--manifest" && args[i + 1]) return args[++i]!;
  }
  return null;
}

interface Config {
  outreach: { sending_enabled: boolean; test_recipient_only: boolean };
}

function loadConfig(): Config {
  return parseYaml(fs.readFileSync(path.join(ROOT, "config.yaml"), "utf8")) as Config;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 3) return "***";
  return `${"*".repeat(Math.max(0, digits.length - 3))}${digits.slice(-3)}`;
}

function toE164(phone: string): string {
  return `+${formatPhoneForWhatsApp(phone)}`;
}

function sha256File(filePath: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function probeVideo(filePath: string): { width: number; height: number; duration: number } {
  const raw = execSync(
    `"${ffprobeBin()}" -v error -select_streams v:0 -show_entries stream=width,height -show_entries format=duration -of json "${filePath}"`,
    { encoding: "utf8" }
  );
  const data = JSON.parse(raw) as {
    streams?: { width?: number; height?: number }[];
    format?: { duration?: string };
  };
  return {
    width: data.streams?.[0]?.width ?? 0,
    height: data.streams?.[0]?.height ?? 0,
    duration: Number(data.format?.duration ?? 0),
  };
}

function pickVideo(target: PitchTarget): string {
  const desktop = path.join(ROOT, target.videoPath);
  const mobile = path.join(ROOT, target.mobileVideoPath);
  if (!fs.existsSync(desktop)) throw new Error(`Video missing: ${desktop}`);
  const size = fs.statSync(desktop).size;
  if (size > 15 * 1024 * 1024 && fs.existsSync(mobile)) {
    return mobile;
  }
  return desktop;
}

function isRetriableVideoError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const httpStatus = (err as { httpStatus?: number }).httpStatus;
  return httpStatus === 413 || /413|format|payload|too large/i.test(msg);
}

function pitchMessagesForTarget(target: PitchTarget, businessName: string): string[] {
  return formatWhatsAppTouch1({
    businessName,
    siteUrl: target.siteUrl,
    videoAttachment: true,
  }).messages;
}

async function sendPitchVideo(
  phone: string,
  videoPath: string,
  messages: string[],
  siteUrl: string,
  fallbackPath: string | null
): Promise<{
  mode: "two_message";
  videoPathUsed: string;
  videoAttempts: number;
  textSentCount: number;
  videoSentCount: number;
}> {
  let attempts = 0;
  const pathsToTry = [videoPath, ...(fallbackPath ? [fallbackPath] : [])];
  const guard = new PitchSendGuard();

  for (const candidate of pathsToTry) {
    attempts++;
    try {
      await guard.sendPitchSequence(phone, messages, {
        touch: TOUCH,
        videoPath: candidate,
        siteUrl,
      });
      return {
        mode: "two_message",
        videoPathUsed: candidate,
        videoAttempts: attempts,
        textSentCount: guard.counts.textSentCount,
        videoSentCount: guard.counts.videoSentCount,
      };
    } catch (err) {
      if (attempts < pathsToTry.length && isRetriableVideoError(err)) {
        console.log(`  Video send failed (${(err as Error).message}), trying fallback...`);
        guard.reset();
        continue;
      }
      throw err;
    }
  }

  throw new Error("Video pitch send failed after all attempts.");
}

async function waitForSendAck(ms = 3000): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

function verifyBriefPhone(slug: string, expected: string): void {
  const briefPath = path.join(ROOT, "sites", slug, "data", "brief.json");
  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as { phone?: string };
  if (formatPhoneForWhatsApp(brief.phone ?? "") !== formatPhoneForWhatsApp(expected)) {
    throw new Error(
      `Phone mismatch for ${slug}: brief=${brief.phone ?? "(none)"} expected=${expected}`
    );
  }
}

function printApprovalPreview(
  target: PitchTarget,
  videoAbs: string,
  messages: string[]
): void {
  const stat = fs.statSync(videoAbs);
  const probe = probeVideo(videoAbs);
  console.log("\n--- Approval preview ---");
  console.log(`Business: ${target.slug}`);
  console.log(`Recipient (E.164): ${toE164(target.phone)}`);
  messages.forEach((body, index) => {
    console.log(`Message ${index + 1}:\n${body}\n`);
  });
  console.log(
    `Attachment: ${path.relative(ROOT, videoAbs)} (${(stat.size / 1024 / 1024).toFixed(2)} MB, ${probe.duration.toFixed(1)}s, ${probe.width}x${probe.height})`
  );
  console.log(`Poster: ${target.posterPath}`);
  console.log(`Pitch gate: waived_by_user`);
  console.log(`Waived blockers: ${target.waivedBlockers.join("; ")}`);
}

async function sendOne(target: PitchTarget): Promise<{
  delivered: boolean;
  messageId: string | null;
  deliveryStatus: string;
  videoPathUsed: string;
  videoBytes: number;
  mode: string;
  logged: boolean;
  sentAtUk: string;
}> {
  verifyBriefPhone(target.slug, target.phone);

  const lead = getLeadBySlug(target.slug);
  if (!lead) throw new Error(`Lead not found: ${target.slug}`);
  assertPitchTargetSendAllowed(lead);

  const videoAbs = pickVideo(target);
  const messages = pitchMessagesForTarget(target, lead.business_name);
  printApprovalPreview(target, videoAbs, messages);

  const availability = await checkWhatsAppAvailable(target.phone);
  if (availability.status === "unavailable") {
    throw new Error(`Recipient not WhatsApp available: ${target.phone}`);
  }

  resetWhatsAppVideoSendGuards();
  const leadStateBefore = lead.state;
  const sentAt = new Date();
  const sentAtUk = sentAt.toLocaleString("en-GB", { timeZone: "Europe/London" });

  const sendOutcome = await sendPitchVideo(
    target.phone,
    videoAbs,
    messages,
    target.siteUrl,
    fs.existsSync(path.join(ROOT, target.mobileVideoPath))
      ? path.join(ROOT, target.mobileVideoPath)
      : null
  );

  await waitForSendAck(4000);

  const delivered = sendOutcome.videoSentCount === 1 && sendOutcome.textSentCount >= 1;
  const messageId: string | null = null;
  const deliveryStatus = delivered ? "accepted_by_openwa" : "failed";

  let logged = false;
  if (delivered) {
    logWhatsAppSend(lead.id, TOUCH);
    updateLead(lead.id, {
      state: "PITCHED",
      pitched_at: sentAt.toISOString(),
      last_touch: TOUCH,
      primary_outreach_channel: "whatsapp",
      site_url: target.siteUrl,
      quoted_price: RECOMMENDED_PRICE,
      whatsapp_status: availability.status,
      whatsapp_available: 1,
      reply_status: "waiting",
      notes: [
        lead.notes,
        `whatsapp_pitch_sent=${sentAt.toISOString()}`,
        `pitch_gate_status=waived_by_user`,
        `waived_blockers=${target.waivedBlockers.join("|")}`,
        `openwa_message_id=${messageId}`,
        `whatsapp_mode=${sendOutcome.mode}`,
      ]
        .filter(Boolean)
        .join("; "),
    });

    const attachmentHash = sha256File(sendOutcome.videoPathUsed);
    const logResult = logSuccessfulOutreachSend({
      timestamp: sentAt.toISOString(),
      slug: target.slug,
      business_name: lead.business_name,
      contact_name: null,
      intended_whatsapp_contact_name: null,
      phone: target.phone,
      channel: "whatsapp",
      touch: TOUCH,
      site_url: target.siteUrl,
      video_path: path.relative(ROOT, sendOutcome.videoPathUsed),
      message_body: messages.join("\n\n---\n\n"),
      price_note: `£${RECOMMENDED_PRICE}, not mentioned in first message`,
      lead_state_before: leadStateBefore,
      lead_state_after: "PITCHED",
      send_result: "success",
      text_sent_count: sendOutcome.textSentCount,
      video_sent_count: sendOutcome.videoSentCount,
      video_attempts: sendOutcome.videoAttempts,
      test_prefix_used: false,
      duplicate_prevented: true,
      vcard_path: null,
      openwa_contact_save_supported: false,
      notes: [
        `pitch_gate_status=waived_by_user`,
        `waived_blockers=${JSON.stringify(target.waivedBlockers)}`,
        `openwa_message_id=${messageId}`,
        `delivery_status=${deliveryStatus}`,
        `attachment_hash=${attachmentHash}`,
        `send_mode=${sendOutcome.mode}`,
      ].join("; "),
      sending_enabled_final: false,
      test_recipient_only_final: true,
      sequence_path: "whatsapp_only",
    });
    logged = logResult.logged;
  }

  return {
    delivered,
    messageId,
    deliveryStatus,
    videoPathUsed: sendOutcome.videoPathUsed,
    videoBytes: fs.statSync(sendOutcome.videoPathUsed).size,
    mode: sendOutcome.mode,
    logged,
    sentAtUk,
  };
}

async function main(): Promise<void> {
  if (!process.argv.includes("--live") || !process.argv.includes("--confirm")) {
    console.error("Refusing to send without --live --confirm.");
    process.exit(1);
  }

  const manifestPath = parseManifestArg();
  if (!manifestPath) {
    console.error(
      "Hardcoded targets removed. Provide --manifest <path> with a JSON array of pitch targets."
    );
    process.exit(1);
  }
  const targets = loadTargetsFromManifest(manifestPath);

  const ukHour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  );
  if (ukHour < 9 || ukHour >= 18) {
    console.error(`Outside UK send window (09:00-18:00). Current UK hour: ${ukHour}`);
    process.exit(1);
  }

  const health = await getOpenWAStatus();
  const session = await getSessionStatus();
  if (!health.reachable || !session.connected || session.status !== "ready") {
    console.error("OpenWA not ready. Start session before sending.");
    process.exit(1);
  }

  console.log("--- Preflight ---");
  console.log(`OpenWA: reachable=${health.reachable} session=${session.status}`);
  console.log(`UK time OK (hour ${ukHour})`);

  const results: Record<string, Awaited<ReturnType<typeof sendOne>>> = {};

  try {
    enableLiveOutreach();
    const cfg = loadConfig();
    if (!cfg.outreach.sending_enabled || cfg.outreach.test_recipient_only !== false) {
      throw new Error("Could not enable live outreach flags.");
    }

    for (const target of targets) {
      console.log(`\n========== ${target.slug} ==========`);
      results[target.slug] = await sendOne(target);
      console.log(
        `Send ${results[target.slug].delivered ? "OK" : "FAILED"} messageId=${results[target.slug].messageId ?? "(none)"}`
      );
    }
  } finally {
    const safety = resetOutreachSafety();
    console.log(
      `\nSafety reset: sending_enabled=${!safety.sendingReset ? "false" : "restored false"}, test_recipient_only=${safety.testOnlyReset ? "restored true" : "already true"}`
    );
  }

  console.log("\n--- Final config ---");
  const finalCfg = loadConfig();
  console.log(`sending_enabled: ${finalCfg.outreach.sending_enabled}`);
  console.log(`test_recipient_only: ${finalCfg.outreach.test_recipient_only}`);

  for (const target of targets) {
    const r = results[target.slug];
    if (!r?.delivered) process.exit(1);
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((err) => {
    console.error(err);
    resetOutreachSafety();
    process.exit(1);
  });
}
