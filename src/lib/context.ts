export type GardenEffects = {
  sky: string;
  particles: "none" | "rain" | "mist" | "fireflies";
  soil: "normal" | "dry" | "wet";
  light: "bright" | "soft" | "dim";
};

export type WeatherContext = {
  source: "open-meteo";
  location: {
    lat: number;
    lon: number;
  };
  temperature_c: number;
  weather_code: number;
  condition: "clear" | "cloudy" | "rain" | "storm" | "fog" | "hot" | "unknown";
  is_day: boolean;
  garden_effects: GardenEffects;
};

export type PublicContext = {
  source: "bright-data" | "fallback";
  air_quality_hint: string | null;
  local_stressors: string[];
  commute_or_city_hint: string | null;
  summary: string;
};

export type ResearchContext = {
  source: "tavily" | "fallback";
  why_it_helps: string;
  supporting_points: string[];
  links: Array<{ title: string; url: string }>;
};

export type UnifiedContext = {
  weather: WeatherContext;
  public_context: PublicContext;
  research_context: ResearchContext | null;
  context_summary: string;
};

export type UnifiedContextInput = {
  lat: number | null;
  lon: number | null;
  moodText: string;
  signals: {
    sleepHours: number;
    screenTime: number;
    meetingLoad: number;
    steps: number;
  };
  vitality: number;
};

const defaultContext: UnifiedContext = {
  weather: {
    source: "open-meteo",
    location: { lat: 12.9716, lon: 77.5946 },
    temperature_c: 27,
    weather_code: 2,
    condition: "cloudy",
    is_day: true,
    garden_effects: {
      sky: "cloud drift",
      particles: "none",
      soil: "normal",
      light: "soft"
    }
  },
  public_context: {
    source: "fallback",
    air_quality_hint: null,
    local_stressors: [],
    commute_or_city_hint: null,
    summary: "Using demo context. Public world pressure signals are currently simulated."
  },
  research_context: null,
  context_summary: "Using demo context while external services warm up."
};

export async function fetchUnifiedContext(input: UnifiedContextInput): Promise<UnifiedContext> {
  try {
    const response = await fetch("/api/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });

    if (!response.ok) return defaultContext;

    const data = (await response.json()) as UnifiedContext;
    if (!data?.weather || !data?.public_context) return defaultContext;
    return data;
  } catch {
    return defaultContext;
  }
}

export async function fetchResearchNudge(input: {
  restoration_action: string;
  burnout_risk: "low" | "medium" | "high";
  emotional_state: string;
}): Promise<ResearchContext> {
  try {
    const response = await fetch("/api/research-nudge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      return {
        source: "fallback",
        why_it_helps: "Small restoration actions can interrupt stress buildup and reset focus.",
        supporting_points: ["Micro-breaks can improve perceived focus.", "Breathing cues can lower immediate tension."],
        links: []
      };
    }

    return (await response.json()) as ResearchContext;
  } catch {
    return {
      source: "fallback",
      why_it_helps: "Small restoration actions can interrupt stress buildup and reset focus.",
      supporting_points: ["Micro-breaks can improve perceived focus.", "Breathing cues can lower immediate tension."],
      links: []
    };
  }
}
