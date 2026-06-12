import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "leads.db");

export type LeadState =
  | "NEW"
  | "GATHERED"
  | "BUILT"
  | "REVIEWED"
  | "DEPLOYED"
  | "PITCHED"
  | "IN_CONVO"
  | "WON"
  | "LOST"
  | "PITCH_BLOCKED"
  | "NEEDS_MANUAL_CONTACT"
  | "DO_NOT_CONTACT"
  | "LAPSED";

export type WhatsAppStatus = "available" | "unavailable" | "unknown";

export type ContactabilityStatus =
  | "CONTACTABLE"
  | "DISQUALIFIED_NO_CONTACT_METHOD"
  | "NEEDS_MANUAL_REVIEW";

export interface Lead {
  id: number;
  business_name: string;
  niche: string | null;
  region: string | null;
  owner_name: string | null;
  email: string | null;
  phone: string | null;
  score: number | null;
  state: LeadState;
  site_url: string | null;
  verified_site_url: string | null;
  deployment_url: string | null;
  alias_status: string | null;
  build_id: string | null;
  style_verified: number | null;
  style_verified_at: string | null;
  style_verify_notes: string | null;
  slug: string | null;
  pitched_at: string | null;
  last_touch: number;
  reply_status: string | null;
  quoted_price: number | null;
  source_urls: string | null;
  notes: string | null;
  website_status: string | null;
  website_check_notes: string | null;
  contact_saved: number | null;
  contact_name: string | null;
  owner_first_name: string | null;
  whatsapp_available: number | null;
  whatsapp_status: string | null;
  whatsapp_checked_at: string | null;
  phone_type: string | null;
  primary_outreach_channel: string | null;
  email_available: number | null;
  contactability_status: string | null;
  contactability_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type WebsiteStatus =
  | "NO_WEBSITE"
  | "SOCIAL_OR_DIRECTORY_ONLY"
  | "BROKEN_OR_BAD_SITE"
  | "NEEDS_MANUAL_REVIEW"
  | "HAS_REAL_SITE";

export type LeadInsert = Partial<
  Omit<Lead, "id" | "created_at" | "updated_at">
> & {
  business_name: string;
  state?: LeadState;
  last_touch?: number;
};

export type LeadUpdate = Partial<
  Omit<Lead, "id" | "created_at" | "updated_at">
>;

let db: Database.Database | null = null;

function ensureLeadColumns(database: Database.Database): void {
  const cols = database
    .prepare("PRAGMA table_info(leads)")
    .all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("website_status")) {
    database.exec("ALTER TABLE leads ADD COLUMN website_status TEXT");
  }
  if (!names.has("website_check_notes")) {
    database.exec("ALTER TABLE leads ADD COLUMN website_check_notes TEXT");
  }
  if (!names.has("contact_saved")) {
    database.exec("ALTER TABLE leads ADD COLUMN contact_saved INTEGER DEFAULT 0");
  }
  if (!names.has("contact_name")) {
    database.exec("ALTER TABLE leads ADD COLUMN contact_name TEXT");
  }
  if (!names.has("owner_first_name")) {
    database.exec("ALTER TABLE leads ADD COLUMN owner_first_name TEXT");
  }
  if (!names.has("whatsapp_available")) {
    database.exec("ALTER TABLE leads ADD COLUMN whatsapp_available INTEGER");
  }
  if (!names.has("whatsapp_checked_at")) {
    database.exec("ALTER TABLE leads ADD COLUMN whatsapp_checked_at TEXT");
  }
  if (!names.has("whatsapp_status")) {
    database.exec("ALTER TABLE leads ADD COLUMN whatsapp_status TEXT");
  }
  if (!names.has("phone_type")) {
    database.exec("ALTER TABLE leads ADD COLUMN phone_type TEXT");
  }
  if (!names.has("primary_outreach_channel")) {
    database.exec("ALTER TABLE leads ADD COLUMN primary_outreach_channel TEXT");
  }
  if (!names.has("trade_relevance")) {
    database.exec("ALTER TABLE leads ADD COLUMN trade_relevance TEXT");
  }
  if (!names.has("trade_relevance_notes")) {
    database.exec("ALTER TABLE leads ADD COLUMN trade_relevance_notes TEXT");
  }
  if (!names.has("duplicate_phone_cluster")) {
    database.exec(
      "ALTER TABLE leads ADD COLUMN duplicate_phone_cluster INTEGER DEFAULT 0"
    );
  }
  if (!names.has("duplicate_of")) {
    database.exec("ALTER TABLE leads ADD COLUMN duplicate_of TEXT");
  }
  if (!names.has("duplicate_cluster_id")) {
    database.exec("ALTER TABLE leads ADD COLUMN duplicate_cluster_id TEXT");
  }
  if (!names.has("geo_relevance")) {
    database.exec("ALTER TABLE leads ADD COLUMN geo_relevance TEXT");
  }
  if (!names.has("geo_relevance_notes")) {
    database.exec("ALTER TABLE leads ADD COLUMN geo_relevance_notes TEXT");
  }
  if (!names.has("email_available")) {
    database.exec("ALTER TABLE leads ADD COLUMN email_available INTEGER");
  }
  if (!names.has("contactability_status")) {
    database.exec("ALTER TABLE leads ADD COLUMN contactability_status TEXT");
  }
  if (!names.has("contactability_reason")) {
    database.exec("ALTER TABLE leads ADD COLUMN contactability_reason TEXT");
  }
  if (!names.has("verified_site_url")) {
    database.exec("ALTER TABLE leads ADD COLUMN verified_site_url TEXT");
  }
  if (!names.has("deployment_url")) {
    database.exec("ALTER TABLE leads ADD COLUMN deployment_url TEXT");
  }
  if (!names.has("alias_status")) {
    database.exec("ALTER TABLE leads ADD COLUMN alias_status TEXT");
  }
  if (!names.has("build_id")) {
    database.exec("ALTER TABLE leads ADD COLUMN build_id TEXT");
  }
  if (!names.has("style_verified")) {
    database.exec("ALTER TABLE leads ADD COLUMN style_verified INTEGER");
  }
  if (!names.has("style_verified_at")) {
    database.exec("ALTER TABLE leads ADD COLUMN style_verified_at TEXT");
  }
  if (!names.has("style_verify_notes")) {
    database.exec("ALTER TABLE leads ADD COLUMN style_verify_notes TEXT");
  }
}

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    // Allow concurrent writers (parallel batch workers each open their own
    // connection). SQLite serialises writes with a lock; busy_timeout makes
    // contending writers wait and retry instead of throwing SQLITE_BUSY.
    db.pragma("busy_timeout = 15000");
    db.exec(`
      CREATE TABLE IF NOT EXISTS email_sends (
        id INTEGER PRIMARY KEY,
        lead_id INTEGER NOT NULL,
        touch INTEGER NOT NULL,
        sent_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS whatsapp_sends (
        id INTEGER PRIMARY KEY,
        lead_id INTEGER NOT NULL,
        touch INTEGER NOT NULL,
        sent_at TEXT NOT NULL
      );
    `);
    ensureLeadColumns(db);
  }
  return db;
}

