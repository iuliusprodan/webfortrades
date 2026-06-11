import assert from "node:assert/strict";
import { assertPitchTargetSendAllowed } from "../send_whatsapp_caption_pitches.js";

assert.throws(
  () => assertPitchTargetSendAllowed({ state: "PITCHED", slug: "demo" }),
  /already PITCHED/
);
assert.doesNotThrow(() => assertPitchTargetSendAllowed({ state: "DEPLOYED", slug: "demo" }));
console.log("caption_pitches_guard: ok");
