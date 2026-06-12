import fs from "node:fs";
import path from "node:path";
import type { DesignColors } from "./palette.js";

export type FontPairKey =
  | "inter-fraunces"
  | "space-grotesk-inter"
  | "dm-sans-lora"
  | "archivo-ibm-plex"
  | "manrope-source-serif"
  | "work-sans-merriweather"
  | "syne-dm-sans"
  | "space-mono-ibm-plex";

export type LayoutFamily =
  | "split-hero-editorial"
  | "full-bleed-hero"
  | "stacked-hero-proof"
  | "compact-local";

export type StatsStyle = "centered-row" | "band-cards" | "inline-strip";
export type ReviewsStyle = "two-column-grid" | "stacked-quotes" | "single-featured";
export type GalleryStyle = "standard-grid" | "compact-row" | "featured-plus-pair";
export type CtaStyle = "rounded-pill" | "sharp-block" | "outline-band";

export interface FontPairDef {
  key: FontPairKey;
  display: string;
  body: string;
  label: string;
}

export interface PalettePreset {
  key: string;
  label: string;
  colors: DesignColors;
}

export interface DesignDirectionSelection {
  direction: string;
  fontPairKey: FontPairKey;
  fonts: { display: string; body: string };
  layoutFamily: LayoutFamily;
  statsStyle: StatsStyle;
  reviewsStyle: ReviewsStyle;
  galleryStyle: GalleryStyle;
  ctaStyle: CtaStyle;
  separator: string;
  colors: DesignColors;
  heroHeadline: string;
  heroHeadlineKey: string;
  toneOfVoice: string;
  imageTreatment: string;
  sectionRhythm: string;
  inspiredBy: string | null;
  deliberatelyDifferentFrom: string[];
  reasonForChoices: string;
}

const FONT_PAIRS: FontPairDef[] = [
  { key: "inter-fraunces", display: "Fraunces", body: "Inter", label: "Trustworthy local service" },
  { key: "space-grotesk-inter", display: "Space Grotesk", body: "Inter", label: "Modern technical" },
  { key: "dm-sans-lora", display: "Lora", body: "DM Sans", label: "Friendly family trade" },
  { key: "archivo-ibm-plex", display: "Archivo", body: "IBM Plex Sans", label: "Industrial heating/plumbing" },
  { key: "manrope-source-serif", display: "Source Serif 4", body: "Manrope", label: "Clean minimal" },
  { key: "work-sans-merriweather", display: "Merriweather", body: "Work Sans", label: "Practical trade" },
  { key: "syne-dm-sans", display: "Syne", body: "DM Sans", label: "Quiet premium editorial" },
  { key: "space-mono-ibm-plex", display: "Space Mono", body: "IBM Plex Sans", label: "Technical industrial monospace" },
];

