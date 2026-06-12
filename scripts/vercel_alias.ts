import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractBuildMarkerFromHtml,
  htmlContainsPhone,
  type BuildMarker,
} from "./build_marker.js";
import { parseOutwardPostcode } from "./site_content.js";
import { withFileLockSync } from "./concurrency.js";

const ALIAS_LOCK_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".locks",
  "vercel-alias"
);

export type AliasCandidateStatus =
  | "available"
  | "taken_by_other_site"
  | "already_ours"
  | "alias_assigned"
  | "verification_failed"
  | "verified"
  | "assign_failed"
  | "skipped";

export interface AliasCandidateResult {
  hostname: string;
  url: string;
  preflight: AliasCandidateStatus;
  assign?: AliasCandidateStatus;
  verify?: AliasCandidateStatus;
  detail?: string;
}

export interface DeployVerificationInput {
  slug: string;
  businessName: string;
  phone: string | null;
  buildId: string;
}

export interface DeployVerificationResult {
  ok: boolean;
  httpStatus: number | null;
  markerFound: boolean;
  businessNameFound: boolean;
  phoneFound: boolean;
  marker: BuildMarker | null;
  errors: string[];
}

export interface AliasResolutionResult {
  preferredAlias: string;
  candidates: AliasCandidateResult[];
  deploymentUrl: string;
  finalUrl: string;
  verifiedUrl: string | null;
  aliasStatus: "VERIFIED" | "NEEDS_MANUAL_ALIAS";
  verification: DeployVerificationResult | null;
}

export interface VercelAuth {
  token?: string;
  scope?: string;
}

export interface VerifyFetchContext {
  siteDir?: string;
  auth?: VercelAuth;
}

export function isDeploymentProtectionResponse(status: number, html: string): boolean {
  return (
    status === 401 &&
    (/Authentication Required|deployment protection|Vercel Authentication|vercel\.com\/sso-api/i.test(
      html
    ) ||
      html.includes("vercel.com/docs/deployment-protection"))
  );
}

export function fetchHtmlViaVercelCurl(
  url: string,
  siteDir: string,
  auth: VercelAuth
): { status: number; html: string } {
  const parts = ["npx", "vercel@latest", "curl", "-s", url];
  if (auth.scope) parts.push(`--scope=${auth.scope}`);
  if (auth.token) parts.push(`--token=${auth.token}`);

  const out = execSync(parts.join(" "), {
    cwd: siteDir,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    env: auth.token ? { ...process.env, VERCEL_TOKEN: auth.token } : { ...process.env },
    maxBuffer: 12 * 1024 * 1024,
  });

  const html = out.replace(/^[\s\S]*?(?=<!DOCTYPE|<html)/i, (m) =>
    m.includes("HTTP/") ? "" : m
  );
  return { status: 200, html: html || out };
}

export function generateAliasCandidates(input: {
  slug: string;
  city?: string | null;
  outwardPostcode?: string | null;
}): string[] {
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  const city = input.city?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || null;
  const outward =
    input.outwardPostcode?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "") || null;

  const raw = [
    slug,
    city ? `${slug}-${city}` : null,
    outward ? `${slug}-${outward}` : null,
    city && outward ? `${slug}-${city}-${outward}` : null,
    `${slug}-uk`,
    `${slug}-web`,
  ].filter(Boolean) as string[];

  const seen = new Set<string>();
  const result: string[] = [];
  for (const host of raw) {
    const h = host.slice(0, 63);
    if (!seen.has(h) && !h.includes("demo")) {
      seen.add(h);
      result.push(h);
    }
  }
  return result;
}

export function aliasCandidatesFromBrief(
  slug: string,
  brief: { based_location?: string | null; address?: string | null; service_area?: string[] }
): string[] {
  const city =
    brief.based_location?.split(",")[0]?.trim() ||
    brief.service_area?.[0]?.trim() ||
    null;
  const outward = parseOutwardPostcode(brief.address ?? null);
  return generateAliasCandidates({ slug, city, outwardPostcode: outward });
}

