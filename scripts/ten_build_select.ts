#!/usr/bin/env tsx
/**
 * Ten-site build batch: select 10 leads from cache (leads.db NEW pool), optional live top-up,
 * contactability gate, review table. Heartbeat every 30s.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, type ChildProcess } from "node:child_process";
import { getDb, getLeadBySlug, updateLead, type Lead } from "./db.js";
import { classifyUkPhone } from "./phone_utils.js";
import {
  qualifyContactabilityAsync,
  contactabilityToLeadFields,
  leadStateForContactability,
} from "./contactability.js";
import { loadEnvLocal } from "./load_env_local.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BATCH_ID = "2026-06-11-ten-build";
const OUT_DIR = path.join(ROOT, "data", "batches", BATCH_ID);

const EXCLUDED_SLUGS = new Set([
  "bristol-plumbing-co",
  "greens-precise-plumbing-heating-ltd",
  "jt-plumbing",
  "corvell-ltd",
  "nfs-plumbing-heating",
  "bbr-plumbing-heating-bristol-bristol-boiler-repairs",
  "west-park-electrics",
  "alexander-s-painters-decorators",
  "stay-dry-roofing",
]);

const TOP_UP_PAIRS: { location: string; niche: string; extra?: string[] }[] = [
  { location: "Newcastle", niche: "electricians" },
  { location: "Derby", niche: "garage doors", extra: ["--include-manual-review"] },
  { location: "Glasgow", niche: "locksmiths" },
  { location: "Plymouth", niche: "builders", extra: ["--include-manual-review"] },
];

interface Progress {
  step: string;
  done: number;
  total: number;
  inFlight: number;
  last: string;
  cacheHits: number;
  liveHits: number;
}

const progress: Progress = {
  step: "init",
  done: 0,
  total: 10,
  inFlight: 0,
  last: "starting",
  cacheHits: 0,
  liveHits: 0,
};

function ts(): string {
  return new Date().toTimeString().slice(0, 8);
}

function printProgress(): void {
  const p = progress;
  console.log(
    `[${ts()}] step=${p.step} done=${p.done}/${p.total} in_flight=${p.inFlight} last=${p.last} cache_hits=${p.cacheHits} live_hits=${p.liveHits}`
  );
}

function startHeartbeat(): NodeJS.Timeout {
  printProgress();
  return setInterval(printProgress, 30_000);
}

interface PoolLead extends Lead {
  estRating: number | null;
  estReviews: number | null;
}

function parseNotesQuality(notes: string | null): {
  reviews10: boolean;
  rating45: boolean;
  sketchy: boolean;
  weakTrade: boolean;
} {
  const n = notes ?? "";
  return {
    reviews10: n.includes("reviews_10plus"),
    rating45: n.includes("rating_4_5plus"),
    sketchy: n.includes("sketchy_listing"),
    weakTrade: n.includes("weak_or_unclear_trade") || n.includes("trade_weak_trade_match"),
  };
}

function passesQualityBar(lead: Lead): boolean {
  if (!["NEW", "GATHERED"].includes(lead.state)) return false;
  if (!lead.slug || EXCLUDED_SLUGS.has(lead.slug)) return false;
  if (lead.phone_type !== "mobile" && classifyUkPhone(lead.phone) !== "mobile") return false;
  const ws = lead.website_status ?? "";
  if (ws === "HAS_REAL_SITE") return false;
  if (!["NO_WEBSITE", "BROKEN_OR_BAD_SITE", "SOCIAL_OR_DIRECTORY_ONLY"].includes(ws)) return false;
  const q = parseNotesQuality(lead.notes);
  if (!q.reviews10 && !q.rating45) return false;
  if (q.sketchy && !q.reviews10) return false;
  return true;
}

function loadCachePool(): PoolLead[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM leads
       WHERE state IN ('NEW', 'GATHERED')
         AND (contactability_status IS NULL OR contactability_status != 'DISQUALIFIED_NO_CONTACT_METHOD')
       ORDER BY score DESC`
    )
    .all() as Lead[];

  return rows
    .filter(passesQualityBar)
    .sort((a, b) => {
      const aw = parseNotesQuality(a.notes).weakTrade ? 1 : 0;
      const bw = parseNotesQuality(b.notes).weakTrade ? 1 : 0;
      if (aw !== bw) return aw - bw;
      return (b.score ?? 0) - (a.score ?? 0);
    })
    .map((lead) => {
    const q = parseNotesQuality(lead.notes);
    return {
      ...lead,
      estRating: q.rating45 ? 4.5 : 4.0,
      estReviews: q.reviews10 ? 10 : 5,
    };
  });
}

function nicheKey(niche: string | null): string {
  if (!niche) return "";
  const n = niche.toLowerCase();
  if (n.includes("paint") || n.includes("decor")) return "painters";
  if (n.includes("plumb")) return "plumbers";
  if (n.includes("electric")) return "electricians";
  if (n.includes("roof")) return "roofers";
  if (n.includes("gas") || n.includes("heating")) return "heating";
  if (n.includes("lock")) return "locksmiths";
  if (n.includes("fence")) return "fencing";
  if (n.includes("landscape") || n.includes("garden")) return "landscaping";
  if (n.includes("build")) return "builders";
  if (n.includes("garage")) return "garage-doors";
  return n;
}

function selectTen(pool: PoolLead[]): PoolLead[] {
  const picked: PoolLead[] = [];
  const cities = new Set<string>();
  const niches = new Set<string>();
  const usedSlugs = new Set<string>();

  const tryPick = (lead: PoolLead, force = false): boolean => {
    if (picked.length >= 10) return false;
    if (!lead.slug || usedSlugs.has(lead.slug)) return false;
    const nk = nicheKey(lead.niche);
    if (!force && lead.region && cities.has(lead.region)) return false;
    if (!force && nk && niches.has(nk)) return false;
    picked.push(lead);
    usedSlugs.add(lead.slug);
    if (lead.region) cities.add(lead.region);
    if (nk) niches.add(nk);
    return true;
  };

  // Pass 1: one lead per new city, prefer new niche
  for (const lead of pool) {
    if (picked.length >= 10) break;
    if (lead.region && cities.has(lead.region)) continue;
    tryPick(lead);
  }

  // Pass 2: fill missing niches (painters, builders, landscaping, etc.)
  for (const lead of pool) {
    if (picked.length >= 10) break;
    const nk = nicheKey(lead.niche);
    if (nk && niches.has(nk)) continue;
    if (lead.region && cities.has(lead.region)) continue;
    tryPick(lead);
  }

  // Pass 3: fill to 10 without reusing cities
  for (const lead of pool) {
    if (picked.length >= 10) break;
    if (lead.region && cities.has(lead.region)) continue;
    tryPick(lead);
  }

  // Pass 4: new cities only (niche repeat allowed for geographic spread)
  for (const lead of pool) {
    if (picked.length >= 10) break;
    if (lead.region && cities.has(lead.region)) continue;
    tryPick(lead, true);
  }

  return picked.slice(0, 10);
}

async function fetchGoogleRating(
  name: string,
  region: string,
  apiKey: string
): Promise<{ rating: number | null; reviews: number | null }> {
  const query = encodeURIComponent(`${name} ${region}`);
  const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,rating,user_ratings_total&key=${apiKey}`;
  const findRes = await fetch(findUrl);
  const findData = (await findRes.json()) as {
    candidates?: { place_id?: string; rating?: number; user_ratings_total?: number }[];
  };
  const c = findData.candidates?.[0];
  if (!c?.place_id) return { rating: null, reviews: null };
  if (c.rating != null && c.user_ratings_total != null) {
    return { rating: c.rating, reviews: c.user_ratings_total };
  }
  const params = new URLSearchParams({
    place_id: c.place_id,
    fields: "rating,user_ratings_total",
    key: apiKey,
  });
  const det = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`
  );
  const detData = (await det.json()) as {
    result?: { rating?: number; user_ratings_total?: number };
  };
  return {
    rating: detData.result?.rating ?? null,
    reviews: detData.result?.user_ratings_total ?? null,
  };
}

function runProspectPair(
  location: string,
  niche: string,
  extra: string[] = []
): Promise<{ ok: boolean; code: number | null }> {
  return new Promise((resolve) => {
    const args = [
      "run",
      "prospect",
      "--",
      "--location",
      location,
      "--niche",
      niche,
      "--target-unique",
      "35",
      ...extra,
    ];
    progress.inFlight += 1;
    progress.last = `prospect ${location}/${niche}`;
    printProgress();
    const child: ChildProcess = spawn("npm", args, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    child.on("close", (code) => {
      progress.inFlight -= 1;
      progress.liveHits += 1;
      progress.last = `prospect done ${location}/${niche} exit=${code}`;
      printProgress();
      resolve({ ok: code === 0, code });
    });
    child.on("error", () => {
      progress.inFlight -= 1;
      resolve({ ok: false, code: 1 });
    });
  });
}

async function topUpPool(deadlineMs: number): Promise<void> {
  const started = Date.now();
  let nextPair = 0;

  async function worker(): Promise<void> {
    while (Date.now() - started < deadlineMs) {
      if (selectTen(loadCachePool()).length >= 10) return;
      const i = nextPair++;
      if (i >= TOP_UP_PAIRS.length) return;
      const pair = TOP_UP_PAIRS[i]!;
      await runProspectPair(pair.location, pair.niche, pair.extra ?? []);
    }
  }

  await Promise.all(Array.from({ length: 4 }, () => worker()));
}

function phoneLast4(phone: string | null): string {
  if (!phone) return "----";
  const d = phone.replace(/\D/g, "");
  return d.slice(-4) || "----";
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const heartbeat = startHeartbeat();
  const prospectDeadlineMs = 20 * 60_000;
  const prospectStarted = Date.now();

  try {
    progress.step = "cache-scan";
    progress.last = "scanning leads.db NEW pool (no data/prospects/ dir)";
    printProgress();

    let pool = loadCachePool();
    progress.last = `cache pool=${pool.length} quality matches`;
    printProgress();

    let selected = selectTen(pool);
    progress.cacheHits = selected.length;

    if (pool.length >= 30 && selected.length >= 10) {
      progress.step = "cache-select";
      progress.done = 10;
      progress.last = "10 selected from cache, skipping live prospect";
      printProgress();
    } else {
      progress.step = "live-top-up";
      progress.last = `cache insufficient (${pool.length} pool, ${selected.length} selected)`;
      printProgress();
      const remaining = prospectDeadlineMs - (Date.now() - prospectStarted);
      if (remaining > 0) {
        await topUpPool(4, remaining);
      }
      pool = loadCachePool();
      selected = selectTen(pool);
      progress.cacheHits = selected.filter((s) => s.id).length;
    }

    if (selected.length < 10) {
      progress.step = "halt";
      progress.last = `only ${selected.length}/10 leads after ${Math.round((Date.now() - prospectStarted) / 1000)}s`;
      printProgress();
      fs.writeFileSync(
        path.join(OUT_DIR, "partial-pool.json"),
        JSON.stringify({ selected, poolSize: pool.length }, null, 2) + "\n"
      );
      console.error("\nProspecting cap reached or pool too thin. Partial pool saved.");
      process.exit(1);
    }

    progress.step = "contactability";
    progress.done = 0;
    progress.total = selected.length;
    progress.last = "OpenWA check starting";
    printProgress();

    const env = { ...process.env, ...loadEnvLocal() };
    const apiKey = env.GOOGLE_PLACES_API_KEY ?? "";

    const rows: Record<string, unknown>[] = [];

    for (let i = 0; i < selected.length; i++) {
      const lead = selected[i]!;
      progress.inFlight = 1;
      progress.last = `contactability ${lead.slug}`;
      printProgress();

      let rating = lead.estRating;
      let reviews = lead.estReviews;
      if (apiKey) {
        try {
          const g = await fetchGoogleRating(
            lead.business_name,
            lead.region ?? "",
            apiKey
          );
          if (g.rating != null) rating = g.rating;
          if (g.reviews != null) reviews = g.reviews;
        } catch {
          /* keep estimates */
        }
      }

      const contact =
        lead.contactability_status && lead.state === "GATHERED"
          ? {
              email_available: Boolean(lead.email_available),
              phone_type: classifyUkPhone(lead.phone),
              whatsapp_available:
                lead.whatsapp_status === "available"
                  ? ("available" as const)
                  : lead.whatsapp_status === "unavailable"
                    ? ("unavailable" as const)
                    : lead.whatsapp_status === "unknown"
                      ? ("unknown" as const)
                      : ("not_checked" as const),
              whatsapp_checked: Boolean(lead.whatsapp_checked_at),
              contactability_status: lead.contactability_status as
                | "CONTACTABLE"
                | "DISQUALIFIED_NO_CONTACT_METHOD"
                | "NEEDS_MANUAL_REVIEW",
              contactability_reason: lead.contactability_reason ?? "",
              preferred_channel: (lead.primary_outreach_channel as "whatsapp" | "email") ?? null,
              whatsapp_check_detail: null,
              whatsapp_candidate: classifyUkPhone(lead.phone) === "mobile",
            }
          : await qualifyContactabilityAsync({
              email: lead.email,
              phone: lead.phone,
            });

      if (!(lead.contactability_status && lead.state === "GATHERED")) {
        updateLead(lead.id, {
          ...contactabilityToLeadFields(contact),
          state: leadStateForContactability(contact.contactability_status),
        });
      }

      const q = parseNotesQuality(lead.notes);
      const notes: string[] = [];
      if (q.weakTrade) notes.push("weak_trade flag from prospect");
      if (contact.contactability_status !== "CONTACTABLE") {
        notes.push(contact.contactability_reason);
      }
      if (!lead.email) notes.push("no email on file");

      rows.push({
        row: i + 1,
        slug: lead.slug,
        business_name: lead.business_name,
        niche: lead.niche,
        city: lead.region,
        phone: lead.phone,
        phone_last4: phoneLast4(lead.phone),
        phone_type: lead.phone_type ?? classifyUkPhone(lead.phone),
        wa_status: contact.whatsapp_available,
        email_present: contact.email_available,
        google_rating: rating,
        reviews_count: reviews,
        website_status: lead.website_status,
        contactability: contact.contactability_status,
        score: lead.score,
        source: "cache",
        notes: notes.join("; ") || "-",
      });

      progress.done = i + 1;
      progress.inFlight = 0;
      progress.last = `${lead.slug} ${contact.contactability_status}`;
      printProgress();
    }

    progress.step = "complete";
    progress.last = "review table ready";
    printProgress();

    fs.writeFileSync(
      path.join(OUT_DIR, "candidate-review.json"),
      JSON.stringify({ batch_id: BATCH_ID, rows, cache_pool_size: pool.length }, null, 2) + "\n"
    );

    console.log("\n## Contactability review (10 leads) — awaiting your approval\n");
    console.log(
      "| Row | Business name | Niche | City | Phone (last 4) | Mobile/Landline | WA status | Email present | Google rating | Reviews count | Notes |"
    );
    console.log(
      "|-----|---------------|-------|------|----------------|-----------------|-----------|---------------|---------------|---------------|-------|"
    );
    for (const r of rows) {
      console.log(
        `| ${r.row} | ${r.business_name} | ${r.niche} | ${r.city} | ${r.phone_last4} | ${r.phone_type} | ${r.wa_status} | ${r.email_present ? "yes" : "no"} | ${r.google_rating ?? "?"} | ${r.reviews_count ?? "?"} | ${r.notes} |`
      );
    }
    console.log("\n**Paused.** Reply: `proceed all`, `proceed N, M`, `drop N`, or `swap N`.");
    console.log("No outreach sent. sending_enabled=false unchanged.\n");
  } finally {
    clearInterval(heartbeat);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