const PALETTE_PRESETS: PalettePreset[] = [
  {
    key: "trust-blue",
    label: "Deep blue trust",
    colors: {
      accent: "#1a8fd1",
      accentForeground: "#ffffff",
      background: "#f4f8fc",
      foreground: "#0c2d4a",
      muted: "#dbeafe",
      mutedForeground: "#475569",
      border: "#bfdbfe",
      surface: "#ffffff",
    },
  },
  {
    key: "navy-brass-heating",
    label: "Navy, warm cream, brass",
    colors: {
      accent: "#c9a227",
      accentForeground: "#1a1208",
      background: "#f5f0e8",
      foreground: "#0c2d4a",
      muted: "#e8e0d4",
      mutedForeground: "#4a5568",
      border: "#d4c4a8",
      surface: "#ffffff",
    },
  },
  {
    key: "forest-green",
    label: "Forest green, cream, charcoal",
    colors: {
      accent: "#2d5a3d",
      accentForeground: "#ffffff",
      background: "#f6f8f4",
      foreground: "#1c2420",
      muted: "#dce8de",
      mutedForeground: "#4b5c52",
      border: "#c5d4c9",
      surface: "#ffffff",
    },
  },
  {
    key: "slate-plumbing",
    label: "Slate, pale blue, off-white",
    colors: {
      accent: "#3d5a73",
      accentForeground: "#ffffff",
      background: "#f7f9fb",
      foreground: "#1e293b",
      muted: "#e2e8f0",
      mutedForeground: "#64748b",
      border: "#cbd5e1",
      surface: "#ffffff",
    },
  },
  {
    key: "charcoal-orange",
    label: "Charcoal, white, safety orange",
    colors: {
      accent: "#e85d04",
      accentForeground: "#ffffff",
      background: "#f5f5f4",
      foreground: "#1c1917",
      muted: "#e7e5e4",
      mutedForeground: "#57534e",
      border: "#d6d3d1",
      surface: "#ffffff",
    },
  },
  {
    key: "burgundy-graphite",
    label: "Burgundy, cream, graphite",
    colors: {
      accent: "#7c2d3a",
      accentForeground: "#ffffff",
      background: "#faf7f5",
      foreground: "#292524",
      muted: "#e7e5e4",
      mutedForeground: "#57534e",
      border: "#d6d3d1",
      surface: "#ffffff",
    },
  },
  {
    key: "warm-cream-bathroom",
    label: "Warm cream, terracotta, premium bathroom",
    colors: {
      accent: "#b15c38",
      accentForeground: "#ffffff",
      background: "#faf4ec",
      foreground: "#2b2018",
      muted: "#efe3d4",
      mutedForeground: "#6b5847",
      border: "#e0cdb8",
      surface: "#ffffff",
    },
  },
  {
    key: "white-green-friendly",
    label: "White, fresh green, friendly local",
    colors: {
      accent: "#1f9d57",
      accentForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#13241a",
      muted: "#e6f4ec",
      mutedForeground: "#4a6354",
      border: "#cfe7d8",
      surface: "#f6fbf8",
    },
  },
  {
    key: "steel-blue-ops",
    label: "Dark steel, ice blue, operations",
    colors: {
      accent: "#4f7fa8",
      accentForeground: "#ffffff",
      background: "#eef1f4",
      foreground: "#16202b",
      muted: "#dde3ea",
      mutedForeground: "#566472",
      border: "#c3cdd8",
      surface: "#ffffff",
    },
  },
];

const HERO_HEADLINES: { key: string; text: string; trades: RegExp }[] = [
  { key: "plumbing-sorted", text: "Plumbing sorted properly.", trades: /plumb/ },
  { key: "heating-you-can-trust", text: "Heating you can trust.", trades: /heat|boiler|radiator/ },
  { key: "local-plumber-clear-quotes", text: "Local plumber. Clear quotes.", trades: /plumb/ },
  { key: "pipes-heating-done-right", text: "Pipes and heating, done right.", trades: /plumb|heat/ },
  { key: "bathroom-pipework-properly", text: "Bathroom and pipework, done properly.", trades: /bathroom|plumb/ },
  { key: "warm-homes-reliable-heating", text: "Warm homes. Reliable heating.", trades: /heat|boiler/ },
  { key: "precise-plumbing-local", text: "Precise plumbing, local and reliable.", trades: /plumb|precise/ },
  { key: "emergency-to-refit", text: "From emergency leaks to full refits.", trades: /plumb|emergency/ },
  { key: "south-wales-plumbing", text: "South Wales plumbing, done properly.", trades: /plumb|heat/ },
];

export interface RecentDesignUsage {
  slug: string;
  paletteKey?: string;
  fontPairKey?: FontPairKey;
  layoutFamily?: LayoutFamily;
  heroHeadlineKey?: string;
  direction?: string;
}

/**
 * Pre-assigned creative direction constraint. Used by the batch orchestrator to
 * force distinct directions across parallel builds (workers cannot see each
 * other's anti-reuse history while building concurrently).
 */
export interface CreativeConstraint {
  label?: string;
  paletteKey?: string;
  fontPairKey?: FontPairKey;
  layoutFamily?: LayoutFamily;
  heroHeadlineKey?: string;
}

