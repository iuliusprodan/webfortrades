import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildTouchSchedule, type SequencePath } from "./outreach_sequence.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

export const OUTREACH_LOG_JSONL = path.join(ROOT, "data", "outreach-log.jsonl");
export const OUTREACH_FAILURES_JSONL = path.join(ROOT, "data", "outreach-failures.jsonl");
export const CONTACTED_LEADS_MD = path.join(ROOT, "outreach", "contacted-leads.md");

export type OutreachSendResult =
  | "success"
  | "partial_text_only"
  | "partial_video_only"
  | "failed";

export interface OutreachLogEntry {
  send_id: string;
  timestamp: string;
  slug: string;
  business_name: string;
  contact_name: string | null;
  intended_whatsapp_contact_name: string | null;
  phone: string;
  channel: "whatsapp" | "email";
  touch: number;
  site_url: string | null;
  video_path: string | null;
  message_body: string;
  price_note: string | null;
  lead_state_before: string;
  lead_state_after: string;
  send_result: OutreachSendResult;
  text_sent_count: number;
  video_sent_count: number;
  video_attempts: number;
  test_prefix_used: boolean;
  duplicate_prevented: boolean;
  follow_up_due: string | null;
  reply_status: string;
  vcard_path: string | null;
  openwa_contact_save_supported: boolean;
  notes: string | null;
  sending_enabled_final: boolean;
  test_recipient_only_final: boolean;
}

export interface LogOutreachSendInput {
  timestamp: string;
  slug: string;
  business_name: string;
  contact_name: string | null;
  intended_whatsapp_contact_name: string | null;
  phone: string;
  channel: "whatsapp" | "email";
  touch: number;
  site_url: string | null;
  video_path: string | null;
  message_body: string;
  price_note: string | null;
  lead_state_before: string;
  lead_state_after: string;
  send_result: OutreachSendResult;
  text_sent_count: number;
  video_sent_count: number;
  video_attempts: number;
  test_prefix_used?: boolean;
  duplicate_prevented?: boolean;
  follow_up_due?: string | null;
  reply_status?: string;
  vcard_path?: string | null;
  openwa_contact_save_supported?: boolean;
  notes?: string | null;
  sending_enabled_final: boolean;
  test_recipient_only_final: boolean;
  sequence_path?: SequencePath;
}

export interface OutreachFailureEntry {
  failure_id: string;
  timestamp: string;
  slug: string;
  business_name: string;
  phone: string;
  channel: "whatsapp" | "email";
  touch: number;
  send_result: OutreachSendResult;
  error: string | null;
  text_sent_count: number;
  video_sent_count: number;
  video_attempts: number;
  lead_state_before: string;
  lead_state_after: string;
}

