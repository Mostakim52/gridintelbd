import { RIG, type Summary } from "../lib/field";

type Props = { summary: Summary; liveA: number; liveB: number };

const W = 920;
const H = 372;
const X_IN = 118;
const X_OUT = 686;
const Y_A = 126;
const Y_B = 258;
const LOG_X = 726;
const LOG_W = 172;

const TAPS = [430, 540];

function Node({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <text x={x} y={y - 26} textAnchor="middle" className="n-cap">
        {label}
      </text>
      <rect
        x={x - 15}
        y={y - 15}
        width={30}
        height={30}
        rx={9}
        fill="#0d0d10"
        stroke="#3a3a44"
      />
      {/* current-transformer clamp */}
      <path
        d={`M${x - 6} ${y + 4} a6 6 0 1 1 12 0`}
        fill="none"
        stroke="#ffb36b"
        strokeWidth={1.6}
      />
      <circle cx={x} cy={y + 4} r={1.4} fill="#ffb36b" />
    </g>
  );
}

/**
 * The measurement schematic: two spans, four metering points, one logger. The
 * only structural difference between the two spans is what surrounds the
 * conductor — steel and air versus XLPE and sand.
 */
export function RigDiagram({ summary, liveA, liveB }: Props) {
  return (
    <svg
      className="gs-net"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Span A overhead and span B underground, each metered at both ends and logged by rig 02"
    >
      <defs>
        <linearGradient id="duct" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2f9e7c" />
          <stop offset="100%" stopColor="#4fe3b1" />
        </linearGradient>
      </defs>

      {/* row labels */}
      <text x="34" y={Y_A + 2} className="n-name" style={{ fontSize: 22, fill: "#ff6b2c" }}>
        A
      </text>
      <text x="34" y={Y_A + 22} className="n-cap">
        OVERHEAD
      </text>
      <text x="34" y={Y_B + 2} className="n-name" style={{ fontSize: 22, fill: "#4fe3b1" }}>
        B
      </text>
      <text x="34" y={Y_B + 22} className="n-cap">
        UNDERGROUND
      </text>

      {/* ---- span A : bare conductor ---- */}
      <line
        x1={X_IN}
        y1={Y_A}
        x2={X_OUT}
        y2={Y_A}
        stroke="#3a3a44"
        strokeWidth={2.4}
      />
      {Array.from({ length: 12 }, (_, i) => X_IN + 44 + i * 44)
        .filter((x) => x < X_OUT - 30)
        .map((x) => (
          <line key={x} x1={x} y1={Y_A - 9} x2={x} y2={Y_A + 9} stroke="#33333b" strokeWidth={1.4} />
        ))}
      <line
        x1={X_IN}
        y1={Y_A}
        x2={X_OUT}
        y2={Y_A}
        className="gs-flow"
        stroke="#8d8d96"
        strokeWidth={1.6}
        opacity={0.5}
      />

      {TAPS.map((x) => (
        <g key={x} transform={`translate(${x},${Y_A})`}>
          <path d="M0 2 L6 20" stroke="#ff5c8a" strokeWidth={1.5} strokeLinecap="round" className="gs-spark" />
          <path d="M6 20 L14 12 L22 20" fill="none" stroke="#ff5c8a" strokeWidth={1.2} strokeLinejoin="round" />
          <rect x="7" y="19" width="14" height="10" rx="2" fill="#2a1018" stroke="#ff5c8a" strokeWidth={1.1} />
        </g>
      ))}

      <text x={X_IN + 84} y={Y_A - 26} className="n-mono">
        I 98.4 A
      </text>
      <text x={X_IN + 176} y={Y_A - 26} className="n-mono">
        V 11.02 kV
      </text>
      <text x={X_OUT - 4} y={Y_A - 26} textAnchor="end" className="n-live">
        {liveA.toFixed(1)}% loss
      </text>

      <Node x={X_IN} y={Y_A} label="A · IN" />
      <Node x={X_OUT} y={Y_A} label="A · OUT" />

      {/* ---- span B : ducted cable ---- */}
      <rect
        x={X_IN - 6}
        y={Y_B - 7}
        width={X_OUT - X_IN + 12}
        height={14}
        rx={7}
        fill="#0f1a16"
        stroke="#26443a"
      />
      <line
        x1={X_IN}
        y1={Y_B}
        x2={X_OUT}
        y2={Y_B}
        stroke="url(#duct)"
        strokeWidth={3.4}
        strokeLinecap="round"
      />
      <line
        x1={X_IN}
        y1={Y_B}
        x2={X_OUT}
        y2={Y_B}
        className="gs-flow"
        stroke="#c8ffe9"
        strokeWidth={1.6}
        opacity={0.75}
      />
      {/* duct hatching */}
      {Array.from({ length: 17 }, (_, i) => X_IN + 30 + i * 34)
        .filter((x) => x < X_OUT - 12)
        .map((x) => (
          <line key={x} x1={x} y1={Y_B - 7} x2={x - 6} y2={Y_B + 7} stroke="#1d3a30" strokeWidth={1} />
        ))}

      <text x={X_IN + 84} y={Y_B - 26} className="n-mono">
        I 96.1 A
      </text>
      <text x={X_IN + 176} y={Y_B - 26} className="n-mono">
        V 11.01 kV
      </text>
      <text x={X_OUT - 4} y={Y_B - 26} textAnchor="end" className="n-live" style={{ fill: "#4fe3b1" }}>
        {liveB.toFixed(1)}% loss
      </text>

      <Node x={X_IN} y={Y_B} label="B · IN" />
      <Node x={X_OUT} y={Y_B} label="B · OUT" />

      {/* distance */}
      <line x1={X_IN} y1={Y_B + 46} x2={X_OUT} y2={Y_B + 46} stroke="#2a2a31" strokeWidth={1} />
      <line x1={X_IN} y1={Y_B + 42} x2={X_IN} y2={Y_B + 50} stroke="#2a2a31" strokeWidth={1} />
      <line x1={X_OUT} y1={Y_B + 42} x2={X_OUT} y2={Y_B + 50} stroke="#2a2a31" strokeWidth={1} />
      <text x={(X_IN + X_OUT) / 2} y={Y_B + 64} textAnchor="middle" className="n-mono">
        {RIG.spanKm.toFixed(2)} km, same route, {RIG.voltageKv} kV
      </text>

      {/* ---- logger ---- */}
      <rect
        x={LOG_X}
        y={96}
        width={LOG_W}
        height={206}
        rx={22}
        fill="#0d0d10"
        stroke="#2a2a31"
      />
      <circle cx={LOG_X + 22} cy={122} r={4} fill="#ff6b2c" className="gs-spark" />
      <text x={LOG_X + 34} y={126} className="n-name" style={{ fontSize: 13 }}>
        {RIG.id}
      </text>
      <text x={LOG_X + 18} y={148} className="n-cap">
        LOGGER
      </text>
      <text x={LOG_X + 18} y={186} className="n-mono">
        {RIG.sampleRate} samples
      </text>
      <text x={LOG_X + 18} y={204} className="n-mono">
        {RIG.ctClass} CTs
      </text>
      <text x={LOG_X + 18} y={222} className="n-mono">
        GPS + PTP
      </text>
      <line x1={LOG_X + 18} y1={242} x2={LOG_X + LOG_W - 18} y2={242} stroke="#2a2a31" />
      <text x={LOG_X + 18} y={262} className="n-cap">
        DIFFERENTIAL
      </text>
      <text x={LOG_X + 18} y={288} className="n-live" style={{ fontSize: 19 }}>
        {summary.gap.toFixed(1)} pp
      </text>

      {/* measurement paths */}
      {[
        [X_IN + 16, Y_A, LOG_X, 118],
        [X_OUT + 16, Y_A, LOG_X, 150],
        [X_IN + 16, Y_B, LOG_X, 196],
        [X_OUT + 16, Y_B, LOG_X, 224],
      ].map(([x1, y1, x2, y2], i) => (
        <path
          key={i}
          d={`M${x1} ${y1} C ${x1 + 80} ${y1}, ${x2 - 90} ${y2}, ${x2} ${y2}`}
          fill="none"
          stroke="#2f2f37"
          strokeWidth={1}
          strokeDasharray="3 4"
        />
      ))}
    </svg>
  );
}
