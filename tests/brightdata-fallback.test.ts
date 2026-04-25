import test from "node:test";
import assert from "node:assert/strict";
import { getPublicContext } from "../server/adapters/brightData.js";

test("bright data adapter safely falls back with no config", async () => {
  const context = await getPublicContext(
    { lat: null, lon: null },
    { enableExternalContext: true, brightDataApiKey: "", brightDataMcpUrl: "" }
  );

  assert.equal(context.source, "fallback");
  assert.equal(typeof context.summary, "string");
});
