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
  // Runtime implementation lives in brightData.js for Node execution and now
  // attempts Bright Data Web MCP JSON-RPC calls with safe fallback.
  // This TS file remains the adapter contract surface for app code.
  return {
    source: "fallback",
    air_quality_hint: null,
    local_stressors: [],
    commute_or_city_hint: null,
    summary: "Using demo context. Bright Data adapter is running in fallback mode."
  };
}
