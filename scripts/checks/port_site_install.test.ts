import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  PORT_INSTALL_REQUIRED_MSG,
  checkInstallGate,
  needsNpmInstall,
  runPortSiteBuild,
} from "../port_site_install.js";
import type { CommandResult } from "../concurrency.js";

function test(name: string, fn: () => void | Promise<void>): void | Promise<void> {
  try {
    const r = fn();
    if (r instanceof Promise) {
      return r.then(() => console.log(`  ✓ ${name}`)).catch((err) => {
        console.error(`  ✗ ${name}`);
        throw err;
      });
    }
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

function tmpSite(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wft-port-install-"));
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "test-site", scripts: { build: "node -e \"\"" } }, null, 2) + "\n"
  );
  return dir;
}

console.log("port_site_install");

await test("needsNpmInstall when node_modules missing", () => {
  const dir = tmpSite();
  try {
    assert.equal(needsNpmInstall(dir), true);
    const gate = checkInstallGate(dir);
    assert.equal(gate.ok, false);
    if (!gate.ok) assert.equal(gate.error, PORT_INSTALL_REQUIRED_MSG);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

await test("needsNpmInstall false when node_modules is fresh", () => {
  const dir = tmpSite();
  const nm = path.join(dir, "node_modules");
  fs.mkdirSync(nm);
  const now = Date.now();
  fs.utimesSync(path.join(dir, "package.json"), now / 1000, (now - 5000) / 1000);
  fs.utimesSync(nm, now / 1000, now / 1000);
  try {
    assert.equal(needsNpmInstall(dir), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

await test("runPortSiteBuild fails cleanly when install skipped but required", async () => {
  const dir = tmpSite();
  let buildCalled = false;
  const mockRun = async (cmd: string, args: string[]): Promise<CommandResult> => {
    if (cmd === "npm" && args[0] === "run" && args[1] === "build") {
      buildCalled = true;
    }
    return { ok: true, code: 0, stdout: "", stderr: "" };
  };
  try {
    const result = await runPortSiteBuild(dir, { skipInstall: true, runCommandFn: mockRun });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, PORT_INSTALL_REQUIRED_MSG);
    assert.equal(buildCalled, false, "build must not run when install gate fails");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

await test("runPortSiteBuild runs install then build when node_modules missing", async () => {
  const dir = tmpSite();
  const calls: string[] = [];
  const mockRun = async (cmd: string, args: string[]): Promise<CommandResult> => {
    if (cmd === "npm" && args[0] === "install") {
      calls.push("install");
      fs.mkdirSync(path.join(dir, "node_modules"));
    }
    if (cmd === "npm" && args[0] === "run" && args[1] === "build") {
      calls.push("build");
    }
    return { ok: true, code: 0, stdout: "", stderr: "" };
  };
  try {
    const result = await runPortSiteBuild(dir, { runCommandFn: mockRun });
    assert.equal(result.ok, true);
    assert.deepEqual(calls, ["install", "build"]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

console.log("\nAll port_site_install tests passed.");
