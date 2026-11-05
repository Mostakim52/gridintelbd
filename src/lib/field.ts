/**
 * Field rig model for the A/B span measurement page.
 *
 * The point of this module is that the field page is a *measurement*, not a
 * second simulation: a span's loss is what goes in at one end minus what comes
 * out at the other. We generate the two end-readings with a deterministic
 * pseudo-noise so the trace is stable across renders and reproducible, and we
 * expose the same numbers the model in `model.ts` assumes, so the page can
 * show whether the assumption survives contact with a meter.
 */

import { DEFAULT_SCENARIO, MODEL } from "./model";

export type SpanKey = "a" | "b";

export type SpanSpec = {
  key: SpanKey;
  label: string;
  kind: string;
  build: string;
  /** Measured mean loss across the span, %. */
  meanLoss: number;
  /** 95% interval half-width on that mean, pp. */
  band: number;
  /** Zero-mean wobble amplitude from load and temperature, pp. */
  jitter: number;
  /** Only bare conductors are reachable by a hook. */
  theftProne: boolean;
};

export const RIG = {
  id: "RIG-02",
  site: "Dhanmondi 9/A lateral",
  voltageKv: 11,
  spanKm: 1.24,
  ctClass: "0.5S",
  sampleRate: "1 s",
  sync: "GPS + PTP, ±40 µs",
  runningDays: 34,
  /** Differential uncertainty of the two-meter loss estimate, pp. */
  uncertainty: 0.35,
} as const;

export const SPANS: Record<SpanKey, SpanSpec> = {
  a: {
    key: "a",
    label: "Span A",
    kind: "Overhead",
    build: "3 × 120 mm² ACSR, bare",
    meanLoss: 11.3,
    band: 0.7,
    jitter: 0.42,
    theftProne: true,
  },
  b: {
    key: "b",
    label: "Span B",
    kind: "Underground",
    build: "3 × 240 mm² XLPE, ducted",
    meanLoss: 3.2,
    band: 0.2,
    jitter: 0.05,
    theftProne: false,
  },
};

export type TheftEvent = {
  id: number;
  /** Sample index the event started on. */
  at: number;
  /** Extra loss at the peak of the event, pp. */
  peak: number;
  /** How many samples the event lasts. */
  spanTicks: number;
  pole: number;
  kind: string;
};

/** Deterministic value noise in [0,1). */
const hash = (n: number) => {
  const s = Math.sin(n * 12.9898 + 4.1414) * 43758.5453;
  return s - Math.floor(s);
};

/** Two-octave noise in [-1,1) so the trace reads like a meter, not a saw. */
const wobble = (tick: number) => {
  const fast = hash(tick) * 2 - 1;
  const slow = hash(Math.floor(tick / 7) + 0.5) * 2 - 1;
  return fast * 0.65 + slow * 0.35;
};

export function lossAt(
  span: SpanSpec,
  tick: number,
  events: TheftEvent[],
): number {
  let value = span.meanLoss + wobble(tick) * span.jitter;

  if (span.theftProne) {
    for (const event of events) {
      const age = tick - event.at;
      if (age >= 0 && age <= event.spanTicks) {
        // A hook ramps on, holds, then is removed: one smooth hump.
        value += event.peak * Math.sin((Math.PI * age) / event.spanTicks);
      }
    }
  }

  return Math.max(0, value);
}

export type Sample = { t: number; a: number; b: number };

/**
 * One point per bucket. A longer step averages more seconds per point, which is
 * exactly what a real meter does when you ask it for a 1-hour trend — and it is
 * why a 40-second hook disappears into an hourly average.
 */
export function buildSeries(
  tick: number,
  events: TheftEvent[],
  points = 60,
  stepSec = 1,
): Sample[] {
  return Array.from({ length: points }, (_, i) => {
    const end = tick - (points - 1 - i) * stepSec;
    let a = 0;
    let b = 0;
    for (let s = 0; s < stepSec; s++) {
      const t = end - s;
      a += lossAt(SPANS.a, t, events);
      b += lossAt(SPANS.b, t, events);
    }
    return { t: end, a: a / stepSec, b: b / stepSec };
  });
}

export type Summary = {
  a: number;
  b: number;
  gap: number;
  peakA: number;
  minA: number;
};

export function summarise(series: Sample[]): Summary {
  if (series.length === 0) return { a: 0, b: 0, gap: 0, peakA: 0, minA: 0 };
  const a = series.reduce((sum, p) => sum + p.a, 0) / series.length;
  const b = series.reduce((sum, p) => sum + p.b, 0) / series.length;
  return {
    a,
    b,
    gap: a - b,
    peakA: Math.max(...series.map((p) => p.a)),
    minA: Math.min(...series.map((p) => p.a)),
  };
}

const KINDS = [
  "Hookup on pole",
  "Service-drop tap",
  "Meter bypass",
  "Unauthorised line",
];

export function makeEvent(at: number): TheftEvent {
  const r = hash(at * 3.77 + 11);
  return {
    id: at,
    at,
    peak: 0.8 + r * 1.7,
    spanTicks: 9 + Math.round(r * 14),
    pole: 4 + Math.round(r * 31),
    kind: KINDS[Math.floor(r * KINDS.length)] ?? KINDS[0],
  };
}

/** What the existing model assumes for each conductor type, for reconciliation. */
export const MODELLED = {
  a: MODEL.techLossOverheadPct + DEFAULT_SCENARIO.theftPct,
  b: MODEL.techLossUndergroundPct + MODEL.theftLossUndergroundPct,
};

/** Seconds of history shown, by trend button. */
export const WINDOWS = [
  { id: "1m", label: "1 min", stepSec: 1 },
  { id: "10m", label: "10 min", stepSec: 10 },
  { id: "1h", label: "1 h", stepSec: 60 },
] as const;

export type WindowId = (typeof WINDOWS)[number]["id"];
