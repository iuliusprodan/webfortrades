import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getLeadBySlug, logWhatsAppSend, updateLead } from "../db.js";
import { evaluatePitchReadiness } from "../pitch_gate.js";
import {
  assertOutreachPayloadValid,
  randomBatchInterMessageDelayMs,
  randomBatchLeadCooldownMs,
  sleepMs,
  validateOutreachPayload,
} from "../outreach_message_format.js";
import {
  logFailedOutreachSend,
  logSuccessfulOutreachSend,
  type OutreachSendResult,
} from "../outreach_log.js";
import { loadDeployManifest } from "../vercel_alias.js";
import {
  checkWhatsAppAvailable,
  getOpenWAStatus,
  getSessionStatus,
  resetWhatsAppVideoSendGuards,
} from "../whatsapp_gateway.js";
import { PitchSendGuard } from "../whatsapp_send_guard.js";
import { isScrollVideoEnabled } from "../site_config.js";
import { classifySendError } from "./hard_stops.js";
import { WEBSITE_ROOT } from "./config.js";
import type { BatchLeadSpec, LeadSendResult } from "./types.js";

const TOUCH = 1;
const RECOMMENDED_PRICE = 250;

export interface SendOneOptions {
  root?: string;
  /** Use random 3-6s between WA messages (batch mode). Default: fixed pipeline delay. */
  batchTiming?: boolean;
  /** Do not write outreach logs (dry-run / preflight-only). */
  dryRun?: boolean;
}

function readDraft(root: string, slug: string, n: 1 | 2): string {
  const p = path.join(root, "outreach/drafts", `${slug}-message-${n}.txt`);
  if (!fs.existsSync(p)) throw new Error(`Draft missing: ${p}`);
  return fs.readFileSync(p, "utf8").trimEnd();
}

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function resolveSiteUrl(
  root: string,
  slug: string,
  leadUrl: string | null,
  override?: string
): string {
  if (override) return override.replace(/\/$/, "");
  const deploy = loadDeployManifest(root, slug);
  const verified =
    (deploy?.verified_url as string | undefined) ?? leadUrl ?? "";
  if (!verified) throw new Error(`No site URL for ${slug}`);
  return verified.replace(/\/$/, "");
}

