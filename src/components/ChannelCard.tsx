import { clsx } from "clsx";
import type { Sample, SpanSpec, Summary } from "../lib/field";
import { spot, useReveal } from "../lib/useReveal";
import { TraceChart } from "./TraceChart";

type Props = {
  span: SpanSpec;
  summary: Summary;
  series: Sample[];
  live: number;
  points: number;
};

export function ChannelCard({ span, summary, series, live, points }: Props) {
  const { ref, shown } = useReveal<HTMLElement>();
  const isA = span.key === "a";
  const mean = isA ? summary.a : summary.b;

  return (
    <section
      ref={ref}
      className={clsx("kr-card gs-panel gs-ch", shown && "kr-in")}
      onPointerMove={spot}
      aria-labelledby={`ch-${span.key}`}
    >
      <div className="gs-ch-head">
        <div>
          <div className="gs-ch-id">
            <span className={clsx("gs-ch-badge", isA ? "gs-ch-badge--a" : "gs-ch-badge--b")}>
              {span.key.toUpperCase()}
            </span>
            <div>
              <h2 className="gs-h2" id={`ch-${span.key}`} style={{ fontSize: 17 }}>
                {span.label}
              </h2>
              <div className="gs-ch-meta">{span.build}</div>
            </div>
          </div>
        </div>
        {isA ? (
          <span className="gs-chip gs-chip--rose">{span.theftProne ? "UNSEALED" : ""}</span>
        ) : (
          <span className="gs-chip gs-chip--good">SEALED</span>
        )}
      </div>

      <div className="gs-ch-fig">
        <b>{live.toFixed(1)}</b>
        <small>% loss, now</small>
      </div>
      <div className="gs-ch-range">
        {points}-point mean {mean.toFixed(1)}% · range{" "}
        {isA ? summary.minA.toFixed(1) : summary.b.toFixed(1)}–
        {isA ? summary.peakA.toFixed(1) : summary.b.toFixed(1)}%
      </div>

      <div className="gs-scope-wrap">
        <TraceChart series={series} summary={summary} channel={span.key} height={124} />
      </div>
    </section>
  );
}
