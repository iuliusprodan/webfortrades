import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LIBRARY = path.join(ROOT, "library");
const INDEX_PATH = path.join(LIBRARY, "index.md");

export interface LibrarySyncInput {
  slug: string;
  trade: string;
  direction: string;
  displayFont: string;
  bodyFont: string;
  paletteSummary: string;
  liveUrl: string | null;
  vibe: string;
  siteDir: string;
}

function readDesignSystem(siteDir: string): {
  direction?: string;
  trade?: string;
  fonts?: { display?: string; body?: string };
  colors?: Record<string, string>;
} | null {
  const p = path.join(siteDir, "design-system.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8")) as {
    direction?: string;
    trade?: string;
    fonts?: { display?: string; body?: string };
    colors?: Record<string, string>;
  };
}

function paletteFromDesign(design: ReturnType<typeof readDesignSystem>): string {
  if (!design?.colors) return "see design-system.json";
  const vals = Object.values(design.colors).filter(Boolean).slice(0, 3);
  return vals.length ? vals.join(" / ") : "see design-system.json";
}

function findScreenshotSource(slug: string): string | null {
  const candidates = [
    path.join(ROOT, "screenshots", slug, "desktop", "01-hero.png"),
    path.join(ROOT, "screenshots", slug, "desktop", "full-page.png"),
    path.join(ROOT, "screenshots", slug, "mobile", "01-hero.png"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function upsertIndexRow(slug: string, row: string): void {
  if (!fs.existsSync(INDEX_PATH)) {
    fs.mkdirSync(LIBRARY, { recursive: true });
    fs.writeFileSync(
      INDEX_PATH,
      `# WebForTrades template library\n\n| slug | trade | direction | fonts | palette | live URL | vibe |\n|------|-------|-----------|-------|---------|----------|------|\n${row}\n`
    );
    return;
  }

  const content = fs.readFileSync(INDEX_PATH, "utf8");
  const lines = content.split("\n");
  const rowPrefix = `| ${slug} |`;
  const filtered = lines.filter((l) => !l.startsWith(rowPrefix));
  const tableEnd = filtered.findIndex((l, i) => i > 5 && l.startsWith("|") && !l.includes("---"));
  let insertAt = filtered.length;
  for (let i = filtered.length - 1; i >= 0; i--) {
    if (filtered[i].startsWith("|") && !filtered[i].includes("---")) {
      insertAt = i + 1;
      break;
    }
  }
  filtered.splice(insertAt, 0, row);
  fs.writeFileSync(INDEX_PATH, filtered.join("\n"));
}

export function syncToLibrary(input: LibrarySyncInput): void {
  const libDir = path.join(LIBRARY, input.slug);
  fs.mkdirSync(libDir, { recursive: true });

  const designPath = path.join(input.siteDir, "design-system.json");
  const notesPath = path.join(input.siteDir, "build-notes.md");

  if (fs.existsSync(designPath)) {
    fs.copyFileSync(designPath, path.join(libDir, "design-system.json"));
  }

  let notes = fs.existsSync(notesPath)
    ? fs.readFileSync(notesPath, "utf8")
    : `# Build notes - ${input.slug}\n`;

  const screenshotSrc = findScreenshotSource(input.slug);
  const screenshotDest = path.join(libDir, "screenshot.png");
  if (screenshotSrc) {
    fs.copyFileSync(screenshotSrc, screenshotDest);
  } else if (!notes.includes("TODO: library screenshot")) {
    notes += `\n\nTODO: library screenshot - run npm run review then redeploy to copy screenshots/${input.slug}/desktop/01-hero.png\n`;
  }

  if (input.liveUrl && !notes.includes(input.liveUrl)) {
    notes += `\n\nLive URL: ${input.liveUrl}\n`;
  }

  fs.writeFileSync(path.join(libDir, "build-notes.md"), notes);
  if (fs.existsSync(notesPath)) {
    fs.writeFileSync(notesPath, notes);
  }

  const design = readDesignSystem(input.siteDir);
  const fonts = `${input.displayFont} + ${input.bodyFont}`;
  const palette = input.paletteSummary || paletteFromDesign(design);
  const url = input.liveUrl ?? "(pending deploy)";

  const row = `| ${input.slug} | ${input.trade} | ${input.direction} | ${fonts} | ${palette} | ${url} | ${input.vibe} |`;
  upsertIndexRow(input.slug, row);

  console.log(`Library updated: library/${input.slug}/`);
}

export function syncLibraryFromSite(
  slug: string,
  siteDir: string,
  lead: { niche: string | null; business_name: string },
  liveUrl: string | null
): void {
  const design = readDesignSystem(siteDir);
  const trade = lead.niche ?? design?.trade ?? "trade";
  const direction = design?.direction ?? "custom";
  const displayFont = design?.fonts?.display ?? "Syne";
  const bodyFont = design?.fonts?.body ?? "DM Sans";

  syncToLibrary({
    slug,
    trade,
    direction,
    displayFont,
    bodyFont,
    paletteSummary: paletteFromDesign(design),
    liveUrl,
    vibe: `${lead.business_name} - ${direction}`,
    siteDir,
  });
}
