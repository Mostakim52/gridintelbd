import type { CSSProperties, ReactNode } from "react";
import { spot, useReveal } from "../lib/useReveal";

type Props = {
  label: string;
  value: string;
  unit: string;
  icon: ReactNode;
  sub: ReactNode;
  /** 0-100, drives the thin bar under the figure. */
  progress: number;
};

export function KpiCard({ label, value, unit, icon, sub, progress }: Props) {
  const { ref, shown } = useReveal<HTMLElement>();

  return (
    <article
      ref={ref}
      className={`kr-card gs-kpi${shown ? " kr-in" : ""}`}
      onPointerMove={spot}
    >
      <div className="gs-kpi-top">
        <span className="kr-tag">{label}</span>
        <span className="gs-ico">{icon}</span>
      </div>

      <div className="gs-fig-row">
        <span className="gs-fig">{value}</span>
        <span className="gs-fig-unit">{unit}</span>
      </div>

      <div className="kr-stat-bar">
        <i style={{ "--kr-v": `${Math.max(0, Math.min(100, progress))}%` } as CSSProperties} />
      </div>

      <p className="gs-kpi-sub">{sub}</p>
    </article>
  );
}
