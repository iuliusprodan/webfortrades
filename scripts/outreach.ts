import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { getLeadBySlug, getNextDeployedLead, logWhatsAppSend, updateLead, type Lead } from "./db.js";
import {
  buildOutreachPlan,
  draftForTouch,
  nextTouch,
  printSequenceSummary,
  resolveTouchChannel,
  shouldDraftChannel,
  touchForStep,
  type BriefLike,
} from "./outreach_sequence.js";
import { assertOutreachPayloadValid } from "./outreach_message_format.js";
import { isScrollVideoEnabled } from "./site_config.js";
import { isWhatsAppCandidate } from "./phone_utils.js";
import {
  disableSendingEnabled,
  formatTestWhatsAppMessage,
  requireTestRecipientNumber,
} from "./test_recipient.js";
import {
  checkWhatsAppAvailable,
  loadEnv,
  sendWhatsAppMessage,
  type WhatsAppCheckResult,
} from "./whatsapp_gateway.js";
import {
  contactabilityBlocksPipeline,
  printContactabilitySummary,
  qualifyContactability,
} from "./contactability.js";
import { evaluatePitchReadiness } from "./pitch_gate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

interface Config {
  approval_mode: string;
  outreach: {
    from_name: string;
    from_email: string;
    agency_name: string;
    primary_channel: string;
    whatsapp_mode: string;
    whatsapp_check_enabled: boolean;
    sending_enabled: boolean;
    test_recipient_only?: boolean;
    sequence_touches: number;
  };
}

function loadConfig(): Config {
  return parseYaml(fs.readFileSync(path.join(ROOT, "config.yaml"), "utf8")) as Config;
}

function parseArgs(): {
  slug?: string;
  send?: boolean;
  allowManualReview?: boolean;
} {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  let send = false;
  let allowManualReview = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    else if (args[i] === "--send") send = true;
    else if (args[i] === "--allow-manual-review") allowManualReview = true;
  }
  return { slug, send, allowManualReview };
}

function approvalRequiresSend(mode: string): boolean {
  return mode.includes("ask_before_send") || mode === "ask_both";
}

async function resolveWhatsAppCheck(lead: Lead): Promise<WhatsAppCheckResult> {
  if (!isWhatsAppCandidate(lead.phone)) {
    return { status: "unavailable", checked: true, detail: "not_a_mobile" };
  }

  if (lead.whatsapp_status === "available" || lead.whatsapp_status === "unavailable") {
    return {
      status: lead.whatsapp_status,
      checked: true,
      detail: null,
    };
  }

  return checkWhatsAppAvailable(lead.phone!);
}

function whatsappAvailableInt(status: string): number | null {
  if (status === "available") return 1;
  if (status === "unavailable") return 0;
  return null;
}

