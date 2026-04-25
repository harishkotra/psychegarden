export type Signals = {
  sleepHours: number;
  screenTime: number;
  meetingLoad: number;
  steps: number;
  moodText: string;
  stressEvents: number;
  recoveryActions: number;
};

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function calculateEnergy(signals: Signals) {
  const base = 52;
  const sleepBoost = (signals.sleepHours - 6) * 6;
  const stepsBoost = (signals.steps / 1000) * 2.2;
  const screenPenalty = signals.screenTime * 3.8;
  const meetingPenalty = signals.meetingLoad * 5.2;
  const stressPenalty = signals.stressEvents * 8;
  const recoveryBoost = signals.recoveryActions * 7;

  const raw = base + sleepBoost + stepsBoost + recoveryBoost - screenPenalty - meetingPenalty - stressPenalty;
  return Math.round(clamp(raw, 0, 100));
}

export type GardenState = "blooming" | "stable" | "drained" | "burnout";

export function getGardenState(score: number): GardenState {
  if (score >= 80) return "blooming";
  if (score >= 50) return "stable";
  if (score >= 25) return "drained";
  return "burnout";
}

export function burnoutForecast(signals: Signals, energyScore: number) {
  const strain = signals.meetingLoad * 1.4 + signals.screenTime * 0.9 + signals.stressEvents * 2;
  const recovery = signals.sleepHours * 0.8 + signals.recoveryActions * 1.2 + signals.steps / 5000;
  const net = strain - recovery;

  if (energyScore < 28 || net > 7) {
    return "At this pace, your energy may dip below 30 by 6 PM.";
  }
  if (energyScore < 55 || net > 3) {
    return "You are stable, but one more high-stress block may drain your garden.";
  }
  return "Recovery trend detected. Your garden is regaining light.";
}
