import test from "node:test";
import assert from "node:assert/strict";
import { getResearchNudge } from "../server/services/researchService.js";

test("research nudge falls back when Tavily key is missing", async () => {
  const result = await getResearchNudge(
    {
      restoration_action: "2 minute breathing exercise",
      burnout_risk: "high",
      emotional_state: "overloaded"
    },
    {
      enableExternalContext: true,
      tavilyApiKey: ""
    }
  );

  assert.equal(result.source, "fallback");
  assert.equal(Array.isArray(result.links), true);
  assert.equal(result.links.length, 0);
});
