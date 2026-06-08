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
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

db.close();
console.log(`Initialized ${DB_PATH}`);
