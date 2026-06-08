import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { getLeadBySlug, getNextDeployableLead, updateLead } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function loadEnv(): Record<string, string> {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return {};
  const vars: Record<string, string> = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

function parseArgs(): { slug?: string } {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
  }
  return { slug };
}

function extractDeployUrl(output: string): string | null {
  const patterns = [
    /Production:\s*(https:\/\/[^\s]+)/i,
    /https:\/\/[a-z0-9-]+\.vercel\.app/i,
  ];
  for (const pattern of patterns) {
    const match = output.match(pattern);
    if (match) return match[1] ?? match[0];
  }
  return null;
}

async function verifyMobileHttps(url: string): Promise<void> {
  if (!url.startsWith("https://")) {
    throw new Error(`URL is not HTTPS: ${url}`);
  }

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    if (!response) throw new Error("No response from deployed URL");
    if (response.status() >= 400) {
      throw new Error(`Deployed URL returned HTTP ${response.status()}`);
    }

    const finalUrl = page.url();
    if (!finalUrl.startsWith("https://")) {
      throw new Error(`Redirect dropped HTTPS: ${finalUrl}`);
    }

    const title = await page.title();
    if (/PLACEHOLDER/i.test(title)) {
      throw new Error("Page title still contains PLACEHOLDER");
    }

    console.log(`Mobile check OK — ${finalUrl} (${title})`);
  } finally {
    await browser.close();
  }
}

async function main(): Promise<void> {
  const { slug: slugArg } = parseArgs();
  const lead = slugArg ? getLeadBySlug(slugArg) : getNextDeployableLead();

  if (!lead?.slug) {
    console.error(
      "No deployable lead (REVIEWED or BUILT). Run build:site and review first."
    );
    process.exit(1);
  }

  const env = { ...loadEnv(), ...process.env };
  const token = env.VERCEL_TOKEN;
  if (!token) {
    console.error("Missing VERCEL_TOKEN in .env");
    process.exit(1);
  }

  const slug = lead.slug;
  const siteDir = path.join(ROOT, "sites", slug);

  if (!fs.existsSync(path.join(siteDir, "package.json"))) {
    console.error(`Site folder not found: ${siteDir}`);
    process.exit(1);
  }

  console.log(`Building sites/${slug}...`);
  execSync("npm run build", { cwd: siteDir, stdio: "inherit" });

  const projectName = `wft-${slug}`.slice(0, 63);
  console.log(`Deploying to Vercel (project: ${projectName})...`);

  const deployCmd = [
    "npx",
    "vercel@latest",
    "deploy",
    "--prod",
    "--yes",
    `--token=${token}`,
    `--name=${projectName}`,
  ].join(" ");

  let deployOutput = "";
  try {
    deployOutput = execSync(deployCmd, {
      cwd: siteDir,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, VERCEL_TOKEN: token },
    });
    process.stdout.write(deployOutput);
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string };
    deployOutput = [e.stdout, e.stderr].filter(Boolean).join("\n");
    if (deployOutput) process.stderr.write(deployOutput);
    throw err;
  }

  const siteUrl = extractDeployUrl(deployOutput);
  if (!siteUrl) {
    throw new Error("Could not parse deployment URL from Vercel CLI output");
  }

  console.log(`\nVerifying ${siteUrl} on mobile viewport...`);
  await verifyMobileHttps(siteUrl);

  updateLead(lead.id, {
    state: "DEPLOYED",
    site_url: siteUrl,
  });

  console.log(`\n✓ Deployed: ${siteUrl}`);
  console.log(`✓ State → DEPLOYED (lead id=${lead.id}, ${lead.business_name})`);
  console.log(`\nOpen: ${siteUrl}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
