export const SMTP_ENV_KEYS = [
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
] as const;

export const IMAP_ENV_KEYS = [
  "IMAP_USER",
  "IMAP_PASS",
  "IMAP_HOST",
  "IMAP_PORT",
  "IMAP_SECURE",
] as const;

export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  requireTls: boolean;
  user: string;
  pass: string;
}

export interface ImapSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

export function parseSecure(value: string | undefined, fallback = true): boolean {
  if (value == null || value.trim() === "") return fallback;
  const v = value.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export function parsePort(value: string | undefined, fallback: number): number {
  const n = parseInt(value ?? "", 10);
  return Number.isFinite(n) ? n : fallback;
}

function parseRequireTls(
  env: Record<string, string | undefined>,
  secure: boolean,
  port: number
): boolean {
  if (env.SMTP_REQUIRE_TLS != null && env.SMTP_REQUIRE_TLS.trim() !== "") {
    return parseSecure(env.SMTP_REQUIRE_TLS, false);
  }
  return !secure && port === 587;
}

export function smtpEnvStatus(env: Record<string, string | undefined>): {
  present: boolean;
  missing: string[];
} {
  const missing = SMTP_ENV_KEYS.filter((k) => !env[k]?.trim());
  return { present: missing.length === 0, missing: [...missing] };
}

export function imapEnvStatus(env: Record<string, string | undefined>): {
  present: boolean;
  missing: string[];
} {
  const missing = IMAP_ENV_KEYS.filter((k) => !env[k]?.trim());
  return { present: missing.length === 0, missing: [...missing] };
}

export function requireSmtpSettings(env: Record<string, string | undefined>): SmtpSettings {
  const { missing } = smtpEnvStatus(env);
  if (missing.length) {
    throw new Error(`Missing SMTP env: ${missing.join(", ")}`);
  }
  const port = parsePort(env.SMTP_PORT, 587);
  const secure = parseSecure(env.SMTP_SECURE, port === 465);
  return {
    host: env.SMTP_HOST!.trim(),
    port,
    secure,
    requireTls: parseRequireTls(env, secure, port),
    user: env.SMTP_USER!.trim(),
    pass: env.SMTP_PASS!.trim(),
  };
}

export function requireImapSettings(env: Record<string, string | undefined>): ImapSettings {
  const { missing } = imapEnvStatus(env);
  if (missing.length) {
    throw new Error(`Missing IMAP env: ${missing.join(", ")}`);
  }
  return {
    host: env.IMAP_HOST!.trim(),
    port: parsePort(env.IMAP_PORT, 993),
    secure: parseSecure(env.IMAP_SECURE, true),
    user: env.IMAP_USER!.trim(),
    pass: env.IMAP_PASS!.trim(),
  };
}

export function smtpTransportOptions(smtp: SmtpSettings): {
  host: string;
  port: number;
  secure: boolean;
  requireTLS: boolean;
  auth: { user: string; pass: string };
} {
  return {
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    requireTLS: smtp.requireTls,
    auth: { user: smtp.user, pass: smtp.pass },
  };
}

export function imapClientOptions(
  imap: ImapSettings,
  debug: boolean
): {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
  logger: false | undefined;
} {
  return {
    host: imap.host,
    port: imap.port,
    secure: imap.secure,
    auth: { user: imap.user, pass: imap.pass },
    logger: debug ? undefined : false,
  };
}
