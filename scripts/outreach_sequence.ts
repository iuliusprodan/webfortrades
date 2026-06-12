import type { Lead, WhatsAppStatus } from "./db.js";
import {
  classifyUkPhone,
  isWhatsAppCandidate,
  type PhoneType,
} from "./phone_utils.js";
import {
  formatEmailTouch1,
  formatPriceClarity,
  formatWhatsAppBump,
  formatWhatsAppFinal,
  formatWhatsAppTouch1,
} from "./outreach_message_format.js";

export type OutreachChannel = "whatsapp" | "email";

export type SequencePath =
  | "whatsapp_and_email"
  | "whatsapp_only"
  | "email_only"
  | "blocked";

export interface BriefLike {
  business_name: string;
  owner_name: string | null;
  email?: string | null;
}

export interface TouchPlan {
  touch: number;
  channel: OutreachChannel;
  daysAfterStart: number;
  kind: "intro" | "bump" | "price" | "final";
}

export interface OutreachPlan {
  sequencePath: SequencePath;
  primaryChannel: OutreachChannel | null;
  phoneType: PhoneType;
  whatsappStatus: WhatsAppStatus;
  whatsappAvailable: boolean | null;
  canUseWhatsApp: boolean;
  canUseEmail: boolean;
  needsManualReview: boolean;
  contactName: string;
  ownerFirstName: string | null;
  touches: TouchPlan[];
  blockedReason: string | null;
  suggestedState: "DEPLOYED" | "PITCH_BLOCKED" | "NEEDS_MANUAL_CONTACT";
}

export interface WhatsAppDraft {
  channel: "whatsapp";
  touch: number;
  to: string;
  /** Primary message (message 1). Same as messages[0] when messages is set. */
  text: string;
  /** Full WhatsApp sequence for this touch (e.g. two messages on touch 1 with video). */
  messages?: string[];
  /** When true, message 2 is followed by a video attachment (no video URL in text). */
  videoAttachment?: boolean;
}

export interface EmailDraft {
  channel: "email";
  touch: number;
  to: string;
  subject: string;
  text: string;
}

export type OutreachDraft = WhatsAppDraft | EmailDraft;

const TOUCH_DAYS = {
  day3: 3,
  day7: 7,
  day12: 12,
  day18: 18,
} as const;

export function ownerFirstName(lead: Lead, brief: BriefLike | null): string | null {
  const raw = brief?.owner_name ?? lead.owner_name;
  if (!raw?.trim()) return null;
  return raw.trim().split(/\s+/)[0] ?? null;
}

export function greetingName(lead: Lead, brief: BriefLike | null): string {
  return ownerFirstName(lead, brief) ?? "there";
}

export function formatContactName(
  ownerFirst: string | null,
  businessName: string
): string {
  if (ownerFirst?.trim()) {
    return `${ownerFirst.trim()} - ${businessName}`;
  }
  return businessName;
}

export function buildTouchSchedule(path: SequencePath): TouchPlan[] {
  switch (path) {
    case "whatsapp_and_email":
      return [
        { touch: 1, channel: "whatsapp", daysAfterStart: 0, kind: "intro" },
        { touch: 2, channel: "email", daysAfterStart: TOUCH_DAYS.day3, kind: "bump" },
        { touch: 3, channel: "whatsapp", daysAfterStart: TOUCH_DAYS.day7, kind: "bump" },
        { touch: 4, channel: "email", daysAfterStart: TOUCH_DAYS.day12, kind: "price" },
        { touch: 5, channel: "whatsapp", daysAfterStart: TOUCH_DAYS.day18, kind: "final" },
      ];
    case "whatsapp_only":
      return [
        { touch: 1, channel: "whatsapp", daysAfterStart: 0, kind: "intro" },
        { touch: 2, channel: "whatsapp", daysAfterStart: TOUCH_DAYS.day3, kind: "bump" },
        { touch: 3, channel: "whatsapp", daysAfterStart: TOUCH_DAYS.day7, kind: "bump" },
        { touch: 4, channel: "whatsapp", daysAfterStart: TOUCH_DAYS.day18, kind: "final" },
      ];
    case "email_only":
      return [
        { touch: 1, channel: "email", daysAfterStart: 0, kind: "intro" },
        { touch: 2, channel: "email", daysAfterStart: TOUCH_DAYS.day3, kind: "bump" },
        { touch: 3, channel: "email", daysAfterStart: TOUCH_DAYS.day12, kind: "price" },
      ];
    default:
      return [];
  }
}

