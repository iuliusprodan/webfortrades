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
import { requireImapSettings, requireSmtpSettings, smtpTransportOptions } from "./mail_config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

interface OutreachConfig {
  from_name: string;
  agency_name: string;
  from_email: string;
  daily_send_cap: number;
  sending_enabled: boolean;
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
  env: Record<string, string | undefined>
): Promise<void> {
  let imap;
  try {
    imap = requireImapSettings(env);
  } catch {
    return;
  }

  const client = new ImapFlow({
    host: imap.host,
    port: imap.port,
    secure: imap.secure,
    auth: { user: imap.user, pass: imap.pass },
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock("Sent");
    try {
      await client.append("Sent", raw, ["\\Seen"]);
    } finally {
      lock.release();
    }
  } catch {
    /* Namecheap may already mirror SMTP sends to Sent */
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
  const env = { ...process.env, ...loadEnv() };
  const config = loadConfig();

  if (!config.outreach.sending_enabled) {
    throw new Error(
      "Email sending is disabled. Set outreach.sending_enabled: true in config.yaml when Julius enables live sends."
    );
  }

  const smtp = requireSmtpSettings(env);

  const sentToday = countEmailSendsToday();
  if (sentToday >= config.outreach.daily_send_cap) {
    throw new Error(
      `daily_send_cap reached (${config.outreach.daily_send_cap}). Try again tomorrow.`
    );
  }

  const transporter = nodemailer.createTransport(smtpTransportOptions(smtp));

  const from = `"${config.outreach.from_name} | ${config.outreach.agency_name}" <${config.outreach.from_email}>`;

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
  await appendToSent(raw, env);

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
