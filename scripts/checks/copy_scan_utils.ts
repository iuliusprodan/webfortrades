/**
 * Shared utilities for scanning customer-facing site copy.
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, briefDir } from "../site_config.js";

export { ROOT };

export function walkSiteFiles(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkSiteFiles(full, acc);
    else if (/\.(tsx?|jsx?|css|html|md)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

export function collectSiteCopyFiles(slug: string, root = ROOT): string[] {
  const siteDir = path.join(root, "sites", slug);
  const files: string[] = [];
  for (const sub of ["app", "components", "content"]) {
    const dir = path.join(siteDir, sub);
    if (fs.existsSync(dir)) files.push(...walkSiteFiles(dir));
  }
  return files;
}

export function extractStringLiterals(content: string): string[] {
  const strings: string[] = [];
  const re = /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const s = m[2]!;
    if (s.length >= 4 && /[a-zA-Z]/.test(s)) strings.push(s);
  }
  return strings;
}

export function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
}

export function normalizeCopy(text: string): string {
  return text.replace(/\s+/g, " ").toLowerCase();
}

export function readPageSource(slug: string, root = ROOT): string {
  const pagePath = path.join(root, "sites", slug, "app", "page.tsx");
  if (!fs.existsSync(pagePath)) return "";
  return fs.readFileSync(pagePath, "utf8");
}

export function extractHeroBlock(pageSource: string): string {
  const m = pageSource.match(/data-section-id=["']hero["'][\s\S]*?(?=data-section-id=["'][^"']+["']|<\/main)/i);
  return m?.[0] ?? pageSource.slice(0, 6000);
}

export function extractHeroSubhead(pageSource: string): string | null {
  const hero = extractHeroBlock(pageSource);
  const classMatch = hero.match(/className="[^"]*(?:hero-subhead|lead)[^"]*"[^>]*>([\s\S]*?)<\//i);
  if (classMatch) return stripTags(classMatch[1]!);
  const strings = extractStringLiterals(hero).filter((s) => s.length > 20 && s.length < 400);
  return strings.sort((a, b) => b.length - a.length)[0] ?? null;
}

export function collectAllCustomerCopy(slug: string, root = ROOT): string {
  const files = collectSiteCopyFiles(slug, root);
  let blob = "";
  for (const file of files) {
    blob += ` ${fs.readFileSync(file, "utf8")}`;
    for (const s of extractStringLiterals(fs.readFileSync(file, "utf8"))) {
      blob += ` ${s}`;
    }
  }
  return blob;
}

export function loadBriefJson(slug: string, root = ROOT): Record<string, unknown> {
  const p = path.join(briefDir(slug), "brief.json");
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, unknown>;
}

export function loadVoiceJson(slug: string, root = ROOT): { distinctive_angle?: string | null } | null {
  const p = path.join(briefDir(slug), "voice.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8")) as { distinctive_angle?: string | null };
}