export function resolveSequencePath(input: {
  hasMobile: boolean;
  whatsappStatus: WhatsAppStatus;
  hasEmail: boolean;
}): {
  path: SequencePath;
  blockedReason: string | null;
  needsManualReview: boolean;
} {
  const { hasMobile, whatsappStatus, hasEmail } = input;

  if (hasMobile && whatsappStatus === "available" && hasEmail) {
    return { path: "whatsapp_and_email", blockedReason: null, needsManualReview: false };
  }
  if (hasMobile && whatsappStatus === "available" && !hasEmail) {
    return { path: "whatsapp_only", blockedReason: null, needsManualReview: false };
  }
  if (hasMobile && whatsappStatus === "unavailable" && hasEmail) {
    return { path: "email_only", blockedReason: null, needsManualReview: false };
  }
  if (hasMobile && whatsappStatus === "unknown" && hasEmail) {
    return {
      path: "email_only",
      blockedReason:
        "whatsapp_status=unknown. Email-only plan until WhatsApp is verified manually.",
      needsManualReview: true,
    };
  }
  if (hasMobile && whatsappStatus === "unknown" && !hasEmail) {
    return {
      path: "blocked",
      blockedReason: "whatsapp_status=unknown and no public email.",
      needsManualReview: true,
    };
  }
  if (!hasMobile && hasEmail) {
    return { path: "email_only", blockedReason: null, needsManualReview: false };
  }
  if (!hasEmail && (!hasMobile || whatsappStatus !== "available")) {
    return {
      path: "blocked",
      blockedReason: "No WhatsApp-available mobile and no public email.",
      needsManualReview: false,
    };
  }
  return { path: "blocked", blockedReason: "No usable outreach channel.", needsManualReview: false };
}

export function buildOutreachPlan(
  lead: Lead,
  brief: BriefLike | null,
  whatsappStatus: WhatsAppStatus
): OutreachPlan {
  const phoneType = classifyUkPhone(lead.phone);
  const hasMobile = isWhatsAppCandidate(lead.phone);
  const hasEmail = Boolean(lead.email?.trim());
  const ownerFirst = ownerFirstName(lead, brief);
  const contactName = formatContactName(ownerFirst, brief?.business_name ?? lead.business_name);

  const { path, blockedReason, needsManualReview } = resolveSequencePath({
    hasMobile,
    whatsappStatus,
    hasEmail,
  });

  let suggestedState: OutreachPlan["suggestedState"] = "DEPLOYED";
  if (path === "blocked") {
    const hasAnyContact = hasEmail || hasMobile;
    suggestedState = hasAnyContact ? "NEEDS_MANUAL_CONTACT" : "PITCH_BLOCKED";
  } else if (needsManualReview) {
    suggestedState = "DEPLOYED";
  }

  const canUseWhatsApp = hasMobile && whatsappStatus === "available";
  const canUseEmail = hasEmail;
  const whatsappAvailable =
    whatsappStatus === "available" ? true : whatsappStatus === "unavailable" ? false : null;

  return {
    sequencePath: path,
    primaryChannel:
      path === "blocked"
        ? null
        : canUseWhatsApp
          ? "whatsapp"
          : canUseEmail
            ? "email"
            : null,
    phoneType,
    whatsappStatus,
    whatsappAvailable,
    canUseWhatsApp,
    canUseEmail,
    needsManualReview,
    contactName,
    ownerFirstName: ownerFirst,
    touches: buildTouchSchedule(path),
    blockedReason,
    suggestedState,
  };
}

