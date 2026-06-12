/**
 * Canonical pitch message formatting: two-message shape, link spacing, site/video separation.
 */

export const WHATSAPP_INTER_MESSAGE_DELAY_MS = 2000;

/** Batch sends: random pause between message 1 and 2 (and before video). */
export const BATCH_INTER_MESSAGE_DELAY_MIN_MS = 3000;
export const BATCH_INTER_MESSAGE_DELAY_MAX_MS = 6000;

/** Random cooldown between leads in a batch (60-180 seconds). */
export const BATCH_LEAD_COOLDOWN_MIN_MS = 60_000;
export const BATCH_LEAD_COOLDOWN_MAX_MS = 180_000;

export function randomBatchInterMessageDelayMs(): number {
  const span =
    BATCH_INTER_MESSAGE_DELAY_MAX_MS - BATCH_INTER_MESSAGE_DELAY_MIN_MS;
  return BATCH_INTER_MESSAGE_DELAY_MIN_MS + Math.floor(Math.random() * (span + 1));
}

export function randomBatchLeadCooldownMs(): number {
  const span = BATCH_LEAD_COOLDOWN_MAX_MS - BATCH_LEAD_COOLDOWN_MIN_MS;
  return BATCH_LEAD_COOLDOWN_MIN_MS + Math.floor(Math.random() * (span + 1));
}

const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi;

export interface OutreachFormatIssue {
  code:
    | "site_and_video_same_message"
    | "link_missing_blank_line_above"
    | "link_missing_blank_line_below"
    | "empty_message"
    | "cannot_split_combined_payload";
  message: string;
}

export interface PitchTouch1Input {
  contactFirstName?: string | null;
  businessName: string;
  siteUrl: string;
  /** When set, WhatsApp/SMS use a second message; email embeds a spaced video link block. */
  videoUrl?: string | null;
  /** True when video is sent as attachment (message 2 has intro text only, no video URL). */
  videoAttachment?: boolean;
}

export interface FormattedPitchTouch1 {
  /** WhatsApp/SMS: two messages. Email: one body. */
  messages: string[];
  channelShape: "two_message" | "single_email";
}

function normaliseUrl(url: string): string {
  return url.trim().replace(/\/$/, "");
}

export function extractUrls(text: string): string[] {
  return [...text.matchAll(URL_RE)].map((m) => m[0]!);
}

/** Each URL line must have a blank line immediately above and below. */
export function validateLinkSpacing(body: string): OutreachFormatIssue[] {
  const issues: OutreachFormatIssue[] = [];
  const lines = body.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const urls = extractUrls(line);
    if (urls.length === 0) continue;

    const prev = i > 0 ? lines[i - 1]! : "";
    const next = i < lines.length - 1 ? lines[i + 1]! : "";

    if (prev.trim() !== "") {
      issues.push({
        code: "link_missing_blank_line_above",
        message: `URL "${urls[0]}" must have a blank line above it`,
      });
    }
    if (next.trim() !== "") {
      issues.push({
        code: "link_missing_blank_line_below",
        message: `URL "${urls[0]}" must have a blank line below it`,
      });
    }
  }

  return issues;
}

export function validateNoSiteAndVideoInSameMessage(
  body: string,
  siteUrl: string,
  videoUrl: string
): OutreachFormatIssue[] {
  const siteNorm = normaliseUrl(siteUrl);
  const videoNorm = normaliseUrl(videoUrl);
  const urls = extractUrls(body).map(normaliseUrl);

  const hasSite = urls.some((u) => u === siteNorm || u.startsWith(siteNorm));
  const hasVideo = urls.some((u) => u === videoNorm || u.startsWith(videoNorm));

  if (hasSite && hasVideo) {
    return [
      {
        code: "site_and_video_same_message",
        message: "Site URL and video URL must not appear in the same message",
      },
    ];
  }
  return [];
}

export function validateOutreachMessage(
  body: string,
  options: { siteUrl?: string; videoUrl?: string } = {}
): OutreachFormatIssue[] {
  const issues: OutreachFormatIssue[] = [];
  if (!body.trim()) {
    issues.push({ code: "empty_message", message: "Message body is empty" });
    return issues;
  }

  issues.push(...validateLinkSpacing(body));

  if (options.siteUrl && options.videoUrl) {
    issues.push(
      ...validateNoSiteAndVideoInSameMessage(body, options.siteUrl, options.videoUrl)
    );
  }

  return issues;
}

