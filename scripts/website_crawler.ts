import {
  extractEmails,
  extractGalleryImageUrls,
  extractOpenGraph,
  extractSchemaLocalBusiness,
  extractServiceHints,
  extractTitle,
  extractUkPhones,
  parseSitemapUrls,
} from "./html_extract.js";
import { classifyProbeResult } from "./website_classify.js";
import { lightweightFetch, appearsToBelongToBusiness } from "./website_discovery.js";
import type { WebsiteDiscoveryClassification } from "./website_discovery.js";

export interface CrawledPage {
  url: string;
  status_code: number | null;
  title: string | null;
  phones: string[];
  emails: string[];
  services: string[];
  images: string[];
  text_snippet: string;
}

export interface WebsiteCrawlResult {
  initial_url: string;
  final_url: string | null;
  classification: WebsiteDiscoveryClassification;
  classification_reason: string;
  pages: CrawledPage[];
  sitemap_urls: string[];
  schema_name: string | null;
  schema_logo: string | null;
  schema_images: string[];
  og_image: string | null;
  services: string[];
  phones: string[];
  emails: string[];
  is_real_site: boolean;
  is_bad_site: boolean;
  is_outdated_hint: boolean;
  page_count_checked: number;
  failures: string[];
}

const COMMON_PATHS = [
  "",
  "/about",
  "/about-us",
  "/services",
  "/our-services",
  "/gallery",
  "/our-work",
  "/contact",
  "/contact-us",
  "/reviews",
  "/testimonials",
];

const OUTDATED_PATTERNS = [
  /copyright 20(0[0-9]|1[0-9]|20)\b/i,
  /last updated 20(0[0-9]|1[0-9])\b/i,
  /built with (wordpress|wix|weebly) 3/i,
];

function stripHtmlLocal(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchHtml(url: string): Promise<{ ok: boolean; status: number | null; finalUrl: string; html: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WebForTradesProspector/1.0)",
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    const html = res.ok ? await res.text() : "";
    return { ok: res.ok, status: res.status, finalUrl: res.url || url, html };
  } catch {
    return { ok: false, status: null, finalUrl: url, html: "" };
  }
}

function originOf(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return url;
  }
}

export async function crawlWebsite(
  websiteUrl: string,
  businessName: string
): Promise<WebsiteCrawlResult> {
  const failures: string[] = [];
  const pages: CrawledPage[] = [];
  const allServices = new Set<string>();
  const allPhones = new Set<string>();
  const allEmails = new Set<string>();
  const schemaImages: string[] = [];

  const homeProbe = await lightweightFetch(websiteUrl);
  const homeFetch = await fetchHtml(homeProbe.finalUrl || websiteUrl);
  const finalUrl = homeFetch.finalUrl || websiteUrl;
  const origin = originOf(finalUrl);

  let sitemap_urls: string[] = [];
  try {
    const sitemapRes = await fetchHtml(`${origin}/sitemap.xml`);
    if (sitemapRes.ok) {
      sitemap_urls = parseSitemapUrls(sitemapRes.html, origin);
    }
  } catch {
    failures.push("sitemap.xml not accessible");
  }

  const pathsToCheck = [...new Set([...COMMON_PATHS.map((p) => `${origin}${p}`), ...sitemap_urls.slice(0, 8)])].slice(
    0,
    12
  );

  let schema_name: string | null = null;
  let schema_logo: string | null = null;
  let og_image: string | null = null;
  let outdatedHint = false;

  for (const pageUrl of pathsToCheck) {
    const fetched = await fetchHtml(pageUrl);
    if (!fetched.ok || !fetched.html) continue;

    const bodyText = stripHtmlLocal(fetched.html);
    const title = extractTitle(fetched.html) ?? extractOpenGraph(fetched.html).title;
    const phones = extractUkPhones(bodyText);
    const emails = extractEmails(bodyText);
    const services = extractServiceHints(bodyText + " " + (title ?? ""));
    const images = extractGalleryImageUrls(fetched.html, fetched.finalUrl);

    phones.forEach((p) => allPhones.add(p));
    emails.forEach((e) => allEmails.add(e));
    services.forEach((s) => allServices.add(s));

    const schema = extractSchemaLocalBusiness(fetched.html);
    if (schema) {
      schema_name = schema.name ?? schema_name;
      schema_logo = schema.logo ?? schema_logo;
      schema.image.forEach((i) => schemaImages.push(i));
      if (schema.telephone) allPhones.add(schema.telephone);
      if (schema.email) allEmails.add(schema.email);
    }

    const og = extractOpenGraph(fetched.html);
    og_image = og.image ?? og_image;

    if (OUTDATED_PATTERNS.some((re) => re.test(bodyText))) outdatedHint = true;

    pages.push({
      url: fetched.finalUrl,
      status_code: fetched.status,
      title,
      phones,
      emails,
      services,
      images,
      text_snippet: bodyText.slice(0, 400),
    });
  }

  const classificationResult = classifyProbeResult({
    initialUrl: websiteUrl,
    businessName,
    probe: homeProbe,
    finalUrlIsSocialOrDirectory: false,
    appearsToBelongToBusiness: appearsToBelongToBusiness(businessName, homeProbe.title, homeProbe.bodyText),
    hasServicesOrContact: allServices.size > 0 || allPhones.size > 0 || allEmails.size > 0,
  });

  const classification = mapClassification(classificationResult.status, homeProbe);
  const is_real_site = classification === "HAS_REAL_SITE";
  const is_bad_site =
    classification === "BROKEN_OR_BAD_SITE" ||
    classification === "PARKED_DOMAIN" ||
    classification === "UNDER_CONSTRUCTION";

  return {
    initial_url: websiteUrl,
    final_url: finalUrl,
    classification,
    classification_reason: classificationResult.notes,
    pages,
    sitemap_urls,
    schema_name,
    schema_logo,
    schema_images: [...new Set(schemaImages)],
    og_image,
    services: [...allServices],
    phones: [...allPhones],
    emails: [...allEmails],
    is_real_site,
    is_bad_site,
    is_outdated_hint: outdatedHint,
    page_count_checked: pages.length,
    failures,
  };
}

function mapClassification(
  status: string,
  probe: Awaited<ReturnType<typeof lightweightFetch>>
): WebsiteDiscoveryClassification {
  if (status === "HAS_REAL_SITE") return "HAS_REAL_SITE";
  if (status === "NEEDS_MANUAL_REVIEW") return "NEEDS_MANUAL_REVIEW";
  if (status === "SOCIAL_OR_DIRECTORY_ONLY") return "SOCIAL_OR_DIRECTORY_ONLY";
  if (status === "NO_WEBSITE") return "NO_WEBSITE";
  const combined = `${probe.title ?? ""} ${probe.bodyText}`;
  if (/coming soon|under construction/i.test(combined)) return "UNDER_CONSTRUCTION";
  if (/domain for sale|parked/i.test(combined)) return "PARKED_DOMAIN";
  return "BROKEN_OR_BAD_SITE";
}
