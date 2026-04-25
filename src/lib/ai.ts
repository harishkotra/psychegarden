import type { Signals } from "./energy";
import type { PublicContext, WeatherContext } from "./context";

export type InsightPayload = {
  signals: Signals;
  vitality: number;
  moodText: string;
  weather: WeatherContext;
  public_context: PublicContext;
  research_summary?: string;
};

export type InsightResponse = {
  emotional_state: string;
  burnout_risk: "low" | "medium" | "high";
  garden_metaphor: string;
  insight: string;
  restoration_action: string;
  micro_message: string;
  contextual_reason: string;
};

export type InsightResult = {
  source: "openai" | "fallback";
  result: InsightResponse;
};

const localFallback = (payload: InsightPayload): InsightResponse => {
  const risk = payload.vitality < 30 ? "high" : payload.vitality < 60 ? "medium" : "low";

  return {
    emotional_state:
      payload.moodText.trim().length > 0 ? "Emotionally stretched but self-aware" : "Balanced, with mild mental load",
    burnout_risk: risk,
    garden_metaphor:
      payload.vitality < 25
        ? "Your garden is in a dry spell and asking for immediate shade."
        : payload.vitality < 50
          ? "The leaves are bending in wind, but roots are still holding."
          : payload.vitality < 80
            ? "The garden is steady with gentle cloud cover."
            : "The garden is vibrant, sunlit, and full of motion.",
    insight:
      risk === "high"
        ? "Your current load suggests mounting fatigue. A quick body reset can reduce mental pressure and help you continue with less strain."
        : risk === "medium"
          ? "You are carrying moderate cognitive load. Small intentional breaks now can protect your evening energy."
          : "Your pattern looks stable. Keep up short recovery rituals to preserve this momentum.",
    restoration_action: "Take 2 minutes: stand up, shake out tension, and do 6 slow breaths.",
    micro_message: "Tiny resets count. Your garden responds to every small act of care.",
    contextual_reason: `Signals and ${payload.weather.condition} weather suggest ${risk} strain right now.`
  };
};

export async function fetchInsight(payload: InsightPayload): Promise<InsightResult> {
  try {
    const response = await fetch("/api/insight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return { source: "fallback", result: localFallback(payload) };
    }

    const data = (await response.json()) as InsightResult;
    if (!data?.result) {
      return { source: "fallback", result: localFallback(payload) };
    }

    return data;
  } catch {
    return { source: "fallback", result: localFallback(payload) };
  }
}
