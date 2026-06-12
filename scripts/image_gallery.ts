import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export interface GalleryPhoto {
  local: string;
  source_url: string;
  width: number;
  height: number;
  classification?: string;
  pair_id?: string | null;
  caption?: string;
  cluster_id?: string;
  source_type?: string;
  selected?: boolean;
  selection_reason?: string;
}

const FACEBOOK_SAFE_CAPTIONS = [
  "Recent bathroom work",
  "Heating pipework",
  "Van and local plumbing work",
  "Finished plumbing job",
  "Bathroom finish",
  "Boiler and pipework",
  "Kitchen plumbing work",
  "Radiator installation",
];

const SAFE_CAPTIONS = [
  "Bathroom finish",
  "Radiator pipework",
  "Shower and basin fit",
  "Boiler pipework",
  "Recent plumbing work",
  "Heating pipework",
  "Basin and taps",
  "Toilet and waste fit",
  "Pipework detail",
  "Completed bathroom",
];

const SUPPLIER_OR_ADDRESS =
  /\b(ltd|limited|materials|construction|cemex|yard|dock|industrial estate|unit \d)\b/i;

function averageHash(buffer: Buffer): bigint {
  const pixels: number[] = [];
  for (let i = 0; i < buffer.length; i++) {
    pixels.push(buffer[i]!);
  }
  const avg = pixels.reduce((a, b) => a + b, 0) / pixels.length;
  let hash = 0n;
  for (let i = 0; i < pixels.length; i++) {
    if (pixels[i]! >= avg) hash |= 1n << BigInt(i);
  }
  return hash;
}

function hamming(a: bigint, b: bigint): number {
  let x = a ^ b;
  let count = 0;
  while (x) {
    count += Number(x & 1n);
    x >>= 1n;
  }
  return count;
}

async function photoHash(imagePath: string): Promise<bigint | null> {
  if (!fs.existsSync(imagePath)) return null;
  try {
    const buf = await sharp(imagePath).resize(8, 8, { fit: "fill" }).greyscale().raw().toBuffer();
    return averageHash(buf);
  } catch {
    return null;
  }
}

function filenameSimilarity(a: string, b: string): boolean {
  const baseA = path.basename(a, path.extname(a)).replace(/\d+/g, "");
  const baseB = path.basename(b, path.extname(b)).replace(/\d+/g, "");
  return baseA === baseB && baseA.length > 3;
}