export async function sendDraftWhatsAppLead(
  spec: BatchLeadSpec,
  options: SendOneOptions = {}
): Promise<LeadSendResult> {
  const root = options.root ?? WEBSITE_ROOT;
  const slug = spec.slug;

  if (spec.skip) {
    return {
      index: spec.index,
      slug,
      channel: "whatsapp",
      outcome: "skipped",
      detail: spec.skipReason ?? "skipped",
    };
  }

  const lead = getLeadBySlug(slug);
  if (!lead?.phone?.trim()) {
    return {
      index: spec.index,
      slug,
      channel: "whatsapp",
      outcome: "failed",
      detail: "Lead or phone missing",
    };
  }
  if (lead.state === "PITCHED") {
    return {
      index: spec.index,
      slug,
      channel: "whatsapp",
      outcome: "skipped",
      detail: "already PITCHED",
    };
  }

  try {
    const siteUrl = resolveSiteUrl(root, slug, lead.site_url, spec.siteUrl);
    const scrollEnabled = isScrollVideoEnabled();
    const m1 = readDraft(root, slug, 1);
    const m2 = scrollEnabled ? readDraft(root, slug, 2) : null;
    const messages = m2 ? [m1, m2] : [m1];
    const videoPath = path.join(root, "previews", slug, "scroll.mp4");

    if (scrollEnabled && !fs.existsSync(videoPath)) {
      throw new Error(`Video missing: ${videoPath}`);
    }

    const fmtIssues = validateOutreachPayload({
      messages,
      siteUrl,
      videoAttachment: scrollEnabled && fs.existsSync(videoPath),
    });
    if (fmtIssues.length > 0) {
      throw new Error(
        `Format validation failed: ${fmtIssues.map((i) => i.message).join("; ")}`
      );
    }
    assertOutreachPayloadValid({
      messages,
      siteUrl,
      videoAttachment: scrollEnabled && fs.existsSync(videoPath),
    });

    const waive = spec.waiveContactability ?? false;
    const pitch = evaluatePitchReadiness(root, lead, {
      allowManualReview: waive,
    });
    if (!pitch.ready && !waive) {
      throw new Error(`Pitch gate blocked: ${pitch.blockers.join("; ")}`);
    }

    const health = await getOpenWAStatus();
    const session = await getSessionStatus();
    if (!health.reachable || !session.connected || session.status !== "ready") {
      const err = new Error("OpenWA session not ready.");
      const classified = classifySendError(err);
      return {
        index: spec.index,
        slug,
        channel: "whatsapp",
        outcome: "failed",
        detail: classified.message,
        hardStop: classified.reason ?? undefined,
      };
    }

    const availability = await checkWhatsAppAvailable(lead.phone.trim());
    if (availability.status === "unavailable") {
      const err = new Error("Recipient not WhatsApp available.");
      const classified = classifySendError(err);
      return {
        index: spec.index,
        slug,
        channel: "whatsapp",
        outcome: "failed",
        detail: classified.message,
        hardStop: classified.reason ?? undefined,
      };
    }

    if (options.dryRun) {
      return {
        index: spec.index,
        slug,
        channel: "whatsapp",
        outcome: "skipped",
        detail: "dry-run",
      };
    }

    const guard = new PitchSendGuard();
    resetWhatsAppVideoSendGuards();
    const leadStateBefore = lead.state;
    const recipient = lead.phone.trim();

    const interDelay = options.batchTiming
      ? () => randomBatchInterMessageDelayMs()
      : undefined;

    await guard.sendPitchSequence(recipient, messages, {
      touch: TOUCH,
      videoPath: scrollEnabled && fs.existsSync(videoPath) ? videoPath : undefined,
      siteUrl,
      interMessageDelayMs: interDelay,
    });

    const { textSentCount, videoSentCount, videoSendAttempts } = guard.counts;
    const pitchSucceeded = scrollEnabled
      ? textSentCount >= 2 && videoSentCount === 1
      : textSentCount >= 1;
    const pitchedAt = new Date().toISOString();
    const sendResult: OutreachSendResult = pitchSucceeded
      ? "success"
      : textSentCount > 0 || videoSentCount > 0
        ? "partial_text_only"
        : "failed";

    const logNotes = [
      waive ? "contactability_waived=true" : null,
      `m1_hash=${sha256(m1)}`,
      m2 ? `m2_hash=${sha256(m2)}` : null,
      scrollEnabled && fs.existsSync(videoPath)
        ? `attachment_hash=${sha256(fs.readFileSync(videoPath))}`
        : "scroll_video=disabled",
      options.batchTiming ? "batch_timing=true" : null,
    ]
      .filter(Boolean)
      .join("; ");

    const logBase = {
      timestamp: pitchedAt,
      slug,
      business_name: lead.business_name,
      contact_name: lead.owner_first_name,
      intended_whatsapp_contact_name: lead.contact_name,
      phone: recipient,
      channel: "whatsapp" as const,
      touch: TOUCH,
      site_url: siteUrl,
      video_path:
        scrollEnabled && fs.existsSync(videoPath)
          ? path.relative(root, videoPath)
          : null,
      message_body: messages.join("\n\n---\n\n"),
      price_note: `£${RECOMMENDED_PRICE}, not mentioned in first message`,
      lead_state_before: leadStateBefore,
      lead_state_after: pitchSucceeded ? "PITCHED" : leadStateBefore,
      send_result: sendResult,
      text_sent_count: textSentCount,
      video_sent_count: videoSentCount,
      video_attempts: videoSendAttempts,
      test_prefix_used: false,
      duplicate_prevented: videoSentCount <= 1,
      vcard_path: null,
      openwa_contact_save_supported: false,
      notes: logNotes,
      sending_enabled_final: false,
      test_recipient_only_final: true,
      sequence_path: "whatsapp_only" as const,
    };

    if (pitchSucceeded) {
      if (waive && lead.contactability_status !== "CONTACTABLE") {
        updateLead(lead.id, {
          contactability_status: "CONTACTABLE",
          whatsapp_status: availability.status,
          whatsapp_available: 1,
        });
      }
      logWhatsAppSend(lead.id, TOUCH);
      updateLead(lead.id, {
        state: "PITCHED",
        pitched_at: pitchedAt,
        last_touch: TOUCH,
        primary_outreach_channel: "whatsapp",
        site_url: siteUrl,
        quoted_price: RECOMMENDED_PRICE,
        whatsapp_status: availability.status,
        whatsapp_available: 1,
        reply_status: "waiting",
        notes: [
          lead.notes,
          `whatsapp_pitch_sent=${pitchedAt}`,
          `whatsapp_draft_pitch=true`,
        ]
          .filter(Boolean)
          .join("; "),
      });
      logSuccessfulOutreachSend(logBase);
      return {
        index: spec.index,
        slug,
        channel: "whatsapp",
        outcome: "sent",
      };
    }

    logFailedOutreachSend({ ...logBase, error: "pitch incomplete" });
    return {
      index: spec.index,
      slug,
      channel: "whatsapp",
      outcome: "failed",
      detail: `text=${textSentCount} video=${videoSentCount}`,
    };
  } catch (err) {
    const classified = classifySendError(err);
    return {
      index: spec.index,
      slug,
      channel: "whatsapp",
      outcome: "failed",
      detail: classified.message,
      hardStop: classified.hardStop ? classified.reason ?? undefined : undefined,
    };
  }
}

export async function sendDraftEmailLead(
  spec: BatchLeadSpec,
  options: SendOneOptions = {}
): Promise<LeadSendResult> {
  if (spec.skip) {
    return {
      index: spec.index,
      slug: spec.slug,
      channel: "email",
      outcome: "skipped",
      detail: spec.skipReason ?? "skipped",
    };
  }

  const root = options.root ?? WEBSITE_ROOT;
  const to = spec.emailTo ?? getLeadBySlug(spec.slug)?.email;
  if (!to) {
    return {
      index: spec.index,
      slug: spec.slug,
      channel: "email",
      outcome: "skipped",
      detail: "no recipient email",
    };
  }

  if (options.dryRun) {
    return {
      index: spec.index,
      slug: spec.slug,
      channel: "email",
      outcome: "skipped",
      detail: "dry-run (email send via send:outreach-batch not yet wired)",
    };
  }

  return {
    index: spec.index,
    slug: spec.slug,
    channel: "email",
    outcome: "failed",
    detail: "email batch send not implemented; use outreach email path",
  };
}

export async function batchCooldownMs(): Promise<void> {
  const ms = randomBatchLeadCooldownMs();
  console.log(`Cooldown ${Math.round(ms / 1000)}s...`);
  await sleepMs(ms);
}