function normaliseKey(s: string): string {
  return s.trim().toLowerCase();
}

export function loadRecentDesignUsage(root: string, excludeSlug?: string): RecentDesignUsage[] {
  const recent: RecentDesignUsage[] = [];
  const sitesDir = path.join(root, "sites");
  const libraryPath = path.join(root, "library", "index.md");

  if (fs.existsSync(sitesDir)) {
    for (const slug of fs.readdirSync(sitesDir)) {
      if (excludeSlug && slug === excludeSlug) continue;
      const dsPath = path.join(sitesDir, slug, "data", "design-system.json");
      const briefPath = path.join(root, "briefs", slug, "creative-brief.json");
      if (fs.existsSync(briefPath)) {
        try {
          const cb = JSON.parse(fs.readFileSync(briefPath, "utf8")) as {
            chosen_colour_palette?: string;
            chosen_fonts?: string;
            chosen_layout_direction?: string;
            slug?: string;
          };
          recent.push({
            slug,
            paletteKey: cb.chosen_colour_palette,
            layoutFamily: cb.chosen_layout_direction as LayoutFamily,
          });
        } catch {
          /* skip */
        }
      }
      if (fs.existsSync(dsPath)) {
        try {
          const ds = JSON.parse(fs.readFileSync(dsPath, "utf8")) as {
            fontPairKey?: FontPairKey;
            layoutFamily?: LayoutFamily;
            heroHeadlineKey?: string;
            direction?: string;
            colors?: { accent?: string };
          };
          const entry = recent.find((r) => r.slug === slug) ?? { slug };
          entry.fontPairKey = ds.fontPairKey;
          entry.layoutFamily = ds.layoutFamily ?? entry.layoutFamily;
          entry.heroHeadlineKey = ds.heroHeadlineKey;
          entry.direction = ds.direction;
          if (!recent.find((r) => r.slug === slug)) recent.push(entry);
        } catch {
          /* skip */
        }
      }
    }
  }

  if (fs.existsSync(libraryPath)) {
    const lines = fs.readFileSync(libraryPath, "utf8").split("\n");
    for (const line of lines) {
      if (!line.startsWith("|") || line.includes("slug")) continue;
      const cols = line.split("|").map((c) => c.trim());
      const slug = cols[1];
      if (!slug || slug === "slug" || (excludeSlug && slug === excludeSlug)) continue;
      if (recent.some((r) => r.slug === slug)) continue;
      recent.push({
        slug,
        direction: cols[3],
        fontPairKey: undefined,
        layoutFamily: undefined,
      });
    }
  }

  return recent.slice(-12);
}

function businessBlob(input: {
  businessName: string;
  services: string[];
  reviewsBlob: string;
  niche: string | null;
}): string {
  return [input.businessName, ...input.services, input.reviewsBlob, input.niche ?? ""]
    .join(" ")
    .toLowerCase();
}

function pickPalette(
  presets: PalettePreset[],
  recent: RecentDesignUsage[],
  blob: string,
  logoColors: string[],
  nameSuggestsGreen: boolean
): PalettePreset {
  const usedKeys = new Set(recent.map((r) => r.paletteKey).filter(Boolean));

  let ranked = [...presets];
  if (nameSuggestsGreen) {
    ranked.sort((a, b) => (a.key === "forest-green" ? -1 : b.key === "forest-green" ? 1 : 0));
  }
  if (/heat|boiler|radiator|gas/.test(blob)) {
    ranked.sort((a, b) =>
      a.key === "navy-brass-heating" ? -1 : b.key === "navy-brass-heating" ? 1 : 0
    );
  }
  if (/emergency|24/.test(blob)) {
    ranked.sort((a, b) => (a.key === "trust-blue" ? -1 : b.key === "trust-blue" ? 1 : 0));
  }

  for (const preset of ranked) {
    if (!usedKeys.has(preset.key)) return preset;
  }
  return ranked[0]!;
}

