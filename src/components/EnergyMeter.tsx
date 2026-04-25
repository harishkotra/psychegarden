type EnergyMeterProps = {
  score: number;
};

export function EnergyMeter({ score }: EnergyMeterProps) {
  return (
    <section className="card meter-card">
      <div className="meter-head">
        <h2>Garden Vitality</h2>
        <span className="score">{score}/100</span>
      </div>
      <div className="meter-track" aria-label="Energy meter">
        <div className="meter-fill" style={{ width: `${score}%` }} />
      </div>
      <p className="meter-caption">
        {score >= 80 && "Blooming energy. Keep your rhythm gentle and steady."}
        {score >= 50 && score < 80 && "Stable energy. Protect your focus from overload spikes."}
        {score >= 25 && score < 50 && "Drained energy. Favor short resets between work blocks."}
        {score < 25 && "Burnout risk is high. Pause and recover before pushing harder."}
      </p>
    </section>
  );
}
