import assert from "node:assert/strict";
import {
  classifyProbeResult,
  isAccessBlocked,
  type FetchProbe,
} from "./website_classify.js";

function probe(overrides: Partial<FetchProbe>): FetchProbe {
  return {
    ok: true,
    statusCode: 200,
    finalUrl: "https://example.com/",
    title: null,
    bodyText: "Contact us about plumbing services in Bristol.",
    error: null,
    ...overrides,
  };
}

function classify403(): void {
  const result = classifyProbeResult({
    initialUrl: "https://bristolplumber.co.uk/",
    businessName: "MP Plumbing Services Ltd",
    probe: probe({
      statusCode: 403,
      title: "403 - Forbidden",
      bodyText: "",
      finalUrl: "https://bristolplumber.co.uk/",
    }),
    finalUrlIsSocialOrDirectory: false,
    appearsToBelongToBusiness: false,
    hasServicesOrContact: false,
  });
  assert.equal(result.status, "NEEDS_MANUAL_REVIEW");
  assert.match(result.notes, /bot_or_access_blocked/);
}

function classify403TitleOn200(): void {
  const result = classifyProbeResult({
    initialUrl: "https://www.oakleybathrooms.co.uk/",
    businessName: "Oakley Bathrooms",
    probe: probe({
      statusCode: 200,
      title: "403 - Forbidden",
      bodyText: "Forbidden",
      finalUrl: "https://www.oakleybathrooms.co.uk/",
    }),
    finalUrlIsSocialOrDirectory: false,
    appearsToBelongToBusiness: false,
    hasServicesOrContact: false,
  });
  assert.equal(result.status, "NEEDS_MANUAL_REVIEW");
}

function classify404Broken(): void {
  const result = classifyProbeResult({
    initialUrl: "https://example.com/",
    businessName: "Example Plumbing",
    probe: probe({
      statusCode: 404,
      title: "Not Found",
      bodyText: "Page not found",
    }),
    finalUrlIsSocialOrDirectory: false,
    appearsToBelongToBusiness: false,
    hasServicesOrContact: false,
  });
  assert.equal(result.status, "BROKEN_OR_BAD_SITE");
  assert.match(result.notes, /http_404/);
}

function isAccessBlockedDirect(): void {
  assert.equal(
    isAccessBlocked(probe({ statusCode: 403, title: "403 - Forbidden", bodyText: "" })),
    true
  );
  assert.equal(
    isAccessBlocked(probe({ statusCode: 200, title: "403 - Forbidden", bodyText: "" })),
    true
  );
  assert.equal(
    isAccessBlocked(probe({ statusCode: 404, title: "Not Found", bodyText: "missing" })),
    false
  );
}

function classify202Waf(): void {
  const result = classifyProbeResult({
    initialUrl: "https://bristolplumber.co.uk/",
    businessName: "MP Plumbing Services Ltd",
    probe: probe({
      statusCode: 202,
      title: "",
      bodyText: "sgcaptcha",
      finalUrl: "https://bristolplumber.co.uk/",
    }),
    finalUrlIsSocialOrDirectory: false,
    appearsToBelongToBusiness: false,
    hasServicesOrContact: false,
  });
  assert.equal(result.status, "NEEDS_MANUAL_REVIEW");
}

classify403();
classify403TitleOn200();
classify404Broken();
classify202Waf();
isAccessBlockedDirect();

console.log("website_classify regression tests passed");
