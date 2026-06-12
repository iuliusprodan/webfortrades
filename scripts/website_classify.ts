import type { WebsiteStatus } from "./db.js";

export interface FetchProbe {
  ok: boolean;
  statusCode: number | null;
  finalUrl: string;
  title: string | null;
  bodyText: string;
  error: string | null;
}

export interface WebsiteCheckOutcome {
  status: WebsiteStatus;
  notes: string;
  initialUrl: string | null;
  finalUrl: string | null;
  statusCode: number | null;
  title: string | null;
}

export const BOT_BLOCK_PATTERNS = [
  /cloudflare/i,
  /attention required/i,
  /just a moment/i,
  /checking your browser/i,
  /access denied/i,
  /bot protection/i,
  /cf-browser-verification/i,
  /please enable cookies/i,
  /security check/i,
  /ddos protection/i,
  /error 403/i,
  /error 401/i,
  /\b403\s*[-–]?\s*forbidden\b/i,
  /\b401\s*[-–]?\s*unauthorized\b/i,
  /\bforbidden\b/i,
  /\bcaptcha\b/i,
  /sgcaptcha/i,
  /\.well-known\/sgcaptcha/i,
  /verify you are human/i,
  /ray id:/i,
];

const PARKED_PATTERNS = [
  /domain (is )?for sale/i,
  /buy this domain/i,
  /parked free/i,
  /godaddy\.com/i,
  /\bsedo\b/i,
  /hugedomains/i,
  /this domain/i,
  /domain parking/i,
];

const COMING_SOON_PATTERNS = [
  /coming soon/i,
  /under construction/i,
  /launching soon/i,
  /website coming soon/i,
  /site under maintenance/i,
];

const SPAM_PATTERNS = [
  /\bviagra\b/i,
  /\bcasino\b/i,
  /\bpoker\b/i,
  /online pharmacy/i,
  /click here to win/i,
];

const FETCH_ERROR_BROKEN = new Set([
  "timeout",
  "dns_error",
  "ssl_error",
  "network_error",
  "fetch_error",
]);

export function accessHintsFromRawHtml(raw: string): string {
  const slice = raw.slice(0, 12000);
  const hints: string[] = [];
  if (/sgcaptcha|\.well-known\/sgcaptcha/i.test(slice)) hints.push("sgcaptcha");
  if (/cf-browser-verification|challenge-platform/i.test(slice)) hints.push("cloudflare");
  if (/captcha/i.test(slice)) hints.push("captcha");
  return hints.join(" ");
}

export function formatCheckNotes(parts: Record<string, string | number | null>): string {
  return Object.entries(parts)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

export function isAccessBlocked(probe: FetchProbe): boolean {
  if (probe.statusCode === 401 || probe.statusCode === 403) return true;
  if (
    probe.statusCode === 202 &&
    probe.bodyText.length < 120 &&
    !probe.title?.trim()
  ) {
    return true;
  }
  const blob = `${probe.title ?? ""} ${probe.bodyText}`;
  return BOT_BLOCK_PATTERNS.some((re) => re.test(blob));
}

export function detectBrokenSiteReason(
  title: string | null,
  bodyText: string
): string | null {
  const combined = `${title ?? ""} ${bodyText}`;
  if (bodyText.length < 80) return "blank_or_near_empty_page";
  for (const re of PARKED_PATTERNS) {
    if (re.test(combined)) return "parked_domain";
  }
  for (const re of COMING_SOON_PATTERNS) {
    if (re.test(combined)) return "coming_soon_page";
  }
  for (const re of SPAM_PATTERNS) {
    if (re.test(combined)) return "spam_or_hacked_signals";
  }
  return null;
}

export function isBrokenHttpStatus(statusCode: number | null | undefined): boolean {
  if (statusCode == null) return false;
  if (statusCode === 401 || statusCode === 403) return false;
  return statusCode >= 400;
}

export function classifyProbeResult(input: {
  initialUrl: string;
  businessName: string;
  probe: FetchProbe;
  finalUrlIsSocialOrDirectory: boolean;
  appearsToBelongToBusiness: boolean;
  hasServicesOrContact: boolean;
}): WebsiteCheckOutcome {
  const { initialUrl, probe, finalUrlIsSocialOrDirectory } = input;
  const base = {
    initialUrl,
    finalUrl: probe.finalUrl,
    statusCode: probe.statusCode,
    title: probe.title,
  };

  if (finalUrlIsSocialOrDirectory) {
    return {
      status: "SOCIAL_OR_DIRECTORY_ONLY",
      notes: formatCheckNotes({
        reason: "redirect_to_social_or_directory",
        status: probe.statusCode,
        final: probe.finalUrl,
        title: probe.title,
      }),
      ...base,
    };
  }

  if (!probe.ok) {
    const reason = probe.error ?? "fetch_error";
    return {
      status: "BROKEN_OR_BAD_SITE",
      notes: formatCheckNotes({
        reason,
        url: initialUrl,
        final: probe.finalUrl,
      }),
      ...base,
    };
  }

  if (isAccessBlocked(probe)) {
    return {
      status: "NEEDS_MANUAL_REVIEW",
      notes: formatCheckNotes({
        reason: "bot_or_access_blocked",
        status: probe.statusCode,
        final: probe.finalUrl,
        title: probe.title,
      }),
      ...base,
    };
  }

  if (isBrokenHttpStatus(probe.statusCode)) {
    return {
      status: "BROKEN_OR_BAD_SITE",
      notes: formatCheckNotes({
        reason: `http_${probe.statusCode}`,
        final: probe.finalUrl,
        title: probe.title,
      }),
      ...base,
    };
  }

  const badReason = detectBrokenSiteReason(probe.title, probe.bodyText);
  if (badReason) {
    return {
      status: "BROKEN_OR_BAD_SITE",
      notes: formatCheckNotes({
        reason: badReason,
        status: probe.statusCode,
        final: probe.finalUrl,
        title: probe.title,
      }),
      ...base,
    };
  }

  if (
    probe.statusCode &&
    probe.statusCode >= 200 &&
    probe.statusCode < 400 &&
    input.appearsToBelongToBusiness &&
    (input.hasServicesOrContact || probe.bodyText.length > 500)
  ) {
    return {
      status: "HAS_REAL_SITE",
      notes: formatCheckNotes({
        reason: "working_site",
        status: probe.statusCode,
        final: probe.finalUrl,
        title: probe.title,
      }),
      ...base,
    };
  }

  return {
    status: "BROKEN_OR_BAD_SITE",
    notes: formatCheckNotes({
      reason: "thin_or_unrelated_site",
      status: probe.statusCode,
      final: probe.finalUrl,
      title: probe.title,
    }),
    ...base,
  };
}
