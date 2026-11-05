/**
 * GridIntelBD simulation model.
 *
 * Everything in the UI is derived from `simulate(scenario)`. The model is a
 * deliberately simple, parameterised energy balance for one urban distribution
 * network: it trades technical + non-technical loss and weather outages against
 * the capital cost of putting that network underground.
 *
 * All constants live in MODEL so they can be shown to the viewer (the
 * Assumptions panel) and quoted in the walkthrough.
 */

export type Scenario = {
  /** Share of the study network converted to underground cable, 0-100. */
  undergroundPct: number;
  /** Non-technical (theft) loss assumed on the sections still overhead, %. */
  theftPct: number;
  /** Multiplier on weather-driven outage hours (monsoon / cyclone severity). */
  severity: number;
  /** National system peak demand, MW. */
  peakMW: number;
};

export const DEFAULT_SCENARIO: Scenario = {
  undergroundPct: 40,
  theftPct: 5.2,
  severity: 1,
  peakMW: 17000,
};

export const PRESETS: { id: string; label: string; undergroundPct: number }[] = [
  { id: "today", label: "Today", undergroundPct: 0 },
  { id: "pilot", label: "Pilot · 25%", undergroundPct: 25 },
  { id: "phase1", label: "Phase 1 · 40%", undergroundPct: 40 },
  { id: "full", label: "Full urban · 70%", undergroundPct: 70 },
];

export const MODEL = {
  /** Circuit-km of theft-prone urban distribution network in scope. */
  networkKm: 9000,
  /** Capex per circuit-km of 33/11 kV underground cable, trenching included. */
  capexCrorePerKm: 1.2,
  /** Programme fixed cost: design, substation upgrades, road restoration. */
  fixedProgramCrore: 240,
  /** Annual energy input to the study network, GWh. */
  energyGWh: 38000,
  /** Average generation cost that avoided energy is valued at, BDT/kWh. */
  genCostTakaPerKWh: 9.4,
  /** Technical (heat / impedance) loss on overhead lines, %. */
  techLossOverheadPct: 6.4,
  /** Technical loss on underground cable, %. */
  techLossUndergroundPct: 2.6,
  /** Residual non-technical loss on a ducted, metered network, %. */
  theftLossUndergroundPct: 0.8,
  /** Weather-driven outage hours per year, overhead. */
  outageHoursOverhead: 190,
  /** Weather-driven outage hours per year, underground. */
  outageHoursUnderground: 18,
  /** Average load as a fraction of peak. */
  loadFactor: 0.62,
  /** Annual household consumption used to express energy in homes, kWh. */
  householdKWhPerYear: 2500,
  /** Grid emission factor, kg CO2 per kWh. */
  co2KgPerKWh: 0.62,
};

export const FEEDERS = [
  { id: "dhk", name: "Dhaka Central", loadShare: 0.32, profile: "Commercial core" },
  { id: "nar", name: "Narayanganj", loadShare: 0.27, profile: "Industrial belt" },
  { id: "mir", name: "Mirpur", loadShare: 0.23, profile: "Dense residential" },
  { id: "ctg", name: "Chattogram Port", loadShare: 0.18, profile: "Port & logistics" },
];

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const RAW_SEASONAL = [0.55, 0.6, 0.85, 1.25, 1.35, 1.6, 1.75, 1.65, 1.3, 1.0, 0.7, 0.55];
const SEASONAL_MEAN = RAW_SEASONAL.reduce((a, b) => a + b, 0) / RAW_SEASONAL.length;

/** Month-by-month weight on outage likelihood, normalised to mean 1.0. */
export const SEASONAL = RAW_SEASONAL.map((v) => v / SEASONAL_MEAN);

export type MonthPoint = { month: string; today: number; scenario: number };

export type Result = {
  share: number;
  baseLossPct: number;
  lossPct: number;
  techLossPct: number;
  theftLossPct: number;
  recoveredGWh: number;
  valueCrore: number;
  baseOutageHours: number;
  outageHours: number;
  avgLoadMW: number;
  unservedGWh: number;
  baseUnservedGWh: number;
  outageValueCrore: number;
  capexCrore: number;
  annualBenefitCrore: number;
  paybackYears: number;
  households: number;
  co2Tonnes: number;
  feederProgress: number[];
  monthly: MonthPoint[];
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Distribute the network-wide underground share across feeders, filling the
 * highest-load feeder first. A share of 0.4 fully converts the 32% feeder and
 * converts ~30% of the next one.
 */
export function feederProgress(share: number): number[] {
  let remaining = share;
  return FEEDERS.map((f) => {
    const p = clamp(remaining / f.loadShare, 0, 1);
    remaining = Math.max(0, remaining - f.loadShare);
    return p;
  });
}

export function outageHoursAt(share: number, severity: number): number {
  return severity * lerp(MODEL.outageHoursOverhead, MODEL.outageHoursUnderground, share);
}

export function simulate(scenario: Scenario): Result {
  const share = clamp(scenario.undergroundPct / 100, 0, 1);

  // Losses are a linear blend between the overhead and underground rates.
  const techLossPct = lerp(MODEL.techLossOverheadPct, MODEL.techLossUndergroundPct, share);
  const theftLossPct = lerp(scenario.theftPct, MODEL.theftLossUndergroundPct, share);
  const lossPct = techLossPct + theftLossPct;

  /** The "today" reference is the same network with nothing underground. */
  const baseLossPct = MODEL.techLossOverheadPct + scenario.theftPct;

  const recoveredGWh = (MODEL.energyGWh * (baseLossPct - lossPct)) / 100;
  const valueCrore = (recoveredGWh * MODEL.genCostTakaPerKWh) / 10;

  const baseOutageHours = outageHoursAt(0, scenario.severity);
  const outageHours = outageHoursAt(share, scenario.severity);
  const avgLoadMW = scenario.peakMW * MODEL.loadFactor;
  const unservedGWh = (outageHours * avgLoadMW) / 1000;
  const baseUnservedGWh = (baseOutageHours * avgLoadMW) / 1000;
  const outageValueCrore =
    ((baseUnservedGWh - unservedGWh) * MODEL.genCostTakaPerKWh) / 10;

  const capexCrore =
    share === 0
      ? 0
      : MODEL.fixedProgramCrore + share * MODEL.networkKm * MODEL.capexCrorePerKm;

  const annualBenefitCrore = valueCrore + outageValueCrore;
  const paybackYears =
    capexCrore > 0 && annualBenefitCrore > 0 ? capexCrore / annualBenefitCrore : 0;

  const monthly: MonthPoint[] = MONTHS.map((month, i) => {
    // Rollout ramps linearly to the target share across the 12 months.
    const rampShare = share * ((i + 1) / 12);
    return {
      month,
      today: (baseOutageHours * SEASONAL[i] * avgLoadMW) / 1000,
      scenario: (outageHoursAt(rampShare, scenario.severity) * SEASONAL[i] * avgLoadMW) / 1000,
    };
  });

  return {
    share,
    baseLossPct,
    lossPct,
    techLossPct,
    theftLossPct,
    recoveredGWh,
    valueCrore,
    baseOutageHours,
    outageHours,
    avgLoadMW,
    unservedGWh,
    baseUnservedGWh,
    outageValueCrore,
    capexCrore,
    annualBenefitCrore,
    paybackYears,
    households: (recoveredGWh * 1e6) / MODEL.householdKWhPerYear,
    co2Tonnes: (recoveredGWh * 1e6 * MODEL.co2KgPerKWh) / 1000,
    feederProgress: feederProgress(share),
    monthly,
  };
}
