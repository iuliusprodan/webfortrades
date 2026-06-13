/**
 * ARCH-7 runtime guard: config.yaml is read-only at runtime.
 *
 * Importing this module captures a snapshot (mtime + size + content hash) of config.yaml at
 * process startup. If config.yaml changes during the run — the signature of a runtime write
 * such as the retired enableLiveOutreach() gate-flip — `assertConfigUnchanged()` throws, and
 * a best-effort process-exit hook flags the violation and sets a non-zero exit code.
 *
 * This is the runtime counterpart to the static check in scripts/checks/no_config_yaml_writes.ts.
 * Side-effect import: `import "./config_guard.js";` at the top of an entrypoint is enough.
 *
 * Note (ARCH-7): a hard filesystem lock (chmod 0444) is intentionally NOT applied here; this
 * guard is detection-only by design.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = path.join(ROOT, "config.yaml");

interface ConfigSnapshot {
  mtimeMs: number;
  size: number;
  hash: string;
}

function snapshot(): ConfigSnapshot | null {
  try {
    const stat = fs.statSync(CONFIG_PATH);
    const buf = fs.readFileSync(CONFIG_PATH);
    return {
      mtimeMs: stat.mtimeMs,
      size: stat.size,
      hash: createHash("sha256").update(buf).digest("hex"),
    };
  } catch {
    return null;
  }
}

// Captured once, at process startup (first import / module load).
const startup = snapshot();

function changedSince(start: ConfigSnapshot, now: ConfigSnapshot | null): boolean {
  if (!now) return true; // disappeared mid-run
  return (
    now.hash !== start.hash ||
    now.mtimeMs !== start.mtimeMs ||
    now.size !== start.size
  );
}

/**
 * Throws if config.yaml has changed (mtime, size, or content) since process startup.
 * Call this before any operation that depends on config.yaml being authoritative.
 */
export function assertConfigUnchanged(context = "runtime"): void {
  if (!startup) return; // no config at startup; nothing to protect
  if (changedSince(startup, snapshot())) {
    throw new Error(
      `ARCH-7 violation: config.yaml was modified during ${context}. ` +
        "config.yaml is read-only at runtime; never write it from code " +
        "(see scripts/checks/no_config_yaml_writes.ts)."
    );
  }
}

// Best-effort automatic check at process exit. We cannot throw from an 'exit' handler, so we
// log loudly and set a non-zero exit code instead.
process.on("exit", () => {
  if (!startup) return;
  if (changedSince(startup, snapshot())) {
    process.exitCode = process.exitCode || 1;
    console.error(
      "ARCH-7 violation: config.yaml changed during this process. " +
        "It must be read-only at runtime."
    );
  }
});