function resolvePitchScrollVideo(slug: string): string | null {
  if (!isScrollVideoEnabled()) return null;
  const candidates = [
    path.join(ROOT, "previews", slug, "scroll.mp4"),
    path.join(ROOT, "briefs", slug, "outreach", "site-scroll.mp4"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function printDraft(draft: ReturnType<typeof draftForTouch>): void {
  if (draft.channel === "whatsapp") {
    console.log(`Channel: WhatsApp`);
    console.log(`To: ${draft.to}`);
    console.log(`Touch: ${draft.touch}\n`);
    const messages = draft.messages ?? [draft.text];
    messages.forEach((body, index) => {
      console.log(`--- Message ${index + 1} ---\n`);
      console.log(body);
      console.log("");
    });
    if (draft.videoAttachment) {
      console.log("(Message 2 is followed by scroll video attachment when sending.)");
    }
    return;
  }

  console.log(`Channel: Email`);
  console.log(`To: ${draft.to}`);
  console.log(`Subject: ${draft.subject}`);
  console.log(`Touch: ${draft.touch}\n`);
  console.log(draft.text);
}

async function main(): Promise<void> {
  const { slug, send, allowManualReview } = parseArgs();
  const config = loadConfig();
  const lead = slug ? getLeadBySlug(slug) : getNextDeployedLead();

  if (!lead?.slug) {
    console.error("No DEPLOYED lead found. Deploy a site first.");
    process.exit(1);
  }

  const blockReason = contactabilityBlocksPipeline(lead, { allowManualReview });
  if (blockReason) {
    console.error(`Outreach blocked for ${lead.business_name}: ${blockReason}`);
    if (lead.contactability_status) {
      console.error(`Contactability: ${lead.contactability_status}`);
    }
    process.exit(1);
  }

  if (lead.state !== "DEPLOYED" && lead.state !== "PITCHED") {
    console.error(
      `Lead "${lead.business_name}" is state=${lead.state}. Expected DEPLOYED or PITCHED.`
    );
    process.exit(1);
  }

  if (!lead.site_url) {
    console.error("Lead has no site_url. Deploy first.");
    process.exit(1);
  }

  const pitchGate = evaluatePitchReadiness(ROOT, lead, { allowManualReview });
  if (!pitchGate.ready) {
    console.error("Outreach refused: site is not READY_TO_PITCH.");
    for (const b of pitchGate.blockers) console.error(`  - ${b}`);
    process.exit(1);
  }
  if (pitchGate.warnings.length) {
    console.warn("Pitch readiness warnings:");
    for (const w of pitchGate.warnings) console.warn(`  - ${w}`);
  }

  const verifiedUrl = lead.verified_site_url ?? lead.site_url;
  if (lead.verified_site_url && lead.site_url !== lead.verified_site_url) {
    console.error(
      `Outreach refused: site_url (${lead.site_url}) differs from verified_site_url (${lead.verified_site_url})`
    );
    process.exit(1);
  }
  void verifiedUrl;

  const briefPath = path.join(ROOT, "briefs", lead.slug, "brief.json");
  if (!fs.existsSync(briefPath)) {
    console.error(`Missing brief: ${briefPath}`);
    process.exit(1);
  }

  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as BriefLike;
  const waCheck = await resolveWhatsAppCheck(lead);
  const contactability = qualifyContactability({
    email: lead.email ?? brief.email ?? null,
    phone: lead.phone,
    whatsappCheck: waCheck,
  });

  console.log("");
  printContactabilitySummary(lead.business_name, lead.phone, contactability);
  console.log("");

  if (contactability.contactability_status !== "CONTACTABLE") {
    console.error(
      `Outreach refused: ${contactability.contactability_reason}`
    );
    process.exit(1);
  }

  const plan = buildOutreachPlan(lead, brief, waCheck.status);

  console.log(`\nOutreach plan: ${lead.business_name} (${lead.slug})`);
  console.log(`sending_enabled: ${config.outreach.sending_enabled} (outbound only)`);
  console.log(`test_recipient_only: ${config.outreach.test_recipient_only === true}`);
  console.log(`whatsapp_check_enabled: ${config.outreach.whatsapp_check_enabled}`);
  console.log(`Primary channel setting: ${config.outreach.primary_channel}`);
  console.log(`WhatsApp mode: ${config.outreach.whatsapp_mode}`);
  if (waCheck.detail) console.log(`WhatsApp check detail: ${waCheck.detail}`);
  console.log("");

  for (const line of printSequenceSummary(plan)) {
    console.log(line);
  }

  if (plan.sequencePath === "blocked") {
    updateLead(lead.id, {
      state: plan.suggestedState,
      phone_type: plan.phoneType,
      whatsapp_status: waCheck.status,
      whatsapp_available: whatsappAvailableInt(waCheck.status),
      whatsapp_checked_at: new Date().toISOString(),
      primary_outreach_channel: null,
      notes: [lead.notes, plan.blockedReason, waCheck.detail ? `wa_check=${waCheck.detail}` : null]
        .filter(Boolean)
        .join("; "),
    });
    console.log(`\nLead marked ${plan.suggestedState}. No drafts created.`);
    return;
  }

  const touch = nextTouch(lead, plan) ?? 1;
  const step = touchForStep(plan, touch);
  if (!step) {
    console.error(`No touch ${touch} in sequence.`);
    process.exit(1);
  }

  const channel = resolveTouchChannel(step, plan);
  if (!shouldDraftChannel(channel, plan)) {
    console.error(`Touch ${touch} channel ${channel} is not usable for this lead.`);
    process.exit(1);
  }

  const scrollVideo = resolvePitchScrollVideo(lead.slug);
  const draft = draftForTouch(step, plan, lead, brief, config.outreach.from_email, {
    videoAttachment: step.kind === "intro" && Boolean(scrollVideo),
  });

  const draftMessages =
    draft.channel === "whatsapp"
      ? draft.messages ?? [draft.text]
      : [draft.text];

  try {
    assertOutreachPayloadValid({
      messages: draftMessages,
      siteUrl: lead.site_url ?? undefined,
      videoAttachment:
        draft.channel === "whatsapp" ? draft.videoAttachment : undefined,
    });
  } catch (err) {
    console.error("\nOutreach format check failed (dry-run blocked):");
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  const words = draftMessages.join(" ").split(/\s+/).length;
  console.log(`\n--- DRAFT touch ${touch} (${words} words, ${draftMessages.length} message(s)) ---\n`);
  printDraft(draft);
  console.log(`\nSite URL: ${lead.site_url}`);

  if (plan.needsManualReview) {
    console.log(
      "\nManual review: whatsapp_status=unknown. Email draft shown. Verify WhatsApp manually before switching channels."
    );
  }

  console.log("\n--- CONTACT SAVE (before first WhatsApp send) ---");
  console.log(`contact_name: ${plan.contactName}`);
  console.log(`owner_first_name: ${plan.ownerFirstName ?? "(unknown)"}`);
  console.log(`phone_type: ${plan.phoneType}`);
  console.log(`whatsapp_status: ${plan.whatsappStatus}`);
  console.log(`contact_saved: false (planned, not executed yet)`);

  updateLead(lead.id, {
    phone_type: plan.phoneType,
    owner_first_name: plan.ownerFirstName,
    contact_name: plan.contactName,
    whatsapp_status: waCheck.status,
    whatsapp_available: whatsappAvailableInt(waCheck.status),
    whatsapp_checked_at: new Date().toISOString(),
    primary_outreach_channel: plan.primaryChannel,
    notes: [
      lead.notes,
      plan.blockedReason,
      waCheck.detail ? `wa_check=${waCheck.detail}` : null,
    ]
      .filter(Boolean)
      .join("; "),
  });

  if (approvalRequiresSend(config.approval_mode) && !send) {
    console.log(
      `\nPaused: approval_mode="${config.approval_mode}". Review the draft above.`
    );
    console.log(
      "Live sending is disabled. Re-run with --send only after sending_enabled is true."
    );
    return;
  }

  if (send) {
    if (!config.outreach.sending_enabled) {
      console.error(
        "\nOutbound sending is blocked. Set outreach.sending_enabled: true in config.yaml."
      );
      process.exit(1);
    }

    if (draft.channel === "email") {
      if (config.outreach.test_recipient_only) {
        console.log(`Would contact (email): ${draft.to || lead.email || "(none)"}`);
        console.log("Email not sent (test_recipient_only=true).");
        return;
      }
      console.error("\nEmail sending is not implemented yet.");
      process.exit(1);
    }

    const testMode = config.outreach.test_recipient_only === true;
    const env = { ...process.env, ...loadEnv() };

    if (testMode) {
      const testNumber = requireTestRecipientNumber(env);
      console.log(`Would contact (WhatsApp): ${draft.to || lead.phone || "(none)"}`);
      console.log(`Test send target: MY_OWN_TEST_NUMBER only`);

      const message = formatTestWhatsAppMessage(lead.business_name, draft.text);
      await sendWhatsAppMessage(testNumber, message, touch);
      logWhatsAppSend(lead.id, touch);

      updateLead(lead.id, {
        state: "PITCHED",
        last_touch: touch,
        notes: [
          lead.notes,
          `test_whatsapp_sent_to=MY_OWN_TEST_NUMBER`,
          `would_contact_whatsapp=${lead.phone ?? ""}`,
        ]
          .filter(Boolean)
          .join("; "),
      });

      console.log("\nTest WhatsApp message sent to MY_OWN_TEST_NUMBER only.");
      console.log("Actual business was not contacted.");

      if (disableSendingEnabled()) {
        console.log(
          "sending_enabled reset to false in config.yaml after test send."
        );
      } else {
        console.warn(
          "WARNING: Set outreach.sending_enabled back to false in config.yaml now."
        );
      }
      return;
    }

    console.error("\nLive WhatsApp sending to business numbers is not enabled.");
    console.error("Set outreach.test_recipient_only: true for safe test sends.");
    process.exit(1);
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
