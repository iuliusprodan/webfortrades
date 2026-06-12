/**
 * Distinct creative directions for the ten-build batch.
 * Mirrors batch_sites.ts assignDirections logic.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadRecentDesignUsage,
  paletteKeyFromColors,
  PALETTE_PRESETS,
  FONT_PAIRS,
  HERO_HEADLINES,
  type CreativeConstraint,
  type FontPairKey,
  type LayoutFamily,
} from "./design_direction.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

export interface BatchLeadRow {
  row: number;
  slug: string;
  business_name: string;
  niche: string;
  city: string;
}

const DIRECTION_POOL: (CreativeConstraint & { label: string })[] = [
  { label: "trust blue technical", paletteKey: "trust-blue", fontPairKey: "archivo-ibm-plex", layoutFamily: "split-hero-editorial", heroHeadlineKey: "heating-you-can-trust" },
  { label: "navy brass heating", paletteKey: "navy-brass-heating", fontPairKey: "space-grotesk-inter", layoutFamily: "full-bleed-hero", heroHeadlineKey: "warm-homes-reliable-heating" },
  { label: "forest green practical", paletteKey: "forest-green", fontPairKey: "work-sans-merriweather", layoutFamily: "stacked-hero-proof", heroHeadlineKey: "precise-plumbing-local" },
  { label: "slate blue clean", paletteKey: "slate-plumbing", fontPairKey: "manrope-source-serif", layoutFamily: "compact-local", heroHeadlineKey: "local-plumber-clear-quotes" },
  { label: "charcoal orange industrial", paletteKey: "charcoal-orange", fontPairKey: "space-mono-ibm-plex", layoutFamily: "split-hero-editorial", heroHeadlineKey: "emergency-to-refit" },
  { label: "warm cream premium bathroom", paletteKey: "warm-cream-bathroom", fontPairKey: "inter-fraunces", layoutFamily: "full-bleed-hero", heroHeadlineKey: "bathroom-pipework-properly" },
  { label: "white green local friendly", paletteKey: "white-green-friendly", fontPairKey: "dm-sans-lora", layoutFamily: "stacked-hero-proof", heroHeadlineKey: "pipes-heating-done-right" },
  { label: "dark steel operations", paletteKey: "steel-blue-ops", fontPairKey: "syne-dm-sans", layoutFamily: "compact-local", heroHeadlineKey: "plumbing-sorted" },
  { label: "burgundy graphite premium", paletteKey: "burgundy-graphite", fontPairKey: "inter-fraunces", layoutFamily: "stacked-hero-proof", heroHeadlineKey: "south-wales-plumbing" },
];

const LAYOUT_FAMILIES: LayoutFamily[] = [
  "split-hero-editorial",
  "full-bleed-hero",
  "stacked-hero-proof",
  "compact-local",
];

interface UsedKeys {
  palettes: Set<string>;
  fonts: Set<string>;
  heroes: Set<string>;
  layouts: Set<string>;
}

function collectUsedKeys(): UsedKeys {
  const used: UsedKeys = {
    palettes: new Set(),
    fonts: new Set(),
    heroes: new Set(),
    layouts: new Set(),
  };
  const sitesDir = path.join(ROOT, "sites");
  if (fs.existsSync(sitesDir)) {
    for (const slug of fs.readdirSync(sitesDir)) {
      const dsPath = path.join(sitesDir, slug, "data", "design-system.json");
      if (!fs.existsSync(dsPath)) continue;
      try {
        const ds = JSON.parse(fs.readFileSync(dsPath, "utf8")) as {
          colors?: { accent?: string };
          fontPairKey?: string;
          heroHeadlineKey?: string;
          layoutFamily?: string;
        };
        if (ds.colors?.accent) {
          const pk = paletteKeyFromColors(ds.colors as { accent: string } & Record<string, string>);
          if (pk) used.palettes.add(pk);
        }
        if (ds.fontPairKey) used.fonts.add(ds.fontPairKey);
        if (ds.heroHeadlineKey) used.heroes.add(ds.heroHeadlineKey);
        if (ds.layoutFamily) used.layouts.add(ds.layoutFamily);
      } catch {
        /* skip */
      }
    }
  }
  for (const r of loadRecentDesignUsage(ROOT)) {
    if (r.paletteKey) used.palettes.add(r.paletteKey);
    if (r.fontPairKey) used.fonts.add(r.fontPairKey);
    if (r.heroHeadlineKey) used.heroes.add(r.heroHeadlineKey);
    if (r.layoutFamily) used.layouts.add(r.layoutFamily);
  }
  return used;
}

/** Assign one distinct creative direction per lead slot. */
export function assignDirectionsForBatch(count: number): (CreativeConstraint & { label: string })[] {
  const used = collectUsedKeys();
  const result: (CreativeConstraint & { label: string })[] = [];

  const takePalette = () => PALETTE_PRESETS.find((p) => !used.palettes.has(p.key))?.key;
  const takeFont = () => FONT_PAIRS.find((f) => !used.fonts.has(f.key))?.key;
  const takeHero = () => HERO_HEADLINES.find((h) => !used.heroes.has(h.key))?.key;
  const takeLayout = () =>
    LAYOUT_FAMILIES.find((l) => !used.layouts.has(l)) ??
    LAYOUT_FAMILIES[result.length % LAYOUT_FAMILIES.length]!;

  for (let i = 0; i < count; i++) {
    let pick: (CreativeConstraint & { label: string }) | null = null;

    const poolEntry = DIRECTION_POOL.find(
      (d) =>
        !used.palettes.has(d.paletteKey!) &&
        !used.fonts.has(d.fontPairKey!) &&
        !used.heroes.has(d.heroHeadlineKey!)
    );
    if (poolEntry) {
      pick = poolEntry;
    } else {
      const paletteKey = takePalette();
      const fontPairKey = takeFont();
      const heroHeadlineKey = takeHero();
      if (paletteKey && fontPairKey && heroHeadlineKey) {
        pick = {
          label: `${paletteKey} composed`,
          paletteKey,
          fontPairKey: fontPairKey as FontPairKey,
          layoutFamily: takeLayout(),
          heroHeadlineKey,
        };
      }
    }

    if (!pick) {
      result.push({ label: `auto (no distinct direction left, slot ${i})` });
      continue;
    }

    used.palettes.add(pick.paletteKey!);
    used.fonts.add(pick.fontPairKey!);
    used.heroes.add(pick.heroHeadlineKey!);
    if (pick.layoutFamily) used.layouts.add(pick.layoutFamily);
    result.push(pick);
  }

  return result;
}