export function touchForStep(plan: OutreachPlan, touch: number): TouchPlan | undefined {
  return plan.touches.find((t) => t.touch === touch);
}

export function resolveTouchChannel(
  step: TouchPlan,
  plan: OutreachPlan
): OutreachChannel {
  if (
    plan.sequencePath === "whatsapp_and_email" &&
    step.kind === "final" &&
    step.channel === "whatsapp" &&
    !plan.canUseWhatsApp &&
    plan.canUseEmail
  ) {
    return "email";
  }
  return step.channel;
}

export function nextTouch(lead: Lead, plan: OutreachPlan): number | null {
  if (plan.sequencePath === "blocked") return null;
  if (!lead.pitched_at) return 1;
  if (lead.state !== "PITCHED") return null;

  const maxTouch = plan.touches.length;
  if (lead.last_touch >= maxTouch) return null;

  const days = Math.floor(
    (Date.now() - new Date(lead.pitched_at).getTime()) / 86400000
  );

  for (const step of plan.touches) {
    if (lead.last_touch < step.touch && days >= step.daysAfterStart) {
      return step.touch;
    }
  }
  return null;
}

export function draftWhatsAppTouch1(
  businessName: string,
  siteUrl: string,
  options: {
    contactFirstName?: string | null;
    videoAttachment?: boolean;
    videoUrl?: string | null;
  } = {}
): { text: string; messages: string[]; videoAttachment?: boolean } {
  const formatted = formatWhatsAppTouch1({
    contactFirstName: options.contactFirstName,
    businessName,
    siteUrl,
    videoUrl: options.videoUrl,
    videoAttachment: options.videoAttachment,
  });
  return {
    text: formatted.messages[0] ?? "",
    messages: formatted.messages,
    videoAttachment: options.videoAttachment,
  };
}

export function draftEmailTouch1(
  businessName: string,
  siteUrl: string,
  greeting: string,
  videoUrl?: string | null
): EmailDraft {
  return {
    channel: "email",
    touch: 1,
    to: "",
    subject: `Quick demo site for ${businessName}`,
    text: formatEmailTouch1(businessName, siteUrl, greeting, videoUrl),
  };
}

export function draftPriceClarity(
  greeting: string,
  siteUrl: string
): string {
  return formatPriceClarity(greeting, siteUrl);
}

export function draftWhatsAppBump(
  businessName: string,
  siteUrl: string
): string {
  return formatWhatsAppBump(businessName, siteUrl);
}

export function draftEmailBump(
  businessName: string,
  siteUrl: string,
  greeting: string
): EmailDraft {
  return {
    channel: "email",
    touch: 0,
    to: "",
    subject: `Re: Quick demo site for ${businessName}`,
    text: `Hi ${greeting},

Just bumping this in case it got buried. The demo site for ${businessName} is still here if you want a look:

${siteUrl}

If it is not useful, reply no thanks and I will take it down.

Julius
WebForTrades`,
  };
}

export function draftWhatsAppFinal(
  businessName: string,
  siteUrl: string
): string {
  return formatWhatsAppFinal(businessName, siteUrl);
}

export function draftEmailFinal(
  businessName: string,
  siteUrl: string,
  greeting: string,
  fromEmail: string
): EmailDraft {
  return {
    channel: "email",
    touch: 0,
    to: "",
    subject: `Closing the loop on ${businessName}`,
    text: `Hi ${greeting},

I'll leave this with you. Last note from me. The preview stays at

${siteUrl}

for now. If it is not for you, just reply no thanks and I will remove it.

Julius
${fromEmail}`,
  };
}

