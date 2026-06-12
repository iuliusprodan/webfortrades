export type PhoneType = "mobile" | "landline" | "foreign" | "unknown";

export function normalizeUkPhoneDigits(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("44")) {
    digits = `0${digits.slice(2)}`;
  }
  if (digits.startsWith("7") && digits.length >= 10 && !digits.startsWith("07")) {
    digits = `0${digits}`;
  }
  return digits;
}

function compactPhone(phone: string): string {
  return phone.trim().replace(/[\s().-]/g, "");
}

function isNonUkInternationalPrefix(compact: string): boolean {
  if (compact.startsWith("+") && !compact.startsWith("+44")) return true;
  if (compact.startsWith("00") && !compact.startsWith("0044")) return true;
  return false;
}

export function classifyUkPhone(phone: string | null | undefined): PhoneType {
  if (!phone?.trim()) return "unknown";
  const compact = compactPhone(phone);
  if (isNonUkInternationalPrefix(compact)) return "foreign";

  const digits = normalizeUkPhoneDigits(phone);
  if (digits.startsWith("07") && digits.length >= 11) return "mobile";
  if (
    digits.startsWith("01") ||
    digits.startsWith("02") ||
    digits.startsWith("03")
  ) {
    return "landline";
  }
  return "unknown";
}

export function isWhatsAppCandidate(phone: string | null | undefined): boolean {
  return classifyUkPhone(phone) === "mobile";
}

export function formatPhoneForWhatsApp(phone: string): string {
  const digits = normalizeUkPhoneDigits(phone);
  if (digits.startsWith("0")) {
    return `44${digits.slice(1)}`;
  }
  return digits;
}