export function extractDeploymentUrl(deployOutput: string): string | null {
  try {
    const json = JSON.parse(deployOutput) as { deployment?: { url?: string } };
    const raw = json.deployment?.url?.trim();
    if (raw) {
      if (raw.startsWith("http")) return raw.replace(/\/$/, "");
      return `https://${raw}`.replace(/\/$/, "");
    }
  } catch {
    /* fall through */
  }

  const patterns = [
    /"url"\s*:\s*"(https:\/\/[^"]+\.vercel\.app)"/i,
    /https:\/\/[a-z0-9-]+-[a-z0-9]+(?:-[a-z0-9]+)*\.vercel\.app/i,
  ];
  for (const pattern of patterns) {
    const match = deployOutput.match(pattern);
    if (match) return (match[1] ?? match[0]).replace(/\/$/, "");
  }
  return null;
}

export function hostnameFromUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").split("/")[0] ?? url;
}

export async function fetchPublicHtml(url: string, timeoutMs = 15000): Promise<{
  status: number;
  html: string;
  finalUrl: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "WebForTrades-DeployVerify/1.0" },
    });
    const html = await res.text();
    return { status: res.status, html, finalUrl: res.url };
  } finally {
    clearTimeout(timer);
  }
}

export async function preflightPublicAlias(
  hostname: string,
  expectedSlug: string,
  ctx?: VerifyFetchContext
): Promise<{ status: AliasCandidateStatus; detail?: string }> {
  const url = `https://${hostname}.vercel.app`;
  try {
    let { status, html } = await fetchPublicHtml(url);

    if (
      isDeploymentProtectionResponse(status, html) &&
      ctx?.siteDir &&
      ctx.auth
    ) {
      try {
        const bypass = fetchHtmlViaVercelCurl(url, ctx.siteDir, ctx.auth);
        status = bypass.status;
        html = bypass.html;
      } catch {
        return {
          status: "available",
          detail: "HTTP 401 deployment protection, could not bypass for preflight",
        };
      }
    }

    if (status === 404) return { status: "available" };
    if (status >= 500) return { status: "available", detail: `HTTP ${status}, treating as unassigned` };

    const marker = extractBuildMarkerFromHtml(html);
    if (marker?.slug === expectedSlug) {
      return { status: "already_ours", detail: `Build marker ${marker.buildId}` };
    }

    if (status >= 200 && status < 400 && html.length > 200) {
      return { status: "taken_by_other_site", detail: `HTTP ${status} without our build marker` };
    }

    return { status: "available", detail: `HTTP ${status}` };
  } catch (err) {
    return {
      status: "available",
      detail: `Fetch failed (${err instanceof Error ? err.message : String(err)}), treating as available`,
    };
  }
}

