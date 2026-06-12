import assert from "node:assert/strict";
import {
  evaluateSectionIntegrity,
  evaluateSectionIntegrityHtml,
  type SectionIntegrityMetrics,
} from "./section_integrity.js";

function testGallerySingleColumnFails(): void {
  const issues = evaluateSectionIntegrity({
    galleryFound: true,
    galleryColumnCount: 1,
    viewportWidth: 1280,
    promiseSections: [],
  });
  assert.ok(issues.some((i) => i.severity === "error" && /single column/i.test(i.message)));
}

function testGalleryThreeColumnsPasses(): void {
  const issues = evaluateSectionIntegrity({
    galleryFound: true,
    galleryColumnCount: 3,
    viewportWidth: 1280,
    promiseSections: [],
  });
  assert.equal(issues.filter((i) => i.severity === "error").length, 0);
}

function testPromiseSectionBareBulletsFails(): void {
  const metrics: SectionIntegrityMetrics = {
    galleryFound: true,
    galleryColumnCount: 3,
    viewportWidth: 1280,
    promiseSections: [
      {
        id: "services",
        heading: "Roofing services explained plainly",
        itemCount: 5,
        itemsWithDescription: 0,
        averageDescriptionWords: 0,
      },
    ],
  };
  const issues = evaluateSectionIntegrity(metrics);
  assert.ok(issues.some((i) => /promises explanatory copy/i.test(i.message)));
}

function testPromiseSectionWithDescriptionsPasses(): void {
  const metrics: SectionIntegrityMetrics = {
    galleryFound: true,
    galleryColumnCount: 3,
    viewportWidth: 1280,
    promiseSections: [
      {
        id: "services",
        heading: "Roofing services explained plainly",
        itemCount: 5,
        itemsWithDescription: 5,
        averageDescriptionWords: 14,
      },
    ],
  };
  const issues = evaluateSectionIntegrity(metrics);
  assert.equal(issues.filter((i) => /promises explanatory/i.test(i.message)).length, 0);
}

function testHtmlSingleColumnClassFails(): void {
  const html = `<section id="gallery"><div class="gallery gallery--single-column"></div></section>`;
  const issues = evaluateSectionIntegrityHtml(html);
  assert.ok(issues.some((i) => /single-column desktop class/i.test(i.message)));
}

testGallerySingleColumnFails();
testGalleryThreeColumnsPasses();
testPromiseSectionBareBulletsFails();
testPromiseSectionWithDescriptionsPasses();
testHtmlSingleColumnClassFails();
console.log("section_integrity tests: all passed");
