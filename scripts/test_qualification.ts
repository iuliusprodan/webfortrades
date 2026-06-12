import { getDb, getLeadBySlug } from "./db.js";
import {
  printContactabilitySummary,
  qualifyContactabilityAsync,
} from "./contactability.js";

function parseArgs(): { slug?: string; live?: boolean } {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  let live = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    else if (args[i] === "--live") live = true;
  }
  return { slug, live };
}

async function main(): Promise<void> {
  getDb();

  const { slug, live } = parseArgs();

  if (live && slug) {
    const lead = getLeadBySlug(slug);
    if (!lead) {
      console.error(`Lead not found for slug: ${slug}`);
      process.exit(1);
    }

    console.log(`Live contactability check (check-only, no messages): ${lead.business_name}\n`);
    const result = await qualifyContactabilityAsync({
      email: lead.email,
      phone: lead.phone,
    });
    printContactabilitySummary(lead.business_name, lead.phone, result);
    console.log("\nNo outreach was sent.");
    return;
  }

  if (slug === "bristol-plumbing-co" || live) {
    const phone = "07972 176630";
    console.log("Bristol Plumbing Co. qualification preview (check-only)\n");
    const result = await qualifyContactabilityAsync({
      email: null,
      phone,
    });
    printContactabilitySummary("Bristol Plumbing Co.", phone, result);
    console.log("\nNo outreach was sent.");
    return;
  }

  console.log("Run unit tests: tsx scripts/contactability.test.ts");
  console.log("Live lead check: npm run test:qualification -- --live --slug bristol-plumbing-co");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
