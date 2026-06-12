import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { Lead } from "../db.js";
import { getLeadBySlug } from "../db.js";
import { evaluatePitchReadiness } from "../pitch_gate.js";
import { checkWhatsAppAvailable } from "../whatsapp_gateway.js";
import { validateOutreachPayload } from "../outreach_message_format.js";
import { loadStyleVerifyManifest } from "../style_verify.js";
import { loadDeployManifest } from "../vercel_alias.js";
import { WEBSITE_ROOT } from "./config.js";
import { isScrollVideoEnabled } from "../site_config.js";
import type { BatchLeadSpec, OutreachChannel } from "./types.js";

export interface PreflightRow {
  index: number;
  slug: string;
  business_name: string;
  channel: OutreachChannel;
  phone_last4: string | null;
  email: string | null;
  wa_status: string;
  site_url: string;
  site_http: number | string;
  og_http: number | string;
  scroll_video: string | null;
  style_ok: boolean;
  pitch_ready: boolean;
  pitch_blockers: string[];
  format_ok: boolean;
  skip: boolean;
  skip_reason: string | null;
  message1: string | null;
  message2: string | null;
  email_subject: string | null;
  email_body: string | null;
  m1_hash: string | null;
  m2_hash: string | null;
}

function readDraft(root: string, slug: string, n: 1 | 2): string | null {
  const p = path.join(root, "outreach/drafts", `${slug}-message-${n}.txt`);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8").trimEnd() : null;
}

function readEmailDraft(root: string, slug: string): {
  subject: string | null;
  body: string | null;
} {
  const subjectPath = path.join(root, "outreach/drafts", `${slug}-email-subject.txt`);
  const bodyPath = path.join(root, "outreach/drafts", `${slug}-email-body.txt`);
  return {
    subject: fs.existsSync(subjectPath)
      ? fs.readFileSync(subjectPath, "utf8").trimEnd()
      : null,
    body: fs.existsSync(bodyPath) ? fs.readFileSync(bodyPath, "utf8").trimEnd() : null,
  };
}

async function head(url: string): Promise<number | string> {
  try {
    return (await fetch(url, { redirect: "follow" })).status;
  } catch (e) {
    return `ERR:${(e as Error).message}`;
  }
}

function resolveSiteUrl(root: string, spec: BatchLeadSpec, lead: Lead): string {
  if (spec.siteUrl) return spec.siteUrl.replace(/\/$/, "");
  const deploy = loadDeployManifest(root, spec.slug);
  const url = deploy?.verified_url ?? lead.site_url ?? "";
  if (!url) throw new Error(`No site URL for ${spec.slug}`);
  return url.replace(/\/$/, "");
}

