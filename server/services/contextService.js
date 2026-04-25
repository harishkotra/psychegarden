import { getPublicContext } from "../adapters/brightData.js";
import { getResearchNudge } from "./researchService.js";
import { getWeatherContext } from "./weatherService.js";

function cleanSignals(signals = {}) {
  return {
    sleepHours: Number(signals.sleepHours ?? 7),
    screenTime: Number(signals.screenTime ?? 3),
    meetingLoad: Number(signals.meetingLoad ?? 2),
    steps: Number(signals.steps ?? 5000)
  };
}

export function validateContextInput(input = {}) {
  return {
    lat: input.lat === null || input.lat === undefined ? null : Number(input.lat),
    lon: input.lon === null || input.lon === undefined ? null : Number(input.lon),
    moodText: String(input.moodText || "").slice(0, 240),
    signals: cleanSignals(input.signals),
    vitality: Number(input.vitality ?? 50)
  };
}

export async function buildUnifiedContext(input, opts = {}) {
  const safeInput = validateContextInput(input);

  const weather = await getWeatherContext(
    {
      lat: safeInput.lat,
      lon: safeInput.lon
    },
    opts
  );

  const publicContext = await getPublicContext(safeInput, opts);

  let researchContext = null;
  if (opts.enableExternalContext && opts.tavilyApiKey) {
    researchContext = await getResearchNudge(
      {
        restoration_action: "2 minute breathing exercise",
        burnout_risk: safeInput.vitality < 30 ? "high" : safeInput.vitality < 60 ? "medium" : "low",
        emotional_state: safeInput.moodText || "mentally loaded"
      },
      opts
    );
  }

  const contextSummary = [
    `Today's sky feels ${weather.condition} with ${weather.garden_effects.light} light.`,
    publicContext.summary,
    researchContext?.why_it_helps || ""
  ]
    .filter(Boolean)
    .join(" ");

  return {
    weather,
    public_context: publicContext,
    research_context: researchContext,
    context_summary: contextSummary
  };
}
