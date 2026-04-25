import { useEffect, useMemo, useState } from "react";
import { GardenScene } from "./components/GardenScene";
import { EnergyMeter } from "./components/EnergyMeter";
import { SignalControls } from "./components/SignalControls";
import { InsightCard } from "./components/InsightCard";
import { BurnoutForecast } from "./components/BurnoutForecast";
import { WhyThisHelpsCard } from "./components/WhyThisHelpsCard";
import { WorldContextPanel } from "./components/WorldContextPanel";
import { burnoutForecast, calculateEnergy, getGardenState, type Signals } from "./lib/energy";
import { fetchWeatherContext } from "./lib/weather";
import { fetchInsight, type InsightResult } from "./lib/ai";
import { fetchResearchNudge, fetchUnifiedContext, type ResearchContext, type UnifiedContext, type WeatherContext } from "./lib/context";

const defaultSignals: Signals = {
  sleepHours: 7,
  screenTime: 3,
  meetingLoad: 2,
  steps: 6000,
  moodText: "",
  stressEvents: 0,
  recoveryActions: 1
};

const defaultInsight: InsightResult = {
  source: "fallback",
  result: {
    emotional_state: "Settling into your day",
    burnout_risk: "medium",
    garden_metaphor: "Your garden is stable with light cloud cover.",
    insight: "Your energy is balanced for now. Keep transitions gentle between intense tasks.",
    restoration_action: "Take 2 minutes to breathe slowly and relax your shoulders.",
    micro_message: "Small moments of care help your garden stay resilient.",
    contextual_reason: "Using demo context while live context initializes."
  }
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

export default function App() {
  const [signals, setSignals] = useState<Signals>(defaultSignals);
  const [weather, setWeather] = useState<WeatherContext>(defaultContext.weather);
  const [unifiedContext, setUnifiedContext] = useState<UnifiedContext>(defaultContext);
  const [insight, setInsight] = useState<InsightResult>(defaultInsight);
  const [researchNudge, setResearchNudge] = useState<ResearchContext | null>(null);
  const [healingPulse, setHealingPulse] = useState(false);
  const [latestBoostMessage, setLatestBoostMessage] = useState("");
  const [coords, setCoords] = useState<{ lat: number | null; lon: number | null }>({ lat: null, lon: null });

  const energyScore = useMemo(() => calculateEnergy(signals), [signals]);
  const state = getGardenState(energyScore);
  const forecast = burnoutForecast(signals, energyScore);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      () => {
        setCoords({ lat: null, lon: null });
      },
      { enableHighAccuracy: false, timeout: 4000 }
    );
  }, []);

  useEffect(() => {
    fetchWeatherContext(coords.lat, coords.lon).then(setWeather).catch(() => setWeather(defaultContext.weather));
  }, [coords.lat, coords.lon]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUnifiedContext({
        lat: coords.lat,
        lon: coords.lon,
        moodText: signals.moodText,
        signals: {
          sleepHours: signals.sleepHours,
          screenTime: signals.screenTime,
          meetingLoad: signals.meetingLoad,
          steps: signals.steps
        },
        vitality: energyScore
      }).then((context) => {
        setUnifiedContext(context);
        setWeather(context.weather);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [coords.lat, coords.lon, energyScore, signals.meetingLoad, signals.moodText, signals.screenTime, signals.sleepHours, signals.steps]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInsight({
        signals,
        vitality: energyScore,
        moodText: signals.moodText,
        weather: unifiedContext.weather,
        public_context: unifiedContext.public_context,
        research_summary: unifiedContext.research_context?.why_it_helps || unifiedContext.context_summary
      }).then(setInsight);
    }, 320);

    return () => clearTimeout(timer);
  }, [energyScore, signals, unifiedContext.context_summary, unifiedContext.public_context, unifiedContext.research_context, unifiedContext.weather]);

  useEffect(() => {
    fetchResearchNudge({
      restoration_action: insight.result.restoration_action,
      burnout_risk: insight.result.burnout_risk,
      emotional_state: insight.result.emotional_state
    }).then(setResearchNudge);
  }, [insight.result.burnout_risk, insight.result.emotional_state, insight.result.restoration_action]);

  const onStressEvent = () => {
    setSignals((prev) => ({ ...prev, stressEvents: prev.stressEvents + 1 }));
  };

  const onRecoveryAction = () => {
    setSignals((prev) => ({ ...prev, recoveryActions: prev.recoveryActions + 1 }));
    setLatestBoostMessage("Recovery action logged. Your garden is responding.");
  };

  const onCompleteRestoration = () => {
    setHealingPulse(true);
    setSignals((prev) => ({
      ...prev,
      recoveryActions: prev.recoveryActions + 1,
      stressEvents: Math.max(0, prev.stressEvents - 1)
    }));
    setLatestBoostMessage("Restoration complete. Warmth and color are returning to your garden.");

    setTimeout(() => setHealingPulse(false), 1200);
  };

  const usingDemoContext =
    insight.source === "fallback" ||
    unifiedContext.public_context.source === "fallback" ||
    (researchNudge?.source ?? "fallback") === "fallback";

  return (
    <main className="app-shell">
      <header className="top-bar card">
        <div>
          <h1>PsycheGarden</h1>
          <p className="subtitle">A calm reflection space where your mental energy becomes a living garden.</p>
        </div>
        <div className="weather-chip">
          <span>{weather.condition}</span>
          <span>{Math.round(weather.temperature_c)} C</span>
          <span>{weather.is_day ? "Day cycle" : "Night cycle"}</span>
        </div>
      </header>

      <section className="center-stage">
        <GardenScene state={state} weather={weather} healingPulse={healingPulse} />
      </section>

      <section className="grid-layout">
        <EnergyMeter score={energyScore} />
        <BurnoutForecast message={forecast} />
        <WorldContextPanel
          weather={weather}
          publicContext={unifiedContext.public_context}
          contextSummary={unifiedContext.context_summary}
          usingDemoContext={usingDemoContext}
        />
        <SignalControls
          signals={signals}
          onSignalsChange={setSignals}
          onStressEvent={onStressEvent}
          onRecoveryAction={onRecoveryAction}
          onPresetApply={(preset) => {
            setSignals(preset);
            setLatestBoostMessage("Preset applied. Re-reading world context...");
          }}
        />
        <InsightCard
          insight={insight.result}
          source={insight.source}
          onCompleteRestoration={onCompleteRestoration}
          latestBoostMessage={latestBoostMessage}
        />
        <WhyThisHelpsCard research={researchNudge} />
      </section>
    </main>
  );
}
