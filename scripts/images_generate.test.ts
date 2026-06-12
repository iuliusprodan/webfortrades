import assert from "node:assert/strict";
import { buildPrompt, detectNiche, loadDesignDirection } from "./image_generate_prompt.js";
import { findUsableGooglePlacesHero } from "./images_generate.js";

function testNicheDetection(): void {
  assert.equal(detectNiche("electricians Leeds"), "electrician");
  assert.equal(detectNiche("plumbing heating boiler"), "plumbing_heating");
  assert.equal(detectNiche("bathroom refits and gas work", "electricians"), "electrician");
  assert.equal(detectNiche("roofer slate tiles"), "roofer");
  assert.equal(detectNiche("painters decorators wallpaper"), "painter_decorator");
  assert.equal(detectNiche("general trade"), "default");
}

function testPromptBuilder(): void {
  const prompt = buildPrompt({
    slug: "test",
    label: "charcoal orange technical electric",
    paletteKey: "charcoal-orange",
    tone: "Assured, precise, plain English",
    niche: "electrician",
  });
  assert.match(prompt.fullPrompt, /switchgear/i);
  assert.match(prompt.fullPrompt, /no people/i);
  assert.match(prompt.fullPrompt, /charcoal/i);
  assert.equal(prompt.altText, "Abstract brushed steel switchgear and wiring texture");
  assert.doesNotMatch(prompt.fullPrompt, /West Park|Choudhary|Leeds/i);
}

function testWestParkDesignDirection(): void {
  const design = loadDesignDirection("west-park-electrics");
  assert.equal(design.niche, "electrician");
  const prompt = buildPrompt(design);
  assert.match(prompt.fullPrompt, /editorial photography/i);
}

function testHeroSkipThreshold(): void {
  const hero = findUsableGooglePlacesHero("west-park-electrics");
  assert.ok(hero);
  assert.ok(Math.max(hero.width, hero.height) >= 1000);
}

testNicheDetection();
testPromptBuilder();
testWestParkDesignDirection();
testHeroSkipThreshold();
console.log("images:generate tests: all passed");
