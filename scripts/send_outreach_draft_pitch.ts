/**
 * Send approved WhatsApp pitch using outreach/drafts message files.
 * Usage: tsx scripts/send_outreach_draft_pitch.ts --live --slug <slug> [--site-url <url>]
 *
 * For multi-lead batches with approval modes, use: npm run send:outreach-batch
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { enableLiveOutreach, resetOutreachSafety } from "./test_recipient.js";
import { loadWebsiteConfig, WEBSITE_ROOT } from "./outreach/config.js";
import { sendDraftWhatsAppLead } from "./outreach/send_one.js";
import { getOpenWAStatus, getSessionStatus } from "./whatsapp_gateway.js";
import { checkWhatsAppAvailable } from "./whatsapp_gateway.js";
import { getLeadBySlug } from "./db.js";
import crypto from "node:crypto";
import fs from "node:fs";
import { loadDeployManifest } from "./vercel_alias.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function parseArgs(): { slug: string; siteUrl: string | null; waiveContactability: boolean } {
  const argv = process.argv.slice(2);
  const slugIdx = argv.indexOf("--slug");
  const urlIdx = argv.indexOf("--site-url");
  if (slugIdx === -1 || !argv[slugIdx + 1]) {
    throw new Error("Missing --slug <slug>");
  }
  return {
    slug: argv[slugIdx + 1]!,
    siteUrl: urlIdx !== -1 ? (argv[urlIdx + 1] ?? null) : null,
    waiveContactability: argv.includes("--waive-contactability"),
  };
}

function readDraft(slug: string, n: 1 | 2): string {
  const p = path.join(ROOT, "outreach/drafts", `${slug}-message-${n}.txt`);
  if (!fs.existsSync(p)) throw new Error(`Draft missing: ${p}`);
  return fs.readFileSync(p, "utf8").trimEnd();
}

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 4 ? `***${digits.slice(-4)}` : "***";
}

async function main(): Promise<void> {
  if (!process.argv.includes("--live")) {
    console.error("Refusing to send without --live.");
    process.exit(1);
  }

  const { slug, siteUrl: siteUrlOverride, waiveContactability } = parseArgs();
  const lead = getLeadBySlug(slug);
  if (!lead?.phone?.trim()) throw new Error(`Lead or phone missing: ${slug}`);

  const m1 = readDraft(slug, 1);
  const m2 = readDraft(slug, 2);
  const deploy = loadDeployManifest(ROOT, slug);
  const siteUrl = (siteUrlOverride ?? deploy?.verified_url ?? lead.site_url ?? "").replace(/\/$/, "");

  const health = await getOpenWAStatus();
  const session = await getSessionStatus();
  const availability = await checkWhatsAppAvailable(lead.phone.trim());

  console.log("--- Preflight ---");
  console.log(`OpenWA: reachable=${health.reachable} session=${session.status}`);
  console.log(`Recipient: ${maskPhone(lead.phone)} WA=${availability.status}`);
  console.log(`Site: ${siteUrl}`);
  console.log(`m1_hash=${sha256(m1).slice(0, 12)} m2_hash=${sha256(m2).slice(0, 12)}`);

  const ukHour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  );
  if (ukHour < 9 || ukHour >= 18) {
    throw new Error(`Outside UK send window (hour=${ukHour}).`);
  }

  console.log("OUTREACH IS NOW LIVE");
  enableLiveOutreach();
  const cfg = loadWebsiteConfig();
  if (!cfg.outreach.sending_enabled || cfg.outreach.test_recipient_only !== false) {
    throw new Error("Could not enable live outreach flags.");
  }

  const result = await sendDraftWhatsAppLead(
    { index: 1, slug, channel: "whatsapp", siteUrl: siteUrlOverride ?? undefined, waiveContactability },
    { root: WEBSITE_ROOT, batchTiming: cfg.outreach.approval_mode === "batch" }
  );

  resetOutreachSafety();
  console.log(`\n--- Result ---\n${result.slug}: ${result.outcome}${result.detail ? ` (${result.detail})` : ""}`);
  if (result.outcome !== "sent") process.exit(1);
}

main().catch((err) => {
  console.error(err);
  resetOutreachSafety();
  process.exit(1);
});