function ensureDirFor(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJsonl<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

function appendJsonl(filePath: string, entry: unknown): void {
  ensureDirFor(filePath);
  fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`, "utf8");
}

export function buildSendId(
  slug: string,
  channel: string,
  touch: number,
  timestamp: string
): string {
  return `${slug}:${channel}:touch${touch}:${timestamp}`;
}

export function computeFollowUpDue(
  pitchedAtIso: string,
  touch: number,
  sequencePath: SequencePath = "whatsapp_only"
): string | null {
  const schedule = buildTouchSchedule(sequencePath);
  const next = schedule.find((step) => step.touch === touch + 1);
  if (!next) return null;
  const base = new Date(pitchedAtIso);
  if (Number.isNaN(base.getTime())) return null;
  base.setUTCDate(base.getUTCDate() + next.daysAfterStart);
  return base.toISOString().slice(0, 10);
}

export function hasOutreachLogEntry(sendId: string): boolean {
  const rows = readJsonl<{ send_id: string }>(OUTREACH_LOG_JSONL);
  return rows.some((row) => row.send_id === sendId);
}

export function hasSuccessfulContactLog(
  slug: string,
  channel: string,
  touch: number
): boolean {
  const rows = readJsonl<OutreachLogEntry>(OUTREACH_LOG_JSONL);
  return rows.some(
    (row) =>
      row.slug === slug &&
      row.channel === channel &&
      row.touch === touch &&
      row.send_result === "success"
  );
}

function contactedLeadsHeader(): string {
  return `# Contacted leads

Human-readable log of real WebForTrades outreach sends.

- Machine-readable log: \`data/outreach-log.jsonl\`
- Failed or partial sends: \`data/outreach-failures.jsonl\`
- Test sends to \`MY_OWN_TEST_NUMBER\` are never listed here.
- Lead state becomes \`PITCHED\` only after a real successful send.

OpenWA cannot add WhatsApp contacts directly. The pipeline records the intended contact name (\`First_Name - Business_Name\` when known) and creates a vCard under \`briefs/<slug>/outreach/\` for manual import.

`;
}

function formatContactedLeadSection(entry: OutreachLogEntry): string {
  const lines = [
    "---",
    "",
    `## ${entry.business_name} (${entry.timestamp.slice(0, 10)})`,
    "",
    `- **Business name:** ${entry.business_name}`,
    `- **Slug:** ${entry.slug}`,
    `- **Contact name:** ${entry.contact_name ?? "(unknown)"}`,
    `- **Intended WhatsApp contact name:** ${entry.intended_whatsapp_contact_name ?? entry.contact_name ?? "(unknown)"}`,
    `- **Phone:** ${entry.phone}`,
    `- **Channel:** ${entry.channel}`,
    `- **Touch:** ${entry.touch}`,
    `- **Sent timestamp:** ${entry.timestamp}`,
    `- **Site URL:** ${entry.site_url ?? "(none)"}`,
    `- **Video path:** ${entry.video_path ?? "(none)"}`,
    `- **Price note:** ${entry.price_note ?? "(none)"}`,
    `- **Lead state:** ${entry.lead_state_after}`,
    `- **Send result:** ${entry.send_result}`,
    `- **Text sent count:** ${entry.text_sent_count}`,
    `- **Video sent count:** ${entry.video_sent_count}`,
    `- **Video attempts:** ${entry.video_attempts}`,
    `- **TEST prefix used:** ${entry.test_prefix_used ? "yes" : "no"}`,
    `- **Duplicate prevented:** ${entry.duplicate_prevented ? "yes" : "no"}`,
    `- **Follow-up due:** ${entry.follow_up_due ?? "(none)"}`,
    `- **Reply status:** ${entry.reply_status}`,
    `- **VCard:** ${entry.vcard_path ?? "(none)"}`,
    `- **OpenWA contact save:** ${entry.openwa_contact_save_supported ? "supported" : "not supported (use vCard)"}`,
  ];

  if (entry.notes?.trim()) {
    lines.push(`- **Notes:** ${entry.notes.trim()}`);
  }

  lines.push(
    "",
    "**Message sent:**",
    "",
    "```",
    entry.message_body,
    "```",
    ""
  );

  return lines.join("\n");
}

function appendContactedLeadMarkdown(entry: OutreachLogEntry): void {
  ensureDirFor(CONTACTED_LEADS_MD);
  if (!fs.existsSync(CONTACTED_LEADS_MD)) {
    fs.writeFileSync(CONTACTED_LEADS_MD, contactedLeadsHeader(), "utf8");
  }
  fs.appendFileSync(CONTACTED_LEADS_MD, formatContactedLeadSection(entry), "utf8");
}

export function logSuccessfulOutreachSend(
  input: LogOutreachSendInput
): { logged: boolean; send_id: string; reason?: string } {
  const sendId = buildSendId(input.slug, input.channel, input.touch, input.timestamp);

  if (hasOutreachLogEntry(sendId)) {
    return { logged: false, send_id: sendId, reason: "send_id already logged" };
  }

  if (hasSuccessfulContactLog(input.slug, input.channel, input.touch)) {
    return {
      logged: false,
      send_id: sendId,
      reason: "successful send already logged for slug/channel/touch",
    };
  }

  const followUpDue =
    input.follow_up_due ??
    computeFollowUpDue(
      input.timestamp,
      input.touch,
      input.sequence_path ?? "whatsapp_only"
    );

  const entry: OutreachLogEntry = {
    send_id: sendId,
    timestamp: input.timestamp,
    slug: input.slug,
    business_name: input.business_name,
    contact_name: input.contact_name,
    intended_whatsapp_contact_name: input.intended_whatsapp_contact_name,
    phone: input.phone,
    channel: input.channel,
    touch: input.touch,
    site_url: input.site_url,
    video_path: input.video_path,
    message_body: input.message_body,
    price_note: input.price_note,
    lead_state_before: input.lead_state_before,
    lead_state_after: input.lead_state_after,
    send_result: input.send_result,
    text_sent_count: input.text_sent_count,
    video_sent_count: input.video_sent_count,
    video_attempts: input.video_attempts,
    test_prefix_used: input.test_prefix_used ?? false,
    duplicate_prevented: input.duplicate_prevented ?? false,
    follow_up_due: followUpDue,
    reply_status: input.reply_status ?? "waiting",
    vcard_path: input.vcard_path ?? null,
    openwa_contact_save_supported: input.openwa_contact_save_supported ?? false,
    notes: input.notes ?? null,
    sending_enabled_final: input.sending_enabled_final,
    test_recipient_only_final: input.test_recipient_only_final,
  };

  appendJsonl(OUTREACH_LOG_JSONL, entry);
  appendContactedLeadMarkdown(entry);

  return { logged: true, send_id: sendId };
}

export function logFailedOutreachSend(
  input: LogOutreachSendInput & { error: string | null }
): { logged: boolean; failure_id: string } {
  const failureId = buildSendId(input.slug, input.channel, input.touch, input.timestamp);

  if (readJsonl<{ failure_id: string }>(OUTREACH_FAILURES_JSONL).some((r) => r.failure_id === failureId)) {
    return { logged: false, failure_id: failureId };
  }

  const failure: OutreachFailureEntry = {
    failure_id: failureId,
    timestamp: input.timestamp,
    slug: input.slug,
    business_name: input.business_name,
    phone: input.phone,
    channel: input.channel,
    touch: input.touch,
    send_result: input.send_result,
    error: input.error,
    text_sent_count: input.text_sent_count,
    video_sent_count: input.video_sent_count,
    video_attempts: input.video_attempts,
    lead_state_before: input.lead_state_before,
    lead_state_after: input.lead_state_after,
  };

  appendJsonl(OUTREACH_FAILURES_JSONL, failure);
  return { logged: true, failure_id: failureId };
}

/** Backfill Bristol Plumbing Co. first real WhatsApp pitch. */
export function backfillBristolPlumbingCoSend(): { logged: boolean; send_id: string; reason?: string } {
  const timestamp = "2026-06-09T15:36:31.127Z";
  const message = `Hi Jack, it's Julius from WebForTrades. I put together a quick website for Bristol Plumbing Co. and thought I'd send it over in case it's useful.

https://bristol-plumbing-co.vercel.app/

Happy to change anything on it. If you'd like to keep it, just let me know.`;

  return logSuccessfulOutreachSend({
    timestamp,
    slug: "bristol-plumbing-co",
    business_name: "Bristol Plumbing Co.",
    contact_name: "Jack",
    intended_whatsapp_contact_name: "Jack - Bristol Plumbing Co.",
    phone: "07972 176630",
    channel: "whatsapp",
    touch: 1,
    site_url: "https://bristol-plumbing-co.vercel.app/",
    video_path: "briefs/bristol-plumbing-co/outreach/site-scroll.mp4",
    message_body: message,
    price_note: "£250, not mentioned in first message",
    lead_state_before: "DEPLOYED",
    lead_state_after: "PITCHED",
    send_result: "success",
    text_sent_count: 1,
    video_sent_count: 1,
    video_attempts: 1,
    test_prefix_used: false,
    duplicate_prevented: false,
    follow_up_due: "2026-06-16",
    reply_status: "waiting",
    vcard_path: "briefs/bristol-plumbing-co/outreach/jack-bristol-plumbing-co.vcf",
    openwa_contact_save_supported: false,
    notes:
      "First real WhatsApp pitch. Text sent once, video sent once. No TEST prefix, no duplicate video.",
    sending_enabled_final: false,
    test_recipient_only_final: true,
    sequence_path: "whatsapp_only",
  });
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  if (!process.argv.includes("--backfill")) {
    console.error(
      "Refusing to run outreach_log without --backfill. Use: npm run outreach:backfill -- --backfill"
    );
    process.exit(1);
  }
  const result = backfillBristolPlumbingCoSend();
  console.log(JSON.stringify(result, null, 2));
}
