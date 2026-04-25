import type { PublicContext, WeatherContext } from "../lib/context";

type WorldContextPanelProps = {
  weather: WeatherContext;
  publicContext: PublicContext;
  contextSummary: string;
  usingDemoContext: boolean;
};

export function WorldContextPanel({ weather, publicContext, contextSummary, usingDemoContext }: WorldContextPanelProps) {
  return (
    <section className="card world-card">
      <div className="insight-header">
        <h2>World Context</h2>
        {usingDemoContext ? <span className="pill">Using demo context</span> : <span className="pill">Live context</span>}
      </div>

      <div className="world-grid">
        <div>
          <p className="world-label">Today's Sky</p>
          <p className="world-value">
            {weather.condition} {weather.is_day ? "day" : "night"} ({Math.round(weather.temperature_c)} C)
          </p>
          <p className="world-meta">Garden effect: {weather.garden_effects.sky}</p>
        </div>

        <div>
          <p className="world-label">World Pressure</p>
          <p className="world-value">{publicContext.summary}</p>
          {publicContext.local_stressors.length > 0 ? (
            <p className="world-meta">Signals: {publicContext.local_stressors.slice(0, 2).join(" • ")}</p>
          ) : null}
        </div>
      </div>

      <p className="world-summary">{contextSummary}</p>
    </section>
  );
}
