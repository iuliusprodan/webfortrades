import fs from "node:fs";
import path from "node:path";
import { briefDir } from "./site_config.js";
import { PALETTE_PRESETS } from "./image_generate_palette.js";

export type NicheKey =
  | "plumbing_heating"
  | "electrician"
  | "roofer"
  | "painter_decorator"
  | "default";

export interface DesignDirectionInput {
  slug: string;
  label?: string;
  paletteKey?: string;
  fontPairKey?: string;
  layoutFamily?: string;
  tone?: string;
  niche: NicheKey;
}

export interface BuiltPrompt {
  niche: NicheKey;
  basePrompt: string;
  styleSuffix: string;
  negativeConstraints: string;
  fullPrompt: string;
  altText: string;
}

const NICHE_BASE_PROMPTS: Record<NicheKey, string> = {
  plumbing_heating:
    "close-up of polished copper pipework with soft natural light, shallow depth of field, neutral background, editorial photography style",
  electrician:
    "close-up of brushed steel switchgear and braided wiring on a dark workbench, dramatic side light, editorial photography style",
  roofer:
    "close-up of wet slate tiles after rain, soft overcast light, fine texture, editorial photography style",
  painter_decorator:
    "close-up of freshly painted timber panel with brush strokes catching warm light, calm neutral palette, editorial photography style",
  default:
    "abstract architectural texture in muted tones, soft natural light, editorial photography style",
};

const NICHE_ALT_TEXT: Record<NicheKey, string> = {
  plumbing_heating: "Abstract polished copper pipework texture",
  electrician: "Abstract brushed steel switchgear and wiring texture",
  roofer: "Abstract wet slate tile texture",
  painter_decorator: "Abstract freshly painted timber panel texture",
  default: "Abstract architectural texture in muted tones",
};

const NEGATIVE_CONSTRAINTS =
  "no text, no logos, no watermarks, no people, no faces, no vehicles, no signage, no UK street names, no brand marks, photorealistic, no illustration";

export function detectNiche(raw: string, tradeNiche?: string): NicheKey {
  if (tradeNiche?.trim()) {
    const fromTrade = detectNicheFromText(tradeNiche);
    if (fromTrade !== "default") return fromTrade;
  }
  return detectNicheFromText(raw);
}

function detectNicheFromText(raw: string): NicheKey {
  const s = raw.toLowerCase();
  if (/electric|electrical/.test(s)) return "electrician";
  if (/plumb|heat|boiler|bathroom|gas/.test(s)) return "plumbing_heating";
  if (/roof|roofer|slate|tile roof/.test(s)) return "roofer";
  if (/paint|decor|wallpaper/.test(s)) return "painter_decorator";
  return "default";
}

function paletteStyleSuffix(paletteKey?: string, label?: string): string {
  const preset = PALETTE_PRESETS.find((p) => p.key === paletteKey);
  if (preset) {
    return `Colour mood: ${preset.label.toLowerCase()}, accent ${preset.colors.accent}, background ${preset.colors.background}.`;
  }
  if (label?.trim()) {
    return `Colour mood: ${label.toLowerCase()}.`;
  }
  return "Colour mood: muted neutral trade palette.";
}

function toneSuffix(tone?: string): string {
  if (!tone?.trim()) return "Tone: assured, plain, professional.";
  return `Tone: ${tone.trim().replace(/\.$/, "")}.`;
}

export function buildPrompt(input: DesignDirectionInput): BuiltPrompt {
  const basePrompt = NICHE_BASE_PROMPTS[input.niche];
  const styleSuffix = `${paletteStyleSuffix(input.paletteKey, input.label)} ${toneSuffix(input.tone)}`;
  const fullPrompt = `${basePrompt}. ${styleSuffix} ${NEGATIVE_CONSTRAINTS}.`;
  return {
    niche: input.niche,
    basePrompt,
    styleSuffix: styleSuffix.trim(),
    negativeConstraints: NEGATIVE_CONSTRAINTS,
    fullPrompt,
    altText: NICHE_ALT_TEXT[input.niche],
  };
}

export function loadDesignDirection(slug: string): DesignDirectionInput {
  const dir = briefDir(slug);
  const directionPath = path.join(dir, "design-direction.json");
  if (!fs.existsSync(directionPath)) {
    console.error(`Missing design-direction.json for slug "${slug}".`);
    console.error(`Expected: briefs/${slug}/design-direction.json`);
    process.exit(1);
  }

  const direction = JSON.parse(fs.readFileSync(directionPath, "utf8")) as {
    slug?: string;
    label?: string;
    paletteKey?: string;
    fontPairKey?: string;
    layoutFamily?: string;
  };

  let nicheRaw = direction.label ?? "";
  let tone: string | undefined;
  let tradeNiche: string | undefined;

  const creativeBriefPath = path.join(dir, "creative-brief.json");
  if (fs.existsSync(creativeBriefPath)) {
    const cb = JSON.parse(fs.readFileSync(creativeBriefPath, "utf8")) as {
      trade_niche?: string;
      chosen_tone_of_voice?: string;
      chosen_colour_palette?: string;
    };
    tradeNiche = cb.trade_niche;
    nicheRaw = [nicheRaw, cb.trade_niche].filter(Boolean).join(" ");
    tone = cb.chosen_tone_of_voice;
    if (!direction.paletteKey && cb.chosen_colour_palette) {
      direction.paletteKey = cb.chosen_colour_palette;
    }
  }

  const briefPath = path.join(dir, "brief.json");
  if (fs.existsSync(briefPath)) {
    const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as {
      niche?: string;
      services?: string[];
    };
    nicheRaw = [nicheRaw, brief.niche, ...(brief.services ?? [])].filter(Boolean).join(" ");
  }

  return {
    slug,
    label: direction.label,
    paletteKey: direction.paletteKey,
    fontPairKey: direction.fontPairKey,
    layoutFamily: direction.layoutFamily,
    tone,
    niche: detectNiche(nicheRaw, tradeNiche),
  };
}

export function adjustPromptForFailure(
  base: BuiltPrompt,
  failures: string[]
): BuiltPrompt {
  const additions: string[] = [];
  for (const f of failures) {
    if (f.includes("face")) {
      additions.push("absolutely no people, no faces, no portraits, no human skin, empty scene only");
    }
    if (f.includes("text")) {
      additions.push("zero text, zero letters, zero numbers, zero signage, blank surfaces only");
    }
    if (f.includes("luminance_low") || f.includes("flat")) {
      additions.push("more contrast, richer mid-tones, visible surface detail");
    }
    if (f.includes("luminance_high")) {
      additions.push("softer highlights, avoid blown-out whites");
    }
    if (f.includes("dimension") || f.includes("aspect")) {
      additions.push("full frame composition filling the entire canvas edge to edge");
    }
    if (f.includes("file_size")) {
      additions.push("rich photographic detail, natural texture variation");
    }
  }
  const extra = [...new Set(additions)].join(". ");
  const fullPrompt = extra ? `${base.fullPrompt} ${extra}.` : base.fullPrompt;
  return { ...base, fullPrompt };
}
