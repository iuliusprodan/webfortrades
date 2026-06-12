/**
 * Extract likely contact/person first names from Google review body text.
 * Does not promote to owner_name without explicit ownership sources.
 */

export type ContactNameConfidence = "high" | "medium" | "low";

export interface ReviewSnippet {
  text: string;
  reviewer: string;
}

export interface ContactNameFields {
  contact_name: string | null;
  contact_name_source: "google_reviews" | null;
  contact_name_confidence: ContactNameConfidence | null;
  contact_name_evidence_count: number;
  contact_name_usage_allowed: boolean;
  possible_contact_name: string | null;
}

const STOPWORDS = new Set([
  "The",
  "And",
  "Was",
  "Were",
  "His",
  "Her",
  "Their",
  "They",
  "She",
  "You",
  "Your",
  "Our",
  "We",
  "He",
  "It",
  "Its",
  "This",
  "That",
  "These",
  "Those",
  "With",
  "From",
  "For",
  "Not",
  "But",
  "All",
  "Any",
  "Can",
  "Could",
  "Would",
  "Should",
  "Have",
  "Has",
  "Had",
  "Are",
  "Been",
  "Being",
  "Will",
  "Just",
  "Also",
  "Very",
  "Most",
  "More",
  "Some",
  "Such",
  "When",
  "Where",
  "What",
  "Which",
  "Who",
  "How",
  "Why",
  "After",
  "Before",
  "During",
  "While",
  "About",
  "Into",
  "Through",
  "Over",
  "Under",
  "Again",
  "Once",
  "Here",
  "There",
  "Then",
  "Than",
  "Too",
  "Professional",
  "Excellent",
  "Great",
  "Good",
  "Best",
  "Happy",
  "Highly",
  "Recommend",
  "Recommended",
  "Recommending",
  "Service",
  "Services",
  "Work",
  "Job",
  "Team",
  "Company",
  "Business",
  "Customer",
  "Customers",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "Google",
  "Bristol",
  "London",
  "England",
  "United",
  "Kingdom",
]);

function businessTokens(businessName?: string): Set<string> {
  const tokens = new Set<string>();
  if (!businessName) return tokens;
  for (const part of businessName.split(/[^A-Za-z]+/)) {
    if (part.length >= 2) {
      tokens.add(part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
      if (part.length > 2) tokens.add(part);
    }
  }
  return tokens;
}

function reviewerNames(reviews: ReviewSnippet[]): Set<string> {
  const names = new Set<string>();
  for (const r of reviews) {
    const first = r.reviewer.trim().split(/\s+/)[0];
    if (first.length >= 2) {
      names.add(first.charAt(0).toUpperCase() + first.slice(1).toLowerCase());
    }
  }
  return names;
}

function extractCapitalizedNames(text: string): string[] {
  const found: string[] = [];
  const re = /\b([A-Z][a-z]{2,})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    found.push(m[1]);
  }
  return found;
}

function confidenceFromCount(count: number): ContactNameConfidence | null {
  if (count >= 3) return "high";
  if (count === 2) return "medium";
  if (count === 1) return "low";
  return null;
}

export function extractLikelyContactNameFromReviews(
  reviews: ReviewSnippet[],
  businessName?: string
): ContactNameFields {
  const empty: ContactNameFields = {
    contact_name: null,
    contact_name_source: null,
    contact_name_confidence: null,
    contact_name_evidence_count: 0,
    contact_name_usage_allowed: false,
    possible_contact_name: null,
  };

  if (!reviews.length) return empty;

  const excludeReviewers = reviewerNames(reviews);
  const excludeBusiness = businessTokens(businessName);
  const reviewMentionCounts = new Map<string, number>();

  for (const review of reviews) {
    const body = review.text.trim();
    if (!body) continue;

    const namesInBody = new Set<string>();
    for (const raw of extractCapitalizedNames(body)) {
      const name = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      if (STOPWORDS.has(name) || STOPWORDS.has(raw)) continue;
      if (excludeReviewers.has(name)) continue;
      if (excludeBusiness.has(name)) continue;
      if (/^(Plumb|Electric|Heat|Roof|Decor|Mechanic)/i.test(name)) continue;
      namesInBody.add(name);
    }

    for (const name of namesInBody) {
      reviewMentionCounts.set(name, (reviewMentionCounts.get(name) ?? 0) + 1);
    }
  }

  if (reviewMentionCounts.size === 0) return empty;

  let bestName: string | null = null;
  let bestCount = 0;
  for (const [name, count] of reviewMentionCounts) {
    if (count > bestCount) {
      bestCount = count;
      bestName = name;
    }
  }

  if (!bestName || bestCount === 0) return empty;

  const confidence = confidenceFromCount(bestCount);

  if (bestCount === 1) {
    return {
      ...empty,
      possible_contact_name: bestName,
      contact_name_evidence_count: 1,
      contact_name_confidence: "low",
    };
  }

  return {
    contact_name: bestName,
    contact_name_source: "google_reviews",
    contact_name_confidence: confidence,
    contact_name_evidence_count: bestCount,
    contact_name_usage_allowed: true,
    possible_contact_name: null,
  };
}

export const OWNER_CLAIM_PATTERNS = [
  /\bowner\s+[A-Z][a-z]+/i,
  /\bfounder\s+[A-Z][a-z]+/i,
  /\bowned by\s+[A-Z][a-z]+/i,
  /\bfamily[- ]run by\s+[A-Z][a-z]+/i,
  /\brun by\s+[A-Z][a-z]+\s+[A-Z][a-z]+/i,
];

export function bodyHasOwnerClaims(text: string, contactName?: string | null): boolean {
  for (const re of OWNER_CLAIM_PATTERNS) {
    if (re.test(text)) return true;
  }
  if (contactName) {
    if (new RegExp(`\\bowner\\s+${contactName}\\b`, "i").test(text)) return true;
    if (new RegExp(`\\bfounder\\s+${contactName}\\b`, "i").test(text)) return true;
    if (new RegExp(`${contactName}\\s+owns\\b`, "i").test(text)) return true;
  }
  return false;
}
