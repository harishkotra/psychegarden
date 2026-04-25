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

export async function getPublicContext(input, options = {}) {
  const hasConfig = Boolean(options.brightDataApiKey || options.brightDataMcpUrl);
  if (!options.enableExternalContext || !hasConfig) {
    return fallbackPublicContext();
  }

  // TODO: Replace this placeholder request when a Bright Data MCP contract is available.
  // The fallback path is intentionally safe and non-blocking for deployments.
  if (!options.brightDataMcpUrl) {
    return {
      source: "fallback",
      air_quality_hint: "No live Bright Data endpoint configured",
      local_stressors: [],
      commute_or_city_hint: null,
      summary: "Using demo context. Bright Data adapter is configured for safe fallback mode."
    };
  }

  try {
    const response = await fetchWithTimeout(
      options.brightDataMcpUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(options.brightDataApiKey ? { Authorization: `Bearer ${options.brightDataApiKey}` } : {})
        },
        body: JSON.stringify({
          // Only coarse public, city-level context.
          lat: input?.lat ?? null,
          lon: input?.lon ?? null,
          scope: "public_city_context"
        })
      },
      4500
    );

    if (!response.ok) {
      console.error("bright-data adapter HTTP error", response.status);
      return fallbackPublicContext();
    }

    const data = await response.json();
    return {
      source: "bright-data",
      air_quality_hint: typeof data?.air_quality_hint === "string" ? data.air_quality_hint : null,
      local_stressors: Array.isArray(data?.local_stressors)
        ? data.local_stressors.map((item) => String(item)).slice(0, 3)
        : [],
      commute_or_city_hint: typeof data?.commute_or_city_hint === "string" ? data.commute_or_city_hint : null,
      summary:
        typeof data?.summary === "string"
          ? data.summary
          : "Public city context was checked to tune your garden guidance."
    };
  } catch (error) {
    console.error("bright-data adapter error", error);
    return fallbackPublicContext();
  }
}
