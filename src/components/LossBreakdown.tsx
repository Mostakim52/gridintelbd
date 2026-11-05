import { MODEL, type Result, type Scenario } from "../lib/model";
import { num } from "../lib/format";
import { Panel } from "./Panel";

type Props = { scenario: Scenario; result: Result };

const toGWh = (pct: number) => (MODEL.energyGWh * pct) / 100;

const DELIVERED = "#4fe3b1";
const TECH = "#5cc8ff";
const THEFT = "#ff5c8a";

export function LossBreakdown({ scenario, result }: Props) {
  const today = {
    delivered: toGWh(100 - result.baseLossPct),
    tech: toGWh(MODEL.techLossOverheadPct),
    theft: toGWh(scenario.theftPct),
  };
  const next = {
    delivered: toGWh(100 - result.lossPct),
    tech: toGWh(result.techLossPct),
    theft: toGWh(result.theftLossPct),
  };

  const deliveredShare = (next.delivered / MODEL.energyGWh) * 100;

  return (
    <Panel
      title="Where the power goes"
      note={`${num(MODEL.energyGWh)} GWh entering the network, today against your scenario.`}
    >
      <div className="gs-bd">
        <div className="gs-bd-head">
          <span>TODAY</span>
          <span>
            <b>{result.baseLossPct.toFixed(1)}%</b> lost
          </span>
        </div>
        <div className="gs-bd-bar">
          <div
            className="gs-bd-seg"
            style={{ width: `${100 - result.baseLossPct}%`, background: DELIVERED }}
          />
          <div
            className="gs-bd-seg"
            style={{ width: `${MODEL.techLossOverheadPct}%`, background: TECH }}
          />
          <div
            className="gs-bd-seg"
            style={{ width: `${scenario.theftPct}%`, background: THEFT }}
          />
        </div>
      </div>

      <div className="gs-bd">
        <div className="gs-bd-head">
          <span>YOUR SCENARIO</span>
          <span>
            <b>{result.lossPct.toFixed(1)}%</b> lost
          </span>
        </div>
        <div className="gs-bd-bar">
          <div
            className="gs-bd-seg"
            style={{ width: `${100 - result.lossPct}%`, background: DELIVERED }}
          />
          <div
            className="gs-bd-seg"
            style={{ width: `${result.techLossPct}%`, background: TECH }}
          />
          <div
            className="gs-bd-seg"
            style={{ width: `${result.theftLossPct}%`, background: THEFT }}
          />
        </div>
      </div>

      <p className="gs-sub" style={{ marginTop: 22 }}>
        <strong style={{ color: "var(--kr-text)", fontWeight: 600 }}>
          {deliveredShare.toFixed(1)}%
        </strong>{" "}
        of input energy now reaches a paying customer, up from{" "}
        <strong style={{ color: "var(--kr-text)", fontWeight: 600 }}>
          {(100 - result.baseLossPct).toFixed(1)}%
        </strong>
        .
      </p>

      <div className="gs-bd-keys">
        <div className="gs-bd-key">
          <span className="gs-sw" style={{ background: DELIVERED }} />
          Delivered to customers
          <b>{num(next.delivered)} GWh</b>
        </div>
        <div className="gs-bd-key">
          <span className="gs-sw" style={{ background: TECH }} />
          Technical loss
          <b>{num(next.tech)} GWh</b>
        </div>
        <div className="gs-bd-key">
          <span className="gs-sw" style={{ background: THEFT }} />
          Non-technical loss
          <b>{num(next.theft)} GWh</b>
        </div>
        <div className="gs-bd-key gs-bd-key--total">
          <span className="gs-sw" style={{ background: "#ff6b2c" }} />
          Recovered vs today
          <b>+{num(next.delivered - today.delivered)} GWh</b>
        </div>
      </div>
    </Panel>
  );
}
