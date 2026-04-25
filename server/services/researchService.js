import { fetchWithTimeout } from "../utils/http.js";

const TAVILY_URL = "https://api.tavily.com/search";

function fallbackResearch(restorationAction) {
  return {
    source: "fallback",
    why_it_helps:
      "Brief grounding actions can reduce cognitive overload by interrupting stress loops and restoring attention.",
    supporting_points: [
      "Short breath-led pauses can calm immediate stress activation.",
      "Micro-breaks improve task quality when mental strain is high."
    ],
    links: [],
    restoration_action: restorationAction
  };
}

function sanitizeLinks(results) {
  if (!Array.isArray(results)) return [];

  return results
    .slice(0, 2)
    .map((item) => ({
      title: String(item?.title || "Reference"),
      url: String(item?.url || "")
    }))
    .filter((item) => item.url.startsWith("http"));
}

export async function getResearchNudge(input, opts = {}) {
  const restorationAction = String(input?.restoration_action || "2 minute breathing reset");
  const burnoutRisk = String(input?.burnout_risk || "medium");
  const emotionalState = String(input?.emotional_state || "mentally loaded");

  if (!opts.enableExternalContext || !opts.tavilyApiKey) {
    return fallbackResearch(restorationAction);
  }

  const query = `evidence based benefit of ${restorationAction} for stress recovery, burnout risk ${burnoutRisk}, emotional state ${emotionalState}`;

  try {
    const response = await fetchWithTimeout(
      TAVILY_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          api_key: opts.tavilyApiKey,
          query,
          max_results: 2,
          search_depth: "basic",
          include_answer: true,
          include_raw_content: false
        })
      },
      6500
    );

    if (!response.ok) {
      console.error("/api/research-nudge tavily failed", response.status);
      return fallbackResearch(restorationAction);
    }

    const data = await response.json();
    const answer = String(data?.answer || "").trim();
    const links = sanitizeLinks(data?.results);

    const supportingPoints = [];
    for (const result of Array.isArray(data?.results) ? data.results.slice(0, 2) : []) {
      const content = String(result?.content || "").trim();
      if (content) supportingPoints.push(content.slice(0, 150));
    }

    return {
      source: "tavily",
      why_it_helps:
        answer ||
        "Small restorative actions can help shift stress momentum and improve short-term clarity.",
      supporting_points:
        supportingPoints.length > 0
          ? supportingPoints
          : [
              "Brief interventions can restore attention during mentally demanding periods.",
              "Consistent small resets are linked with lower perceived stress."
            ],
      links
    };
  } catch (error) {
    console.error("/api/research-nudge error", error);
    return fallbackResearch(restorationAction);
  }
}

export function summarizeResearchContext(researchContext) {
  if (!researchContext || researchContext.source === "fallback") return null;
  return `${researchContext.why_it_helps} ${researchContext.supporting_points?.[0] || ""}`.trim();
}
