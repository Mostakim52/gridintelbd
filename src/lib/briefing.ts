import { MODEL, type Result, type Scenario } from "./model";
import { num, pct1 } from "./format";

/**
 * Renders the current scenario as a plain-text briefing note, the artefact a
 * decision maker would actually read before approving a phase.
 */
export function buildBriefing(scenario: Scenario, r: Result): string {
  const date = new Date().toISOString().slice(0, 10);
  const km = Math.round(r.share * MODEL.networkKm);

  return [
    "BRIEFING NOTE — URBAN FEEDER UNDERGROUNDING",
    `GridIntelBD model output · ${date}`,
    "",
    "SCENARIO",
    `• Underground share of the ${num(MODEL.networkKm)} km theft-prone urban network: ${Math.round(scenario.undergroundPct)}% (${num(km)} km)`,
    `• Non-technical loss assumed on remaining overhead sections: ${pct1(scenario.theftPct)}`,
    `• Monsoon / cyclone severity multiplier: ${scenario.severity.toFixed(2)}x`,
    `• System peak demand: ${num(scenario.peakMW)} MW`,
    "",
    "RESULT",
    `• Distribution loss: ${pct1(r.baseLossPct)} → ${pct1(r.lossPct)}`,
    `• Energy recovered: ${num(r.recoveredGWh)} GWh/year (≈ ${num(r.households)} households)`,
    `• Value recovered: BDT ${num(r.valueCrore)} crore/year`,
    `• Weather-driven outage hours: ${num(r.baseOutageHours)} → ${num(r.outageHours)} h/year`,
    `• Unserved energy avoided: ${num(r.baseUnservedGWh - r.unservedGWh)} GWh/year`,
    `• CO2 avoided: ${num(r.co2Tonnes)} tonnes/year`,
    `• Estimated capex: BDT ${num(r.capexCrore)} crore`,
    `• Simple payback: ${r.paybackYears > 0 ? `${r.paybackYears.toFixed(1)} years` : "n/a"}`,
    "",
    "CAVEAT",
    "Figures come from a simplified, parameterised model built for demonstration.",
    "They show direction and order of magnitude, not a bankable forecast.",
  ].join("\n");
}
