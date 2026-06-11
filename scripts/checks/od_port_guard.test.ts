import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { hasOpenDesignPort, OD_PORT_MARKER } from "../site_config.js";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wft-od-port-"));
const siteDir = path.join(tmp, "sites", "demo");
fs.mkdirSync(siteDir, { recursive: true });
assert.equal(hasOpenDesignPort(siteDir), false);
fs.writeFileSync(path.join(siteDir, OD_PORT_MARKER), "ported from Open Design\n");
assert.equal(hasOpenDesignPort(siteDir), true);
console.log("od_port_guard: ok");
