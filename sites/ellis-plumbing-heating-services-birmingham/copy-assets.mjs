import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const slug = "ellis-plumbing-heating-services-birmingham";
const imgDir = path.join(__dirname, "public/assets/images");

fs.mkdirSync(imgDir, { recursive: true });
for (const file of fs.readdirSync(path.join(root, "open-design-artifacts", slug, "assets/images"))) {
  fs.copyFileSync(
    path.join(root, "open-design-artifacts", slug, "assets/images", file),
    path.join(imgDir, file)
  );
}
fs.copyFileSync(
  path.join(root, "briefs", slug, "brief.json"),
  path.join(__dirname, "data/brief.json")
);
console.log(`Copied ${fs.readdirSync(imgDir).length} images and brief.json`);
