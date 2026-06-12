/**
 * Registry of public source types the WebForTrades pipeline can search.
 * Public sources only. No login-required sources for automatic gathering.
 */

export type SourceDataType =
  | "business_name"
  | "phone"
  | "email"
  | "address"
  | "reviews"
  | "photos"
  | "logo"
  | "services"
  | "website"
  | "opening_hours"
  | "social_links"
  | "company_number"
  | "named_people";

export type SourceRiskLevel = "low" | "medium" | "high";
export type SourceConfidenceLevel = "high" | "medium" | "low" | "rejected";

export interface SourceDefinition {
  id: string;
  display_name: string;
  search_query_pattern: string;
  verification_signals: string[];
  data_types: SourceDataType[];
  risk_level: SourceRiskLevel;
  requires_login: boolean;
  allowed_for_scraping: boolean;
  notes: string;
}

export const SOURCE_REGISTRY: SourceDefinition[] = [
  {
    id: "google_places",
    display_name: "Google Places",
    search_query_pattern: "{business_name} {city}",
    verification_signals: ["place_id", "phone_match", "address_match"],
    data_types: ["business_name", "phone", "address", "reviews", "photos", "website", "opening_hours", "services"],
    risk_level: "low",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Primary prospect source via Places API.",
  },
  {
    id: "google_maps",
    display_name: "Google Maps listing",
    search_query_pattern: "{business_name} {city} site:google.com/maps",
    verification_signals: ["place_id", "cid_match"],
    data_types: ["business_name", "phone", "address", "reviews", "photos"],
    risk_level: "low",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Same entity as Google Places; used for URL provenance.",
  },
  {
    id: "google_reviews",
    display_name: "Google reviews",
    search_query_pattern: "{business_name} {city} reviews",
    verification_signals: ["place_id", "review_count"],
    data_types: ["reviews", "named_people", "services"],
    risk_level: "low",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Review text for contact names and service proof.",
  },
  {
    id: "google_photos",
    display_name: "Google Places photos",
    search_query_pattern: "{business_name} {city} photos",
    verification_signals: ["place_id"],
    data_types: ["photos"],
    risk_level: "low",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Default photo source when no better verified images exist.",
  },
  {
    id: "facebook",
    display_name: "Facebook page",
    search_query_pattern: "{business_name} {city} Facebook",
    verification_signals: ["phone_match", "name_match", "location_match", "email_visible"],
    data_types: ["business_name", "phone", "email", "address", "photos", "logo", "services", "website", "social_links"],
    risk_level: "medium",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "May block bots; mark FACEBOOK_BLOCKED_OR_LOGIN_REQUIRED and manual review if blocked.",
  },
  {
    id: "instagram",
    display_name: "Instagram profile",
    search_query_pattern: "{business_name} {city} Instagram",
    verification_signals: ["name_match", "bio_phone", "bio_link"],
    data_types: ["photos", "logo", "services", "social_links", "website"],
    risk_level: "medium",
    requires_login: true,
    allowed_for_scraping: false,
    notes: "Login often required; manual review only unless public bio is accessible.",
  },
  {
    id: "checkatrade",
    display_name: "Checkatrade",
    search_query_pattern: "{business_name} {city} site:checkatrade.com",
    verification_signals: ["phone_match", "name_match", "trade_match"],
    data_types: ["reviews", "photos", "services", "phone", "website"],
    risk_level: "low",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Strong trade proof for UK trades.",
  },
  {
    id: "trustatrader",
    display_name: "TrustATrader",
    search_query_pattern: "{business_name} {city} site:trustatrader.com",
    verification_signals: ["phone_match", "name_match"],
    data_types: ["reviews", "photos", "services", "phone"],
    risk_level: "low",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Trade directory with reviews.",
  },
  {
    id: "yell",
    display_name: "Yell",
    search_query_pattern: "{business_name} {city} site:yell.com",
    verification_signals: ["phone_match", "name_match"],
    data_types: ["phone", "address", "website", "reviews"],
    risk_level: "medium",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Directory listing; not a real website.",
  },
  {
    id: "nextdoor",
    display_name: "Nextdoor",
    search_query_pattern: "{business_name} {city} site:nextdoor.co.uk",
    verification_signals: ["name_match", "location_match"],
    data_types: ["reviews", "services"],
    risk_level: "medium",
    requires_login: true,
    allowed_for_scraping: false,
    notes: "Often login-walled; manual review.",
  },
  {
    id: "mybuilder",
    display_name: "MyBuilder",
    search_query_pattern: "{business_name} {city} site:mybuilder.com",
    verification_signals: ["phone_match", "name_match", "trade_match"],
    data_types: ["reviews", "photos", "services"],
    risk_level: "low",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Trade marketplace profile.",
  },
  {
    id: "rated_people",
    display_name: "Rated People",
    search_query_pattern: "{business_name} {city} site:ratedpeople.com",
    verification_signals: ["phone_match", "name_match"],
    data_types: ["reviews", "services"],
    risk_level: "low",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Trade lead platform profile.",
  },
  {
    id: "bark",
    display_name: "Bark",
    search_query_pattern: "{business_name} {city} site:bark.com",
    verification_signals: ["name_match"],
    data_types: ["services", "reviews"],
    risk_level: "medium",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Weaker verification; name match alone is low confidence.",
  },
  {
    id: "houzz",
    display_name: "Houzz",
    search_query_pattern: "{business_name} {city} site:houzz.co.uk",
    verification_signals: ["name_match", "trade_match", "location_match"],
    data_types: ["photos", "reviews", "services"],
    risk_level: "low",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Strong for bathroom/kitchen trades.",
  },
  {
    id: "pinterest",
    display_name: "Pinterest",
    search_query_pattern: "{business_name} {city} site:pinterest.com",
    verification_signals: ["name_match"],
    data_types: ["photos"],
    risk_level: "high",
    requires_login: true,
    allowed_for_scraping: false,
    notes: "Photos may be unverified; manual review.",
  },
  {
    id: "tiktok",
    display_name: "TikTok",
    search_query_pattern: "{business_name} {city} TikTok",
    verification_signals: ["name_match"],
    data_types: ["photos", "social_links"],
    risk_level: "medium",
    requires_login: true,
    allowed_for_scraping: false,
    notes: "Manual review unless public profile accessible.",
  },
  {
    id: "linkedin",
    display_name: "LinkedIn",
    search_query_pattern: "{business_name} {city} site:linkedin.com",
    verification_signals: ["name_match", "location_match"],
    data_types: ["named_people", "services", "website"],
    risk_level: "medium",
    requires_login: true,
    allowed_for_scraping: false,
    notes: "Company page may need manual review.",
  },
  {
    id: "twitter",
    display_name: "X / Twitter",
    search_query_pattern: "{business_name} {city} site:twitter.com OR site:x.com",
    verification_signals: ["name_match"],
    data_types: ["social_links"],
    risk_level: "high",
    requires_login: true,
    allowed_for_scraping: false,
    notes: "Rare for local trades; manual review.",
  },
  {
    id: "youtube",
    display_name: "YouTube",
    search_query_pattern: "{business_name} {city} site:youtube.com",
    verification_signals: ["name_match"],
    data_types: ["photos", "services"],
    risk_level: "medium",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Video proof source.",
  },
  {
    id: "companies_house",
    display_name: "Companies House",
    search_query_pattern: "{business_name} site:find-and-update.company-information.service.gov.uk",
    verification_signals: ["company_number", "registered_address"],
    data_types: ["business_name", "address", "company_number", "named_people"],
    risk_level: "low",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Legal entity verification; does not prove trade website.",
  },
  {
    id: "official_website",
    display_name: "Official website",
    search_query_pattern: "{business_name} {city} website",
    verification_signals: ["phone_match", "name_on_page", "services_on_page"],
    data_types: ["website", "photos", "logo", "services", "email", "phone"],
    risk_level: "low",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "If real and decent, disqualify from no-website pipeline.",
  },
  {
    id: "email_domain_website",
    display_name: "Email domain website",
    search_query_pattern: "https://{email_domain}",
    verification_signals: ["email_domain_match", "name_on_page", "phone_match"],
    data_types: ["website", "email", "photos", "logo"],
    risk_level: "low",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Hidden website discovery when email found on Facebook or directories.",
  },
  {
    id: "directories",
    display_name: "Generic trade directories",
    search_query_pattern: "{business_name} {city} plumber electrician directory",
    verification_signals: ["phone_match", "name_match"],
    data_types: ["phone", "reviews", "website"],
    risk_level: "medium",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Freeindex, Thomson Local, Cylex, Hotfrog, etc.",
  },
  {
    id: "local_trade_directories",
    display_name: "Local trade directories",
    search_query_pattern: "{business_name} {city} local directory",
    verification_signals: ["phone_match", "location_match"],
    data_types: ["phone", "address", "reviews"],
    risk_level: "medium",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Regional chamber and trade association listings.",
  },
  {
    id: "trade_association",
    display_name: "Trade association pages",
    search_query_pattern: "{business_name} {trade} association member",
    verification_signals: ["membership_id", "name_match"],
    data_types: ["services", "named_people"],
    risk_level: "low",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Gas Safe, NICEIC, etc. when relevant.",
  },
  {
    id: "review_aggregators",
    display_name: "Review aggregators",
    search_query_pattern: "{business_name} {city} reviews",
    verification_signals: ["name_match", "review_count"],
    data_types: ["reviews"],
    risk_level: "medium",
    requires_login: false,
    allowed_for_scraping: true,
    notes: "Trustpilot, FreeIndex, etc.",
  },
];

export function getSourceById(id: string): SourceDefinition | undefined {
  return SOURCE_REGISTRY.find((s) => s.id === id);
}

export function buildSearchQuery(
  source: SourceDefinition,
  businessName: string,
  city: string,
  extras: Record<string, string> = {}
): string {
  return source.search_query_pattern
    .replace("{business_name}", businessName)
    .replace("{city}", city)
    .replace("{trade}", extras.trade ?? "")
    .replace("{email_domain}", extras.email_domain ?? "");
}

export function automaticSources(): SourceDefinition[] {
  return SOURCE_REGISTRY.filter((s) => !s.requires_login && s.allowed_for_scraping);
}

export function manualReviewSources(): SourceDefinition[] {
  return SOURCE_REGISTRY.filter((s) => s.requires_login || !s.allowed_for_scraping);
}
