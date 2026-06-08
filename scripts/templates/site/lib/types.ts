export interface BriefPhoto {
  local: string;
  source_url: string;
  width: number;
  height: number;
}

export interface BriefReview {
  text: string;
  reviewer: string;
  rating: number;
}

export interface Brief {
  business_name: string;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  opening_hours: string[];
  services: string[];
  service_area: string[];
  photos: BriefPhoto[];
  reviews: BriefReview[];
  social: { facebook: string | null; instagram: string | null };
  brand: { colours: string[]; logo_url: string | null };
  sources: string[];
}

export interface DesignSystem {
  slug: string;
  business_name: string;
  direction: string;
  trade: string;
  fonts: { display: string; body: string };
  separator: string;
  colors: {
    accent: string;
    accentForeground: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    surface: string;
  };
}