export function insertLead(fields: LeadInsert): number {
  const now = new Date().toISOString();
  const stmt = getDb().prepare(`
    INSERT INTO leads (
      business_name, niche, region, owner_name, email, phone, score,
      state, site_url, slug, pitched_at, last_touch, reply_status,
      quoted_price, source_urls, notes, website_status, website_check_notes,
      phone_type, created_at, updated_at
    ) VALUES (
      @business_name, @niche, @region, @owner_name, @email, @phone, @score,
      @state, @site_url, @slug, @pitched_at, @last_touch, @reply_status,
      @quoted_price, @source_urls, @notes, @website_status, @website_check_notes,
      @phone_type, @created_at, @updated_at
    )
  `);

  const result = stmt.run({
    business_name: fields.business_name,
    niche: fields.niche ?? null,
    region: fields.region ?? null,
    owner_name: fields.owner_name ?? null,
    email: fields.email ?? null,
    phone: fields.phone ?? null,
    score: fields.score ?? null,
    state: fields.state ?? "NEW",
    site_url: fields.site_url ?? null,
    slug: fields.slug ?? null,
    pitched_at: fields.pitched_at ?? null,
    last_touch: fields.last_touch ?? 0,
    reply_status: fields.reply_status ?? null,
    quoted_price: fields.quoted_price ?? null,
    source_urls: fields.source_urls ?? null,
    notes: fields.notes ?? null,
    website_status: fields.website_status ?? null,
    website_check_notes: fields.website_check_notes ?? null,
    phone_type: fields.phone_type ?? null,
    created_at: now,
    updated_at: now,
  });

  return Number(result.lastInsertRowid);
}

export function updateLead(id: number, fields: LeadUpdate): boolean {
  const keys = Object.keys(fields).filter(
    (k) => fields[k as keyof LeadUpdate] !== undefined
  );
  if (keys.length === 0) return false;

  const setClause = keys.map((k) => `${k} = @${k}`).join(", ");
  const stmt = getDb().prepare(`
    UPDATE leads
    SET ${setClause}, updated_at = @updated_at
    WHERE id = @id
  `);

  const result = stmt.run({
    ...fields,
    id,
    updated_at: new Date().toISOString(),
  });

  return result.changes > 0;
}

export function getLeadsByState(state: LeadState): Lead[] {
  const stmt = getDb().prepare(`
    SELECT * FROM leads WHERE state = ? ORDER BY score DESC, id ASC
  `);
  return stmt.all(state) as Lead[];
}

export function findLeadByName(name: string): Lead | undefined {
  const stmt = getDb().prepare(`
    SELECT * FROM leads WHERE business_name = ? LIMIT 1
  `);
  return stmt.get(name) as Lead | undefined;
}

export function findLeadByNameAndRegion(
  name: string,
  region: string
): Lead | undefined {
  const stmt = getDb().prepare(`
    SELECT * FROM leads WHERE business_name = ? AND region = ? LIMIT 1
  `);
  return stmt.get(name, region) as Lead | undefined;
}

