import assert from "node:assert/strict";
import { resolveSessionApiId } from "../openwa_ensure.js";

const sessions = [
  { id: "sess-uuid-1", name: "webfortrades-outreach" },
  { id: "sess-uuid-2", name: "other" },
];

assert.equal(resolveSessionApiId("sess-uuid-1", sessions), "sess-uuid-1");
assert.equal(resolveSessionApiId("webfortrades-outreach", sessions), "sess-uuid-1");
assert.equal(resolveSessionApiId("missing", sessions), null);
console.log("openwa_session_resolve: ok");
