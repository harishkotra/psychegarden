import type { WeatherContext } from "./context";

const fallbackWeather: WeatherContext = {
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
};

export async function fetchWeatherContext(lat: number | null, lon: number | null): Promise<WeatherContext> {
  const params = new URLSearchParams();
  if (lat !== null) params.set("lat", String(lat));
  if (lon !== null) params.set("lon", String(lon));

  try {
    const response = await fetch(`/api/weather${params.toString() ? `?${params}` : ""}`);
    if (!response.ok) return fallbackWeather;

    const data = (await response.json()) as WeatherContext;
    if (!data?.garden_effects) return fallbackWeather;
    return data;
  } catch {
    return fallbackWeather;
  }
}
