import assert from "node:assert/strict";
import {
  evaluateOwnerNameSectionTitleBanHtml,
  evaluateTextOnlyWordmarksHtml,
} from "../site_design_checks.js";

const badOwnerTitle =
  '<section><h2>Customers mention Neil by name in their reviews.</h2></section>';
assert.ok(evaluateOwnerNameSectionTitleBanHtml(badOwnerTitle).length > 0);

const goodTitle = "<section><h2>What customers say</h2></section>";
assert.equal(evaluateOwnerNameSectionTitleBanHtml(goodTitle).length, 0);

const logoHtml = '<header><img class="site-logo" src="/logo.png" alt="Logo"></header>';
assert.ok(evaluateTextOnlyWordmarksHtml(logoHtml).length > 0);

console.log("site_design_checks: ok");
