export interface BriefReview {
  name: string;
  rating: number;
  text: string;
}

export interface Brief {
  slug: string;
  business_name: string;
  owner_name: string;
  trade: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  services: string[];
  service_area: string[];
  reviews: BriefReview[];
  years_trading: number;
  rating: number;
  review_count: number;
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
