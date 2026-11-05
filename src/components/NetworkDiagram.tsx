import { FEEDERS, MODEL, outageHoursAt, type Result, type Scenario } from "../lib/model";
import { num } from "../lib/format";
import { Panel } from "./Panel";

type Props = {
  scenario: Scenario;
  result: Result;
};

const W = 940;
const H = 386;
const X0 = 132;
const X1 = 872;
const LANES = [96, 166, 236, 306];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Four feeders drawn from the substation outward. Each one is split at the
 * point the underground cable currently reaches, so raising the slider pushes
 * the duct further down the line and deletes the illegal taps behind it.
 */
export function NetworkDiagram({ scenario, result }: Props) {
  return (
    <Panel
      title="Feeder conversion"
      note="Conversion runs from the substation outward — highest-load feeder first."
      aside={
        <span className="gs-chip gs-chip--mute">
          {num(Math.round(result.share * MODEL.networkKm))} km converted
        </span>
      }
      flush
      footer={
        <div className="gs-legend">
          <span>
            <span className="gs-key" style={{ background: "#3a3a44" }} />
            Overhead conductor
          </span>
          <span>
            <span
              className="gs-key gs-key--5"
              style={{ backgroundImage: "linear-gradient(90deg,#ff6b2c,#ffb36b)" }}
            />
            Underground duct
          </span>
          <span>
            <span className="gs-key" style={{ background: "#ff5c8a" }} />
            Illegal tap
          </span>
          <span>
            <span className="gs-dot" />
            Live current
          </span>
        </div>
      }
    >
      <svg
        className="gs-net"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Four distribution feeders with ${Math.round(
          result.share * 100,
        )} percent of the network converted to underground cable`}
      >
        <defs>
          <linearGradient id="cable" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff6b2c" />
            <stop offset="100%" stopColor="#ffb36b" />
          </linearGradient>
          <linearGradient id="subbox" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#17171c" />
            <stop offset="100%" stopColor="#0b0b0e" />
          </linearGradient>
        </defs>

        {/* substation */}
        <rect x="22" y="66" width="86" height="272" rx="18" fill="url(#subbox)" stroke="#2a2a31" />
        <path d="M66 96 54 128h9l-4 26 18-34h-10l6-24z" fill="#ff6b2c" opacity="0.95" />
        <text x="65" y="198" textAnchor="middle" className="n-cap">
          GRID
        </text>
        <text x="65" y="214" textAnchor="middle" className="n-cap">
          SUBSTATION
        </text>
        <text x="65" y="242" textAnchor="middle" className="n-mono">
          132 / 33 kV
        </text>
        <text x="65" y="316" textAnchor="middle" className="n-live">
          {num(scenario.peakMW)} MW
        </text>

        {FEEDERS.map((feeder, i) => {
          const p = clamp(result.feederProgress[i] ?? 0, 0, 1);
          const y = LANES[i];
          const splitX = X0 + (X1 - X0) * p;
          const overheadLen = X1 - splitX;
          const ugLen = splitX - X0;

          const lossPct =
            (MODEL.techLossOverheadPct + scenario.theftPct) * (1 - p) +
            (MODEL.techLossUndergroundPct + MODEL.theftLossUndergroundPct) * p;
          const hours = outageHoursAt(p, scenario.severity);
          const loadMW = scenario.peakMW * feeder.loadShare;

          const poles: number[] = [];
          for (let x = splitX + 16; x < X1 - 6; x += 30) poles.push(x);

          const tapCount =
            overheadLen < 90 ? 0 : clamp(Math.round(scenario.theftPct / 2.2), 1, 4);
          const taps = Array.from(
            { length: tapCount },
            (_, k) => splitX + overheadLen * (0.28 + 0.17 * k),
          ).filter((x) => x < X1 - 34);

          return (
            <g key={feeder.id}>
              <text x={X0} y={y - 22} className="n-name">
                {feeder.name}
              </text>
              <text x={X0 + 86} y={y - 22} className="n-sub">
                {feeder.profile}
              </text>
              <text x={X1} y={y - 22} textAnchor="end" className="n-mono">
                {num(loadMW)} MW · {lossPct.toFixed(1)}% · {Math.round(hours)} h
              </text>

              {/* underground cable */}
              {ugLen > 1 && (
                <>
                  <line
                    x1={X0}
                    y1={y}
                    x2={splitX}
                    y2={y}
                    stroke="#2a1608"
                    strokeWidth={11}
                    strokeLinecap="round"
                  />
                  <line
                    x1={X0}
                    y1={y}
                    x2={splitX}
                    y2={y}
                    stroke="url(#cable)"
                    strokeWidth={4.5}
                    strokeLinecap="round"
                  />
                  <line
                    x1={X0}
                    y1={y}
                    x2={splitX}
                    y2={y}
                    stroke="#050506"
                    strokeWidth={10}
                    strokeDasharray="2 13"
                    opacity={0.5}
                  />
                  <line
                    x1={X0}
                    y1={y}
                    x2={splitX}
                    y2={y}
                    className="gs-flow"
                    stroke="#ffd7ad"
                    strokeWidth={2}
                    opacity={0.8}
                  />
                </>
              )}

              {/* overhead line */}
              {overheadLen > 1 && (
                <>
                  <line x1={splitX} y1={y} x2={X1} y2={y} stroke="#3a3a44" strokeWidth={2.4} />
                  {poles.map((x, idx) => (
                    <line
                      key={idx}
                      x1={x}
                      y1={y - 7}
                      x2={x}
                      y2={y + 7}
                      stroke="#33333b"
                      strokeWidth={1.4}
                    />
                  ))}
                  <line
                    x1={splitX}
                    y1={y}
                    x2={X1}
                    y2={y}
                    className="gs-flow"
                    stroke="#8d8d96"
                    strokeWidth={1.8}
                    opacity={0.55}
                  />
                </>
              )}

              {/* theft taps */}
              {taps.map((tx, idx) => (
                <g key={`tap-${idx}`} transform={`translate(${tx},${y})`}>
                  <path
                    d="M0 0 L9 15"
                    stroke="#ff5c8a"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    className="gs-spark"
                  />
                  <path
                    d="M7 12 L16 4 L25 12"
                    fill="none"
                    stroke="#ff5c8a"
                    strokeWidth={1.3}
                    strokeLinejoin="round"
                  />
                  <rect
                    x="9.5"
                    y="11"
                    width="13"
                    height="11"
                    rx="2"
                    fill="#2a1018"
                    stroke="#ff5c8a"
                    strokeWidth={1.2}
                  />
                </g>
              ))}

              {/* conversion boundary */}
              {p > 0.02 && p < 0.98 && (
                <g transform={`translate(${splitX},${y})`}>
                  <line
                    y1={-24}
                    y2={24}
                    stroke="#ff6b2c"
                    strokeWidth={1}
                    strokeDasharray="3 4"
                    opacity={0.5}
                  />
                  <circle r="4.5" fill="#ff6b2c" />
                </g>
              )}

              <circle cx={X1} cy={y} r="3.2" fill="#4a4a54" />
            </g>
          );
        })}
      </svg>
    </Panel>
  );
}
