/**
 * Single source of truth for UK-mobile format detection.
 *
 * Replaces the OpenWA `checkWhatsAppAvailable` network ping that contactability.ts and
 * outreach.ts used to make (removed in the 2026-06-13 outreach teardown, ARCH-5). This is a
 * pure, non-network predicate: it answers "is this number shaped like a UK mobile?", which is
 * all the manual-WhatsApp pipeline needs to decide queue/draft eligibility (ARCH-12).
 */
export function isUkMobileCandidate(input: string | null | undefined): boolean {
  if (!input) return false;

  // Strip whitespace, hyphens, parens, dots.
  const cleaned = input.replace(/[\s\-().]/g, "");

  // Only an optional leading + followed by digits is acceptable; any other residue fails.
  if (!/^\+?\d+$/.test(cleaned)) return false;

  let digits = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;

  // Normalise UK international (+44 / 44) to the local 0-leading form.
  if (digits.startsWith("44")) {
    digits = "0" + digits.slice(2);
  }

  // UK local numbers are 11 digits starting with 0.
  if (!/^0\d{10}$/.test(digits)) return false;

  // UK mobiles are the 07 range; landline (01/02), non-geo (03/08/09) are not.
  return digits.startsWith("07");
}
