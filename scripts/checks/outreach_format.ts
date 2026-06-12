/**
 * Lint check: outreach message formatting (link spacing, site/video separation).
 */
export {
  assertOutreachPayloadValid,
  extractUrls,
  validateLinkSpacing,
  validateNoSiteAndVideoInSameMessage,
  validateOutreachMessage,
  validateOutreachPayload,
  type FormattedPitchTouch1,
  type OutreachFormatIssue,
  type PitchTouch1Input,
} from "../outreach_message_format.js";
