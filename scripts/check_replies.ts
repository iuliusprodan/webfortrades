import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ImapFlow } from "imapflow";
import {
  countEmailSendsToday,
  getPitchedLeads,
  updateLead,
  type Lead,
} from "./db.js";
import { loadConfig, loadEnv, sendLeadEmail, type PitchEmail } from "./send_email.js";

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

const TOUCH_DAYS: Record<number, number> = {
  2: 3,
  3: 7,
  4: 12,
  5: 18,
};

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

function daysSince(iso: string | null): number {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
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
    /no thanks|not interested|unsubscribe|remove me|stop emailing|take it (straight )?down|don't contact|do not contact/i.test(
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
    return `Hi ${owner},\n\nGood to hear — glad the site landed okay. Easiest is a quick call: what day suits you for ten minutes? I'll walk you through what's there and what (if anything) you'd want changed.\n\nJulius\n${config.outreach.from_email}`;
  }

  return `Hi ${owner},\n\nThanks for getting back. You asked: "${snippet.slice(0, 120)}${snippet.length > 120 ? "…" : ""}"\n\nShort answer: it's a one-off site build. Starter £300, Standard £500, Premium £800 depending on scope. You own it outright, no monthly fee unless you want hosting support. Happy to explain on a quick call if easier.\n\nJulius\n${config.outreach.from_email}`;
}

async function fetchInboxReplies(
  leadEmails: Set<string>,
  since: Date
): Promise<Map<string, InboxMessage>> {
  const env = { ...loadEnv(), ...process.env };
  if (!env.IMAP_USER || !env.IMAP_PASS) {
    throw new Error("Missing IMAP_USER or IMAP_PASS in .env");
  }

  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user: env.IMAP_USER, pass: env.IMAP_PASS },
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

function draftFollowUp(
  lead: Lead,
  brief: Brief | null,
  touch: number
): PitchEmail {
  const config = loadConfig();
  const owner = ownerFirstName(lead, brief);
  const town = brief?.service_area[0] ?? lead.region ?? "your area";
  const service = brief?.services[0] ?? lead.niche ?? "your trade";
  const url = lead.site_url ?? "";
  const name = brief?.business_name ?? lead.business_name;

  const subjects: Record<number, string> = {
    2: `Re: ${name} site`,
    3: `One tweak I'd make for ${name}`,
    4: `Price for ${name} (if you want to keep it)`,
    5: `Closing the loop — ${name}`,
  };

  let body = "";

  switch (touch) {
    case 2:
      body = `Hi ${owner},

Just bumping this in case it got buried — the site for ${name} is still here if you want a look:
${url}

No rush. Reply "no thanks" any time and I'll pull it down.

Julius`;
      break;
    case 3: {
      const tweak = brief?.services[1] ?? service;
      const reviewHint = brief?.reviews[0]?.text.split(/[.!?]/)[0]?.trim();
      body = `Hi ${owner},

If I were polishing the ${name} page one more notch, I'd lead with ${tweak.toLowerCase()} — it's what people around ${town} seem to ask for most${
        reviewHint ? ` (your reviews mention "${reviewHint.slice(0, 60)}…" too)` : ""
      }.

Worth a glance if you missed it: ${url}

Julius`;
      break;
    }
    case 4:
      body = `Hi ${owner},

Quick clarity in case helpful: if you want to keep the site, it's a simple one-off. Starter £300, Standard £500, Premium £800 depending on tweaks. You own it outright. No monthly tie-in.

Preview: ${url}

Happy to answer questions, or reply "no thanks" and I'll take it down.

Julius`;
      break;
    case 5:
      body = `Hi ${owner},

I'll leave this with you — last note from me. The preview stays at ${url} for now. If it's not for you, just reply "no thanks" and I'll remove it today.

Cheers,
Julius
${config.outreach.from_email}`;
      break;
    default:
      throw new Error(`Unknown touch ${touch}`);
  }

  return {
    to: lead.email!,
    subject: subjects[touch],
    text: body,
  };
}

function nextDueTouch(lead: Lead): number | null {
  if (!lead.pitched_at || lead.state !== "PITCHED") return null;

  const days = daysSince(lead.pitched_at);
  if (lead.last_touch >= 5) return null;

  for (let touch = 5; touch >= 2; touch--) {
    if (lead.last_touch < touch && days >= TOUCH_DAYS[touch]) {
      return touch;
    }
  }
  return null;
}

async function main(): Promise<void> {
  const env = { ...loadEnv(), ...process.env };
  if (!env.IMAP_USER || !env.IMAP_PASS) {
    console.error("Missing IMAP_USER or IMAP_PASS in .env");
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

    if (classification === "OUT_OF_OFFICE") {
      console.log(`  ${lead.business_name}: OUT_OF_OFFICE — skipping`);
      continue;
    }

    if (classification === "NOT_NOW") {
      updateLead(lead.id, {
        reply_status: "NOT_NOW",
        notes: [lead.notes, `NOT_NOW reply: ${snippet.slice(0, 100)}`]
          .filter(Boolean)
          .join("; "),
      });
      console.log(`  ${lead.business_name}: NOT_NOW — noted, no more sends for now`);
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
      console.log(`\n✗ ${lead.business_name} → LOST`);
      console.log(
        `  Offer to take site down: ${lead.site_url ?? "(no url)"} — remove from Vercel when ready.`
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
          `Site: ${lead.site_url ?? "—"} | Automation stopped.`,
        ].join("\n"),
        suggest: suggestedReply(lead, brief, classification, snippet),
      });
    }
  }

  if (handoff.length) {
    console.log("\n=== HANDOFF — you take it from here ===\n");
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

  for (const lead of stillPitched) {
    if (lead.last_touch >= 5) {
      updateLead(lead.id, { state: "LAPSED" });
      console.log(`  ${lead.business_name} → LAPSED (touch 5 sent, no reply)`);
      continue;
    }

    if (countEmailSendsToday() >= config.outreach.daily_send_cap) {
      console.log(
        `daily_send_cap (${config.outreach.daily_send_cap}) reached — remaining touches deferred.`
      );
      break;
    }

    const touch = nextDueTouch(lead);
    if (!touch) continue;
    if (!lead.email) continue;

    const brief = lead.slug ? loadBrief(lead.slug) : null;
    const email = draftFollowUp(lead, brief, touch);

    try {
      await sendLeadEmail(lead, email, touch);
      sent++;
      console.log(`  ✓ Touch ${touch} sent to ${lead.business_name}`);
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
