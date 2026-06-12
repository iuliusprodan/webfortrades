/** Shared image URL helpers for social CDN assets. */

export function decodeHtmlEntitiesInUrl(url: string): string {
  return url.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
}

export function upscaleFacebookCdnUrl(url: string): string {
  let u = decodeHtmlEntitiesInUrl(url);
  u = u.replace(/([?&])stp=[^&]*/g, "$1").replace(/[?&]$/, "");
  u = u.replace(/([?&])oh=[^&]*/g, "$1").replace(/[?&]$/, "");
  u = u.replace(/([?&])oe=[^&]*/g, "$1").replace(/[?&]$/, "");
  return u.replace(/\?&/, "?").replace(/\?$/, "");
}

/** Generate safe Facebook CDN URL variants for retry (largest reasonable first). */
export function facebookPhotoUrlVariants(url: string): string[] {
  const base = decodeHtmlEntitiesInUrl(url);
  const variants = new Set<string>();
  variants.add(base);
  variants.add(upscaleFacebookCdnUrl(base));

  const noQuery = base.split("?")[0]!;
  if (noQuery.includes("fbcdn.net") || noQuery.includes("scontent")) {
    variants.add(noQuery);
  }

  if (base.includes("s320x320") || base.includes("s480x480") || base.includes("s720x720")) {
    variants.add(base.replace(/s\d+x\d+/g, "s960x960"));
    variants.add(base.replace(/s\d+x\d+/g, "s1080x1080"));
  }

  if (/t39\.30808-6\//.test(base)) {
    variants.add(base.replace(/\/v\/t39\.30808-6\//, "/v/t39.30808-1/"));
  }

  return [...variants].filter(Boolean);
}

export function cleanFacebookImageUrl(url: string): string {
  const u = decodeHtmlEntitiesInUrl(url);
  if (u.includes("static.xx.fbcdn.net/rsrc.php")) return "";
  if (u.includes("emoji")) return "";
  if (u.includes("safe_image.php")) return "";
  return u;
}

export function isLikelyTrackingPixel(width: number, height: number): boolean {
  return width <= 16 && height <= 16;
}
