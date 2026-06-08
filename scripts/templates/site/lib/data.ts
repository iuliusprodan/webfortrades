import briefJson from "@/data/brief.json";
import designJson from "@/data/design-system.json";
import type { Brief, DesignSystem } from "./types";

export const brief = briefJson as Brief;
export const design = designJson as DesignSystem;

export function photoPublicPath(local: string): string {
  return "/" + local.replace(/^images\//, "images/");
}

export function ownerName(): string {
  return brief.owner_name ?? brief.business_name.split(" ")[0] ?? "the owner";
}

export function primaryTrade(): string {
  return brief.services[0] ?? "Local trade";
}

export function areaLabel(): string {
  return brief.service_area[0] ?? brief.address.split(",").slice(-2)[0]?.trim() ?? "local area";
}

export function phoneHref(): string {
  return brief.phone ? `tel:${brief.phone.replace(/\s/g, "")}` : "#contact";
}

export function averageRating(): number | null {
  if (!brief.reviews.length) return null;
  const sum = brief.reviews.reduce((a, r) => a + r.rating, 0);
  return Math.round((sum / brief.reviews.length) * 10) / 10;
}

export function mapEmbedUrl(): string {
  const q = encodeURIComponent(`${brief.business_name} ${brief.address}`.trim());
  return `https://maps.google.com/maps?q=${q}&z=13&output=embed`;
}

export function mapSearchUrl(): string {
  const q = encodeURIComponent(`${brief.business_name} ${brief.address}`);
  return `https://www.openstreetmap.org/search?query=${q}`;
}
