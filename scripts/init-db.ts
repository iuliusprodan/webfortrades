import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "leads.db");

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY,
    business_name TEXT NOT NULL,
    niche TEXT,
    region TEXT,
    owner_name TEXT,
    email TEXT,
    phone TEXT,
    score INTEGER,
    state TEXT DEFAULT 'NEW',
    site_url TEXT,
    slug TEXT UNIQUE,
    pitched_at TEXT,
    last_touch INTEGER DEFAULT 0,
    reply_status TEXT,
    quoted_price INTEGER,
    source_urls TEXT,
    notes TEXT,
    website_status TEXT,
    website_check_notes TEXT,
    contact_saved INTEGER DEFAULT 0,
    contact_name TEXT,
    owner_first_name TEXT,
    whatsapp_available INTEGER,
    whatsapp_status TEXT,
    whatsapp_checked_at TEXT,
    phone_type TEXT,
    primary_outreach_channel TEXT,
    trade_relevance TEXT,
    trade_relevance_notes TEXT,
    duplicate_phone_cluster INTEGER DEFAULT 0,
    duplicate_of TEXT,
    duplicate_cluster_id TEXT,
    geo_relevance TEXT,
    geo_relevance_notes TEXT,
    email_available INTEGER,
    contactability_status TEXT,
    contactability_reason TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

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

db.close();
console.log(`Initialized ${DB_PATH}`);
