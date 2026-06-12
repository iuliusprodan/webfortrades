import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ImapFlow } from "imapflow";
import {
  countEmailSendsToday,
  getPitchedLeads,
  leadChannelSentToday,
  updateLead,
  type Lead,
  type WhatsAppStatus,
} from "./db.js";
import { requireImapSettings } from "./mail_config.js";
import {
  buildOutreachPlan,
  draftForTouch,
  isDoNotContactReply,
  isNegativeReply,
  nextTouch,
  resolveTouchChannel,
  touchForStep,
  type BriefLike,
} from "./outreach_sequence.js";
import { loadConfig, loadEnv, sendLeadEmail } from "./send_email.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

type ReplyClass =
  | "INTERESTED"
  | "QUESTION"
  | "NOT_NOW"
  | "NO"
  | "OUT_OF_OFFICE";

interface Brief {
  business_name: string;
  owner_name: string | null;
  services: string[];
  service_area: string[];
  reviews: { text: string; reviewer: string; rating: number }[];
}

interface InboxMessage {
  from: string;
  subject: string;
  text: string;
  date: Date;
}

function loadBrief(slug: string): Brief | null {
  const p = path.join(ROOT, "briefs", slug, "brief.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8")) as Brief;
}

function ownerFirstName(lead: Lead, brief: Brief | null): string {
  if (brief?.owner_name) return brief.owner_name.split(" ")[0];
  if (lead.owner_name) return lead.owner_name.split(" ")[0];
  return lead.business_name.split(" ")[0];
}

function normalizeEmail(addr: string): string {
  const m = addr.match(/<([^>]+)>/) ?? addr.match(/([\w.+-]+@[\w.-]+)/);
  return (m ? m[1] : addr).trim().toLowerCase();
}

function extractTextFromRaw(raw: Buffer): string {
  const s = raw.toString("utf8");
  const plain = s.match(
    /Content-Type: text\/plain[^\n]*\n(?:[^\n]*\n)*?\n([\s\S]*?)(?=\n--[^\n]|\nContent-Type:|\n\r\n--|$)/i
  );
  if (plain?.[1]) {
    return plain[1]
      .replace(/=\r?\n/g, "")
      .replace(/=([0-9A-F]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .trim();
  }
  const stripped = s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return stripped.slice(-1500);
}

export function classifyReply(text: string, subject: string): ReplyClass {
  const blob = `${subject}\n${text}`.toLowerCase();

  if (
    /out of office|automatic reply|auto.?reply|away from (the )?office|on annual leave|ooo/i.test(
      blob
    )
  ) {
    return "OUT_OF_OFFICE";
  }

  if (
    /no thanks|not interested|unsubscribe|remove me|stop (emailing|messaging|contacting)|take it (straight )?down|wrong number|not this business|don't contact|do not contact|opt out|leave me alone/i.test(
      blob
    )
  ) {
    return "NO";
  }

  if (
    /not (right )?now|maybe later|next (month|year)|too busy|call back|get in touch later/i.test(
      blob
    )
  ) {
    return "NOT_NOW";
  }

  if (
    /\?|how much|what.*price|cost|charge|who are you|how does|what happens|can you explain/i.test(
      blob
    )
  ) {
    return "QUESTION";
  }

  if (
    /yes|interested|looks good|like it|love it|happy to|let's talk|give me a call|sounds good|keen/i.test(
      blob
    )
  ) {
    return "INTERESTED";
  }

  return "QUESTION";
}

function suggestedReply(
  lead: Lead,
  brief: Brief | null,
  classification: ReplyClass,
  snippet: string
): string {
  const owner = ownerFirstName(lead, brief);
  const config = loadConfig();

  if (classification === "INTERESTED") {
    return `Hi ${owner},\n\nGood to hear. Glad the site landed okay. Easiest is a quick call: what day suits you for ten minutes? I'll walk you through what's there and what (if anything) you'd want changed.\n\nJulius\n${config.outreach.from_email}`;
  }

  return `Hi ${owner},\n\nThanks for getting back. You asked: "${snippet.slice(0, 120)}${snippet.length > 120 ? "…" : ""}"\n\nShort answer: it's a one-off site build. Starter £300, Standard £500, Premium £800 depending on scope. You own it outright, no monthly fee unless you want hosting support. Happy to explain on a quick call if easier.\n\nJulius\n${config.outreach.from_email}`;
}

