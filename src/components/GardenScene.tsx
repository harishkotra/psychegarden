import type { GardenState } from "../lib/energy";
import type { WeatherContext } from "../lib/context";

type GardenSceneProps = {
  state: GardenState;
  weather: WeatherContext;
  healingPulse: boolean;
};

export function GardenScene({ state, weather, healingPulse }: GardenSceneProps) {
  const classes = [
    "garden-scene",
    `state-${state}`,
    `weather-${weather.condition}`,
    `particle-${weather.garden_effects.particles}`,
    `soil-${weather.garden_effects.soil}`,
    weather.is_day ? "is-day" : "is-night",
    healingPulse ? "healing" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const rainDrops = Array.from({ length: 18 }, (_, i) => i);
  const blooms = Array.from({ length: 7 }, (_, i) => i);
  const fireflies = Array.from({ length: 8 }, (_, i) => i);

  return (
    <section className={classes}>
      <div className="sky-gradient" />
      <div className="sun-orb" />
      <div className="moon-orb" />

      <div className="cloud-layer">
        <span className="cloud cloud-a" />
        <span className="cloud cloud-b" />
        <span className="cloud cloud-c" />
      </div>

      <div className="rain-layer" aria-hidden={!["rain", "storm"].includes(weather.condition)}>
        {rainDrops.map((drop) => (
          <span key={drop} className="rain-drop" style={{ left: `${drop * 5 + 4}%`, animationDelay: `${drop * 0.12}s` }} />
        ))}
      </div>

      <div className="fog-layer" />

      <div className="butterfly-layer">
        {fireflies.map((fly) => (
          <span
            key={fly}
            className="firefly"
            style={{
              left: `${8 + fly * 11}%`,
              animationDelay: `${fly * 0.4}s`
            }}
          />
        ))}
      </div>

      <div className="tree" role="img" aria-label="Garden tree">
        <span className="trunk" />
        <span className="canopy" />
      </div>

      <div className="flower-field">
        {blooms.map((flower) => (
          <span key={flower} className="flower" style={{ left: `${10 + flower * 12}%`, animationDelay: `${flower * 0.2}s` }} />
        ))}
      </div>

      <div className="soil" />
      <div className="glitch-overlay" />
      <div className="heal-burst" />
    </section>
  );
}
