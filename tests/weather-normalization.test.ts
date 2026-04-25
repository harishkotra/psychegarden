import test from "node:test";
import assert from "node:assert/strict";
import { normalizeWeather } from "../server/services/weatherService.js";

test("weather normalization maps storm and wet soil", () => {
  const normalized = normalizeWeather({ temperatureC: 24, weatherCode: 95, isDay: false });
  assert.equal(normalized.condition, "storm");
  assert.equal(normalized.garden_effects.soil, "wet");
  assert.equal(normalized.garden_effects.particles, "rain");
  assert.equal(normalized.is_day, false);
});
