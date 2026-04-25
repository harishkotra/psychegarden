import { clampNumber, fetchWithTimeout } from "../utils/http.js";

export const BANGALORE = {
  lat: 12.9716,
  lon: 77.5946
};

export function normalizeWeather({ temperatureC, weatherCode, isDay }) {
  const code = Number.isFinite(weatherCode) ? weatherCode : -1;
  const temp = Number.isFinite(temperatureC) ? temperatureC : 27;
  const day = Boolean(isDay);

  let condition = "unknown";
  if ([0].includes(code)) condition = "clear";
  if ([1, 2, 3].includes(code)) condition = "cloudy";
  if ([45, 48].includes(code)) condition = "fog";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) condition = "rain";
  if ([95, 96, 99].includes(code)) condition = "storm";
  if (temp >= 33 && !["rain", "storm"].includes(condition)) condition = "hot";

  const gardenEffects = {
    sky: day ? "daylight glow" : "night veil",
    particles: day ? "none" : "fireflies",
    soil: "normal",
    light: day ? "bright" : "dim"
  };

  if (condition === "cloudy") {
    gardenEffects.sky = "cloud drift";
    gardenEffects.light = day ? "soft" : "dim";
  }

  if (condition === "rain" || condition === "storm") {
    gardenEffects.sky = condition === "storm" ? "charged stormfront" : "rain curtain";
    gardenEffects.particles = "rain";
    gardenEffects.soil = "wet";
    gardenEffects.light = day ? "soft" : "dim";
  }

  if (condition === "fog") {
    gardenEffects.sky = "fog blanket";
    gardenEffects.particles = "mist";
    gardenEffects.light = "dim";
  }

  if (condition === "hot") {
    gardenEffects.sky = day ? "heat shimmer" : "warm haze";
    gardenEffects.soil = "dry";
    gardenEffects.light = day ? "bright" : "soft";
  }

  if (!day && gardenEffects.particles === "none") {
    gardenEffects.particles = "fireflies";
    gardenEffects.light = "dim";
  }

  return {
    temperature_c: Math.round(temp * 10) / 10,
    weather_code: code,
    condition,
    is_day: day,
    garden_effects: gardenEffects
  };
}

function fallbackWeather(lat, lon) {
  return {
    source: "open-meteo",
    location: { lat, lon },
    ...normalizeWeather({ temperatureC: 27, weatherCode: 2, isDay: true })
  };
}

export async function getWeatherContext(input = {}, opts = {}) {
  const lat = clampNumber(input.lat, -90, 90, BANGALORE.lat);
  const lon = clampNumber(input.lon, -180, 180, BANGALORE.lon);

  if (!opts.enableExternalContext) {
    return fallbackWeather(lat, lon);
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`;

  try {
    const response = await fetchWithTimeout(url, {}, 5500);
    if (!response.ok) {
      console.error("/api/weather open-meteo failed", response.status);
      return fallbackWeather(lat, lon);
    }

    const data = await response.json();
    const current = data?.current ?? {};

    return {
      source: "open-meteo",
      location: { lat, lon },
      ...normalizeWeather({
        temperatureC: Number(current.temperature_2m),
        weatherCode: Number(current.weather_code),
        isDay: Number(current.is_day) === 1
      })
    };
  } catch (error) {
    console.error("/api/weather error", error);
    return fallbackWeather(lat, lon);
  }
}
