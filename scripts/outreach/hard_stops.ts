import type { HardStopReason } from "./types.js";

const TRANSIENT_HTTP = new Set([408, 429, 502, 503, 504]);

export interface ClassifiedSendError {
  message: string;
  hardStop: boolean;
  reason: HardStopReason | null;
  httpStatus?: number;
}

export function classifySendError(err: unknown): ClassifiedSendError {
  const message = err instanceof Error ? err.message : String(err);
  const httpStatus = (err as { httpStatus?: number }).httpStatus;

  if (/OpenWA API is not reachable|OpenWA session not ready|gateway.*unreachable|fetch failed/i.test(message)) {
    return { message, hardStop: true, reason: "gateway_unreachable", httpStatus };
  }

  if (/not WhatsApp available|recipient.*unavailable|number.*not.*whatsapp|unavailable/i.test(message)) {
    return { message, hardStop: true, reason: "recipient_unavailable", httpStatus };
  }

  if (/hard bounce|blocked|opt-out|do not contact/i.test(message)) {
    return { message, hardStop: true, reason: "recipient_unavailable", httpStatus };
  }

  if (typeof httpStatus === "number") {
    if (httpStatus >= 500 && !TRANSIENT_HTTP.has(httpStatus)) {
      return { message, hardStop: true, reason: "http_server_error", httpStatus };
    }
    if (httpStatus >= 400 && httpStatus < 500 && !TRANSIENT_HTTP.has(httpStatus)) {
      return { message, hardStop: true, reason: "http_client_error", httpStatus };
    }
  }

  if (/gateway_http_5\d\d|auth_http_4\d\d|health_http_5/i.test(message)) {
    const statusMatch = /\d{3}/.exec(message);
    const status = statusMatch ? Number(statusMatch[0]) : undefined;
    if (status && status >= 500 && !TRANSIENT_HTTP.has(status)) {
      return { message, hardStop: true, reason: "http_server_error", httpStatus: status };
    }
    if (status && status >= 400 && status < 500 && !TRANSIENT_HTTP.has(status)) {
      return { message, hardStop: true, reason: "http_client_error", httpStatus: status };
    }
  }

  return { message, hardStop: false, reason: null, httpStatus };
}

export function shouldHaltBatch(
  failureCount: number,
  maxFailuresBeforeHalt = 1
): boolean {
  return failureCount > maxFailuresBeforeHalt;
}

export function formatHardStop(reason: HardStopReason): string {
  switch (reason) {
    case "gateway_unreachable":
      return "OpenWA gateway unreachable or session not ready";
    case "http_client_error":
      return "Non-transient HTTP 4xx from gateway";
    case "http_server_error":
      return "Non-transient HTTP 5xx from gateway";
    case "recipient_unavailable":
      return "Recipient unavailable, blocked, or not on WhatsApp";
    case "cumulative_failures":
      return "More than one send failure in this batch";
    case "safety_flag_drift":
      return "Outreach safety flags changed externally during batch";
    default:
      return reason;
  }
}
