import { fetchWithTimeout } from "./utils/http.js";

const OPENAI_URL = "https://api.openai.com/v1/responses";

const FALLBACK_ACTIONS = [
  "Stand up and roll your shoulders for 90 seconds.",
  "Drink a glass of water and take 8 slow breaths.",
  "Look away from screens and focus on a distant object for 2 minutes.",
  "Do a 2-minute walk and loosen your jaw and neck.",
  "Put one hand on your chest and take 10 slow exhalations."
];

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function riskFromEnergy(energy) {
  if (energy < 30) return "high";
  if (energy < 60) return "medium";
  return "low";
}

function fallbackInsight(payload) {
  const { vitality, moodText, signals, weather, public_context } = payload;
  const sleep = signals?.sleepHours ?? 0;
  const meetings = signals?.meetingLoad ?? 0;
  const screen = signals?.screenTime ?? 0;
  const steps = signals?.steps ?? 0;
  const risk = riskFromEnergy(vitality);
  const weatherCondition = weather?.condition ?? "unknown";
  const worldPressure = public_context?.summary ?? "world context is in demo mode";

  const emotionalState =
    moodText?.trim().length > 0
      ? "Reflective and carrying some load"
      : vitality < 40
        ? "Mentally taxed"
        : "Steady with room to protect energy";

  let metaphor = "Your garden is holding a calm balance.";
  if (vitality < 25) metaphor = "Your soil is dry and the leaves are drooping under heavy weather.";
  else if (vitality < 50) metaphor = "Fog has settled in and your blooms are conserving strength.";
  else if (vitality < 80) metaphor = "Your garden is stable, with some passing cloud cover.";
  else metaphor = "Sunlight and blossoms are thriving across your garden path.";

  const pressureIndex = clamp((meetings * 10 + screen * 4 - sleep * 5 - steps / 1500), 0, 100);
  const action = FALLBACK_ACTIONS[Math.floor((pressureIndex + vitality) % FALLBACK_ACTIONS.length)];

  const insight = `Sleep (${sleep}h), meetings (${meetings}), screen time (${screen}h), and movement (${steps} steps) suggest a ${risk} burnout pattern. Weather feels ${weatherCondition}, so protect your focus with one brief reset.`;

  return {
    emotional_state: emotionalState,
    burnout_risk: risk,
    garden_metaphor: metaphor,
    insight,
    restoration_action: action,
    micro_message:
      risk === "high"
        ? "A small pause now can prevent a bigger crash later."
        : risk === "medium"
          ? "You are still in range to recover momentum with one gentle action."
          : "Your rhythm is working. Keep micro-breaks to preserve this energy.",
    contextual_reason: `Signals and ${weatherCondition} sky indicate ${risk} strain; ${worldPressure}`
  };
}

function tryParseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function generateOpenAIInsight(payload, apiKey) {
  const prompt =
    "You are PsycheGarden, a gentle mental wellness reflection assistant. Given the user mood text, sleep, steps, screen time, meeting load, vitality score, weather context, public context, and research summary, return concise JSON only. Focus on supportive, non-clinical reflection and one practical micro-recovery action under 3 minutes. Do not provide medical claims or diagnosis.";

  const response = await fetchWithTimeout(
    OPENAI_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: prompt
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify(payload)
              }
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "psychegarden_insight",
            schema: {
              type: "object",
              additionalProperties: false,
              required: [
                "emotional_state",
                "burnout_risk",
                "garden_metaphor",
                "insight",
                "restoration_action",
                "micro_message",
                "contextual_reason"
              ],
              properties: {
                emotional_state: { type: "string" },
                burnout_risk: { type: "string", enum: ["low", "medium", "high"] },
                garden_metaphor: { type: "string" },
                insight: { type: "string" },
                restoration_action: { type: "string" },
                micro_message: { type: "string" },
                contextual_reason: { type: "string" }
              }
            }
          }
        }
      })
    },
    9500
  );

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const data = await response.json();
  const outputText = data?.output_text ?? data?.output?.[0]?.content?.[0]?.text ?? "";
  const parsed = tryParseJson(outputText);

  if (!parsed) {
    throw new Error("OpenAI response was not valid JSON");
  }

  return parsed;
}

export async function createInsight(payload, apiKey) {
  if (!apiKey) {
    return { source: "fallback", result: fallbackInsight(payload) };
  }

  try {
    const result = await generateOpenAIInsight(payload, apiKey);
    return { source: "openai", result };
  } catch (error) {
    console.error("/api/insight openai error", error);
    return { source: "fallback", result: fallbackInsight(payload) };
  }
}
