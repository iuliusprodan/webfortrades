import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export interface DesignColors {
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  surface: string;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function saturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function pickAccent(samples: { r: number; g: number; b: number }[]): string {
  const ranked = [...samples]
    .map((c) => ({ ...c, sat: saturation(c.r, c.g, c.b) }))
    .filter((c) => c.sat > 0.15)
    .sort((a, b) => b.sat - a.sat);

  const pick = ranked[0] ?? samples[Math.floor(samples.length / 3)] ?? samples[0];
  return rgbToHex(pick.r, pick.g, pick.b);
}

function ensureAaContrast(fg: string, bg: string, min = 4.5): string {
  if (contrastRatio(fg, bg) >= min) return fg;
  const { r, g, b } = hexToRgb(fg);
  const darken = relativeLuminance(bg) > 0.5;
  const factor = darken ? 0.55 : 1.45;
  const adj = rgbToHex(
    Math.min(255, r * factor),
    Math.min(255, g * factor),
    Math.min(255, b * factor)
  );
  return contrastRatio(adj, bg) >= min ? adj : darken ? "#1a1a1a" : "#f5f5f4";
}

export async function extractPalette(imagePaths: string[]): Promise<DesignColors> {
  const samples: { r: number; g: number; b: number }[] = [];

  for (const imgPath of imagePaths.slice(0, 8)) {
    if (!fs.existsSync(imgPath)) continue;
    try {
      const { data, info } = await sharp(imgPath)
        .resize(64, 64, { fit: "cover" })
        .raw()
        .toBuffer({ resolveWithObject: true });

      for (let i = 0; i < data.length; i += info.channels * 8) {
        samples.push({
          r: data[i],
          g: data[i + 1],
          b: data[i + 2],
        });
      }
    } catch {
      /* skip bad image */
    }
  }

  if (samples.length === 0) {
    return {
      accent: "#c45c26",
      accentForeground: "#ffffff",
      background: "#faf8f5",
      foreground: "#1c1917",
      muted: "#e7e5e4",
      mutedForeground: "#57534e",
      border: "#d6d3d1",
      surface: "#ffffff",
    };
  }

  const accent = pickAccent(samples);
  const background = "#faf8f5";
  const foreground = ensureAaContrast("#1c1917", background);
  const accentForeground =
    contrastRatio("#ffffff", accent) >= 4.5
      ? "#ffffff"
      : ensureAaContrast("#1c1917", accent, 4.5);

  return {
    accent,
    accentForeground,
    background,
    foreground,
    muted: "#e7e5e4",
    mutedForeground: "#57534e",
    border: "#d6d3d1",
    surface: "#ffffff",
  };
}

export async function extractPaletteFromDir(imagesDir: string): Promise<DesignColors> {
  if (!fs.existsSync(imagesDir)) return extractPalette([]);
  const files = fs
    .readdirSync(imagesDir)
    .filter((f) => /\.(webp|jpg|jpeg|png)$/i.test(f))
    .map((f) => path.join(imagesDir, f));
  return extractPalette(files);
}
