import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import type { WhatsAppStatus } from "./db.js";
import { ensureOpenWA } from "./openwa_ensure.js";
import {
  formatPhoneForWhatsApp,
  isWhatsAppCandidate,
} from "./phone_utils.js";
import { requireTestRecipientNumber } from "./test_recipient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

interface OutreachConfig {
  sending_enabled: boolean;
  test_recipient_only?: boolean;
  whatsapp_check_enabled: boolean;
  whatsapp_mode: string;
}

interface Config {
  outreach: OutreachConfig;
}

export interface WhatsAppCheckResult {
  status: WhatsAppStatus;
  checked: boolean;
  detail: string | null;
}

export interface WhatsAppContactPayload {
  phone: string;
  contactName: string;
  ownerFirstName: string | null;
  businessName: string;
}

export interface OpenWAHealthResult {
  reachable: boolean;
  healthy: boolean;
  detail: string | null;
}

export interface OpenWASessionResult {
  found: boolean;
  connected: boolean;
  status: string | null;
  detail: string | null;
}

export interface OpenWAAuthResult {
  valid: boolean;
  detail: string | null;
}

interface OpenWAEnv {
  apiUrl: string;
  apiKey: string;
  sessionId: string;
}

export function loadEnv(): Record<string, string> {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return {};
  const vars: Record<string, string> = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

export function openwaEnvStatus(
  env: Record<string, string | undefined> = { ...process.env, ...loadEnv() }
): { present: boolean; missing: string[] } {
  const required = ["OPENWA_API_URL", "OPENWA_API_KEY", "OPENWA_SESSION_ID"];
  const missing = required.filter((key) => !env[key]?.trim());
  return { present: missing.length === 0, missing };
}

function mergedEnv(): Record<string, string | undefined> {
  return { ...process.env, ...loadEnv() };
}

function loadConfig(): Config {
  return parseYaml(fs.readFileSync(path.join(ROOT, "config.yaml"), "utf8")) as Config;
}

/** Block live business numbers when test_recipient_only is enabled. */
function assertOutboundRecipientAllowed(phone: string): void {
  const config = loadConfig();
  if (config.outreach.test_recipient_only !== true) return;

  const testNumber = requireTestRecipientNumber(mergedEnv());
  if (formatPhoneForWhatsApp(phone) !== formatPhoneForWhatsApp(testNumber)) {
    throw new Error(
      "outreach.test_recipient_only is true. Only MY_OWN_TEST_NUMBER may receive WhatsApp sends."
    );
  }
}

/** Start local OpenWA Docker stack when configured but not running (live sends only). */
async function ensureOpenWAForSend(): Promise<void> {
  const env = readOpenWAEnv(mergedEnv());
  if (!env) return;

  const result = await ensureOpenWA({ autoStart: true });
  if (!result.reachable) {
    throw new Error(result.detail ?? "OpenWA API is not reachable.");
  }
  if (!result.ok) {
    throw new Error(
      result.detail ??
        `OpenWA session not ready (status=${result.sessionStatus ?? "unknown"}).`
    );
  }
}

function readOpenWAEnv(env: Record<string, string | undefined>): OpenWAEnv | null {
  const apiUrl = env.OPENWA_API_URL?.trim();
  const apiKey = env.OPENWA_API_KEY?.trim();
  const sessionId = env.OPENWA_SESSION_ID?.trim();
  if (!apiUrl || !apiKey || !sessionId) return null;
  return { apiUrl: apiUrl.replace(/\/$/, ""), apiKey, sessionId };
}

function apiHeaders(apiKey?: string, json = false): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers["X-API-Key"] = apiKey;
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

interface SessionRecord {
  id: string;
  name: string;
  status: string;
}

async function resolveSessionRecord(env: OpenWAEnv): Promise<SessionRecord | null> {
  const direct = await fetch(
    `${env.apiUrl}/api/sessions/${encodeURIComponent(env.sessionId)}`,
    {
      method: "GET",
      headers: apiHeaders(env.apiKey),
      signal: AbortSignal.timeout(12000),
    }
  );

  if (direct.ok) {
    const data = (await parseJsonResponse(direct)) as Record<string, unknown> | null;
    if (data && typeof data.id === "string" && typeof data.status === "string") {
      return {
        id: data.id,
        name: typeof data.name === "string" ? data.name : env.sessionId,
        status: data.status,
      };
    }
  }

  if (direct.status !== 404) return null;

  const listRes = await fetch(`${env.apiUrl}/api/sessions`, {
    method: "GET",
    headers: apiHeaders(env.apiKey),
    signal: AbortSignal.timeout(12000),
  });
  if (!listRes.ok) return null;

  const sessions = (await parseJsonResponse(listRes)) as SessionRecord[] | null;
  if (!Array.isArray(sessions)) return null;

  return (
    sessions.find(
      (session) =>
        session.id === env.sessionId || session.name === env.sessionId
    ) ?? null
  );
}

function parseGatewayAvailability(data: Record<string, unknown>): WhatsAppStatus | null {
  if (data.exists === true || data.numberExists === true || data.isRegistered === true) {
    return "available";
  }
  if (data.exists === false || data.numberExists === false || data.isRegistered === false) {
    return "unavailable";
  }
  if (typeof data.status === "string") {
    const s = data.status.toLowerCase();
    if (s.includes("exist") || s === "ok" || s === "registered") return "available";
    if (s.includes("not") || s.includes("invalid")) return "unavailable";
  }
  return null;
}

function chatIdForPhone(phone: string): string {
  return `${formatPhoneForWhatsApp(phone)}@c.us`;
}

/** Hostname OpenWA (often Docker) uses to reach a temp media server on the host. */
function openwaMediaHost(): string {
  return mergedEnv().OPENWA_MEDIA_HOST?.trim() || "host.docker.internal";
}

async function withLocalMediaUrl<T>(
  filePath: string,
  mimeType: string,
  fn: (url: string, filename: string) => Promise<T>
): Promise<T> {
  const resolved = path.resolve(filePath);
  const filename = path.basename(resolved);

  const server = http.createServer((req, res) => {
    const requested = decodeURIComponent(req.url ?? "");
    if (requested !== `/${filename}`) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "Content-Type": mimeType });
    fs.createReadStream(resolved).pipe(res);
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "0.0.0.0", () => resolve());
  });

  const addr = server.address();
  if (!addr || typeof addr === "string") {
    server.close();
    throw new Error("Could not bind temporary media server.");
  }

  const url = `http://${openwaMediaHost()}:${addr.port}/${filename}`;

  try {
    return await fn(url, filename);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

/** GET /api/health */
export async function getOpenWAStatus(): Promise<OpenWAHealthResult> {
  const env = readOpenWAEnv(mergedEnv());
  if (!env) {
    return { reachable: false, healthy: false, detail: "gateway_not_configured" };
  }

  try {
    const res = await fetch(`${env.apiUrl}/api/health`, {
      method: "GET",
      headers: apiHeaders(),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      return {
        reachable: true,
        healthy: false,
        detail: `health_http_${res.status}`,
      };
    }

    const data = (await parseJsonResponse(res)) as Record<string, unknown> | null;
    const healthy = data?.status === "ok";
    return {
      reachable: true,
      healthy,
      detail: healthy ? null : "health_not_ok",
    };
  } catch (err) {
    return {
      reachable: false,
      healthy: false,
      detail: err instanceof Error ? err.message : "gateway_error",
    };
  }
}

/** POST /api/auth/validate */
export async function validateOpenWAApiKey(): Promise<OpenWAAuthResult> {
  const env = readOpenWAEnv(mergedEnv());
  if (!env) {
    return { valid: false, detail: "gateway_not_configured" };
  }

  try {
    const res = await fetch(`${env.apiUrl}/api/auth/validate`, {
      method: "POST",
      headers: apiHeaders(env.apiKey),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      return { valid: false, detail: `auth_http_${res.status}` };
    }

    const data = (await parseJsonResponse(res)) as Record<string, unknown> | null;
    return {
      valid: data?.valid === true,
      detail: data?.valid === true ? null : "invalid_api_key",
    };
  } catch (err) {
    return {
      valid: false,
      detail: err instanceof Error ? err.message : "gateway_error",
    };
  }
}

/** GET /api/sessions/:id (also resolves OPENWA_SESSION_ID by session name) */
export async function getSessionStatus(): Promise<OpenWASessionResult> {
  const env = readOpenWAEnv(mergedEnv());
  if (!env) {
    return {
      found: false,
      connected: false,
      status: null,
      detail: "gateway_not_configured",
    };
  }

  try {
    const session = await resolveSessionRecord(env);
    if (!session) {
      return {
        found: false,
        connected: false,
        status: null,
        detail: "session_not_found",
      };
    }

    return {
      found: true,
      connected: session.status === "ready",
      status: session.status,
      detail: null,
    };
  } catch (err) {
    return {
      found: false,
      connected: false,
      status: null,
      detail: err instanceof Error ? err.message : "gateway_error",
    };
  }
}

/**
 * Check WhatsApp availability via GET /api/sessions/:sessionId/contacts/check/:number.
 * Returns unknown on gateway errors. Never pretends unavailable on errors.
 */
export async function checkWhatsAppAvailable(phone: string): Promise<WhatsAppCheckResult> {
  const config = loadConfig();

  if (!config.outreach.whatsapp_check_enabled) {
    return {
      status: "unknown",
      checked: false,
      detail: "whatsapp_check_enabled=false",
    };
  }

  if (!isWhatsAppCandidate(phone)) {
    return {
      status: "unavailable",
      checked: true,
      detail: "not_a_mobile",
    };
  }

  const env = readOpenWAEnv(mergedEnv());
  if (!env) {
    return {
      status: "unknown",
      checked: false,
      detail: "gateway_not_configured",
    };
  }

  let session: SessionRecord | null;
  try {
    session = await resolveSessionRecord(env);
  } catch (err) {
    // Gateway unreachable (e.g. ECONNREFUSED when OpenWA is configured but not
    // running). Degrade to unknown -> manual review, never crash gather.
    return {
      status: "unknown",
      checked: true,
      detail: err instanceof Error ? `gateway_error:${err.message}` : "gateway_error",
    };
  }
  if (!session) {
    return {
      status: "unknown",
      checked: true,
      detail: "session_not_found",
    };
  }

  const number = formatPhoneForWhatsApp(phone);
  const url = `${env.apiUrl}/api/sessions/${encodeURIComponent(session.id)}/contacts/check/${encodeURIComponent(number)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: apiHeaders(env.apiKey),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      return {
        status: "unknown",
        checked: true,
        detail: `gateway_http_${res.status}`,
      };
    }

    const data = (await parseJsonResponse(res)) as Record<string, unknown> | null;
    if (!data || typeof data !== "object") {
      return {
        status: "unknown",
        checked: true,
        detail: "ambiguous_gateway_response",
      };
    }

    const parsed = parseGatewayAvailability(data);
    if (parsed) {
      return { status: parsed, checked: true, detail: null };
    }

    return {
      status: "unknown",
      checked: true,
      detail: "ambiguous_gateway_response",
    };
  } catch (err) {
    return {
      status: "unknown",
      checked: true,
      detail: err instanceof Error ? err.message : "gateway_error",
    };
  }
}

/** OpenWA exposes contact list/check APIs only; no create/save contact endpoint. */
export const OPENWA_CONTACT_SAVE_SUPPORTED = false;

/**
 * Save a WhatsApp contact before the first message.
 * OpenWA has no contact-save endpoint; metadata is recorded locally instead.
 */
export async function saveWhatsAppContact(
  payload: WhatsAppContactPayload
): Promise<{ saved: boolean; reason: string }> {
  void payload;
  return {
    saved: false,
    reason: "OpenWA has no contact-create endpoint; save intended contact_name in lead metadata",
  };
}

/**
 * Send a WhatsApp message via POST /api/sessions/:sessionId/messages/send-text.
 * Gated by outreach.sending_enabled.
 */
export async function sendWhatsAppMessage(
  phone: string,
  text: string,
  touch?: number
): Promise<WhatsAppSendResult> {
  const config = loadConfig();
  if (!config.outreach.sending_enabled) {
    throw new Error(
      "WhatsApp sending is disabled. Set outreach.sending_enabled: true in config.yaml."
    );
  }

  assertOutboundRecipientAllowed(phone);

  await ensureOpenWAForSend();

  const env = readOpenWAEnv(mergedEnv());
  if (!env) {
    throw new Error("OPENWA_API_URL, OPENWA_API_KEY, and OPENWA_SESSION_ID are required.");
  }

  const session = await resolveSessionRecord(env);
  if (!session) {
    throw new Error("OpenWA session not found.");
  }

  if (!session.status || session.status !== "ready") {
    throw new Error(
      `OpenWA session is not ready (status=${session.status ?? "unknown"}). Scan the QR code first.`
    );
  }

  if (!isWhatsAppCandidate(phone)) {
    throw new Error("WhatsApp send requires a UK 07 mobile number.");
  }

  const res = await fetch(
    `${env.apiUrl}/api/sessions/${encodeURIComponent(session.id)}/messages/send-text`,
    {
      method: "POST",
      headers: apiHeaders(env.apiKey, true),
      body: JSON.stringify({
        chatId: chatIdForPhone(phone),
        text,
      }),
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!res.ok) {
    throw new Error(`WhatsApp send failed (HTTP ${res.status}).`);
  }

  void touch;
  const data = (await parseJsonResponse(res)) as {
    messageId?: string;
    timestamp?: number;
  } | null;
  return {
    messageId: data?.messageId ?? null,
    timestamp: typeof data?.timestamp === "number" ? data.timestamp : null,
    httpStatus: res.status,
  };
}

export interface WhatsAppSendResult {
  messageId: string | null;
  timestamp: number | null;
  httpStatus: number;
}

export interface WhatsAppVideoOptions {
  caption?: string;
}

/** Tracks in-flight/completed video sends within the current process (same phone + file). */
const completedVideoKeys = new Set<string>();
const inFlightVideoKeys = new Set<string>();

export function resetWhatsAppVideoSendGuards(): void {
  completedVideoKeys.clear();
  inFlightVideoKeys.clear();
}

function videoSendKey(phone: string, videoPath: string): string {
  return `${formatPhoneForWhatsApp(phone)}:${path.resolve(videoPath)}`;
}

/**
 * Send a WhatsApp video via POST /api/sessions/:sessionId/messages/send-video.
 * Uses flat `{ chatId, url, filename, mimetype }` and a short-lived host server
 * via host.docker.internal. No fallback endpoints.
 * Gated by outreach.sending_enabled.
 */
export async function sendWhatsAppVideo(
  phone: string,
  videoPath: string,
  options: WhatsAppVideoOptions = {}
): Promise<WhatsAppSendResult> {
  const key = videoSendKey(phone, videoPath);
  if (completedVideoKeys.has(key)) {
    console.log("Video send: duplicate prevented (gateway guard)");
    return { messageId: null, timestamp: null, httpStatus: 0 };
  }
  if (inFlightVideoKeys.has(key)) {
    console.log("Video send: duplicate prevented (already in flight)");
    return { messageId: null, timestamp: null, httpStatus: 0 };
  }
  inFlightVideoKeys.add(key);

  try {
  const config = loadConfig();
  if (!config.outreach.sending_enabled) {
    throw new Error(
      "WhatsApp sending is disabled. Set outreach.sending_enabled: true in config.yaml."
    );
  }

  assertOutboundRecipientAllowed(phone);

  await ensureOpenWAForSend();

  const env = readOpenWAEnv(mergedEnv());
  if (!env) {
    throw new Error("OPENWA_API_URL, OPENWA_API_KEY, and OPENWA_SESSION_ID are required.");
  }

  const session = await resolveSessionRecord(env);
  if (!session) {
    throw new Error("OpenWA session not found.");
  }

  if (!session.status || session.status !== "ready") {
    throw new Error(
      `OpenWA session is not ready (status=${session.status ?? "unknown"}). Scan the QR code first.`
    );
  }

  if (!isWhatsAppCandidate(phone)) {
    throw new Error("WhatsApp send requires a UK 07 mobile number.");
  }

  const resolved = path.resolve(videoPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Video file not found: ${resolved}`);
  }

  return await withLocalMediaUrl(resolved, "video/mp4", async (url, filename) => {
    const body: Record<string, unknown> = {
      chatId: chatIdForPhone(phone),
      url,
      filename,
      mimetype: "video/mp4",
    };
    if (options.caption?.trim()) {
      body.caption = options.caption.trim();
    }

    const res = await fetch(
      `${env.apiUrl}/api/sessions/${encodeURIComponent(session.id)}/messages/send-video`,
      {
        method: "POST",
        headers: apiHeaders(env.apiKey, true),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      const err = new Error(
        `WhatsApp video send failed (HTTP ${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}.`
      ) as Error & { httpStatus?: number };
      err.httpStatus = res.status;
      throw err;
    }

    completedVideoKeys.add(key);
    const data = (await parseJsonResponse(res)) as {
      messageId?: string;
      timestamp?: number;
    } | null;
    return {
      messageId: data?.messageId ?? null,
      timestamp: typeof data?.timestamp === "number" ? data.timestamp : null,
      httpStatus: res.status,
    };
  });
  } finally {
    inFlightVideoKeys.delete(key);
  }
}
