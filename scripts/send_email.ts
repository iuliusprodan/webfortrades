import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import {
  countEmailSendsToday,
  logEmailSend,
  updateLead,
  type Lead,
} from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

interface OutreachConfig {
  from_name: string;
  agency_name: string;
  from_email: string;
  daily_send_cap: number;
}

interface Config {
  approval_mode: string;
  outreach: OutreachConfig;
}

export interface PitchEmail {
  to: string;
  subject: string;
  text: string;
}

export function loadEnv(): Record<string, string> {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return {};
  const vars: Record<string, string> = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

export function loadConfig(): Config {
  return parseYaml(fs.readFileSync(path.join(ROOT, "config.yaml"), "utf8")) as Config;
}

async function appendToSent(
  raw: string,
  env: Record<string, string>
): Promise<void> {
  const user = env.IMAP_USER;
  const pass = env.IMAP_PASS;
  if (!user || !pass) return;

  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user, pass },
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock("[Gmail]/Sent Mail");
    try {
      await client.append("[Gmail]/Sent Mail", raw, ["\\Seen"]);
    } finally {
      lock.release();
    }
  } catch {
    try {
      const lock = await client.getMailboxLock("Sent");
      try {
        await client.append("Sent", raw, ["\\Seen"]);
      } finally {
        lock.release();
      }
    } catch {
      /* provider may already mirror SMTP sends to Sent */
    }
  } finally {
    await client.logout().catch(() => undefined);
  }
}

export async function sendLeadEmail(
  lead: Lead,
  email: PitchEmail,
  touch: number,
  options?: { setPitched?: boolean }
): Promise<void> {
  const env = { ...loadEnv(), ...process.env };
  const config = loadConfig();

  if (!env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error("Missing SMTP_USER or SMTP_PASS in .env");
  }

  const sentToday = countEmailSendsToday();
  if (sentToday >= config.outreach.daily_send_cap) {
    throw new Error(
      `daily_send_cap reached (${config.outreach.daily_send_cap}). Try again tomorrow.`
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  const from = `"${config.outreach.from_name} — ${config.outreach.agency_name}" <${config.outreach.from_email}>`;

  await transporter.sendMail({
    from,
    to: email.to,
    replyTo: config.outreach.from_email,
    subject: email.subject,
    text: email.text,
  });

  const raw = [
    `From: ${from}`,
    `To: ${email.to}`,
    `Subject: ${email.subject}`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "",
    email.text,
  ].join("\r\n");
  await appendToSent(raw, env as Record<string, string>);

  logEmailSend(lead.id, touch);

  const updates: Parameters<typeof updateLead>[1] = {
    last_touch: touch,
  };

  if (options?.setPitched) {
    updates.state = "PITCHED";
    updates.pitched_at = new Date().toISOString();
  }

  updateLead(lead.id, updates);
}

export async function sendPitchEmail(
  lead: Lead,
  email: PitchEmail
): Promise<void> {
  await sendLeadEmail(lead, email, 1, { setPitched: true });
}