function pickFontPair(recent: RecentDesignUsage[], blob: string): FontPairDef {
  const used = new Set(recent.map((r) => r.fontPairKey).filter(Boolean));
  let ranked = [...FONT_PAIRS];
  if (/heat|boiler|industrial|gas/.test(blob)) {
    ranked.sort((a, b) =>
      a.key === "space-grotesk-inter" || a.key === "archivo-ibm-plex"
        ? -1
        : b.key === "space-grotesk-inter" || b.key === "archivo-ibm-plex"
          ? 1
          : 0
    );
  }
  if (/family|friendly|local/.test(blob)) {
    ranked.sort((a, b) => (a.key === "dm-sans-lora" ? -1 : b.key === "dm-sans-lora" ? 1 : 0));
  }
  for (const pair of ranked) {
    if (!used.has(pair.key)) return pair;
  }
  return ranked.find((p) => p.key !== "work-sans-merriweather") ?? ranked[0]!;
}

function pickLayout(
  recent: RecentDesignUsage[],
  photoCount: number,
  forcedLayout: LayoutFamily | null = null
): {
  layoutFamily: LayoutFamily;
  statsStyle: StatsStyle;
  reviewsStyle: ReviewsStyle;
  galleryStyle: GalleryStyle;
  ctaStyle: CtaStyle;
} {
  const usedLayouts = new Set(recent.map((r) => r.layoutFamily).filter(Boolean));
  const options: {
    layoutFamily: LayoutFamily;
    statsStyle: StatsStyle;
    reviewsStyle: ReviewsStyle;
    galleryStyle: GalleryStyle;
    ctaStyle: CtaStyle;
  }[] = [
    {
      layoutFamily: "split-hero-editorial",
      statsStyle: "centered-row",
      reviewsStyle: "two-column-grid",
      galleryStyle: photoCount <= 4 ? "compact-row" : "standard-grid",
      ctaStyle: "rounded-pill",
    },
    {
      layoutFamily: "full-bleed-hero",
      statsStyle: "band-cards",
      reviewsStyle: "stacked-quotes",
      galleryStyle: "standard-grid",
      ctaStyle: "sharp-block",
    },
    {
      layoutFamily: "stacked-hero-proof",
      statsStyle: "inline-strip",
      reviewsStyle: "single-featured",
      galleryStyle: "featured-plus-pair",
      ctaStyle: "outline-band",
    },
    {
      layoutFamily: "compact-local",
      statsStyle: "inline-strip",
      reviewsStyle: "two-column-grid",
      galleryStyle: "compact-row",
      ctaStyle: "rounded-pill",
    },
  ];

  if (forcedLayout) {
    const forced = options.find((o) => o.layoutFamily === forcedLayout);
    if (forced) return forced;
  }

  for (const opt of options) {
    if (!usedLayouts.has(opt.layoutFamily)) return opt;
  }
  return options[photoCount <= 4 ? 3 : 1]!;
}

function pickHeroHeadline(
  blob: string,
  basedCity: string | null,
  recent: RecentDesignUsage[]
): { key: string; text: string } {
  const used = new Set(recent.map((r) => r.heroHeadlineKey).filter(Boolean));
  const candidates = HERO_HEADLINES.filter((h) => h.trades.test(blob));
  const pool = candidates.length ? candidates : HERO_HEADLINES;

  if (basedCity && /swansea|neath|llanelli|port talbot|south wales/i.test(basedCity)) {
    const swansea = pool.find((h) => h.key === "south-wales-plumbing");
    if (swansea && !used.has(swansea.key)) return swansea;
  }

  for (const h of pool) {
    if (!used.has(h.key) && h.key !== "plumbing-sorted") return h;
  }
  for (const h of pool) {
    if (!used.has(h.key)) return h;
  }
  return pool[0] ?? HERO_HEADLINES[2]!;
}

function directionLabel(
  palette: PalettePreset,
  fonts: FontPairDef,
  layout: LayoutFamily
): string {
  return `${palette.key}-${fonts.key}-${layout}`.replace(/-/g, "_");
}

