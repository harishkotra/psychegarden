import type { Signals } from "../lib/energy";

type SignalControlsProps = {
  signals: Signals;
  onSignalsChange: (next: Signals) => void;
  onStressEvent: () => void;
  onRecoveryAction: () => void;
  onPresetApply: (preset: Signals) => void;
  disableActions?: boolean;
};

const PRESETS: Array<{ name: string; values: Signals }> = [
  {
    name: "Calm Morning",
    values: { sleepHours: 8, screenTime: 1.5, meetingLoad: 1, steps: 3500, moodText: "Calm and focused.", stressEvents: 0, recoveryActions: 1 }
  },
  {
    name: "Meeting Overload",
    values: { sleepHours: 6, screenTime: 5, meetingLoad: 9, steps: 2200, moodText: "My brain feels crowded with calls.", stressEvents: 1, recoveryActions: 0 }
  },
  {
    name: "Doomscroll Spiral",
    values: { sleepHours: 5, screenTime: 9, meetingLoad: 4, steps: 1200, moodText: "I feel mentally exhausted but I still have work left.", stressEvents: 2, recoveryActions: 0 }
  },
  {
    name: "Stormy Day",
    values: { sleepHours: 6.5, screenTime: 6, meetingLoad: 6, steps: 1800, moodText: "Heavy day and low focus.", stressEvents: 1, recoveryActions: 0 }
  },
  {
    name: "Recovery Mode",
    values: { sleepHours: 7.5, screenTime: 2.5, meetingLoad: 2, steps: 7500, moodText: "Taking it slow and restoring.", stressEvents: 0, recoveryActions: 2 }
  }
];

export function SignalControls({
  signals,
  onSignalsChange,
  onStressEvent,
  onRecoveryAction,
  onPresetApply,
  disableActions = false
}: SignalControlsProps) {
  const setField = <K extends keyof Signals>(key: K, value: Signals[K]) => {
    onSignalsChange({ ...signals, [key]: value });
  };

  return (
    <section className="card controls-card">
      <h2>Ambient Signals</h2>

      <label>
        Sleep hours: <strong>{signals.sleepHours.toFixed(1)}h</strong>
        <input
          type="range"
          min={0}
          max={12}
          step={0.5}
          value={signals.sleepHours}
          disabled={disableActions}
          onChange={(e) => setField("sleepHours", Number(e.target.value))}
        />
      </label>

      <label>
        Screen time: <strong>{signals.screenTime.toFixed(1)}h</strong>
        <input
          type="range"
          min={0}
          max={14}
          step={0.5}
          value={signals.screenTime}
          disabled={disableActions}
          onChange={(e) => setField("screenTime", Number(e.target.value))}
        />
      </label>

      <label>
        Meeting load: <strong>{signals.meetingLoad}</strong>
        <input
          type="range"
          min={0}
          max={12}
          step={1}
          value={signals.meetingLoad}
          disabled={disableActions}
          onChange={(e) => setField("meetingLoad", Number(e.target.value))}
        />
      </label>

      <label>
        Steps: <strong>{signals.steps}</strong>
        <input
          type="range"
          min={0}
          max={20000}
          step={250}
          value={signals.steps}
          disabled={disableActions}
          onChange={(e) => setField("steps", Number(e.target.value))}
        />
      </label>

      <label>
        Mood
        <textarea
          rows={3}
          placeholder="How are you feeling right now?"
          value={signals.moodText}
          disabled={disableActions}
          onChange={(e) => setField("moodText", e.target.value)}
        />
      </label>

      <div className="control-buttons">
        <button className="subtle-btn" onClick={onStressEvent} disabled={disableActions}>
          Stress Event (-)
        </button>
        <button className="subtle-btn" onClick={onRecoveryAction} disabled={disableActions}>
          Recovery Action (+)
        </button>
      </div>

      <div className="preset-wrap">
        {PRESETS.map((preset) => (
          <button key={preset.name} className="preset-btn" onClick={() => onPresetApply({ ...preset.values })} disabled={disableActions}>
            {preset.name}
          </button>
        ))}
      </div>
    </section>
  );
}
