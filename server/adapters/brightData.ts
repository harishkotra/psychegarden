export type PublicContext = {
  source: "bright-data" | "fallback";
  air_quality_hint: string | null;
  local_stressors: string[];
  commute_or_city_hint: string | null;
  summary: string;
};

export type PublicContextInput = {
  lat: number | null;
  lon: number | null;
  moodText?: string;
  vitality?: number;
};

export async function getPublicContext(_input: PublicContextInput): Promise<PublicContext> {
  // Runtime implementation lives in brightData.js for Node execution.
  // This TS module is the typed adapter contract for future Bright Data MCP integration.
  return {
    source: "fallback",
    air_quality_hint: null,
    local_stressors: [],
    commute_or_city_hint: null,
    summary: "Using demo context. Bright Data adapter is running in fallback mode."
  };
}
