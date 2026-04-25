import { fetchWithTimeout } from "../utils/http.js";

function fallbackPublicContext() {
  return {
    source: "fallback",
    air_quality_hint: null,
    local_stressors: [],
    commute_or_city_hint: null,
    summary: "Using demo context. Public world pressure signals are currently simulated."
  };
}

function parseResultText(raw) {
  if (!raw) return "";
  if (typeof raw === "string") return raw;

  if (Array.isArray(raw?.content)) {
    return raw.content
      .map((item) => {
        if (typeof item?.text === "string") return item.text;
        if (typeof item === "string") return item;
        return "";
      })
      .filter(Boolean)
      .join(" ");
  }

  if (typeof raw?.result?.content === "string") return raw.result.content;
  if (Array.isArray(raw?.result?.content)) {
    return raw.result.content
      .map((item) => (typeof item?.text === "string" ? item.text : ""))
      .filter(Boolean)
      .join(" ");
  }

  return JSON.stringify(raw);
}

function inferStressors(text) {
  const lower = text.toLowerCase();
  const stressors = [];
  if (lower.includes("traffic") || lower.includes("commute") || lower.includes("congestion")) {
    stressors.push("Commute pressure");
  }
  if (lower.includes("air quality") || lower.includes("pollution") || lower.includes("aqi")) {
    stressors.push("Air quality strain");
  }
  if (lower.includes("heat") || lower.includes("temperature")) stressors.push("Heat load");
  if (lower.includes("rain") || lower.includes("storm")) stressors.push("Weather disruption");
  return stressors.slice(0, 3);
}

function summarizeFromText(text) {
  const sentence = text
    .replace(/\s+/g, " ")
    .split(/[.!?]/)
    .map((chunk) => chunk.trim())
    .find(Boolean);
  return sentence ? `${sentence}.` : "Live public context retrieved from Bright Data Web MCP.";
}

function getEndpoint(options) {
  const baseUrl = options.brightDataMcpUrl || "https://mcp.brightdata.com/mcp";
  const token = options.brightDataApiToken || options.brightDataApiKey;
  if (!token) return null;

  try {
    const url = new URL(baseUrl);
    if (!url.searchParams.has("token")) {
      url.searchParams.set("token", token);
    }
    return url.toString();
  } catch {
    return null;
  }
}

async function callMcp(endpoint, method, params, timeoutMs = 5000) {
  const response = await fetchWithTimeout(
    endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `${method}-${Date.now()}`,
        method,
        params
      })
    },
    timeoutMs
  );

  if (!response.ok) {
    throw new Error(`MCP HTTP ${response.status}`);
  }

  return response.json();
}

async function runSearchTool(endpoint, query) {
  await callMcp(
    endpoint,
    "initialize",
    {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "psychegarden", version: "0.2.0" }
    },
    4500
  );

  const attempts = [
    { name: "search_engine", arguments: { query } },
    { name: "search_engine", arguments: { q: query } },
    { name: "discover", arguments: { query } }
  ];

  for (const attempt of attempts) {
    try {
      const payload = await callMcp(endpoint, "tools/call", attempt, 6000);
      return payload;
    } catch {
      // Continue trying alternate tool/arg variants.
    }
  }

  throw new Error("No compatible Bright Data MCP search tool call succeeded");
}

function extractModeFlags(options) {
  return {
    proMode: Boolean(options.brightDataProMode),
    groups: typeof options.brightDataGroups === "string" ? options.brightDataGroups : "",
    tools: typeof options.brightDataTools === "string" ? options.brightDataTools : ""
  };
}

export async function getPublicContext(input, options = {}) {
  const hasConfig = Boolean(options.brightDataApiToken || options.brightDataApiKey || options.brightDataMcpUrl);
  if (!options.enableExternalContext || !hasConfig) {
    return fallbackPublicContext();
  }

  const endpoint = getEndpoint(options);
  if (!endpoint) {
    return {
      source: "fallback",
      air_quality_hint: "No live Bright Data token/endpoint configured",
      local_stressors: [],
      commute_or_city_hint: null,
      summary: "Using demo context. Bright Data adapter is configured but missing a valid MCP token endpoint."
    };
  }

  try {
    const lat = Number.isFinite(input?.lat) ? input.lat : 12.9716;
    const lon = Number.isFinite(input?.lon) ? input.lon : 77.5946;
    const mode = extractModeFlags(options);
    const modeHint = [
      mode.proMode ? "PRO_MODE=true" : "rapid_mode",
      mode.groups ? `groups=${mode.groups}` : "",
      mode.tools ? `tools=${mode.tools}` : ""
    ]
      .filter(Boolean)
      .join(", ");

    const query = `city level public stress context near lat ${lat}, lon ${lon}: traffic, commute pressure, public disruption, air quality hints, weather related friction. Return concise signal highlights. ${modeHint}`;

    const data = await runSearchTool(endpoint, query);
    const text = parseResultText(data);
    const stressors = inferStressors(text);

    const airQualityHint = /air quality|aqi|pollution/i.test(text)
      ? summarizeFromText(
          text
            .split(/(?<=[.!?])\s+/)
            .find((line) => /air quality|aqi|pollution/i.test(line)) || "Air quality may add mild load today"
        )
      : null;

    const commuteHint = /traffic|commute|congestion/i.test(text)
      ? summarizeFromText(
          text
            .split(/(?<=[.!?])\s+/)
            .find((line) => /traffic|commute|congestion/i.test(line)) ||
            "Commute friction may affect cognitive load"
        )
      : null;

    return {
      source: "bright-data",
      air_quality_hint: airQualityHint,
      local_stressors: stressors,
      commute_or_city_hint: commuteHint,
      summary: summarizeFromText(text)
    };
  } catch (error) {
    console.error("bright-data adapter error", error);
    return fallbackPublicContext();
  }
}
