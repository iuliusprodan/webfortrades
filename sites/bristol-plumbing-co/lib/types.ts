export type PhotoClassification =
  | "before_after_pair"
  | "completed_project"
  | "team_or_van"
  | "logo_or_brand"
  | "skip";

export interface BriefPhoto {
  local: string;
  source_url: string;
  width: number;
  height: number;
  classification?: PhotoClassification;
  pair_id?: string | null;
}

export interface BriefReview {
  text: string;
  reviewer: string;
  rating: number;
}

export interface Brief {
  business_name: string;
  name?: string | null;
  owner_name: string | null;
  contact_name?: string | null;
  contact_name_source?: "google_reviews" | null;
  contact_name_confidence?: "high" | "medium" | "low" | null;
  contact_name_evidence_count?: number;
  contact_name_usage_allowed?: boolean;
  possible_contact_name?: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  opening_hours: string[];
  services: string[];
  service_area: string[];
  based_location?: string | null;
  google_rating?: number | null;
  google_review_count?: number | null;
  google_review_count_sourced?: boolean;
  service_areas_inferred?: boolean;
  google_maps_url?: string | null;
  website_status?: string | null;
  website_url?: string | null;
  photos: BriefPhoto[];
  reviews: BriefReview[];
  social: {
    facebook: string | null;
    instagram: string | null;
    youtube?: string | null;
    tiktok?: string | null;
  };
  gallery_layout?: "before_after_pairs" | "completed_project_gallery";
  brand: { colours: string[]; logo_url: string | null };
  source_urls?: string[];
  sources?: string[];
  notes?: string[];
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
