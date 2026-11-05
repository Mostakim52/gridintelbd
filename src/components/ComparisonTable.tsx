import { MODEL, type Result, type Scenario } from "../lib/model";
import { num } from "../lib/format";
import { Panel } from "./Panel";

type Props = { scenario: Scenario; result: Result };

type Row = {
  label: string;
  today: string;
  next: string;
  change?: { text: string; good: boolean };
  total?: boolean;
};

export function ComparisonTable({ scenario, result }: Props) {
  const todayDelivered = MODEL.energyGWh * (1 - result.baseLossPct / 100);
  const nextDelivered = MODEL.energyGWh * (1 - result.lossPct / 100);
  const outageSaved = result.baseOutageHours - result.outageHours;
  const unservedSaved = result.baseUnservedGWh - result.unservedGWh;

  const rows: Row[] = [
    {
      label: "Distribution loss",
      today: `${result.baseLossPct.toFixed(1)}%`,
      next: `${result.lossPct.toFixed(1)}%`,
      change: { text: `−${(result.baseLossPct - result.lossPct).toFixed(1)} pp`, good: true },
    },
    {
      label: "Energy delivered",
      today: `${num(todayDelivered)} GWh`,
      next: `${num(nextDelivered)} GWh`,
      change: { text: `+${num(nextDelivered - todayDelivered)} GWh`, good: true },
    },
    {
      label: "Weather outage hours",
      today: `${num(result.baseOutageHours)} h`,
      next: `${num(result.outageHours)} h`,
      change: { text: `−${num(outageSaved)} h`, good: true },
    },
    {
      label: "Unserved energy",
      today: `${num(result.baseUnservedGWh)} GWh`,
      next: `${num(result.unservedGWh)} GWh`,
      change: { text: `−${num(unservedSaved)} GWh`, good: true },
    },
    {
      label: "CO₂ avoided",
      today: "—",
      next: `${num(result.co2Tonnes)} t`,
      change: { text: "lower generation", good: true },
    },
    {
      label: "Annual benefit",
      today: "—",
      next: `BDT ${num(result.annualBenefitCrore)} crore`,
      change: { text: `${scenario.theftPct.toFixed(1)}% theft assumption`, good: true },
    },
    {
      label: "Programme capex",
      today: "—",
      next: `BDT ${num(result.capexCrore)} crore`,
    },
    {
      label: "Simple payback",
      today: "—",
      next: result.paybackYears > 0 ? `${result.paybackYears.toFixed(1)} years` : "—",
      total: true,
    },
  ];

  return (
    <Panel
      title="Today vs your scenario"
      note="The same network, measured twice — before and after conversion."
      aside={
        <span className="gs-chip gs-chip--hot">
          {num(Math.round(result.share * MODEL.networkKm))} km
        </span>
      }
    >
      <table className="gs-table">
        <thead>
          <tr>
            <th scope="col">Metric</th>
            <th scope="col">Today</th>
            <th scope="col">Scenario</th>
            <th scope="col">Change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={row.total ? "is-total" : undefined}>
              <td>{row.label}</td>
              <td>{row.today}</td>
              <td>{row.next}</td>
              <td className={row.change?.good ? "gs-up" : "gs-flat"}>
                {row.change?.text ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
