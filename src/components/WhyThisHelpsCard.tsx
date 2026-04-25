import { useState } from "react";
import type { ResearchContext } from "../lib/context";

type WhyThisHelpsCardProps = {
  research: ResearchContext | null;
};

export function WhyThisHelpsCard({ research }: WhyThisHelpsCardProps) {
  const [open, setOpen] = useState(false);
  if (!research) return null;

  return (
    <section className="card why-card">
      <button className="why-toggle" onClick={() => setOpen((prev) => !prev)}>
        Why this spell works {open ? "-" : "+"}
      </button>

      {open ? (
        <div className="why-body">
          <p>{research.why_it_helps}</p>
          {research.supporting_points.slice(0, 2).map((point, idx) => (
            <p key={idx} className="why-point">
              {point}
            </p>
          ))}
          {research.source === "tavily" && research.links.length > 0 ? (
            <div className="why-links">
              {research.links.slice(0, 2).map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                  {link.title}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
