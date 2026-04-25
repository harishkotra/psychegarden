import test from "node:test";
import assert from "node:assert/strict";
import { buildUnifiedContext } from "../server/services/contextService.js";

test("unified context returns valid shape with no API keys", async () => {
  const result = await buildUnifiedContext(
    {
      lat: null,
      lon: null,
      moodText: "Tired but trying",
      signals: { sleepHours: 6, screenTime: 5, meetingLoad: 4, steps: 2500 },
      vitality: 42
    },
    {
      enableExternalContext: false,
      tavilyApiKey: "",
      brightDataApiKey: "",
      brightDataMcpUrl: ""
    }
  );

  assert.equal(typeof result.context_summary, "string");
  assert.equal(result.weather.source, "open-meteo");
  assert.equal(result.public_context.source, "fallback");
  assert.equal(result.research_context, null);
});
