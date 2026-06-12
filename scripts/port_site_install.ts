import fs from "node:fs";
import path from "node:path";
import { runCommand, type CommandResult } from "./concurrency.js";

/** Shown when build is attempted without a fresh npm install. */
export const PORT_INSTALL_REQUIRED_MSG =
  "PORT_GATE: npm install is required before build (node_modules missing or stale relative to package.json)";

export function hasPackageJson(siteDir: string): boolean {
  return fs.existsSync(path.join(siteDir, "package.json"));
}

/**
 * True when package.json exists and node_modules is absent or older than
 * package.json / package-lock.json (dependencies may have changed).
 */
export function needsNpmInstall(siteDir: string): boolean {
  const pkgPath = path.join(siteDir, "package.json");
  if (!fs.existsSync(pkgPath)) return false;

  const nodeModules = path.join(siteDir, "node_modules");
  if (!fs.existsSync(nodeModules)) return true;

  const pkgMtime = fs.statSync(pkgPath).mtimeMs;
  const lockPath = path.join(siteDir, "package-lock.json");
  const lockMtime = fs.existsSync(lockPath) ? fs.statSync(lockPath).mtimeMs : pkgMtime;
  const nmMtime = fs.statSync(nodeModules).mtimeMs;
  const dependencyMtime = Math.max(pkgMtime, lockMtime);
  return dependencyMtime > nmMtime;
}

export function checkInstallGate(
  siteDir: string
): { ok: true } | { ok: false; error: string } {
  if (!needsNpmInstall(siteDir)) return { ok: true };
  return { ok: false, error: PORT_INSTALL_REQUIRED_MSG };
}

export type RunCommandFn = typeof runCommand;

export async function ensureNpmInstall(
  siteDir: string,
  options: { logFile?: string; runCommandFn?: RunCommandFn } = {}
): Promise<{ ok: true } | { ok: false; error: string; result?: CommandResult }> {
  if (!hasPackageJson(siteDir)) return { ok: true };
  if (!needsNpmInstall(siteDir)) return { ok: true };

  const run = options.runCommandFn ?? runCommand;
  const result = await run("npm", ["install"], { cwd: siteDir, logFile: options.logFile });
  if (!result.ok) {
    return { ok: false, error: "npm install failed after port", result };
  }
  return { ok: true };
}

/**
 * Install (when needed) then build. Fails with PORT_INSTALL_REQUIRED_MSG when
 * `skipInstall` is set but node_modules is missing or stale.
 */
export async function runPortSiteBuild(
  siteDir: string,
  options: {
    logFile?: string;
    skipInstall?: boolean;
    runCommandFn?: RunCommandFn;
  } = {}
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasPackageJson(siteDir)) {
    return { ok: false, error: "PORT_GATE: package.json missing under site directory" };
  }

  if (options.skipInstall) {
    const gate = checkInstallGate(siteDir);
    if (!gate.ok) return gate;
  } else {
    const install = await ensureNpmInstall(siteDir, {
      logFile: options.logFile,
      runCommandFn: options.runCommandFn,
    });
    if (!install.ok) return { ok: false, error: install.error };
  }

  const run = options.runCommandFn ?? runCommand;
  const build = await run("npm", ["run", "build"], { cwd: siteDir, logFile: options.logFile });
  if (!build.ok) {
    return { ok: false, error: "next build failed after port" };
  }
  return { ok: true };
}