async function fetchInboxReplies(
  leadEmails: Set<string>,
  since: Date
): Promise<Map<string, InboxMessage>> {
  const env = { ...loadEnv(), ...process.env };
  const imap = requireImapSettings(env);

  const client = new ImapFlow({
    host: imap.host,
    port: imap.port,
    secure: imap.secure,
    auth: { user: imap.user, pass: imap.pass },
  });

  const bySender = new Map<string, InboxMessage>();

  await client.connect();
  const lock = await client.getMailboxLock("INBOX");
  try {
    const uids = await client.search({ since }, { uid: true });
    if (!uids || uids.length === 0) return bySender;

    for await (const msg of client.fetch(uids, {
      envelope: true,
      source: true,
      internalDate: true,
    })) {
      const from = msg.envelope?.from?.[0];
      if (!from?.address) continue;
      const addr = normalizeEmail(from.address);
      if (!leadEmails.has(addr)) continue;

      const text = msg.source ? extractTextFromRaw(msg.source) : "";
      const existing = bySender.get(addr);
      const date =
        msg.internalDate instanceof Date
          ? msg.internalDate
          : new Date(msg.internalDate ?? Date.now());
      if (!existing || date > existing.date) {
        bySender.set(addr, {
          from: addr,
          subject: msg.envelope?.subject ?? "",
          text,
          date,
        });
      }
    }
  } finally {
    lock.release();
    await client.logout();
  }

  return bySender;
}

function whatsappStatusForLead(lead: Lead): WhatsAppStatus {
  const s = lead.whatsapp_status;
  if (s === "available" || s === "unavailable" || s === "unknown") return s;
  return "unknown";
}

