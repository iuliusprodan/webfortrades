/**
 * Lightweight HTML metadata extraction without a DOM dependency.
 * Public pages only. No login bypass.
 */

export interface OpenGraphMeta {
  title: string | null;
  description: string | null;
  image: string | null;
  url: string | null;
  site_name: string | null;
}

export interface SchemaLocalBusiness {
  name: string | null;
  telephone: string | null;
  email: string | null;
  logo: string | null;
  image: string[];
  address: string | null;
  url: string | null;
}

export interface LinkIcon {
  href: string;
  rel: string;
  sizes: string | null;
  type: string | null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ");
}

function metaContent(html: string, key: string, attr: "property" | "name" = "property"): string | null {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const m = html.match(re);
  if (m) return decodeHtmlEntities(m[1]!.trim());
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
    "i"
  );
  const m2 = html.match(re2);
  return m2 ? decodeHtmlEntities(m2[1]!.trim()) : null;
}

export function extractOpenGraph(html: string): OpenGraphMeta {
  return {
    title: metaContent(html, "og:title") ?? extractTitle(html),
    description: metaContent(html, "og:description") ?? metaContent(html, "description", "name"),
    image: metaContent(html, "og:image"),
    url: metaContent(html, "og:url"),
    site_name: metaContent(html, "og:site_name"),
  };
}

export function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return null;
  return decodeHtmlEntities(m[1].replace(/\s+/g, " ").trim().slice(0, 300)) || null;
}

export function extractLinkIcons(html: string, baseUrl: string): LinkIcon[] {
  const icons: LinkIcon[] = [];
  const re = /<link[^>]+>/gi;
  for (const tag of html.match(re) ?? []) {
    const rel = tag.match(/rel=["']([^"']+)["']/i)?.[1]?.toLowerCase() ?? "";
    if (!/(icon|apple-touch-icon|shortcut)/.test(rel)) continue;
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    icons.push({
      href: resolveUrl(href, baseUrl),
      rel,
      sizes: tag.match(/sizes=["']([^"']+)["']/i)?.[1] ?? null,
      type: tag.match(/type=["']([^"']+)["']/i)?.[1] ?? null,
    });
  }
  return icons;
}

export function resolveUrl(href: string, baseUrl: string): string {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}

export function extractSchemaLocalBusiness(html: string): SchemaLocalBusiness | null {
  const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  for (const block of scripts) {
    const inner = block.match(/<script[^>]*>([\s\S]*?)<\/script>/i)?.[1];
    if (!inner) continue;
    try {
      const parsed = JSON.parse(inner.trim()) as unknown;
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        const found = findLocalBusiness(node);
        if (found) return found;
      }
    } catch {
      /* invalid json-ld */
    }
  }
  return null;
}

function findLocalBusiness(node: unknown): SchemaLocalBusiness | null {
  if (!node || typeof node !== "object") return null;
  const obj = node as Record<string, unknown>;
  const type = String(obj["@type"] ?? "");
  const types = Array.isArray(obj["@type"]) ? obj["@type"].map(String) : [type];
  const isBusiness = types.some((t) =>
    /LocalBusiness|Plumber|HomeAndConstructionBusiness|ProfessionalService|Organization/i.test(t)
  );
  if (!isBusiness && !obj.telephone && !obj.logo) return null;

  const logoRaw = obj.logo;
  let logo: string | null = null;
  if (typeof logoRaw === "string") logo = logoRaw;
  else if (logoRaw && typeof logoRaw === "object" && "url" in (logoRaw as object)) {
    logo = String((logoRaw as { url: string }).url);
  }

  const imageRaw = obj.image;
  const images: string[] = [];
  if (typeof imageRaw === "string") images.push(imageRaw);
  else if (Array.isArray(imageRaw)) {
    for (const item of imageRaw) {
      if (typeof item === "string") images.push(item);
      else if (item && typeof item === "object" && "url" in item) images.push(String((item as { url: string }).url));
    }
  }

  const addr = obj.address;
  let address: string | null = null;
  if (typeof addr === "string") address = addr;
  else if (addr && typeof addr === "object") {
    const a = addr as Record<string, string>;
    address = [a.streetAddress, a.addressLocality, a.postalCode].filter(Boolean).join(", ");
  }

  if (!isBusiness && !logo && images.length === 0 && !obj.telephone) return null;

  return {
    name: typeof obj.name === "string" ? obj.name : null,
    telephone: typeof obj.telephone === "string" ? obj.telephone : null,
    email: typeof obj.email === "string" ? obj.email : null,
    logo,
    image: images,
    address,
    url: typeof obj.url === "string" ? obj.url : null,
  };
}

export function extractEmails(text: string): string[] {
  return [
    ...new Set(
      [...text.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)]
        .map((m) => m[0].toLowerCase())
        .filter((e) => !e.includes("example.com") && !e.includes("sentry.io"))
    ),
  ];
}

export function extractUkPhones(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(/(?:\+44|0)\s*7\d{3}[\s-]?\d{3}[\s-]?\d{3,4}/g)) {
    found.add(m[0].replace(/\s+/g, " ").trim());
  }
  for (const m of text.matchAll(/0\d{4}\s?\d{6}/g)) {
    found.add(m[0].replace(/\s+/g, " ").trim());
  }
  return [...found];
}

export function extractGalleryImageUrls(html: string, baseUrl: string): string[] {
  const urls = new Set<string>();
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    const src = resolveUrl(decodeHtmlEntities(m[1]!), baseUrl);
    if (!/logo|icon|favicon|sprite|placeholder|1x1|pixel|spacer|avatar-default/i.test(src)) {
      urls.add(src);
    }
  }
  for (const m of html.matchAll(/url\(["']?([^"')]+\.(?:jpg|jpeg|png|webp)[^"')]*)/gi)) {
    urls.add(resolveUrl(m[1]!, baseUrl));
  }
  return [...urls].slice(0, 40);
}

export function extractServiceHints(text: string): string[] {
  const hints: string[] = [];
  const pairs: [RegExp, string][] = [
    [/plumb/i, "Plumbing"],
    [/heat/i, "Heating"],
    [/boiler/i, "Boiler work"],
    [/bathroom/i, "Bathroom installations"],
    [/tiling|tile/i, "Tiling"],
    [/electric/i, "Electrical"],
    [/drain/i, "Drainage"],
  ];
  for (const [re, label] of pairs) {
    if (re.test(text)) hints.push(label);
  }
  return [...new Set(hints)];
}

export function parseSitemapUrls(xml: string, baseUrl: string): string[] {
  const urls: string[] = [];
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
    try {
      urls.push(new URL(m[1]!.trim(), baseUrl).toString());
    } catch {
      /* skip */
    }
  }
  return urls.slice(0, 100);
}
