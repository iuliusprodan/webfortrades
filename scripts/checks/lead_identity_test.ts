#!/usr/bin/env tsx
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import {
  normalizeLeadName,
  normalizePhoneLast9,
  parsePostcodeFromAddress,
} from "../lead_identity.js";
import { runMigrations } from "../db/migrate.js";

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

function testNormalize(): void {
  assert(normalizeLeadName("Smith & Co Ltd") === "smith co", "Smith & Co Ltd");
  assert(normalizeLeadName("The Roof Doctors") === "roof doctors", "Roof Doctors");
  assert(normalizePhoneLast9("+44 7788 488 486") === "788488486", "+44 mobile");
  assert(normalizePhoneLast9("07788 488 486") === "788488486", "07 mobile");
  assert(parsePostcodeFromAddress("EH15 3FD").outward === "EH15", "EH15 outward");
  assert(parsePostcodeFromAddress("ls4 2qr").outward === "LS4", "LS4 outward");
}

function seedLeadsTable(dbPath: string): void {
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_name TEXT NOT NULL,
      niche TEXT,
      region TEXT,
      owner_name TEXT,
      email TEXT,
      phone TEXT,
      score INTEGER,
      state TEXT DEFAULT 'NEW',
      site_url TEXT,
      slug TEXT,
      pitched_at TEXT,
      last_touch INTEGER DEFAULT 0,
      reply_status TEXT,
      quoted_price INTEGER,
      source_urls TEXT,
      notes TEXT,
      website_status TEXT,
      website_check_notes TEXT,
      phone_type TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);
  db.close();
}

async function testTryInsertLead(): Promise<void> {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wft-lead-id-"));
  const dbPath = path.join(tmp, "leads.db");
  seedLeadsTable(dbPath);
  runMigrations(dbPath, "up");

  process.env.WFT_DB_PATH = dbPath;
  const { resetDbConnection, tryInsertLead } = await import("../db.js");
  resetDbConnection();

  const base = {
    business_name: "Alpha Plumbing Ltd",
    niche: "plumbers",
    region: "Bristol",
    phone: "07788 488 486",
    score: 50,
    slug: "alpha-plumbing-ltd",
    formatted_address: "1 High St, Bristol BS3 1AA",
    website_status: "NO_WEBSITE" as const,
  };

  const a = tryInsertLead({ ...base, place_id: "ChIJaaaaaaaaaaaa" });
  assert(a.result === "inserted", "first insert");

  const dupPlace = tryInsertLead({
    ...base,
    business_name: "Alpha Plumbing",
    place_id: "ChIJaaaaaaaaaaaa",
  });
  assert(dupPlace.result === "duplicate_place", "duplicate place_id");

  const dupPhone = tryInsertLead({
    ...base,
    business_name: "Beta Plumbing Ltd",
    slug: "beta-plumbing-ltd",
    place_id: "ChIJbbbbbbbbbbbb",
    phone: "07788 488 486",
    formatted_address: "2 High St, Bristol BS3 1AB",
  });
  assert(dupPhone.result === "duplicate_phone_postcode", "duplicate phone+postcode");

  const dupName = tryInsertLead({
    ...base,
    business_name: "Alpha Plumbing Ltd",
    slug: "alpha-plumbing-ltd-2",
    place_id: "ChIJcccccccccccc",
    phone: "07889 228995",
    formatted_address: "1 High St, Bristol BS3 1AA",
  });
  assert(dupName.result === "duplicate_name_postcode", "duplicate name+postcode");

  delete process.env.WFT_DB_PATH;
  resetDbConnection();
}

async function testPickNextSearches(): Promise<void> {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wft-search-"));
  const dbPath = path.join(tmp, "leads.db");
  seedLeadsTable(dbPath);
  runMigrations(dbPath, "up");

  const db = new Database(dbPath);
  const recent = new Date().toISOString();
  db.prepare(
    `INSERT INTO search_history (niche, region, query, ran_at, raw_result_count, inserted_count, duplicate_count, quality_pct)
     VALUES (?, ?, ?, ?, 20, 8, 2, 40)`
  ).run("plumbers", "Bristol", "plumbers in Bristol", recent);
  db.close();

  fs.writeFileSync(
    path.join(tmp, "config.yaml"),
    `lead_search:
  niches: [plumbers, electricians, roofers]
  regions_tier1: [Bristol, Leeds, London]
  regions_tier2: [Cardiff]
  regions_tier3: [Penarth]
  repeat_cooldown_days: 14
  quality_promotion_threshold_pct: 30
`
  );

  process.env.WFT_DB_PATH = dbPath;
  const { resetDbConnection } = await import("../db.js");
  resetDbConnection();
  const { pickNextSearches } = await import("../lead_search_strategy.js");
  const picks = pickNextSearches(4, { root: tmp, now: new Date() });

  assert(picks.length > 0, "picks non-empty");
  assert(
    !picks.some((p) => p.region === "Bristol" && p.niche === "plumbers"),
    "Bristol plumbers on cooldown"
  );
  assert(picks.filter((p) => p.niche === picks[0]!.niche).length <= 3, "max 3 same niche");

  delete process.env.WFT_DB_PATH;
  resetDbConnection();
}

async function main(): Promise<void> {
  testNormalize();
  await testTryInsertLead();
  await testPickNextSearches();
  console.log("lead_identity_test.ts: OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
