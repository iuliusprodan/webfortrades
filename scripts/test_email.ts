import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";
import { loadEnv } from "./send_email.js";
import {
  imapClientOptions,
  imapEnvStatus,
  requireImapSettings,
  requireSmtpSettings,
  smtpEnvStatus,
  smtpTransportOptions,
} from "./mail_config.js";

const TEST_TO = "contact@webfortradesuk.co.uk";
const TEST_SUBJECT = "WebForTrades email test";
const TEST_BODY = "This is a test from the WebForTrades pipeline.";

async function main(): Promise<void> {
  const env = { ...process.env, ...loadEnv() };
  const debug = env.DEBUG_EMAIL === "true";

  const smtpStatus = smtpEnvStatus(env);
  const imapStatus = imapEnvStatus(env);

  if (!smtpStatus.present) {
    console.error(`Missing SMTP configuration: ${smtpStatus.missing.join(", ")}`);
    process.exit(1);
  }
  if (!imapStatus.present) {
    console.error(`Missing IMAP configuration: ${imapStatus.missing.join(", ")}`);
    process.exit(1);
  }

  console.log("SMTP env vars present");
  console.log("IMAP env vars present");

  const smtp = requireSmtpSettings(env);
  const imap = requireImapSettings(env);

  const transporter = nodemailer.createTransport(smtpTransportOptions(smtp));

  await transporter.verify();
  console.log("SMTP verify OK");

  await transporter.sendMail({
    from: smtp.user,
    to: TEST_TO,
    subject: TEST_SUBJECT,
    text: TEST_BODY,
  });
  console.log("SMTP send OK");

  const client = new ImapFlow(imapClientOptions(imap, debug));
  await client.connect();
  const lock = await client.getMailboxLock("INBOX");
  try {
    await client.status("INBOX", { messages: true, unseen: true });
  } finally {
    lock.release();
    await client.logout();
  }
  console.log("IMAP inbox OK");
  console.log("Email test passed");
}

main().catch((err) => {
  console.error((err as Error).message);
  process.exit(1);
});
