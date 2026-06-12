import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const root = path.resolve(siteDir, "../..");
const slug = "m-ross-building-services";
const imagesSrc = path.join(root, "briefs", slug, "images");
const imagesDst = path.join(siteDir, "public", "assets", "images");

fs.mkdirSync(imagesDst, { recursive: true });

if (fs.existsSync(imagesSrc)) {
  for (const file of fs.readdirSync(imagesSrc).filter((name) => name.endsWith(".webp"))) {
    fs.copyFileSync(path.join(imagesSrc, file), path.join(imagesDst, file));
  }
}

const briefSrc = path.join(root, "briefs", slug, "brief.json");
const briefDst = path.join(siteDir, "data", "brief.json");
if (fs.existsSync(briefSrc)) {
  fs.copyFileSync(briefSrc, briefDst);
}

console.log(`Copied assets to ${imagesDst}`);
