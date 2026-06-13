/**
 * Coverage / location sections must use keyless Google Maps iframe embeds.
 * Query: "<Town> <Postcode-outward>" only — never full street address or inward postcode.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "../..");

const COVERAGE_SECTION_RE =
  /data-section-id="(?:local-coverage|service-area)"|id="(?:coverage|areas|location)[^"]*"/i;
const MAP_CLASS_RE = /className="[^"]*\b(?:map-embed|local-map|coverage-map|map-panel)\b[^"]*"/i;
const FULL_POSTCODE_RE = /[A-Z]{1,2}\d[A-Z\d]?\s+\d[A-Z]{2}/i;
const GOOGLE_EMBED_RE = /https:\/\/maps\.google\.com\/maps\?q=[^"']+&amp;output=embed|https:\/\/maps\.google\.com\/maps\?q=[^"']+output=embed/i;

export interface MapEmbedViolation {
  file: string;
  message: string;
}

function readBriefAddress(slug: string): string | null {
  const briefPath = path.join(ROOT, "briefs", slug, "brief.json");
  if (!fs.existsSync(briefPath)) return null;
  try {
    const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as { address?: string };
    return brief.address ?? null;
  } catch {
    return null;
  }
}

function streetTokensFromAddress(address: string): string[] {
  const streetPart = address.split(",")[0]?.trim() ?? "";
  return streetPart
    .replace(/^\d+\s*/, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !/^(the|and|ltd|plc|road|rd|street|st|avenue|ave|lane|ln|drive|dr|place|pl|close|cl|way|court|ct)$/i.test(w))
    .map((w) => w.toLowerCase());
}

function extractCoverageBlocks(content: string): string[] {
  const blocks: string[] = [];
  const sectionRe = /<section[\s\S]*?<\/section>/gi;
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(content))) {
    const block = m[0]!;
    if (COVERAGE_SECTION_RE.test(block) || MAP_CLASS_RE.test(block)) {
      blocks.push(block);
    }
  }
  if (blocks.length === 0 && MAP_CLASS_RE.test(content)) {
    blocks.push(content);
  }
  return blocks;
}

function isMapLikeSvg(block: string): boolean {
  return (
    /<svg[^>]*className="[^"]*local-map/i.test(block) ||
    (/<svg[\s\S]*?<\/svg>/i.test(block) &&
      /aria-label="[^"]*Map showing/i.test(block) &&
      /local-grid|local-coverage|coverage-grid|map-embed|local-map/i.test(block))
  );
}

function isMapLikeImg(block: string): boolean {
  const imgRe = /<img[^>]+>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(block))) {
    const tag = m[0]!;
    if (/className="[^"]*(?:local-map|coverage-map|map-embed)/i.test(tag)) return true;
    const alt = tag.match(/alt="([^"]*)"/i)?.[1] ?? "";
    if (/map showing|service area on|area map/i.test(alt)) return true;
  }
  return false;
}

function iframeSrcs(block: string): string[] {
  const srcs: string[] = [];
  const re = /<iframe[^>]+src="([^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) {
    if (/maps\.google\.com\/maps\?q=/i.test(m[1]!)) srcs.push(m[1]!);
  }
  return srcs;
}

function decodeSrc(src: string): string {
  return src.replace(/&amp;/g, "&").replace(/\+/g, " ");
}

export function checkMapEmbedPage(content: string, slug: string, fileRel: string): MapEmbedViolation[] {
  if (!COVERAGE_SECTION_RE.test(content) && !MAP_CLASS_RE.test(content)) {
    return [];
  }

  const violations: MapEmbedViolation[] = [];
  const blocks = extractCoverageBlocks(content);
  if (blocks.length === 0) return violations;

  const address = readBriefAddress(slug);
  const streetTokens = address ? streetTokensFromAddress(address) : [];

  for (const block of blocks) {
    const iframes = iframeSrcs(block);
    const hasSvgMap = isMapLikeSvg(block);
    const hasImgMap = isMapLikeImg(block);

    if (iframes.length === 0 && (hasSvgMap || hasImgMap)) {
      violations.push({
        file: fileRel,
        message: `${slug}: coverage section uses ${hasSvgMap ? "SVG" : "image"} map substitute without Google Maps iframe`,
      });
      continue;
    }

    for (const rawSrc of iframes) {
      const decoded = decodeSrc(rawSrc);
      if (!/output=embed/i.test(decoded)) {
        violations.push({
          file: fileRel,
          message: `${slug}: Google Maps iframe missing output=embed in ${decoded.slice(0, 80)}`,
        });
      }
      if (FULL_POSTCODE_RE.test(decoded)) {
        violations.push({
          file: fileRel,
          message: `${slug}: map query includes full UK postcode (use outward only): ${decoded.slice(0, 100)}`,
        });
      }
      for (const token of streetTokens) {
        if (decoded.toLowerCase().includes(token)) {
          violations.push({
            file: fileRel,
            message: `${slug}: map query may include street address token "${token}": ${decoded.slice(0, 100)}`,
          });
        }
      }
    }

    if (hasSvgMap && iframes.length > 0) {
      violations.push({
        file: fileRel,
        message: `${slug}: coverage section has both Google iframe and SVG map substitute`,
      });
    }
  }

  return violations;
}

export function collectMapEmbedViolations(options: { root?: string; slug?: string } = {}): MapEmbedViolation[] {
  const root = options.root ?? ROOT;
  const sitesDir = path.join(root, "sites");
  if (!fs.existsSync(sitesDir)) return [];

  const slugs = options.slug
    ? [options.slug]
    : fs.readdirSync(sitesDir).filter((s) => fs.statSync(path.join(sitesDir, s)).isDirectory());

  const violations: MapEmbedViolation[] = [];
  for (const slug of slugs) {
    const pagePath = path.join(sitesDir, slug, "app", "page.tsx");
    if (!fs.existsSync(pagePath)) continue;
    const content = fs.readFileSync(pagePath, "utf8");
    violations.push(...checkMapEmbedPage(content, slug, path.relative(root, pagePath)));
  }
  return violations;
}

export function assertMapEmbedForSiteSlug(slug: string, root = ROOT): void {
  const violations = collectMapEmbedViolations({ root, slug });
  if (violations.length > 0) {
    throw new Error(
      `Map embed check failed (${violations.length} hit(s)):\n${violations.map((v) => `  ${v.file}: ${v.message}`).join("\n")}`
    );
  }
}

export function formatMapEmbedReport(violations: MapEmbedViolation[]): string {
  return violations.map((v) => `${v.file}: ${v.message}`).join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const slugArg = process.argv.find((a, i) => process.argv[i - 1] === "--slug");
  const violations = collectMapEmbedViolations(slugArg ? { slug: slugArg } : {});
  if (violations.length === 0) {
    console.log("OK: map embed checks passed.");
    process.exit(0);
  }
  console.error(formatMapEmbedReport(violations));
  process.exit(1);
}
