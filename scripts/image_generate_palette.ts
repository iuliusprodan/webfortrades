/** Palette labels for prompt style suffixes (subset of design_direction presets). */

export interface PaletteColors {
  accent: string;
  background: string;
}

export interface PalettePresetLite {
  key: string;
  label: string;
  colors: PaletteColors;
}

export const PALETTE_PRESETS: PalettePresetLite[] = [
  {
    key: "trust-blue",
    label: "Deep blue trust",
    colors: { accent: "#1a8fd1", background: "#f4f8fc" },
  },
  {
    key: "navy-brass-heating",
    label: "Navy, brass and warm white",
    colors: { accent: "#c9a227", background: "#f5f0e8" },
  },
  {
    key: "forest-green",
    label: "Forest green and ivory",
    colors: { accent: "#2d5a3d", background: "#f6f8f4" },
  },
  {
    key: "slate-plumbing",
    label: "Slate blue and clean white",
    colors: { accent: "#3d5a73", background: "#f7f9fb" },
  },
  {
    key: "charcoal-orange",
    label: "Charcoal, white, safety orange",
    colors: { accent: "#e85d04", background: "#f5f5f4" },
  },
  {
    key: "warm-cream-bathroom",
    label: "Warm cream, terracotta, premium bathroom",
    colors: { accent: "#b15c38", background: "#faf4ec" },
  },
  {
    key: "steel-blue-ops",
    label: "Steel blue operations",
    colors: { accent: "#4f7fa8", background: "#eef1f4" },
  },
  {
    key: "white-green-friendly",
    label: "White, green, friendly local",
    colors: { accent: "#2d6a4f", background: "#f8faf8" },
  },
];