export function chooseDesignDirection(input: {
  slug: string;
  businessName: string;
  services: string[];
  reviewsBlob: string;
  niche: string | null;
  basedCity: string | null;
  photoCount: number;
  logoColors: string[];
  root: string;
  constraint?: CreativeConstraint | null;
}): DesignDirectionSelection {
  const recent = loadRecentDesignUsage(input.root, input.slug);
  const blob = businessBlob(input);
  const nameSuggestsGreen = /green/i.test(input.businessName);
  const constraint = input.constraint ?? null;

  const forcedPalette = constraint?.paletteKey
    ? PALETTE_PRESETS.find((p) => p.key === constraint.paletteKey)
    : undefined;
  const palette =
    forcedPalette ??
    pickPalette(PALETTE_PRESETS, recent, blob, input.logoColors, nameSuggestsGreen);

  const forcedFonts = constraint?.fontPairKey
    ? FONT_PAIRS.find((f) => f.key === constraint.fontPairKey)
    : undefined;
  const fonts = forcedFonts ?? pickFontPair(recent, blob);

  const layout = pickLayout(recent, input.photoCount, constraint?.layoutFamily ?? null);

  const forcedHero = constraint?.heroHeadlineKey
    ? HERO_HEADLINES.find((h) => h.key === constraint.heroHeadlineKey)
    : undefined;
  const hero = forcedHero
    ? { key: forcedHero.key, text: forcedHero.text }
    : pickHeroHeadline(blob, input.basedCity, recent);
  const recentSlugs = recent.slice(-3).map((r) => r.slug);

  let reason = `Palette "${palette.label}" and fonts ${fonts.display} + ${fonts.body} chosen for ${input.businessName}.`;
  if (nameSuggestsGreen) reason += " Business name suggests a restrained green accent.";
  if (/heat|boiler/.test(blob)) reason += " Heating signals in name/reviews support a warmer technical feel.";
  if (input.photoCount <= 4) reason += " Few photos: compact proof layout, not a large gallery grid.";
  if (input.photoCount <= 2) {
    reason += " Very weak image set: use proof-led or typography-led layout, never placeholder photo boxes.";
  }

  const inspiredBy =
    palette.key === "trust-blue"
      ? "test-plumbing (reference only, not cloned)"
      : palette.key === "navy-brass-heating"
        ? "library heating direction (reference only)"
        : palette.key === "forest-green"
          ? "decorator warmth + green accent (reference only)"
          : null;

  return {
    direction: directionLabel(palette, fonts, layout.layoutFamily),
    fontPairKey: fonts.key,
    fonts: { display: fonts.display, body: fonts.body },
    ...layout,
    separator: layout.layoutFamily === "full-bleed-hero" ? "/" : layout.ctaStyle === "outline-band" ? "·" : "◆",
    colors: palette.colors,
    heroHeadline: hero.text,
    heroHeadlineKey: hero.key,
    toneOfVoice: /precise|professional|quality/.test(blob)
      ? "Assured, precise, plain English"
      : "Friendly local trade, plain British English",
    imageTreatment:
      input.photoCount <= 4 ? "Hero-led, minimal gallery" : "Mixed project proof, clustered for diversity",
    sectionRhythm:
      layout.layoutFamily === "compact-local"
        ? "Hero, stats strip, services forward, compact proof, reviews, contact"
        : "Hero, proof, owner note, services, reviews, area, contact",
    inspiredBy,
    deliberatelyDifferentFrom: recentSlugs.filter((s) => s !== input.slug),
    reasonForChoices: reason,
  };
}

export function paletteKeyFromColors(colors: DesignColors): string | null {
  for (const preset of PALETTE_PRESETS) {
    if (normaliseKey(preset.colors.accent) === normaliseKey(colors.accent)) return preset.key;
  }
  return null;
}

export { FONT_PAIRS, PALETTE_PRESETS, HERO_HEADLINES };
