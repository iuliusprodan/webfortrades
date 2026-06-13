/**
 * Copy voice review: banned generic phrases, unsupported badges, angle/proof checks.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BANNED_ALL_COPY_PHRASES,
  BANNED_GENERIC_PATTERNS,
  BANNED_GENERIC_PHRASES,
  CLAIMED_BADGE_PATTERNS,
} from "../copy_voice_constants.js";
import type { VoiceJson } from "../voice_discovery.js";
import { briefDir } from "../site_config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "../..");

export type VoiceReviewSeverity = "error" | "warning" | "info";

export interface VoiceReviewIssue {
  severity: VoiceReviewSeverity;
  code: string;
  message: string;
  file?: string;
  line?: number;
}

function walkFiles(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, acc);
    else if (/\.(tsx?|jsx?|json|md)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

function collectSiteCopyFiles(slug: string, root = ROOT): string[] {
  const siteDir = path.join(root, "sites", slug);
  const targets: string[] = [];
  for (const sub of ["app", "content", "components"]) {
    const dir = path.join(siteDir, sub);
    if (fs.existsSync(dir)) targets.push(...walkFiles(dir));
  }
  return targets;
}

function extractStringLiterals(content: string): string[] {
  const strings: string[] = [];
  const re = /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const s = m[2]!;
    if (s.length >= 8 && /[a-zA-Z]/.test(s)) strings.push(s);
  }
  return strings;
}

function normalizeCopy(text: string): string {
  return text.replace(/\s+/g, " ").toLowerCase();
}

function collectAllowedBadges(brief: {
  certifications?: string[];
  directory_probes?: { badges?: string[]; status?: string }[];
}): string[] {
  const allowed = new Set<string>();
  for (const c of brief.certifications ?? []) {
    allowed.add(c.toLowerCase());
  }
  for (const probe of brief.directory_probes ?? []) {
    if (probe.status === "FOUND_VERIFIED" || probe.status === "FOUND_FROM_SNIPPET") {
      for (const b of probe.badges ?? []) {
        allowed.add(b.toLowerCase());
      }
    }
  }
  return [...allowed];
}

function badgeAllowed(label: string, allowed: string[]): boolean {
  const l = label.toLowerCase();
  if (allowed.some((a) => a.includes(l) || l.includes(a))) return true;
  if (l === "fully insured" && allowed.some((a) => /insur/.test(a))) return true;
  if (l === "gas safe" && allowed.some((a) => /gas safe/.test(a))) return true;
  return false;
}

function proofPointMatchesCopy(proof: string, copyBlob: string): boolean {
  const words = proof
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4);
  const hits = words.filter((w) => copyBlob.includes(w));
  return hits.length >= Math.min(3, Math.ceil(words.length * 0.35));
}

function angleReferencedInCopy(angle: string, copyBlob: string): boolean {
  const tokens = angle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 5);
  const unique = [...new Set(tokens)].slice(0, 12);
  const hitCount = unique.filter((t) => copyBlob.includes(t)).length;
  return hitCount >= Math.min(4, Math.ceil(unique.length * 0.3));
}

function findHeroSubhead(content: string): string | null {
  const heroBlock = content.match(/data-section-id=["']hero["'][\s\S]{0,4000}/i);
  if (!heroBlock) return null;
  const strings = extractStringLiterals(heroBlock[0]!);
  const candidates = strings.filter((s) => s.length > 25 && s.length < 280);
  return candidates.sort((a, b) => b.length - a.length)[0] ?? null;
}

export function reviewVoiceForSite(
  slug: string,
  options: { root?: string; voicePath?: string; briefPath?: string } = {}
): VoiceReviewIssue[] {
  const root = options.root ?? ROOT;
  const voicePath = options.voicePath ?? path.join(briefDir(slug), "voice.json");
  const briefPath = options.briefPath ?? path.join(briefDir(slug), "brief.json");
  const issues: VoiceReviewIssue[] = [];

  if (!fs.existsSync(voicePath)) {
    issues.push({
      severity: "warning",
      code: "voice_missing",
      message: `Missing ${voicePath}. Run voice discovery before port on future batches.`,
    });
    return issues;
  }

  const voice = JSON.parse(fs.readFileSync(voicePath, "utf8")) as VoiceJson;
  const brief = fs.existsSync(briefPath)
    ? (JSON.parse(fs.readFileSync(briefPath, "utf8")) as {
        certifications?: string[];
        directory_probes?: { badges?: string[]; status?: string }[];
      })
    : { certifications: [], directory_probes: [] };

  const files = collectSiteCopyFiles(slug, root);
  if (files.length === 0) {
    issues.push({
      severity: "warning",
      code: "no_site_copy",
      message: `No site copy files found under sites/${slug}/`,
    });
    return issues;
  }

  const allowedBadges = collectAllowedBadges(brief);
  let copyBlob = "";
  let heroContent = "";

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const rel = path.relative(root, file);
    if (file.includes(`${path.sep}app${path.sep}`) && /page\.tsx?$/.test(file)) {
      heroContent += content;
    }
    copyBlob += ` ${content}`;

    for (const pattern of BANNED_GENERIC_PATTERNS) {
      if (pattern.test(content)) {
        if (pattern.source.includes("fully insured") && badgeAllowed("fully insured", allowedBadges)) {
          continue;
        }
        issues.push({
          severity: "error",
          code: "banned_generic_phrase",
          message: `Banned generic phrase matched /${pattern.source}/ in copy`,
          file: rel,
        });
      }
    }

    for (const badge of CLAIMED_BADGE_PATTERNS) {
      if (badge.pattern.test(content) && !badgeAllowed(badge.label, allowedBadges)) {
        issues.push({
          severity: "error",
          code: "unsupported_badge",
          message: `Copy claims "${badge.label}" but brief has no matching certification or directory badge`,
          file: rel,
        });
      }
    }

    for (const str of extractStringLiterals(content)) {
      if (str.length < 8) continue;
      copyBlob += ` ${str}`;
    }

    const isLikelyReviewQuote = (s: string) =>
      /&ldquo;|&rdquo;|^["']|Google review|Customer on Google/i.test(s) ||
      (s.length > 60 && /professional service|recommend|excellent|great job/i.test(s));

    for (const str of extractStringLiterals(content)) {
      if (isLikelyReviewQuote(str)) continue;
      const normStr = normalizeCopy(str);
      for (const phrase of BANNED_ALL_COPY_PHRASES) {
        if (normStr.includes(phrase.toLowerCase())) {
          issues.push({
            severity: "error",
            code: "banned_copy_phrase",
            message: `Banned copy phrase "${phrase}" in customer-facing text`,
            file: rel,
          });
        }
      }
    }
  }

  const normBlob = normalizeCopy(copyBlob);

  if (
    (voice.confidence === "high" || voice.confidence === "medium") &&
    voice.distinctive_angle
  ) {
    const heroSub = findHeroSubhead(heroContent);
    const target = heroSub ? normalizeCopy(heroSub) : normBlob.slice(0, 800);
    if (!angleReferencedInCopy(voice.distinctive_angle, target)) {
      issues.push({
        severity: "warning",
        code: "hero_missing_angle",
        message:
          "Hero subhead (or early copy) does not appear to reflect distinctive_angle from voice.json (manual review)",
      });
    }
  }

  if (voice.specific_proof_points.length > 0) {
    const matched = voice.specific_proof_points.filter((p) => proofPointMatchesCopy(p, normBlob));
    const need = 2;
    if (matched.length < need) {
      issues.push({
        severity: voice.confidence === "high" ? "warning" : "info",
        code: "proof_points_missing",
        message: `Only ${matched.length}/${need} specific_proof_points from voice.json appear in site copy (${voice.specific_proof_points.length} listed)`,
      });
    }
  }

  return issues;
}

export function formatVoiceReviewReport(issues: VoiceReviewIssue[]): string {
  if (issues.length === 0) return "Voice review: no issues.";
  return issues.map((i) => `[${i.severity}] ${i.code}: ${i.message}${i.file ? ` (${i.file})` : ""}`).join("\n");
}

export function assertVoiceReviewForSiteSlug(slug: string, root = ROOT): void {
  const issues = reviewVoiceForSite(slug, { root });
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const infos = issues.filter((i) => i.severity === "info");

  for (const w of warnings) console.warn(`Voice review warning: ${w.message}`);
  for (const info of infos) console.log(`Voice review info: ${info.message}`);

  if (errors.length > 0) {
    throw new Error(`Voice review failed (${errors.length} blocking issue(s)):\n${formatVoiceReviewReport(errors)}`);
  }
  if (issues.length === 0) {
    console.log("Voice review passed.");
  } else {
    console.log(`Voice review passed with ${warnings.length} warning(s), ${infos.length} info note(s).`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const slugArg = process.argv.find((a, i) => process.argv[i - 1] === "--slug");
  if (!slugArg) {
    console.error("Usage: tsx scripts/checks/voice_review.ts --slug <slug>");
    process.exit(1);
  }
  const issues = reviewVoiceForSite(slugArg);
  console.log(formatVoiceReviewReport(issues));
  process.exit(issues.some((i) => i.severity === "error") ? 1 : 0);
}
