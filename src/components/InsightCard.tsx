import type { InsightResult } from "../lib/ai";

type InsightCardProps = {
  insight: InsightResult["result"];
  source: InsightResult["source"];
  onCompleteRestoration: () => void;
  latestBoostMessage: string;
  disableActions?: boolean;
  restorationCooling?: boolean;
};

export function InsightCard({
  insight,
  source,
  onCompleteRestoration,
  latestBoostMessage,
  disableActions = false,
  restorationCooling = false
}: InsightCardProps) {
  return (
    <section className="card insight-card">
      <div className="insight-header">
        <h2>Garden Wisdom</h2>
        <span className="pill">{source === "openai" ? "OpenAI" : "Local fallback"}</span>
      </div>

      <p className="insight-state">{insight.emotional_state}</p>
      <p className="insight-text">{insight.insight}</p>
      <p className="metaphor">{insight.garden_metaphor}</p>

      <div className="restoration-box">
        <h3>Restoration Spell</h3>
        <p>{insight.restoration_action}</p>
        <p className="contextual-reason">{insight.contextual_reason}</p>
      </div>

      <button className="magic-btn" onClick={onCompleteRestoration} disabled={disableActions || restorationCooling}>
        {restorationCooling ? "Restoration Charging..." : "Complete Restoration"}
      </button>

      <p className="micro-message">{latestBoostMessage || insight.micro_message}</p>
      <p className="disclaimer">PsycheGarden is a wellness reflection tool, not medical advice.</p>
    </section>
  );
}
