import { MONTHS, type Result } from "../lib/model";
import { num } from "../lib/format";
import { Panel } from "./Panel";

type Props = { result: Result };

const W = 660;
const H = 288;
const PAD = { l: 42, r: 10, t: 14, b: 28 };

const MONSOON_FROM = 5;
const MONSOON_TO = 8;

export function TrajectoryChart({ result }: Props) {
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  const values = result.monthly.flatMap((m) => [m.today, m.scenario]);
  const rawMax = Math.max(...values, 1);
  const maxY = Math.max(50, Math.ceil((rawMax * 1.1) / 50) * 50);

  const xAt = (i: number) => PAD.l + (plotW * i) / (MONTHS.length - 1);
  const yAt = (v: number) => PAD.t + plotH * (1 - v / maxY);

  const line = (vals: number[]) =>
    vals
      .map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`)
      .join(" ");

  const todayPath = line(result.monthly.map((m) => m.today));
  const scenarioPath = line(result.monthly.map((m) => m.scenario));
  const areaPath = `${scenarioPath} L${xAt(MONTHS.length - 1).toFixed(1)},${(
    PAD.t + plotH
  ).toFixed(1)} L${xAt(0).toFixed(1)},${(PAD.t + plotH).toFixed(1)} Z`;

  const step = plotW / (MONTHS.length - 1);
  const bandX = xAt(MONSOON_FROM) - step / 2;
  const bandW = xAt(MONSOON_TO) - xAt(MONSOON_FROM) + step;

  return (
    <Panel
      title="12-month rollout"
      note={`Unserved energy per month as conversion ramps to ${Math.round(
        result.share * 100,
      )}%.`}
      aside={
        <div className="gs-seg" style={{ padding: 3 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 9px",
              font: "500 10px var(--kr-font-mono)",
              color: "#ffb36b",
            }}
          >
            <span className="gs-key" style={{ background: "#ffb36b" }} />
            SCENARIO
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 9px",
              font: "500 10px var(--kr-font-mono)",
              color: "var(--kr-dim)",
            }}
          >
            <span
              className="gs-key"
              style={{ background: "repeating-linear-gradient(90deg,#5b5b64 0 3px,transparent 3px 6px)" }}
            />
            TODAY
          </span>
        </div>
      }
    >
      <svg
        className="gs-scope"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Unserved energy by month, today versus your scenario"
      >
        <defs>
          <linearGradient id="trajArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6b2c" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff6b2c" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect
          x={bandX}
          y={PAD.t}
          width={bandW}
          height={plotH}
          fill="rgba(255,92,138,0.05)"
        />
        <text
          x={bandX + bandW / 2}
          y={PAD.t + 10}
          textAnchor="middle"
          className="s-label"
          style={{ fill: "#ff5c8a" }}
        >
          MONSOON
        </text>

        {[0, 1, 2, 3, 4].map((k) => {
          const v = (maxY * k) / 4;
          const y = yAt(v);
          return (
            <g key={k}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} className="s-grid" />
              <text x={PAD.l - 8} y={y + 3} textAnchor="end" className="s-label">
                {num(v)}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#trajArea)" />
        <path
          d={todayPath}
          fill="none"
          stroke="#5b5b64"
          strokeWidth={1.6}
          strokeDasharray="5 5"
          strokeLinejoin="round"
        />
        <path
          d={scenarioPath}
          fill="none"
          stroke="#ff6b2c"
          strokeWidth={2.2}
          strokeLinejoin="round"
        />

        {result.monthly.map((m, i) => (
          <g key={m.month}>
            <circle cx={xAt(i)} cy={yAt(m.scenario)} r={2.4} fill="#ffb36b">
              <title>{`${m.month}: ${m.scenario.toFixed(0)} GWh unserved`}</title>
            </circle>
            <text x={xAt(i)} y={H - 8} textAnchor="middle" className="s-label">
              {m.month}
            </text>
          </g>
        ))}
      </svg>

      <p className="gs-sub" style={{ marginTop: 2 }}>
        Monsoon months carry most of the avoided outage load — the same storms
        that fell the poles never reach the cable.
      </p>
    </Panel>
  );
}