export function getLeadById(id: number): Lead | undefined {
  const stmt = getDb().prepare(`SELECT * FROM leads WHERE id = ?`);
  return stmt.get(id) as Lead | undefined;
}

export function getLeadBySlug(slug: string): Lead | undefined {
  const stmt = getDb().prepare(`SELECT * FROM leads WHERE slug = ?`);
  return stmt.get(slug) as Lead | undefined;
}

export function getNextNewLead(): Lead | undefined {
  const stmt = getDb().prepare(`
    SELECT * FROM leads WHERE state = 'NEW'
    ORDER BY score DESC, id ASC LIMIT 1
  `);
  return stmt.get() as Lead | undefined;
}

export function getNextGatheredLead(): Lead | undefined {
  const stmt = getDb().prepare(`
    SELECT * FROM leads WHERE state = 'GATHERED'
    ORDER BY score DESC, id ASC LIMIT 1
  `);
  return stmt.get() as Lead | undefined;
}

export function getNextBuiltLead(): Lead | undefined {
  const stmt = getDb().prepare(`
    SELECT * FROM leads WHERE state = 'BUILT'
    ORDER BY score DESC, id ASC LIMIT 1
  `);
  return stmt.get() as Lead | undefined;
}

export function getNextReviewedLead(): Lead | undefined {
  const stmt = getDb().prepare(`
    SELECT * FROM leads WHERE state = 'REVIEWED'
    ORDER BY score DESC, id ASC LIMIT 1
  `);
  return stmt.get() as Lead | undefined;
}

export function getNextDeployableLead(): Lead | undefined {
  return getNextReviewedLead() ?? getNextBuiltLead();
}

/**
 * Central candidate selection for a batch run. Returns pre-build leads that
 * match the niche/region, are not already built/deployed/pitched, and are not
 * disqualified, ordered by score. Contactability is confirmed later (after
 * gather) by the per-lead worker gate.
 */
export function getCandidateLeadsForBatch(input: {
  niche?: string | null;
  region?: string | null;
  limit: number;
}): Lead[] {
  const clauses: string[] = [
    "slug IS NOT NULL",
    "state IN ('NEW','GATHERED')",
    "(contactability_status IS NULL OR contactability_status != 'DISQUALIFIED_NO_CONTACT_METHOD')",
  ];
  const params: (string | number)[] = [];

  if (input.niche) {
    clauses.push("LOWER(niche) = LOWER(?)");
    params.push(input.niche);
  }
  if (input.region) {
    clauses.push("LOWER(region) = LOWER(?)");
    params.push(input.region);
  }

  const stmt = getDb().prepare(`
    SELECT * FROM leads
    WHERE ${clauses.join(" AND ")}
    ORDER BY score DESC, id ASC
    LIMIT ?
  `);
  return stmt.all(...params, input.limit) as Lead[];
}

export function getNextDeployedLead(): Lead | undefined {
  const stmt = getDb().prepare(`
    SELECT * FROM leads WHERE state = 'DEPLOYED'
    ORDER BY score DESC, id ASC LIMIT 1
  `);
  return stmt.get() as Lead | undefined;
}

export function countPitchedToday(): number {
  return countEmailSendsToday();
}

export function countEmailSendsToday(): number {
  const today = new Date().toISOString().slice(0, 10);
  const stmt = getDb().prepare(`
    SELECT COUNT(*) AS n FROM email_sends WHERE sent_at LIKE ?
  `);
  const row = stmt.get(`${today}%`) as { n: number };
  return row.n;
}

export function countWhatsAppSendsToday(): number {
  const today = new Date().toISOString().slice(0, 10);
  const stmt = getDb().prepare(`
    SELECT COUNT(*) AS n FROM whatsapp_sends WHERE sent_at LIKE ?
  `);
  const row = stmt.get(`${today}%`) as { n: number };
  return row.n;
}

export function logWhatsAppSend(leadId: number, touch: number): void {
  const stmt = getDb().prepare(`
    INSERT INTO whatsapp_sends (lead_id, touch, sent_at) VALUES (?, ?, ?)
  `);
  stmt.run(leadId, touch, new Date().toISOString());
}

export function leadChannelSentToday(
  leadId: number,
  channel: "email" | "whatsapp"
): boolean {
  const table = channel === "email" ? "email_sends" : "whatsapp_sends";
  const today = new Date().toISOString().slice(0, 10);
  const stmt = getDb().prepare(
    `SELECT COUNT(*) AS n FROM ${table} WHERE lead_id = ? AND sent_at LIKE ?`
  );
  const row = stmt.get(leadId, `${today}%`) as { n: number };
  return row.n > 0;
}

export function logEmailSend(leadId: number, touch: number): void {
  const stmt = getDb().prepare(`
    INSERT INTO email_sends (lead_id, touch, sent_at) VALUES (?, ?, ?)
  `);
  stmt.run(leadId, touch, new Date().toISOString());
}

export function getPitchedLeads(): Lead[] {
  const stmt = getDb().prepare(`
    SELECT * FROM leads WHERE state = 'PITCHED' ORDER BY pitched_at ASC
  `);
  return stmt.all() as Lead[];
}