export function validateOutreachPayload(input: {
  messages: string[];
  siteUrl?: string;
  videoUrl?: string;
  /** When true, video is attachment-only and must not share a message with the site URL. */
  videoAttachment?: boolean;
}): OutreachFormatIssue[] {
  const issues: OutreachFormatIssue[] = [];
  const { messages, siteUrl, videoUrl, videoAttachment } = input;

  for (const [index, body] of messages.entries()) {
    for (const issue of validateOutreachMessage(body, { siteUrl, videoUrl })) {
      issues.push({
        ...issue,
        message: `Message ${index + 1}: ${issue.message}`,
      });
    }
  }

  if (siteUrl && videoUrl) {
    const combined = messages.some(
      (m) =>
        validateNoSiteAndVideoInSameMessage(m, siteUrl, videoUrl).length > 0
    );
    if (combined) {
      issues.push({
        code: "site_and_video_same_message",
        message: "Site URL and video URL appear in the same message",
      });
    }
  }

  if (siteUrl && videoAttachment && messages.length >= 2) {
    const siteNorm = normaliseUrl(siteUrl);
    for (const [index, body] of messages.entries()) {
      if (index === 0) continue;
      const urls = extractUrls(body).map(normaliseUrl);
      if (urls.some((u) => u === siteNorm || u.startsWith(siteNorm))) {
        issues.push({
          code: "site_and_video_same_message",
          message: `Message ${index + 1}: site URL must only appear in message 1 when video is a separate attachment`,
        });
      }
    }
  }

  return issues;
}

export function assertOutreachPayloadValid(
  input: Parameters<typeof validateOutreachPayload>[0]
): void {
  const issues = validateOutreachPayload(input);
  if (issues.length > 0) {
    throw new Error(
      `Outreach format validation failed:\n${issues.map((i) => `  - ${i.message}`).join("\n")}`
    );
  }
}

/** WhatsApp touch 1 with known contact first name. */
export function formatWhatsAppTouch1WithName(input: PitchTouch1Input): FormattedPitchTouch1 {
  const name = input.contactFirstName?.trim() || "there";
  const site = input.siteUrl.trim();

  const message1 = `Hi, is this ${input.businessName}?

I'm Julius. I put together a website for ${input.businessName} and thought I'd send it over in case it's useful.

${site}

Happy to change anything on it. If you'd like to keep it, just let me know.`;

  const messages = [message1];

  if (input.videoUrl?.trim()) {
    messages.push(
      `Here is a short scroll-through of the site.

${input.videoUrl.trim()}`
    );
  } else if (input.videoAttachment) {
    messages.push("Here is a short scroll-through of the site.");
  }

  return { messages, channelShape: "two_message" };
}

/** WhatsApp touch 1 when contact name is unknown. */
export function formatWhatsAppTouch1NoName(input: PitchTouch1Input): FormattedPitchTouch1 {
  const site = input.siteUrl.trim();

  const message1 = `Hi, is this ${input.businessName}?

I'm Julius. I put together a website for ${input.businessName} and thought I'd send it over in case it's useful.

${site}

Happy to change anything on it. If you'd like to keep it, just let me know.`;

  const messages = [message1];

  if (input.videoUrl?.trim()) {
    messages.push(
      `Here is a short scroll-through of the site.

${input.videoUrl.trim()}`
    );
  } else if (input.videoAttachment) {
    messages.push("Here is a short scroll-through of the site.");
  }

  return { messages, channelShape: "two_message" };
}

export function formatWhatsAppTouch1(input: PitchTouch1Input): FormattedPitchTouch1 {
  if (input.contactFirstName?.trim() && input.contactFirstName.trim() !== "there") {
    return formatWhatsAppTouch1WithName(input);
  }
  return formatWhatsAppTouch1NoName(input);
}

export function formatEmailTouch1(
  businessName: string,
  siteUrl: string,
  greeting: string,
  videoUrl?: string | null
): string {
  const site = siteUrl.trim();
  let body = `Hi ${greeting},

I'm Julius.

I built a one-page site for ${businessName} here:

${site}

I used the public details I could find and kept it simple: services, reviews, areas covered, and a quote form.

If it is not useful, reply no thanks and I will take it down.`;

  if (videoUrl?.trim()) {
    body += `

Here is a short scroll-through video:

${videoUrl.trim()}`;
  }

  return `${body}

Julius`;
}

export function formatWhatsAppBump(businessName: string, siteUrl: string): string {
  const site = siteUrl.trim();
  return `Hi, quick follow-up on the site for ${businessName}:

${site}

If it is not useful, reply no thanks and I will take it down.`;
}

export function formatWhatsAppFinal(businessName: string, siteUrl: string): string {
  const site = siteUrl.trim();
  return `Hi, last note from me on the site for ${businessName}.

${site}

If it is not useful, reply no thanks and I will take it down.`;
}

export function formatPriceClarity(greeting: string, siteUrl: string): string {
  const site = siteUrl.trim();
  return `Hi ${greeting},

Just adding a bit more context.

The site is a one-off build, usually £300 to £800 depending on what you want changed. No monthly contract, and you own it.

The site:

${site}

If it is not useful, reply no thanks and I will take it down.

Julius`;
}

/**
 * If a single message body contains both site and video URLs, refuse to send combined.
 * Returns split messages when possible; throws when text cannot be split safely.
 */
export function splitCombinedPitchPayload(
  body: string,
  siteUrl: string,
  videoUrl: string
): string[] {
  const issues = validateNoSiteAndVideoInSameMessage(body, siteUrl, videoUrl);
  if (issues.length === 0) {
    return [body];
  }

  throw new Error(
    "Cannot send outreach: site URL and video URL are in the same message. Split into two messages before sending."
  );
}

export function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