export async function preflightLead(
  spec: BatchLeadSpec,
  options?: { waiveContactability?: boolean; root?: string }
): Promise<PreflightRow> {
  const root = options?.root ?? WEBSITE_ROOT;
  const lead = getLeadBySlug(spec.slug);
  if (!lead) throw new Error(`Lead not found: ${spec.slug}`);

  const siteUrl = resolveSiteUrl(root, spec, lead);
  const pitch = evaluatePitchReadiness(root, lead, {
    allowManualReview: spec.waiveContactability ?? options?.waiveContactability,
  });
  const style = loadStyleVerifyManifest(root, spec.slug);
  const wa =
    spec.channel === "whatsapp" && lead.phone
      ? await checkWhatsAppAvailable(lead.phone)
      : { status: "n/a" as const, detail: null };

  const videoPath = path.join(root, "previews", spec.slug, "scroll.mp4");
  const scrollEnabled = isScrollVideoEnabled();
  const m1 = readDraft(root, spec.slug, 1);
  const m2 = scrollEnabled ? readDraft(root, spec.slug, 2) : null;
  const emailDraft = readEmailDraft(root, spec.slug);

  const messages =
    spec.channel === "whatsapp" && m1
      ? scrollEnabled && m2
        ? [m1, m2]
        : [m1]
      : [];
  const fmtIssues =
    messages.length >= 1
      ? validateOutreachPayload({
          messages,
          siteUrl,
          videoAttachment: scrollEnabled && fs.existsSync(videoPath),
        })
      : spec.channel === "email" && emailDraft.body
        ? []
        : [{ message: "missing drafts" }];

  let skip = spec.skip ?? false;
  let skipReason = spec.skipReason ?? null;
  if (spec.channel === "email" && !spec.emailTo && !lead.email) {
    skip = true;
    skipReason = skipReason ?? "no recipient email";
  }
  if (spec.channel === "whatsapp" && wa.status === "unavailable") {
    skip = skip || false;
  }

  const hash = (t: string) =>
    crypto.createHash("sha256").update(t).digest("hex").slice(0, 12);

  const scrollVideoMeta =
    scrollEnabled && fs.existsSync(videoPath)
      ? `${(fs.statSync(videoPath).size / 1024 / 1024).toFixed(1)}MB`
      : null;

  return {
    index: spec.index,
    slug: spec.slug,
    business_name: lead.business_name,
    channel: spec.channel,
    phone_last4: lead.phone?.replace(/\D/g, "").slice(-4) ?? null,
    email: spec.emailTo ?? lead.email ?? null,
    wa_status: wa.status,
    site_url: siteUrl,
    site_http: await head(siteUrl),
    og_http: await head(`${siteUrl}/og.png`),
    scroll_video: scrollVideoMeta,
    style_ok: style?.ok ?? false,
    pitch_ready: pitch.ready,
    pitch_blockers: pitch.blockers,
    format_ok: fmtIssues.length === 0,
    skip,
    skip_reason: skipReason,
    message1: spec.channel === "whatsapp" ? m1 : null,
    message2: spec.channel === "whatsapp" ? m2 : null,
    email_subject: spec.channel === "email" ? emailDraft.subject : null,
    email_body: spec.channel === "email" ? emailDraft.body : null,
    m1_hash: m1 ? hash(m1) : null,
    m2_hash: m2 ? hash(m2) : null,
  };
}

export function printPreflightTable(rows: PreflightRow[]): void {
  const showVideo = isScrollVideoEnabled();
  console.log("\n--- Preflight table ---");
  if (showVideo) {
    console.log("| # | Lead | Ch | Site | OG | Video | Pitch | WA | Skip |");
    for (const r of rows) {
      console.log(
        `| ${r.index} | ${r.slug} | ${r.channel} | ${r.site_http} | ${r.og_http} | ${r.scroll_video ?? "-"} | ${r.pitch_ready ? "ready" : "blocked"} | ${r.wa_status} | ${r.skip ? r.skip_reason ?? "yes" : "no"} |`
      );
    }
  } else {
    console.log("| # | Lead | Ch | Site | OG | Pitch | WA | Skip |");
    for (const r of rows) {
      console.log(
        `| ${r.index} | ${r.slug} | ${r.channel} | ${r.site_http} | ${r.og_http} | ${r.pitch_ready ? "ready" : "blocked"} | ${r.wa_status} | ${r.skip ? r.skip_reason ?? "yes" : "no"} |`
      );
    }
  }
}

export function printAllDrafts(rows: PreflightRow[]): void {
  const scrollEnabled = isScrollVideoEnabled();
  console.log("\n--- Drafted messages ---");
  for (const r of rows) {
    console.log(`\n### #${r.index} ${r.business_name} (${r.slug})`);
    if (r.channel === "whatsapp") {
      console.log("\nMessage 1:\n");
      console.log(r.message1 ?? "(missing)");
      if (scrollEnabled) {
        console.log("\nMessage 2:\n");
        console.log(r.message2 ?? "(missing)");
        if (r.scroll_video) {
          console.log(`\nVideo: previews/${r.slug}/scroll.mp4 (${r.scroll_video})`);
        }
      }
    } else {
      console.log(`\nTo: ${r.email ?? "(none)"}`);
      console.log(`Subject: ${r.email_subject ?? "(missing)"}`);
      console.log("\nBody:\n");
      console.log(r.email_body ?? "(missing)");
    }
  }
}

export function loadBatchManifest(manifestPath: string): {
  batch_id: string | null;
  leads: BatchLeadSpec[];
} {
  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
    batch_id?: string;
    leads: BatchLeadSpec[];
  };
  if (!Array.isArray(raw.leads) || raw.leads.length === 0) {
    throw new Error("Batch manifest must include a non-empty leads array.");
  }
  const leads = raw.leads.map((lead, i) => ({
    ...lead,
    index: lead.index ?? i + 1,
  }));
  return { batch_id: raw.batch_id ?? null, leads };
}
