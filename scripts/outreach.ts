import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { getLeadBySlug, getNextDeployedLead, type Lead } from "./db.js";
import { sendPitchEmail, type PitchEmail } from "./send_email.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

interface Brief {
  business_name: string;
  owner_name: string | null;
  services: string[];
  service_area: string[];
  reviews: { text: string; reviewer: string; rating: number }[];
}

interface Config {
  approval_mode: string;
  outreach: { from_name: string; from_email: string; agency_name: string };
}

function loadConfig(): Config {
  return parseYaml(fs.readFileSync(path.join(ROOT, "config.yaml"), "utf8")) as Config;
}

function parseArgs(): { slug?: string; send?: boolean } {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  let send = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    else if (args[i] === "--send") send = true;
  }
  return { slug, send };
}

function approvalRequiresSend(mode: string): boolean {
  return mode.includes("ask_before_send") || mode === "ask_both";
}

function ownerFirstName(lead: Lead, brief: Brief): string {
  if (brief.owner_name) return brief.owner_name.split(" ")[0];
  if (lead.owner_name) return lead.owner_name.split(" ")[0];
  return lead.business_name.split(" ")[0];
}

export function draftPitch(lead: Lead, brief: Brief, config: Config): PitchEmail {
  if (!lead.site_url) throw new Error("Lead has no site_url");
  if (!lead.email) throw new Error("Lead has no email — cannot pitch");

  const owner = ownerFirstName(lead, brief);
  const town = brief.service_area[0] ?? lead.region ?? "your area";
  const service = brief.services[0] ?? lead.niche ?? "your trade";
  const reviewLine =
    brief.reviews[0]?.text.split(/[.!?]/)[0]?.trim() ??
    null;

  const reviewBit = reviewLine
    ? ` I noticed your Google reviews mention things like "${reviewLine.slice(0, 80)}${reviewLine.length > 80 ? "…" : ""}" — so I kept the tone plain and local.`
    : "";

  const text = `Hi ${owner},

I'm Julius — I run WebForTrades. I put together a one-page site for ${brief.business_name} while looking at ${service.toLowerCase()} businesses around ${town}.${reviewBit}

No invoice, no obligation — it's yours to look at first:
${lead.site_url}

If it's useful, we can talk. If not, reply "no thanks" and I'll take it straight down.

Julius
WebForTrades
${config.outreach.from_email}`;

  const subject = `I built ${brief.business_name} a website — have a look`;

  return { to: lead.email, subject, text };
}

async function main(): Promise<void> {
  const { slug, send } = parseArgs();
  const config = loadConfig();
  const lead = slug ? getLeadBySlug(slug) : getNextDeployedLead();

  if (!lead?.slug) {
    console.error("No DEPLOYED lead found. Deploy a site first.");
    process.exit(1);
  }

  if (lead.state !== "DEPLOYED") {
    console.error(`Lead "${lead.business_name}" is state=${lead.state}, not DEPLOYED.`);
    process.exit(1);
  }

  const briefPath = path.join(ROOT, "briefs", lead.slug, "brief.json");
  if (!fs.existsSync(briefPath)) {
    console.error(`Missing brief: ${briefPath}`);
    process.exit(1);
  }

  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as Brief;
  const email = draftPitch(lead, brief, config);
  const words = email.text.split(/\s+/).length;

  console.log(`\n--- DRAFT (${words} words) ---\n`);
  console.log(`To: ${email.to}`);
  console.log(`Subject: ${email.subject}\n`);
  console.log(email.text);
  console.log(`\nSite URL: ${lead.site_url}`);

  if (approvalRequiresSend(config.approval_mode) && !send) {
    console.log(
      `\n⏸  approval_mode="${config.approval_mode}" — waiting for your OK before sending.`
    );
    console.log(`Re-run with --send after you approve: npm run outreach -- --send`);
    return;
  }

  await sendPitchEmail(lead, email);
  console.log(`\n✓ Sent to ${email.to}. State → PITCHED.`);
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
