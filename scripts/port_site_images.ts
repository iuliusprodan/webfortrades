import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./site_config.js";

/** Prefix for port failures when a page.tsx gallery ref is missing from public/. */
export const PORT_IMAGE_MISSING_MSG_PREFIX =
  "PORT_GATE: gallery image missing after copy to public/assets/images/";

export interface ImageCopyResult {
  copied: number;
  missing: string[];
}

export function imageRefsFromPageContent(content: string): string[] {
  const refs = new Set<string>();
  for (const m of content.matchAll(
    /\/(?:assets\/)?images\/([a-zA-Z0-9._-]+\.(?:webp|jpg|jpeg|png|gif))/g
  )) {
    refs.add(m[1]!);
  }
  return [...refs];
}

export function imageRefsFromSite(siteDir: string): string[] {
  const page = path.join(siteDir, "app", "page.tsx");
  if (!fs.existsSync(page)) return [];
  return imageRefsFromPageContent(fs.readFileSync(page, "utf8"));
}

export function publicImagePath(siteDir: string, filename: string): string {
  return path.join(siteDir, "public", "assets", "images", filename);
}

export function copyBriefImagesToSite(
  slug: string,
  root: string = ROOT
): ImageCopyResult {
  const briefImg = path.join(root, "briefs", slug, "images");
  const siteDir = path.join(root, "sites", slug);
  const missing: string[] = [];
  let copied = 0;
  const refs = new Set(imageRefsFromSite(siteDir));

  if (refs.size === 0) {
    return { copied: 0, missing: [] };
  }

  const destDir = path.join(siteDir, "public", "assets", "images");
  fs.mkdirSync(destDir, { recursive: true });

  for (const name of refs) {
    const src = path.join(briefImg, name);
    const dest = path.join(destDir, name);
    if (!fs.existsSync(src)) {
      missing.push(name);
      continue;
    }
    fs.copyFileSync(src, dest);
    copied++;
  }

  if (fs.existsSync(briefImg)) {
    for (const f of fs.readdirSync(briefImg)) {
      if (!/\.(webp|jpg|jpeg|png)$/i.test(f)) continue;
      const dest = path.join(destDir, f);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(path.join(briefImg, f), dest);
        copied++;
      }
    }
  }

  return { copied, missing };
}

export function missingPublicImages(siteDir: string): string[] {
  const refs = imageRefsFromSite(siteDir);
  return refs.filter((name) => !fs.existsSync(publicImagePath(siteDir, name)));
}

export function formatImageGateError(missing: string[]): string {
  return `${PORT_IMAGE_MISSING_MSG_PREFIX}${missing.join(", ")}`;
}

/**
 * Copy brief images into the site public folder, then fail if any page.tsx
 * reference is still absent from public/assets/images/.
 */
export function runPortSiteImageGate(
  slug: string,
  root: string = ROOT
): { ok: true; copied: number } | { ok: false; error: string } {
  const siteDir = path.join(root, "sites", slug);
  const { copied, missing: briefMissing } = copyBriefImagesToSite(slug, root);

  const stillMissing = [
    ...new Set([...briefMissing, ...missingPublicImages(siteDir)]),
  ];
  if (stillMissing.length) {
    return { ok: false, error: formatImageGateError(stillMissing) };
  }
  return { ok: true, copied };
}
