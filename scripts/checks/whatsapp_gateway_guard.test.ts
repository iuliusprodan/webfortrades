import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");
const CONFIG = path.join(ROOT, "config.yaml");

async function main(): Promise<void> {
  const original = fs.readFileSync(CONFIG, "utf8");
  const patched = original
    .replace(/(\s*sending_enabled:\s*)false/, "$1true")
    .replace(/(\s*test_recipient_only:\s*)false/, "$1true");
  fs.writeFileSync(CONFIG, patched);
  try {
    process.env.MY_OWN_TEST_NUMBER = "07700900123";
    const mod = await import("../whatsapp_gateway.js");
    await assert.rejects(
      () => mod.sendWhatsAppMessage("07888888888", "test"),
      /test_recipient_only is true/
    );
    console.log("whatsapp_gateway_guard: ok");
  } finally {
    fs.writeFileSync(CONFIG, original);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
