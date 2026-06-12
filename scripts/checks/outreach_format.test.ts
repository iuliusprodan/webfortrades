import assert from "node:assert/strict";
import {
  assertOutreachPayloadValid,
  formatWhatsAppTouch1,
  validateLinkSpacing,
  validateOutreachPayload,
} from "../outreach_message_format.js";

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

console.log("outreach_format");

test("accepts canonical two-message WhatsApp touch 1", () => {
  const { messages } = formatWhatsAppTouch1({
    contactFirstName: "Jack",
    businessName: "Bristol Plumbing Co.",
    siteUrl: "https://bristol-plumbing-co.vercel.app",
    videoAttachment: true,
  });
  assert.equal(messages.length, 2);
  assertOutreachPayloadValid({
    messages,
    siteUrl: "https://bristol-plumbing-co.vercel.app",
    videoAttachment: true,
  });
});

test("rejects URL without blank line above", () => {
  const issues = validateLinkSpacing("Hi there\nhttps://example.com\nThanks");
  assert.ok(issues.some((i) => i.code === "link_missing_blank_line_above"));
});

test("rejects URL without blank line below", () => {
  const issues = validateLinkSpacing("Hi\n\nhttps://example.com\nThanks");
  assert.ok(issues.some((i) => i.code === "link_missing_blank_line_below"));
});

test("rejects site and video URL in same message", () => {
  const body = `Hi

https://site.example.com

https://video.example.com/scroll.mp4

Thanks`;
  const issues = validateOutreachPayload({
    messages: [body],
    siteUrl: "https://site.example.com",
    videoUrl: "https://video.example.com/scroll.mp4",
  });
  assert.ok(issues.some((i) => i.code === "site_and_video_same_message"));
});

test("accepts spaced site and video URLs in separate messages", () => {
  const { messages } = formatWhatsAppTouch1({
    contactFirstName: "Jack",
    businessName: "Test Co",
    siteUrl: "https://site.example.com",
    videoUrl: "https://video.example.com/scroll.mp4",
  });
  const issues = validateOutreachPayload({
    messages,
    siteUrl: "https://site.example.com",
    videoUrl: "https://video.example.com/scroll.mp4",
  });
  assert.equal(issues.length, 0);
});

console.log("\nAll outreach_format tests passed.");