async function main(): Promise<void> {
  const env = { ...loadEnv(), ...process.env };
  try {
    requireImapSettings(env);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }

  const pitched = getPitchedLeads();
  if (pitched.length === 0) {
    console.log("No leads in state PITCHED. Nothing to check.");
    return;
  }

  const emailSet = new Set(
    pitched.map((l) => l.email?.toLowerCase()).filter(Boolean) as string[]
  );

  const earliestPitch = pitched.reduce((min, l) => {
    const t = l.pitched_at ? new Date(l.pitched_at).getTime() : Date.now();
    return Math.min(min, t);
  }, Date.now());

  console.log(`Checking inbox for ${pitched.length} pitched lead(s)...`);
  const replies = await fetchInboxReplies(emailSet, new Date(earliestPitch));

  const handoff: { lead: Lead; class: ReplyClass; summary: string; suggest: string }[] =
    [];

  for (const lead of pitched) {
    const addr = lead.email?.toLowerCase();
    if (!addr) continue;

    const msg = replies.get(addr);
    if (!msg) continue;

    const classification = classifyReply(msg.text, msg.subject);
    const brief = lead.slug ? loadBrief(lead.slug) : null;
    const snippet = msg.text.trim().split("\n")[0] ?? msg.subject;

    const negative = isNegativeReply(`${msg.subject}\n${msg.text}`);
    if (negative && classification !== "OUT_OF_OFFICE") {
      const doNotContact = isDoNotContactReply(`${msg.subject}\n${msg.text}`);
      const endState = doNotContact ? "DO_NOT_CONTACT" : "LOST";
      updateLead(lead.id, {
        state: endState,
        reply_status: doNotContact ? "DO_NOT_CONTACT" : "NO",
        notes: [lead.notes, `Negative reply (${endState}): ${snippet.slice(0, 100)}`]
          .filter(Boolean)
          .join("; "),
      });
      console.log(`\nStopped outreach: ${lead.business_name} -> ${endState}`);
      console.log(
        `  Offer to take site down: ${lead.site_url ?? "(no url)"}. Remove from Vercel when ready.`
      );
      continue;
    }

    if (classification === "OUT_OF_OFFICE") {
      console.log(`  ${lead.business_name}: OUT_OF_OFFICE, skipping`);
      continue;
    }

    if (classification === "NOT_NOW") {
      updateLead(lead.id, {
        reply_status: "NOT_NOW",
        notes: [lead.notes, `NOT_NOW reply: ${snippet.slice(0, 100)}`]
          .filter(Boolean)
          .join("; "),
      });
      console.log(`  ${lead.business_name}: NOT_NOW, noted, no more sends for now`);
      continue;
    }

    if (classification === "NO") {
      updateLead(lead.id, {
        state: "LOST",
        reply_status: "NO",
        notes: [lead.notes, `NO reply: ${snippet.slice(0, 100)}`]
          .filter(Boolean)
          .join("; "),
      });
      console.log(`\nStopped outreach: ${lead.business_name} -> LOST`);
      console.log(
        `  Offer to take site down: ${lead.site_url ?? "(no url)"}. Remove from Vercel when ready.`
      );
      continue;
    }

    if (classification === "INTERESTED" || classification === "QUESTION") {
      updateLead(lead.id, {
        state: "IN_CONVO",
        reply_status: classification,
        notes: [lead.notes, `Reply (${classification}): ${snippet.slice(0, 150)}`]
          .filter(Boolean)
          .join("; "),
      });

      handoff.push({
        lead,
        class: classification,
        summary: [
          `${lead.business_name} replied (${classification}).`,
          `They said: "${snippet.slice(0, 100)}${snippet.length > 100 ? "…" : ""}"`,
          `Site: ${lead.site_url ?? "-"} | Automation stopped.`,
        ].join("\n"),
        suggest: suggestedReply(lead, brief, classification, snippet),
      });
    }
  }

  if (handoff.length) {
    console.log("\n=== HANDOFF: you take it from here ===\n");
    for (const h of handoff) {
      console.log(h.summary);
      console.log("\nSuggested reply:\n");
      console.log(h.suggest);
      console.log("\n---\n");
    }
  }

  const config = loadConfig();
  let sent = 0;
  const stillPitched = getPitchedLeads();

  if (!config.outreach.sending_enabled) {
    console.log(
      "\nFollow-up sending blocked (outreach.sending_enabled=false). Reply check completed."
    );
    console.log("\nDone. Follow-ups sent this run: 0");
    return;
  }

  for (const lead of stillPitched) {
    if (lead.state === "LOST" || lead.state === "DO_NOT_CONTACT") continue;

    const brief = lead.slug ? loadBrief(lead.slug) : null;
    const briefLike = brief as BriefLike | null;
    const plan = buildOutreachPlan(lead, briefLike, whatsappStatusForLead(lead));

    if (plan.sequencePath === "blocked") continue;

    const maxTouch = plan.touches.length;
    if (lead.last_touch >= maxTouch) {
      updateLead(lead.id, { state: "LAPSED" });
      console.log(
        `  ${lead.business_name} → LAPSED (${maxTouch} touches sent, no reply)`
      );
      continue;
    }

    const touch = nextTouch(lead, plan);
    if (!touch || touch <= 1) continue;

    const step = touchForStep(plan, touch);
    if (!step) continue;

    const channel = resolveTouchChannel(step, plan);
    const otherChannel = channel === "email" ? "whatsapp" : "email";
    if (leadChannelSentToday(lead.id, otherChannel)) {
      console.log(
        `  skip ${lead.business_name} touch ${touch}: ${otherChannel} already sent today`
      );
      continue;
    }

    if (channel === "whatsapp") {
      console.log(
        `  planned WhatsApp touch ${touch} for ${lead.business_name} (live send not implemented)`
      );
      continue;
    }

    if (!lead.email) continue;

    if (countEmailSendsToday() >= config.outreach.daily_send_cap) {
      console.log(
        `daily_send_cap (${config.outreach.daily_send_cap}) reached. Remaining touches deferred.`
      );
      break;
    }

    const draft = draftForTouch(
      step,
      plan,
      lead,
      briefLike,
      config.outreach.from_email
    );
    if (draft.channel !== "email") continue;

    try {
      await sendLeadEmail(lead, draft, touch);
      sent++;
      console.log(`  ✓ Touch ${touch} email sent to ${lead.business_name}`);
    } catch (err) {
      console.error(
        `  ✗ Touch ${touch} failed for ${lead.business_name}:`,
        (err as Error).message
      );
      break;
    }
  }

  console.log(`\nDone. Follow-ups sent this run: ${sent}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
