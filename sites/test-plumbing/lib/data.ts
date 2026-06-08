import briefJson from "@/data/brief.json";
import designJson from "@/data/design-system.json";
import type { Brief, DesignSystem } from "./types";

export const brief = briefJson as Brief;
export const design = designJson as DesignSystem;

export function ownerName(): string {
  return brief.owner_name;
}

export function primaryTrade(): string {
  return brief.trade;
}

export function areaLabel(): string {
  return brief.service_area[0] ?? "Bristol";
}

export function phoneHref(): string {
  return `tel:${brief.phone.replace(/\s/g, "")}`;
}

export function openingHoursList(): string[] {
  return brief.hours.split(",").map((h) => h.trim());
}

export function mapEmbedUrl(): string {
  const q = encodeURIComponent(`${brief.business_name} ${brief.address}`);
  return `https://maps.google.com/maps?q=${q}&z=12&output=embed`;
}

export function mapSearchUrl(): string {
  const q = encodeURIComponent(`${brief.business_name} ${brief.address}`);
  return `https://www.openstreetmap.org/search?query=${q}`;
}

export const GALLERY_COUNT = 6;