function resolveImagePath(imagesDir: string, local: string): string {
  if (local.includes("/")) {
    return path.join(path.dirname(imagesDir), local.replace(/^images\//, "images/"));
  }
  return path.join(imagesDir, path.basename(local));
}

export async function clusterPhotos(
  photos: GalleryPhoto[],
  imagesDir: string
): Promise<Map<string, string[]>> {
  const clusters = new Map<string, string[]>();
  const assigned = new Set<string>();
  let clusterIndex = 0;

  const hashes = new Map<string, bigint>();
  for (const photo of photos) {
    const imgPath = resolveImagePath(imagesDir, photo.local);
    const h = await photoHash(imgPath);
    if (h !== null) hashes.set(photo.local, h);
  }

  for (const photo of photos) {
    if (assigned.has(photo.local)) continue;
    const clusterId = `cluster-${clusterIndex++}`;
    const members = [photo.local];
    assigned.add(photo.local);
    const h1 = hashes.get(photo.local);

    for (const other of photos) {
      if (assigned.has(other.local)) continue;
      const h2 = hashes.get(other.local);
      let sameCluster = false;
      if (h1 !== undefined && h2 !== undefined && hamming(h1, h2) <= 8) {
        sameCluster = true;
      }
      if (filenameSimilarity(photo.local, other.local)) sameCluster = true;
      if (sameCluster) {
        members.push(other.local);
        assigned.add(other.local);
      }
    }
    clusters.set(clusterId, members);
  }

  return clusters;
}

export function safePhotoCaption(
  index: number,
  photo: GalleryPhoto,
  basedCity: string | null,
  clusterSize: number
): string {
  if (photo.caption?.trim()) return photo.caption.trim();
  const pool =
    photo.source_type?.startsWith("facebook") ? FACEBOOK_SAFE_CAPTIONS : SAFE_CAPTIONS;
  const base = pool[index % pool.length]!;
  if (clusterSize > 2) {
    return `${base} (same project)`;
  }
  // Facebook captions must not invent locations.
  if (photo.source_type?.startsWith("facebook")) {
    return base;
  }
  if (basedCity && !SUPPLIER_OR_ADDRESS.test(basedCity)) {
    return `${base} · ${basedCity}`;
  }
  return base;
}

function sourceBoost(photo: GalleryPhoto): number {
  if (photo.source_type?.startsWith("facebook")) return 120000;
  if (photo.classification === "team_or_van") return 80000;
  if (photo.source_type === "google_places") return 0;
  return 10000;
}

export interface GallerySelectionResult {
  photos: GalleryPhoto[];
  heroIndex: number;
  strategy: string;
  clusterNotes: string[];
  duplicatesReduced: boolean;
}

export async function selectGalleryPhotos(
  photos: GalleryPhoto[],
  imagesDir: string,
  options: {
    maxGallery: number;
    maxPerCluster: number;
    basedCity: string | null;
    preferFacebookWhenRepetitive?: boolean;
  }
): Promise<GallerySelectionResult> {
  const galleryCandidates = photos.filter((p) => p.classification !== "logo_or_brand");
  if (!galleryCandidates.length) {
    return {
      photos: [],
      heroIndex: 0,
      strategy: "No photos available",
      clusterNotes: [],
      duplicatesReduced: false,
    };
  }

  const googleCount = galleryCandidates.filter(
    (p) => !p.source_type?.startsWith("facebook")
  ).length;
  const facebookCount = galleryCandidates.filter((p) =>
    p.source_type?.startsWith("facebook")
  ).length;
  const preferFacebook =
    options.preferFacebookWhenRepetitive !== false &&
    facebookCount > 0 &&
    googleCount > 0;

  const clusters = await clusterPhotos(galleryCandidates, imagesDir);
  const clusterNotes: string[] = [];
  for (const [id, members] of clusters) {
    clusterNotes.push(`${id}: ${members.length} image(s)`);
  }

  const largestCluster = Math.max(...[...clusters.values()].map((m) => m.length), 0);
  const googleHeavy = largestCluster >= 3 && googleCount >= 3;

  const orderedCandidates = [...galleryCandidates].sort((a, b) => {
    const aFb = a.source_type?.startsWith("facebook") ? 1 : 0;
    const bFb = b.source_type?.startsWith("facebook") ? 1 : 0;
    if (preferFacebook && googleHeavy && aFb !== bFb) return bFb - aFb;
    return 0;
  });

  const selected: GalleryPhoto[] = [];
  const clusterCounts = new Map<string, number>();
  let heroIndex = 0;
  let bestHeroScore = -1;

  for (let i = 0; i < orderedCandidates.length; i++) {
    const photo = orderedCandidates[i]!;
    const resolvedPath = resolveImagePath(imagesDir, photo.local);
    let score = photo.width * photo.height + sourceBoost(photo);
    if (fs.existsSync(resolvedPath)) {
      try {
        const meta = await sharp(resolvedPath).metadata();
        score = (meta.width ?? 0) * (meta.height ?? 0) + sourceBoost(photo);
      } catch {
        /* keep default */
      }
    }
    if (score > bestHeroScore) {
      bestHeroScore = score;
      heroIndex = selected.length > 0 ? selected.findIndex((p) => p === photo) : 0;
    }
  }

  // Recompute hero from full candidate list
  heroIndex = 0;
  bestHeroScore = -1;
  for (let i = 0; i < orderedCandidates.length; i++) {
    const photo = orderedCandidates[i]!;
    const resolvedPath = resolveImagePath(imagesDir, photo.local);
    let score = photo.width * photo.height + sourceBoost(photo);
    if (fs.existsSync(resolvedPath)) {
      try {
        const meta = await sharp(resolvedPath).metadata();
        score = (meta.width ?? 0) * (meta.height ?? 0) + sourceBoost(photo);
      } catch {
        /* keep default */
      }
    }
    if (score > bestHeroScore) {
      bestHeroScore = score;
      heroIndex = i;
    }
  }

  const heroPhoto = orderedCandidates[heroIndex]!;
  const ordered = [heroPhoto, ...orderedCandidates.filter((_, i) => i !== heroIndex)];

  for (const photo of ordered) {
    if (selected.length >= options.maxGallery + 1) break;
    let clusterId = "";
    for (const [id, members] of clusters) {
      if (members.includes(photo.local)) {
        clusterId = id;
        break;
      }
    }
    const count = clusterCounts.get(clusterId) ?? 0;
    const isHero = photo.local === heroPhoto.local;
    if (!isHero && count >= options.maxPerCluster) continue;
    clusterCounts.set(clusterId, count + 1);

    const clusterSize = clusters.get(clusterId)?.length ?? 1;
    selected.push({
      ...photo,
      cluster_id: clusterId,
      selected: true,
      selection_reason:
        photo.source_type?.startsWith("facebook") && googleHeavy
          ? "Selected for gallery diversity (verified Facebook photo)"
          : photo.selection_reason ?? "Selected for gallery",
      caption: safePhotoCaption(selected.length, photo, options.basedCity, clusterSize),
    });
  }

  const duplicatesReduced = clusters.size < galleryCandidates.length || selected.length < galleryCandidates.length;
  const maxGallery = Math.min(options.maxGallery, galleryCandidates.length <= 4 ? 3 : options.maxGallery);
  const fbSelected = selected.filter((p) => p.source_type?.startsWith("facebook")).length;

  return {
    photos: selected.slice(0, maxGallery + 1),
    heroIndex: 0,
    strategy:
      galleryCandidates.length <= 4
        ? `Compact gallery: ${Math.min(selected.length - 1, 3)} proof images plus hero (${galleryCandidates.length} sourced, ${fbSelected} Facebook)`
        : preferFacebook && googleHeavy
          ? `Diverse gallery: verified Facebook photos preferred over repetitive Google clusters (${fbSelected} Facebook, max ${options.maxPerCluster} per cluster)`
          : `Diverse gallery: max ${options.maxPerCluster} per cluster, ${clusters.size} clusters detected`,
    clusterNotes,
    duplicatesReduced,
  };
}

export interface ImageManifestEntry {
  local: string;
  source: string;
  source_type: string;
  confidence: "high" | "medium" | "low";
  purpose: "logo" | "gallery" | "skipped";
  selected: boolean;
  reason: string;
  width?: number;
  height?: number;
  quality_score?: number;
  selected_reason?: string;
}

export function buildImageManifestFromPhotos(
  photos: {
    local: string;
    source_url?: string;
    classification?: string;
    source_type?: string;
    selected?: boolean;
    selection_reason?: string;
  }[],
  facebookVerified = false
): ImageManifestEntry[] {
  return photos.map((p) => {
    const isLogo = p.classification === "logo_or_brand";
    const srcType = p.source_type ?? "unknown";
    let confidence: ImageManifestEntry["confidence"] = "medium";
    if (srcType.startsWith("facebook") && facebookVerified) confidence = "high";
    else if (srcType === "manual_asset" || srcType === "manual_verified") confidence = "high";
    else if (srcType === "google_places") confidence = "medium";
    else confidence = "low";
    return {
      local: p.local,
      source: p.source_url ?? "",
      source_type: srcType,
      confidence,
      purpose: isLogo ? "logo" : p.selected === false ? "skipped" : "gallery",
      selected: isLogo ? false : p.selected !== false,
      reason: isLogo
        ? "Brand asset - not gallery"
        : p.selection_reason ?? "Default from gather",
    };
  });
}

export function recommendLayoutForImageSet(manifest: ImageManifestEntry[]): {
  layout_family: "stacked-hero-proof" | "split-hero-editorial" | "full-bleed-hero";
  gallery_style: "compact-row" | "standard-grid" | "featured-plus-pair";
  note: string;
} {
  const galleryCount = manifest.filter((m) => m.purpose === "gallery" && m.selected).length;
  if (galleryCount <= 2) {
    return {
      layout_family: "stacked-hero-proof",
      gallery_style: "compact-row",
      note: "Very few photos - proof-led typography layout recommended",
    };
  }
  if (galleryCount <= 4) {
    return {
      layout_family: "split-hero-editorial",
      gallery_style: "featured-plus-pair",
      note: "Limited photos - compact gallery with review-led hero",
    };
  }
  return {
    layout_family: "full-bleed-hero",
    gallery_style: "standard-grid",
    note: "Enough photos for photo-led layout",
  };
}
