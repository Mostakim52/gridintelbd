import type { Sample, Summary } from "../lib/field";

type Props = {
  series: Sample[];
  summary: Summary;
  channel: "a" | "b" | "both";
  height?: number;
};

const W = 560;
const PAD = { l: 30, r: 8, t: 10, b: 18 };

/** Loss trace for one or both spans. Values are percentages, plotted directly. */
export function TraceChart({ series, summary, channel, height = 132 }: Props) {
  const H = height;
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  const top = Math.max(14, Math.ceil((summary.peakA + 1.6) / 2) * 2);
  const xAt = (i: number) => PAD.l + (plotW * i) / Math.max(1, series.length - 1);
  const yAt = (v: number) => PAD.t + plotH * (1 - Math.min(v, top) / top);

  const path = (key: "a" | "b") =>
    series
      .map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(p[key]).toFixed(1)}`)
      .join(" ");

  const showA = channel !== "b";
  const showB = channel !== "a";

  const areaA = showA
    ? `${path("a")} L${xAt(series.length - 1).toFixed(1)},${(PAD.t + plotH).toFixed(1)} L${PAD.l},${(
        PAD.t + plotH
      ).toFixed(1)} Z`
    : "";

  return (
    <svg
      className="gs-scope"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Loss trace, span A ${summary.a.toFixed(1)} percent, span B ${summary.b.toFixed(1)} percent`}
    >
      <defs>
        <linearGradient id="traceA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6b2c" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#ff6b2c" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 0.5, 1].map((f) => {
        const y = PAD.t + plotH * f;
        return <line key={f} x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} className="s-grid" />;
      })}
      <text x={PAD.l - 6} y={PAD.t + 4} textAnchor="end" className="s-label">
        {top}%
      </text>
      <text x={PAD.l - 6} y={PAD.t + plotH + 3} textAnchor="end" className="s-label">
        0
      </text>

      {showA && <path d={areaA} fill="url(#traceA)" />}
      {showA && (
        <path
          d={path("a")}
          fill="none"
          stroke="#ff6b2c"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      )}
      {showB && (
        <path
          d={path("b")}
          fill="none"
          stroke="#4fe3b1"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      )}

      <circle cx={xAt(series.length - 1)} cy={yAt(series[series.length - 1]?.a ?? 0)} r={2.4} fill="#ffb36b" />
    </svg>
  );
}
