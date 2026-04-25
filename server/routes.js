import { createInsight } from "./aiService.js";
import { buildUnifiedContext, validateContextInput } from "./services/contextService.js";
import { getResearchNudge } from "./services/researchService.js";
import { getWeatherContext } from "./services/weatherService.js";
import { boolFromEnv } from "./utils/http.js";

function buildOptions(env = process.env) {
  return {
    enableExternalContext: boolFromEnv(env.ENABLE_EXTERNAL_CONTEXT, true),
    tavilyApiKey: env.TAVILY_API_KEY,
    brightDataApiKey: env.BRIGHT_DATA_API_KEY,
    brightDataMcpUrl: env.BRIGHT_DATA_MCP_URL
  };
}

function parseLatLon(query = {}) {
  const lat = query.lat === undefined ? undefined : Number(query.lat);
  const lon = query.lon === undefined ? undefined : Number(query.lon);
  return {
    lat: Number.isFinite(lat) ? lat : undefined,
    lon: Number.isFinite(lon) ? lon : undefined
  };
}

export function registerApiRoutes(app, env = process.env) {
  app.get("/api/weather", async (req, res) => {
    const coords = parseLatLon(req.query ?? {});
    const weather = await getWeatherContext(coords, buildOptions(env));
    res.json(weather);
  });

  app.post("/api/research-nudge", async (req, res) => {
    const body = req.body ?? {};
    const safeInput = {
      restoration_action: String(body.restoration_action || "2 minute breathing exercise").slice(0, 140),
      burnout_risk: ["low", "medium", "high"].includes(body.burnout_risk) ? body.burnout_risk : "medium",
      emotional_state: String(body.emotional_state || "mentally loaded").slice(0, 120)
    };

    const result = await getResearchNudge(safeInput, buildOptions(env));
    res.json({
      source: result.source,
      why_it_helps: result.why_it_helps,
      supporting_points: Array.isArray(result.supporting_points) ? result.supporting_points.slice(0, 2) : [],
      links: Array.isArray(result.links) ? result.links.slice(0, 2) : []
    });
  });

  app.post("/api/context", async (req, res) => {
    const payload = validateContextInput(req.body ?? {});
    const context = await buildUnifiedContext(payload, buildOptions(env));
    res.json(context);
  });

  app.post("/api/insight", async (req, res) => {
    try {
      const payload = req.body ?? {};
      const safePayload = {
        moodText: String(payload.moodText || "").slice(0, 280),
        vitality: Number(payload.vitality ?? payload.energyScore ?? 50),
        signals: payload.signals ?? {},
        weather: payload.weather ?? null,
        public_context: payload.public_context ?? null,
        research_summary: String(payload.research_summary || "").slice(0, 280)
      };

      const insight = await createInsight(safePayload, env.OPENAI_API_KEY);
      res.json(insight);
    } catch (error) {
      console.error("/api/insight route error", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate insight" });
    }
  });
}
