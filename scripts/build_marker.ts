import crypto from "node:crypto";

export const BUILD_MARKER_BUILD_ID = "webfortrades-build-id";
export const BUILD_MARKER_SLUG = "webfortrades-business-slug";
export const BUILD_MARKER_COMMENT_PREFIX = "webfortrades-build:";

export interface BuildMarker {
  buildId: string;
  slug: string;
}

export function generateBuildId(slug: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const hash = crypto.randomBytes(4).toString("hex");
  return `${slug}:${date}-${hash}`;
}

export function buildMarkerComment(marker: BuildMarker): string {
  return `<!-- ${BUILD_MARKER_COMMENT_PREFIX}${marker.buildId} -->`;
}

export function extractBuildMarkerFromHtml(html: string): BuildMarker | null {
  const metaId = html.match(
    new RegExp(`name=["']${BUILD_MARKER_BUILD_ID}["']\\s+content=["']([^"']+)["']`, "i")
  );
  const metaSlug = html.match(
    new RegExp(`name=["']${BUILD_MARKER_SLUG}["']\\s+content=["']([^"']+)["']`, "i")
  );
  if (metaId?.[1] && metaSlug?.[1]) {
    return { buildId: metaId[1], slug: metaSlug[1] };
  }

  const comment = html.match(
    new RegExp(`<!--\\s*${BUILD_MARKER_COMMENT_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^>\\s]+)\\s*-->`, "i")
  );
  if (comment?.[1]) {
    const buildId = comment[1];
    const slug = buildId.split(":")[0] ?? "";
    if (slug) return { buildId, slug };
  }

  return null;
}

export function phoneDigits(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

export function htmlContainsPhone(html: string, phone: string | null | undefined): boolean {
  const digits = phoneDigits(phone);
  if (!digits) return true;
  const normalized = html.replace(/\s/g, "");
  if (normalized.includes(digits)) return true;
  const last10 = digits.slice(-10);
  return normalized.includes(last10);
}
