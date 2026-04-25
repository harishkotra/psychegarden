import test from "node:test";
import assert from "node:assert/strict";
import { calculateEnergy } from "../src/lib/energy";

test("energy calculation remains stable for baseline profile", () => {
  const energy = calculateEnergy({
    sleepHours: 7,
    screenTime: 3,
    meetingLoad: 2,
    steps: 6000,
    moodText: "",
    stressEvents: 0,
    recoveryActions: 1
  });

  assert.equal(energy, 56);
});
