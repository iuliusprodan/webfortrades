import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import {
  checkWhatsAppAvailable,
  getOpenWAStatus,
  getSessionStatus,
  loadEnv,
  openwaEnvStatus,
  sendWhatsAppMessage,
  validateOpenWAApiKey,
} from "./whatsapp_gateway.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const REQUIRED_ENV = [
  "OPENWA_API_URL",
  "OPENWA_API_KEY",
  "OPENWA_SESSION_ID",
  "MY_OWN_TEST_NUMBER",
] as const;

const TEST_MESSAGE = `WebForTrades WhatsApp test.
If you see this, OpenWA sending works.
No prospects were contacted.`;

interface Config {
  outreach: {
    sending_enabled: boolean;
  };
}

function loadConfig(): Config {
  return parseYaml(fs.readFileSync(path.join(ROOT, "config.yaml"), "utf8")) as Config;
}

function parseArgs(): { sendTest: boolean } {
  return { sendTest: process.argv.includes("--send-test") };
}

function envVarPresent(
  env: Record<string, string | undefined>,
  key: string
): boolean {
  return Boolean(env[key]?.trim());
}

function availabilityLabel(status: string): "yes" | "no" | "unknown" {
  if (status === "available") return "yes";
  if (status === "unavailable") return "no";
  return "unknown";
}

async function runChecks(
  env: Record<string, string | undefined>,
  options: { verbose: boolean }
): Promise<{
  health: Awaited<ReturnType<typeof getOpenWAStatus>>;
  session: Awaited<ReturnType<typeof getSessionStatus>>;
  availability: Awaited<ReturnType<typeof checkWhatsAppAvailable>>;
  testNumber: string;
}> {
  const testNumber = env.MY_OWN_TEST_NUMBER!.trim();
  const health = await getOpenWAStatus();
  const session = await getSessionStatus();
  const availability = await checkWhatsAppAvailable(testNumber);

  if (options.verbose) {
    const auth = await validateOpenWAApiKey();
    console.log(`OpenWA API key valid: ${auth.valid ? "yes" : "no"}`);
    if (auth.detail) console.log(`Auth detail: ${auth.detail}`);
    if (health.detail) console.log(`Health detail: ${health.detail}`);
    if (session.status) console.log(`Session status: ${session.status}`);
    if (session.detail) console.log(`Session detail: ${session.detail}`);
    if (availability.detail) {
      console.log(`Availability detail: ${availability.detail}`);
    }
  }

  return { health, session, availability, testNumber };
}

async function main(): Promise<void> {
  const { sendTest } = parseArgs();
  const env = { ...process.env, ...loadEnv() };

  const missing = REQUIRED_ENV.filter((key) => !envVarPresent(env, key));
  if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
  }

  const openwaEnv = openwaEnvStatus(env);
  if (!openwaEnv.present) {
    console.error(`Missing OpenWA configuration: ${openwaEnv.missing.join(", ")}`);
    process.exit(1);
  }

  if (!sendTest) {
    for (const key of REQUIRED_ENV) {
      console.log(`${key}: ${envVarPresent(env, key) ? "present" : "missing"}`);
    }

    const { health, session, availability } = await runChecks(env, { verbose: true });

    console.log(`OpenWA reachable: ${health.reachable ? "yes" : "no"}`);
    console.log(`Session connected: ${session.connected ? "yes" : "no"}`);
    console.log(
      `WhatsApp availability for MY_OWN_TEST_NUMBER: ${availability.status}`
    );
    console.log("No messages were sent.");
    return;
  }

  const config = loadConfig();
  if (!config.outreach.sending_enabled) {
    console.error(
      "Sending is disabled. Set outreach.sending_enabled=true only for this self-test."
    );
    process.exit(1);
  }

  const { health, session, availability, testNumber } = await runChecks(env, {
    verbose: false,
  });

  let messageSent = false;
  try {
    await sendWhatsAppMessage(testNumber, TEST_MESSAGE);
    messageSent = true;
  } catch (err) {
    console.error((err as Error).message);
  }

  console.log(`OpenWA reachable: ${health.reachable ? "yes" : "no"}`);
  console.log(`Session connected: ${session.connected ? "yes" : "no"}`);
  console.log(`Test number available: ${availabilityLabel(availability.status)}`);
  console.log(`Test message sent: ${messageSent ? "yes" : "no"}`);
  console.log("Confirmation: no prospect messages were sent");

  if (!messageSent) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error((err as Error).message);
  process.exit(1);
});