export function draftForTouch(
  step: TouchPlan,
  plan: OutreachPlan,
  lead: Lead,
  brief: BriefLike | null,
  fromEmail: string,
  options: { videoAttachment?: boolean; videoUrl?: string | null } = {}
): OutreachDraft {
  const businessName = brief?.business_name ?? lead.business_name;
  const siteUrl = lead.site_url ?? "";
  const greeting = greetingName(lead, brief);
  const channel = resolveTouchChannel(step, plan);
  const touch = step.touch;
  const ownerFirst = ownerFirstName(lead, brief);

  if (channel === "whatsapp") {
    if (step.kind === "intro") {
      const intro = draftWhatsAppTouch1(businessName, siteUrl, {
        contactFirstName: ownerFirst,
        videoAttachment: options.videoAttachment,
        videoUrl: options.videoUrl,
      });
      return {
        channel: "whatsapp",
        touch,
        to: lead.phone ?? "",
        text: intro.text,
        messages: intro.messages,
        videoAttachment: intro.videoAttachment,
      };
    }
    let text = "";
    if (step.kind === "price") text = draftPriceClarity(greeting, siteUrl);
    else if (step.kind === "final") text = draftWhatsAppFinal(businessName, siteUrl);
    else text = draftWhatsAppBump(businessName, siteUrl);
    return { channel: "whatsapp", touch, to: lead.phone ?? "", text, messages: [text] };
  }

  if (step.kind === "intro") {
    const draft = draftEmailTouch1(
      businessName,
      siteUrl,
      greeting,
      options.videoUrl
    );
    return { ...draft, to: lead.email ?? "", touch };
  }
  if (step.kind === "price") {
    return {
      channel: "email",
      touch,
      to: lead.email ?? "",
      subject: `Price clarity for ${businessName}`,
      text: `${draftPriceClarity(greeting, siteUrl)}\nWebForTrades`,
    };
  }
  if (step.kind === "final") {
    const draft = draftEmailFinal(businessName, siteUrl, greeting, fromEmail);
    return { ...draft, to: lead.email ?? "", touch };
  }

  const bump = draftEmailBump(businessName, siteUrl, greeting);
  return { ...bump, to: lead.email ?? "", touch };
}

export function shouldDraftChannel(
  channel: OutreachChannel,
  plan: OutreachPlan
): boolean {
  if (channel === "whatsapp") return plan.canUseWhatsApp;
  return plan.canUseEmail;
}

export function isNegativeReply(text: string): boolean {
  const blob = text.toLowerCase();
  return (
    /no thanks|not interested|unsubscribe|remove me|stop (emailing|messaging|contacting)|take it down|wrong number|not this business|do not contact|don't contact|opt out|leave me alone/.test(
      blob
    )
  );
}

export function isDoNotContactReply(text: string): boolean {
  const blob = text.toLowerCase();
  return /wrong number|not this business|do not contact|don't contact|opt out|unsubscribe|remove me|stop (emailing|messaging|contacting)|leave me alone/.test(
    blob
  );
}

export function printSequenceSummary(plan: OutreachPlan): string[] {
  const lines: string[] = [];
  lines.push(`Sequence path: ${plan.sequencePath}`);
  lines.push(`Primary channel: ${plan.primaryChannel ?? "none"}`);
  lines.push(`Phone type: ${plan.phoneType}`);
  lines.push(`whatsapp_status: ${plan.whatsappStatus}`);
  if (plan.needsManualReview) {
    lines.push("Manual review: WhatsApp status unknown, proceed with caution");
  }
  lines.push(`Contact name: ${plan.contactName}`);
  if (plan.blockedReason) lines.push(`Note: ${plan.blockedReason}`);
  lines.push("Touch schedule:");
  for (const step of plan.touches) {
    const channel = resolveTouchChannel(step, plan);
    lines.push(
      `  Touch ${step.touch}: ${channel} on day ${step.daysAfterStart} (${step.kind})`
    );
  }
  return lines;
}
