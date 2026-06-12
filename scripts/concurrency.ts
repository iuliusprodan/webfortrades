import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

/**
 * Run an async task over a list of items with a fixed-size worker pool.
 * Each task receives the item and a stable slot index (0..concurrency-1) so it
 * can allocate unique ports or scratch space without colliding with peers.
 */
export async function runPool<T, R>(
  items: T[],
  concurrency: number,
  task: (item: T, slot: number, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  const limit = Math.max(1, Math.min(concurrency, items.length || 1));
  let next = 0;

  async function worker(slot: number): Promise<void> {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await task(items[index]!, slot, index);
    }
  }

  await Promise.all(Array.from({ length: limit }, (_, slot) => worker(slot)));
  return results;
}

function sleepSync(ms: number): void {
  const shared = new Int32Array(new SharedArrayBuffer(4));
  Atomics.wait(shared, 0, 0, ms);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Cross-process lock using atomic mkdir. Safe across child processes on one
 * machine. Stale locks (older than staleMs) are reclaimed.
 */
export function acquireLockSync(
  lockDir: string,
  options: { timeoutMs?: number; staleMs?: number } = {}
): () => void {
  const timeoutMs = options.timeoutMs ?? 120_000;
  const staleMs = options.staleMs ?? 180_000;
  const start = Date.now();

  fs.mkdirSync(path.dirname(lockDir), { recursive: true });

  while (true) {
    try {
      fs.mkdirSync(lockDir);
      fs.writeFileSync(path.join(lockDir, "pid"), String(process.pid));
      break;
    } catch {
      try {
        const stat = fs.statSync(lockDir);
        if (Date.now() - stat.mtimeMs > staleMs) {
          fs.rmSync(lockDir, { recursive: true, force: true });
          continue;
        }
      } catch {
        /* lock vanished, retry immediately */
      }
      if (Date.now() - start > timeoutMs) {
        throw new Error(`Timed out waiting for lock: ${lockDir}`);
      }
      sleepSync(150);
    }
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    try {
      fs.rmSync(lockDir, { recursive: true, force: true });
    } catch {
      /* best effort */
    }
  };
}

export function withFileLockSync<T>(
  lockDir: string,
  fn: () => T,
  options?: { timeoutMs?: number; staleMs?: number }
): T {
  const release = acquireLockSync(lockDir, options);
  try {
    return fn();
  } finally {
    release();
  }
}

export async function withFileLock<T>(
  lockDir: string,
  fn: () => Promise<T>,
  options?: { timeoutMs?: number; staleMs?: number }
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? 120_000;
  const staleMs = options?.staleMs ?? 180_000;
  const start = Date.now();

  fs.mkdirSync(path.dirname(lockDir), { recursive: true });

  while (true) {
    try {
      fs.mkdirSync(lockDir);
      fs.writeFileSync(path.join(lockDir, "pid"), String(process.pid));
      break;
    } catch {
      try {
        const stat = fs.statSync(lockDir);
        if (Date.now() - stat.mtimeMs > staleMs) {
          fs.rmSync(lockDir, { recursive: true, force: true });
          continue;
        }
      } catch {
        /* retry */
      }
      if (Date.now() - start > timeoutMs) {
        throw new Error(`Timed out waiting for lock: ${lockDir}`);
      }
      await sleep(150);
    }
  }

  try {
    return await fn();
  } finally {
    try {
      fs.rmSync(lockDir, { recursive: true, force: true });
    } catch {
      /* best effort */
    }
  }
}

export interface CommandResult {
  ok: boolean;
  code: number | null;
  stdout: string;
  stderr: string;
}

/**
 * Run a command to completion, capturing output. Used to drive the existing
 * per-stage CLIs (gather, build, preview, review, deploy) as isolated children.
 */
export function runCommand(
  command: string,
  args: string[],
  options: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    logFile?: string;
    onLine?: (line: string) => void;
  } = {}
): Promise<CommandResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });

    let stdout = "";
    let stderr = "";
    const logStream = options.logFile
      ? fs.createWriteStream(options.logFile, { flags: "a" })
      : null;

    const handle = (buf: Buffer, isErr: boolean) => {
      const text = buf.toString();
      if (isErr) stderr += text;
      else stdout += text;
      if (logStream) logStream.write(text);
      if (options.onLine) {
        for (const line of text.split("\n")) {
          if (line.trim()) options.onLine(line);
        }
      }
    };

    child.stdout.on("data", (b) => handle(b, false));
    child.stderr.on("data", (b) => handle(b, true));

    child.on("close", (code) => {
      if (logStream) logStream.end();
      resolve({ ok: code === 0, code, stdout, stderr });
    });
    child.on("error", (err) => {
      if (logStream) logStream.end();
      resolve({ ok: false, code: null, stdout, stderr: stderr + String(err) });
    });
  });
}
