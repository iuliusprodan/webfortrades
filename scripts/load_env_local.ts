import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const vars: Record<string, string> = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

/** Load `.env.local` first, then merge process.env (process wins). */
export function loadEnvLocal(): Record<string, string> {
  const localPath = path.join(ROOT, ".env.local");
  const fromFile = parseEnvFile(localPath);
  return { ...fromFile, ...process.env } as Record<string, string>;
}

export function requireGeminiEnv(): {
  apiKey: string;
  modelPro: string;
  modelFast: string;
} {
  const env = loadEnvLocal();
  const apiKey = env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "GEMINI_API_KEY is missing. Add it to .env.local (see .env.example for variable names)."
    );
    process.exit(1);
  }
  const modelPro = env.GEMINI_IMAGE_MODEL?.trim() || "gemini-3-pro-image-preview";
  const modelFast = env.GEMINI_IMAGE_MODEL_FAST?.trim() || "gemini-3-flash-image-preview";
  return { apiKey, modelPro, modelFast };
}