export function assignVercelAlias(
  deploymentUrl: string,
  aliasHostname: string,
  auth: VercelAuth
): { ok: boolean; error?: string } {
  const alias = `${aliasHostname}.vercel.app`;
  const parts = ["npx", "vercel@latest", "alias", "set", deploymentUrl, alias];
  if (auth.scope) parts.push(`--scope=${auth.scope}`);
  if (auth.token) parts.push(`--token=${auth.token}`);

  // Serialise alias assignment across concurrent batch deploys. The Vercel CLI
  // mutates a shared alias namespace; running `alias set` from two deploys at
  // once can race. A cross-process lock keeps assignments one at a time.
  try {
    return withFileLockSync(ALIAS_LOCK_DIR, () => {
      try {
        execSync(parts.join(" "), {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
          env: auth.token
            ? { ...process.env, VERCEL_TOKEN: auth.token }
            : { ...process.env },
        });
        return { ok: true };
      } catch (err) {
        const e = err as { stderr?: string; stdout?: string; message?: string };
        const msg = [e.stderr, e.stdout, e.message].filter(Boolean).join("\n");
        return { ok: false, error: msg || "alias set failed" };
      }
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function verifyDeployedSite(
  url: string,
  expected: DeployVerificationInput,
  ctx?: VerifyFetchContext
): Promise<DeployVerificationResult> {
  const errors: string[] = [];
  let httpStatus: number | null = null;
  let html = "";
  let usedBypass = false;

  try {
    const res = await fetchPublicHtml(url);
    httpStatus = res.status;
    html = res.html;

    if (
      isDeploymentProtectionResponse(httpStatus, html) &&
      ctx?.siteDir &&
      ctx.auth
    ) {
      try {
        const bypass = fetchHtmlViaVercelCurl(url, ctx.siteDir, ctx.auth);
        httpStatus = bypass.status;
        html = bypass.html;
        usedBypass = true;
      } catch (err) {
        errors.push(
          `Deployment protection bypass failed for ${url}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  } catch (err) {
    return {
      ok: false,
      httpStatus: null,
      markerFound: false,
      businessNameFound: false,
      phoneFound: false,
      marker: null,
      errors: [`Could not fetch ${url}: ${err instanceof Error ? err.message : String(err)}`],
    };
  }

  if (!usedBypass && (httpStatus === null || httpStatus >= 400)) {
    errors.push(`HTTP ${httpStatus ?? "unknown"} at ${url}`);
  }

  const marker = extractBuildMarkerFromHtml(html);
  const markerFound = Boolean(marker && marker.slug === expected.slug);
  if (!markerFound) {
    errors.push(`Missing or mismatched build marker for slug ${expected.slug}`);
  } else if (marker!.buildId !== expected.buildId) {
    errors.push(
      `Build marker ID mismatch: expected ${expected.buildId}, found ${marker!.buildId}`
    );
  }

  const businessNameFound = html.includes(expected.businessName.trim());
  if (!businessNameFound) {
    errors.push(`Business name "${expected.businessName}" not found in page HTML`);
  }

  const phoneFound = htmlContainsPhone(html, expected.phone);
  if (expected.phone && !phoneFound) {
    errors.push(`Phone "${expected.phone}" not found in page HTML`);
  }

  return {
    ok: errors.length === 0,
    httpStatus,
    markerFound,
    businessNameFound,
    phoneFound,
    marker,
    errors,
  };
}

export interface ResolveVerifiedAliasDeps {
  preflightPublicAlias?: typeof preflightPublicAlias;
  assignVercelAlias?: typeof assignVercelAlias;
  verifyDeployedSite?: typeof verifyDeployedSite;
  assignDelayMs?: number;
}

export async function resolveVerifiedAlias(
  input: {
    slug: string;
    deploymentUrl: string;
    candidates: string[];
    expected: DeployVerificationInput;
    auth: VercelAuth;
    siteDir: string;
  },
  deps: ResolveVerifiedAliasDeps = {}
): Promise<AliasResolutionResult> {
  const preflightFn = deps.preflightPublicAlias ?? preflightPublicAlias;
  const assignFn = deps.assignVercelAlias ?? assignVercelAlias;
  const verifyFn = deps.verifyDeployedSite ?? verifyDeployedSite;
  const assignDelayMs = deps.assignDelayMs ?? 2000;

  const results: AliasCandidateResult[] = [];
  const preferredAlias = input.candidates[0] ?? input.slug;
  const fetchCtx: VerifyFetchContext = { siteDir: input.siteDir, auth: input.auth };

  for (const hostname of input.candidates) {
    const url = `https://${hostname}.vercel.app`;
    const pre = await preflightFn(hostname, input.slug, fetchCtx);
    const entry: AliasCandidateResult = {
      hostname,
      url,
      preflight: pre.status,
      detail: pre.detail,
    };

    if (pre.status === "taken_by_other_site") {
      results.push(entry);
      continue;
    }

    if (pre.status === "already_ours") {
      // Always point the alias at this deployment. A prior build may still own
      // the hostname while serving stale static assets (e.g. missing gallery files).
      const assigned = assignFn(input.deploymentUrl, hostname, input.auth);
      if (assigned.ok) {
        entry.assign = "alias_assigned";
        if (assignDelayMs > 0) await new Promise((r) => setTimeout(r, assignDelayMs));
      } else {
        entry.assign = "assign_failed";
        entry.detail = assigned.error ?? pre.detail;
      }
      const verification = await verifyFn(url, input.expected, fetchCtx);
      entry.verify = verification.ok ? "verified" : "verification_failed";
      entry.detail = verification.errors.join("; ") || pre.detail;
      results.push(entry);
      if (verification.ok) {
        return {
          preferredAlias,
          candidates: results,
          deploymentUrl: input.deploymentUrl,
          finalUrl: url,
          verifiedUrl: url,
          aliasStatus: "VERIFIED",
          verification,
        };
      }
      continue;
    }

    const assigned = assignFn(input.deploymentUrl, hostname, input.auth);
    if (!assigned.ok) {
      entry.assign = "assign_failed";
      entry.detail = assigned.error;
      results.push(entry);
      if (/already in use|already assigned|not available|403|409/i.test(assigned.error ?? "")) {
        entry.preflight = "taken_by_other_site";
      }
      continue;
    }

    entry.assign = "alias_assigned";
    if (assignDelayMs > 0) await new Promise((r) => setTimeout(r, assignDelayMs));

    const verification = await verifyFn(url, input.expected, fetchCtx);
    entry.verify = verification.ok ? "verified" : "verification_failed";
    entry.detail = verification.errors.join("; ") || undefined;
    results.push(entry);

    if (verification.ok) {
      return {
        preferredAlias,
        candidates: results,
        deploymentUrl: input.deploymentUrl,
        finalUrl: url,
        verifiedUrl: url,
        aliasStatus: "VERIFIED",
        verification,
      };
    }
  }

  const fallbackVerification = await verifyFn(
    input.deploymentUrl,
    input.expected,
    fetchCtx
  );
  return {
    preferredAlias,
    candidates: results,
    deploymentUrl: input.deploymentUrl,
    finalUrl: fallbackVerification.ok ? input.deploymentUrl : input.deploymentUrl,
    verifiedUrl: fallbackVerification.ok ? input.deploymentUrl : null,
    aliasStatus: fallbackVerification.ok ? "VERIFIED" : "NEEDS_MANUAL_ALIAS",
    verification: fallbackVerification,
  };
}

export function saveDeployManifest(
  root: string,
  slug: string,
  resolution: AliasResolutionResult
): string {
  const dir = path.join(root, "briefs", slug);
  fs.mkdirSync(dir, { recursive: true });
  const manifestPath = path.join(dir, "deploy.json");
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        slug,
        updated_at: new Date().toISOString(),
        preferred_alias: resolution.preferredAlias,
        deployment_url: resolution.deploymentUrl,
        verified_url: resolution.verifiedUrl,
        final_url: resolution.finalUrl,
        alias_status: resolution.aliasStatus,
        candidates: resolution.candidates,
        verification: resolution.verification,
      },
      null,
      2
    ) + "\n"
  );
  return manifestPath;
}

export function loadDeployManifest(
  root: string,
  slug: string
): {
  verified_url?: string | null;
  alias_status?: string;
  deployment_url?: string;
  candidates?: AliasCandidateResult[];
} | null {
  const p = path.join(root, "briefs", slug, "deploy.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8")) as {
    verified_url?: string | null;
    alias_status?: string;
    deployment_url?: string;
    candidates?: AliasCandidateResult[];
  };
}

export async function disableDeploymentProtection(
  projectName: string,
  auth: VercelAuth
): Promise<{ ok: boolean; detail?: string }> {
  if (!auth.token) {
    return { ok: false, detail: "No VERCEL_TOKEN; skipping protection disable" };
  }

  const teamQuery = auth.scope ? `?teamId=${encodeURIComponent(auth.scope)}` : "";
  try {
    const res = await fetch(
      `https://api.vercel.com/v9/projects/${encodeURIComponent(projectName)}${teamQuery}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ssoProtection: null }),
      }
    );
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, detail: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}
