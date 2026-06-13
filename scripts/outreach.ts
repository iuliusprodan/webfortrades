import "./config_guard.js"; // ARCH-7: config.yaml read-only at runtime
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { assertConfigUnchanged } from "./config_guard.js";
import {
  getLeadBySlug,
  getNextDeployedLead,
  updateLead,
  type Lead,
  type WhatsAppStatus,
} from "./db.js";
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
import { isUkMobileCandidate } from "./lib/uk_mobile.js";
import {
  contactabilityBlocksPipeline,
  printContactabilitySummary,
  qualifyContactability,
} from "./contactability.js";
import { evaluatePitchReadiness } from "./pitch_gate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

interface Config {
  outreach: {
    from_name: string;
    from_email: string;
    agency_name: string;
    primary_channel: string;
    sending_enabled: boolean;
    sequence_touches: number;
  };
}

function loadConfig(): Config {
  return parseYaml(fs.readFileSync(path.join(ROOT, "config.yaml"), "utf8")) as Config;
}

function parseArgs(): {
  slug?: string;
  allowManualReview?: boolean;
  help?: boolean;
} {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  let allowManualReview = false;
  let help = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    else if (args[i] === "--allow-manual-review") allowManualReview = true;
    else if (args[i] === "--help" || args[i] === "-h") help = true;
  }
  return { slug, allowManualReview, help };
}

function printUsage(): void {
  console.log(`outreach.ts — print the next-touch outreach draft for a deployed lead.

ARCH-5: WhatsApp is permanently manual. This tool NEVER sends anything. It prints the
next-touch draft (WhatsApp or email) to stdout so you can review and copy/paste it by hand.

Usage:
  tsx scripts/outreach.ts [--slug <slug>] [--allow-manual-review]
  tsx scripts/outreach.ts --help

Options:
  --slug <slug>           Target a specific lead by slug (default: next DEPLOYED lead).
  --allow-manual-review   Permit a lead in NEEDS_MANUAL_CONTACT to produce a draft.
  --help, -h              Show this help and exit.`);
}

/**
 * ARCH-5: there is no network availability check any more. A UK-mobile-shaped number is a
 * manual-WhatsApp candidate ("available" for sequencing); anything else is "unavailable".
 */
function resolveWhatsAppStatus(lead: Lead): WhatsAppStatus {
  return isUkMobileCandidate(lead.phone) ? "available" : "unavailable";
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
  const { slug, allowManualReview, help } = parseArgs();
  if (help) {
    printUsage();
    return;
  }

  const config = loadConfig();
  assertConfigUnchanged("outreach");
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
  const waStatus = resolveWhatsAppStatus(lead);
  const contactability = qualifyContactability({
    email: lead.email ?? brief.email ?? null,
    phone: lead.phone,
  });

  console.log("");
  printContactabilitySummary(lead.business_name, lead.phone, contactability);
  console.log("");

  const plan = buildOutreachPlan(lead, brief, waStatus);

  console.log(`\nOutreach plan: ${lead.business_name} (${lead.slug})`);
  console.log(`Primary channel setting: ${config.outreach.primary_channel}`);
  console.log("(draft-only: this tool prints drafts for manual send; it never sends)");
  console.log("");

  for (const line of printSequenceSummary(plan)) {
    console.log(line);
  }

  if (plan.sequencePath === "blocked") {
    updateLead(lead.id, {
      state: plan.suggestedState,
      phone_type: plan.phoneType,
      whatsapp_status: waStatus,
      whatsapp_available: whatsappAvailableInt(waStatus),
      whatsapp_checked_at: null,
      primary_outreach_channel: null,
      notes: [lead.notes, plan.blockedReason].filter(Boolean).join("; "),
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
      "\nManual review: verify WhatsApp manually before switching channels."
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
    whatsapp_status: waStatus,
    whatsapp_available: whatsappAvailableInt(waStatus),
    whatsapp_checked_at: null,
    primary_outreach_channel: plan.primaryChannel,
    notes: [lead.notes, plan.blockedReason].filter(Boolean).join("; "),
  });

  console.log(
    "\nDraft printed above. Copy/paste to send manually (ARCH-5: no automated sending)."
  );
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
