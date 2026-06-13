import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { reviewVoiceForSite } from "./voice_review.js";

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "wft-voice-"));
}

function writeJson(file: string, data: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function run(): void {
  const root = tmpDir();
  const slug = "test-voice";
  const briefDirPath = path.join(root, "briefs", slug);
  const siteApp = path.join(root, "sites", slug, "app");

  writeJson(path.join(briefDirPath, "voice.json"), {
    distinctive_angle: "Leeds roofing with walk-through quotes before work starts.",
    owner_voice_signals: {
      register: "conversational",
      verbosity: "balanced",
      self_description: null,
      stock_phrases_used_by_owner: [],
    },
    recurring_themes_in_reviews: [],
    specific_proof_points: ["Walks customers through cost before starting"],
    banned_for_this_business: [],
    confidence: "high",
    confidence_reason: "test",
  });

  writeJson(path.join(briefDirPath, "brief.json"), {
    certifications: [],
    directory_probes: [],
  });

  fs.mkdirSync(siteApp, { recursive: true });
  fs.writeFileSync(
    path.join(siteApp, "page.tsx"),
    `export default function Page() {
  return (
    <main data-section-id="hero">
      <h1>Leeds roofers</h1>
      <p>Your trusted partner for quality you can rely on.</p>
      <p>Gas Safe registered team.</p>
    </main>
  );
}
`
  );

  const issues = reviewVoiceForSite(slug, {
    root,
    voicePath: path.join(briefDirPath, "voice.json"),
    briefPath: path.join(briefDirPath, "brief.json"),
  });

  const codes = issues.map((i) => i.code);
  if (!codes.includes("banned_generic_phrase")) {
    throw new Error(`Expected banned_generic_phrase, got: ${codes.join(", ")}`);
  }
  if (!codes.includes("unsupported_badge")) {
    throw new Error(`Expected unsupported_badge, got: ${codes.join(", ")}`);
  }

  console.log("voice_review.test.ts: OK");
}

run();
