import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { parse as parseYaml } from "yaml";
import { getLeadBySlug, getNextGatheredLead, updateLead } from "./db.js";
import { extractPaletteFromDir } from "./palette.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const TEMPLATE = path.join(__dirname, "templates", "site");

interface Brief {
  business_name: string;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  opening_hours: string[];
  services: string[];
  service_area: string[];
  photos: { local: string; source_url: string; width: number; height: number }[];
  reviews: { text: string; reviewer: string; rating: number }[];
  social: { facebook: string | null; instagram: string | null };
  brand: { colours: string[]; logo_url: string | null };
  sources: string[];
}

type TradeStyle = "editorial-electric" | "warm-heating" | "industrial-mechanic";

function parseArgs(): { slug?: string } {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
  }
  return { slug };
}

function detectTrade(brief: Brief): TradeStyle {
  const blob = [brief.business_name, ...brief.services].join(" ").toLowerCase();
  if (/mechanic|motor|garage|vehicle|tyre|tire|brake|mot|diagnostic|exhaust/.test(blob)) {
    return "industrial-mechanic";
  }
  if (/heat|plumb|gas|boiler|radiator|hvac|central heating/.test(blob)) {
    return "warm-heating";
  }
  return "editorial-electric";
}

function tradeMeta(style: TradeStyle): {
  direction: string;
  displayFont: string;
  bodyFont: string;
  separator: string;
} {
  switch (style) {
    case "warm-heating":
      return {
        direction: "solid-warm-editorial",
        displayFont: "Fraunces",
        bodyFont: "Work Sans",
        separator: "◆",
      };
    case "industrial-mechanic":
      return {
        direction: "industrial-ops-log",
        displayFont: "Space Mono",
        bodyFont: "IBM Plex Sans",
        separator: "/",
      };
    default:
      return {
        direction: "quiet-premium-editorial",
        displayFont: "Syne",
        bodyFont: "DM Sans",
        separator: "✦",
      };
  }
}

function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function replaceInFile(filePath: string, replacements: Record<string, string>): void {
  let content = fs.readFileSync(filePath, "utf8");
  for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
  }
  fs.writeFileSync(filePath, content);
}

function appendMemory(direction: string, palette: object, slug: string): void {
  const memPath = path.join(ROOT, "memory.md");
  const entry = `\n## Build: ${slug} (${new Date().toISOString().slice(0, 10)})\n- Direction: ${direction}\n- Palette: ${JSON.stringify(palette)}\n`;
  fs.appendFileSync(memPath, entry);
}

function writeBuildNotes(
  siteDir: string,
  slug: string,
  brief: Brief,
  design: object
): void {
  const notes = `# Build notes — ${brief.business_name}

- Slug: \`${slug}\`
- Trade style: ${(design as { direction: string }).direction}
- Photos used: ${brief.photos.length}
- Services: ${brief.services.length}
- Reviews: ${brief.reviews.length}
- Static export: \`output: 'export'\` for Vercel

## Design system
\`\`\`json
${JSON.stringify(design, null, 2)}
\`\`\`

## Run locally
\`\`\`bash
cd sites/${slug}
npm run dev
\`\`\`
`;
  fs.writeFileSync(path.join(siteDir, "build-notes.md"), notes);
}

async function main(): Promise<void> {
  const { slug: slugArg } = parseArgs();
  const lead = slugArg ? getLeadBySlug(slugArg) : getNextGatheredLead();

  if (!lead?.slug) {
    console.error(
      "No GATHERED lead found. Run prospect → gather first, or pass --slug <slug>."
    );
    process.exit(1);
  }

  const slug = lead.slug;
  const briefPath = path.join(ROOT, "briefs", slug, "brief.json");
  if (!fs.existsSync(briefPath)) {
    console.error(`Missing brief: ${briefPath}`);
    process.exit(1);
  }

  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as Brief;
  const imagesSrc = path.join(ROOT, "briefs", slug, "images");
  const siteDir = path.join(ROOT, "sites", slug);
  const dataDir = path.join(siteDir, "data");
  const publicImages = path.join(siteDir, "public", "images");

  if (fs.existsSync(siteDir)) {
    fs.rmSync(siteDir, { recursive: true, force: true });
  }

  copyDir(TEMPLATE, siteDir);
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(publicImages, { recursive: true });

  fs.copyFileSync(briefPath, path.join(dataDir, "brief.json"));

  if (fs.existsSync(imagesSrc)) {
    for (const f of fs.readdirSync(imagesSrc)) {
      if (/\.(webp|jpg|jpeg|png)$/i.test(f)) {
        fs.copyFileSync(path.join(imagesSrc, f), path.join(publicImages, f));
      }
    }
  }

  const colors = await extractPaletteFromDir(imagesSrc);
  const trade = detectTrade(brief);
  const meta = tradeMeta(trade);
  const designSystem = {
    slug,
    business_name: brief.business_name,
    direction: meta.direction,
    trade,
    fonts: { display: meta.displayFont, body: meta.bodyFont },
    separator: meta.separator,
    colors,
  };

  fs.writeFileSync(
    path.join(dataDir, "design-system.json"),
    JSON.stringify(designSystem, null, 2) + "\n"
  );
  fs.writeFileSync(
    path.join(siteDir, "design-system.json"),
    JSON.stringify(designSystem, null, 2) + "\n"
  );

  replaceInFile(path.join(siteDir, "package.json"), {
    "{{SLUG}}": slug,
    "{{BUSINESS_NAME}}": brief.business_name,
  });

  writeBuildNotes(siteDir, slug, brief, designSystem);
  appendMemory(meta.direction, colors, slug);

  console.log(`Installing dependencies in sites/${slug}...`);
  execSync("npm install", { cwd: siteDir, stdio: "inherit" });

  console.log("Building static site...");
  execSync("npm run build", { cwd: siteDir, stdio: "inherit" });

  updateLead(lead.id, { state: "BUILT" });

  const config = parseYaml(fs.readFileSync(path.join(ROOT, "config.yaml"), "utf8")) as {
    daily_build_cap: number;
  };

  console.log(`\n✓ Built sites/${slug}`);
  console.log(`✓ State → BUILT (lead id=${lead.id})`);
  console.log(`\nLocal dev URL: http://localhost:3000`);
  console.log(`Run: cd sites/${slug} && npm run dev`);
  console.log(`\nRespecting daily_build_cap: ${config.daily_build_cap}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
