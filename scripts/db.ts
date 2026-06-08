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
  | "LAPSED";

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
  slug: string | null;
  pitched_at: string | null;
  last_touch: number;
  reply_status: string | null;
  quoted_price: number | null;
  source_urls: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type LeadInsert = Omit<
  Lead,
  "id" | "state" | "last_touch" | "created_at" | "updated_at"
> & {
  state?: LeadState;
  last_touch?: number;
};

export type LeadUpdate = Partial<
  Omit<Lead, "id" | "created_at" | "updated_at">
>;

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS email_sends (
        id INTEGER PRIMARY KEY,
        lead_id INTEGER NOT NULL,
        touch INTEGER NOT NULL,
        sent_at TEXT NOT NULL
      );
    `);
  }
  return db;
}

export function insertLead(fields: LeadInsert): number {
  const now = new Date().toISOString();
  const stmt = getDb().prepare(`
    INSERT INTO leads (
      business_name, niche, region, owner_name, email, phone, score,
      state, site_url, slug, pitched_at, last_touch, reply_status,
      quoted_price, source_urls, notes, created_at, updated_at
    ) VALUES (
      @business_name, @niche, @region, @owner_name, @email, @phone, @score,
      @state, @site_url, @slug, @pitched_at, @last_touch, @reply_status,
      @quoted_price, @source_urls, @notes, @created_at, @updated_at
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
