import fs from "node:fs";
import path from "node:path";
import { execSync, spawn, type ChildProcess } from "node:child_process";

export const PREVIEW_PORT = Number(process.env.WFT_PREVIEW_PORT) || 4322;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function waitForPreviewServer(
  url: string,
  timeoutMs = 90_000
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await sleep(500);
  }
  throw new Error(`Preview server did not start at ${url}`);
}

/** Build static export (out/) for production-like preview capture. */
export function ensureStaticBuild(siteDir: string): void {
  const outIndex = path.join(siteDir, "out", "index.html");
  console.log("Building static export for preview (production mode)...");
  execSync("npm run build", { cwd: siteDir, stdio: "inherit" });
  if (!fs.existsSync(outIndex)) {
    throw new Error(`Static export missing after build: ${outIndex}`);
  }
}

/** Serve sites/<slug>/out with a static file server (no next dev). */
export function startStaticPreviewServer(siteDir: string, port = PREVIEW_PORT): ChildProcess {
  const outDir = path.join(siteDir, "out");
  if (!fs.existsSync(path.join(outDir, "index.html"))) {
    throw new Error(`Missing ${outDir}/index.html. Run build first.`);
  }

  // detached + own process group so stopStaticPreviewServer can kill the whole tree
  // (npx -> node serve). shell:true left orphan listeners on batch review ports.
  return spawn(
    "npx",
    ["--yes", "serve", outDir, "-l", String(port), "--no-clipboard"],
    {
      cwd: siteDir,
      stdio: ["ignore", "pipe", "pipe"],
      detached: true,
    }
  );
}

/** Stop a static preview server and any child processes (e.g. npx, serve). */
export function stopStaticPreviewServer(server: ChildProcess): void {
  if (!server.pid || server.killed) return;
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    try {
      server.kill("SIGTERM");
    } catch {
      /* best effort */
    }
  }
}

export async function withPreviewServer<T>(
  siteDir: string,
  fn: (url: string) => Promise<T>
): Promise<T> {
  ensureStaticBuild(siteDir);
  const url = `http://localhost:${PREVIEW_PORT}`;
  const server = startStaticPreviewServer(siteDir, PREVIEW_PORT);
  try {
    await waitForPreviewServer(url);
    return await fn(url);
  } finally {
    stopStaticPreviewServer(server);
  }
}
