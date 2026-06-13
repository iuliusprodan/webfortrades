/**
 * ARCH-7 static guard: config.yaml is read-only at runtime.
 *
 * Fails the build if any source file under scripts/ contains code that writes config.yaml
 * (writeFileSync / appendFileSync / createWriteStream / truncate / rm targeting config.yaml,
 * directly via the "config.yaml" literal or via a variable assigned a config.yaml path).
 *
 * This is the static counterpart to the runtime mtime assertion in scripts/config_guard.ts.
 * It exists because the retired enableLiveOutreach() helper used to flip sending_enabled by
 * rewriting config.yaml on the fly — exactly the pattern this check now bans.
 *
 * Run: tsx scripts/checks/no_config_yaml_writes.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCRIPTS_DIR = path.join(ROOT, "scripts");

const WRITE_FNS = [
  "writeFileSync",
  "writeFile",
  "appendFileSync",
  "appendFile",
  "createWriteStream",
  "outputFileSync",
  "outputFile",
  "truncateSync",
  "truncate",
  "copyFileSync",
  "renameSync",
];

// Files allowed to mention config.yaml + a write-ish token without it being a real violation.
const ALLOWLIST = new Set<string>([
  // This check itself names the patterns it bans.
  path.join(SCRIPTS_DIR, "checks", "no_config_yaml_writes.ts"),
]);

interface Violation {
  file: string;
  line: number;
  text: string;
}

function listTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      out.push(...listTsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

// Variables that resolve to the ROOT config.yaml (not a temp/fixture copy). A var qualifies
// when it is assigned either the bare "config.yaml" literal (cwd-relative) or a path joined
// with a project-root indicator (ROOT/root/__dirname/process.cwd()) plus config.yaml.
// A var assigned path.join(tmp, "config.yaml") deliberately does NOT qualify.
function rootConfigVars(content: string): Set<string> {
  const vars = new Set<string>();
  const re =
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:["']config\.yaml["']|[^;\n]*\b(?:ROOT|root|__dirname|process\.cwd\(\))\b[^;\n]*config\.yaml)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m[1]) vars.add(m[1]);
  }
  return vars;
}

function writesRootConfig(window: string, fn: string, vars: Set<string>): boolean {
  // path.join(ROOT, ..., "config.yaml") / path.resolve(root, "config.yaml")
  if (
    /path\.(?:join|resolve)\([^)]*\b(?:ROOT|root|__dirname|process\.cwd\(\))\b[^)]*config\.yaml[^)]*\)/.test(
      window
    )
  ) {
    return true;
  }
  // writeFn("config.yaml", ...) — bare cwd-relative literal as the first argument
  if (new RegExp(`\\b${fn}\\(\\s*["']config\\.yaml["']`).test(window)) return true;
  // writeFn(rootConfigVar, ...)
  if (vars.size > 0) {
    const alt = [...vars].map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    if (new RegExp(`\\b${fn}\\(\\s*(?:${alt})\\b`).test(window)) return true;
  }
  return false;
}

function scanFile(file: string): Violation[] {
  if (ALLOWLIST.has(file)) return [];
  const content = fs.readFileSync(file, "utf8");
  if (!content.includes("config.yaml")) return [];

  const vars = rootConfigVars(content);
  const lines = content.split("\n");
  const violations: Violation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const fn = WRITE_FNS.find((f) => new RegExp(`\\b${f}\\s*\\(`).test(line));
    if (!fn) continue;

    // Examine the call site and a small forward window so multi-line argument lists
    // (writeFileSync(\n  configPath, ...)) are covered.
    const window = lines.slice(i, i + 4).join("\n");
    if (writesRootConfig(window, fn, vars)) {
      violations.push({ file, line: i + 1, text: line.trim() });
    }
  }
  return violations;
}

function main(): void {
  const files = listTsFiles(SCRIPTS_DIR);
  const violations = files.flatMap(scanFile);

  if (violations.length > 0) {
    console.error("ARCH-7 violation: config.yaml must be read-only at runtime.");
    console.error("The following source locations write config.yaml:");
    for (const v of violations) {
      console.error(`  ${path.relative(ROOT, v.file)}:${v.line}  ${v.text}`);
    }
    process.exit(1);
  }

  console.log(
    `no_config_yaml_writes: OK (${files.length} files scanned, no config.yaml writers)`
  );
}

main();
