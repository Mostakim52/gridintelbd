import { useMemo, useState } from "react";
import { BriefingNote } from "../components/BriefingNote";
import { ComparisonTable } from "../components/ComparisonTable";
import { ControlPanel } from "../components/ControlPanel";
import { ArrowRight, Bolt, Clock, Gauge, Target, Wallet } from "../components/Icons";
import { KpiCard } from "../components/KpiCard";
import { LossBreakdown } from "../components/LossBreakdown";
import { MethodSheet } from "../components/MethodSheet";
import { NetworkDiagram } from "../components/NetworkDiagram";
import { TrajectoryChart } from "../components/TrajectoryChart";
import { num } from "../lib/format";
import { DEFAULT_SCENARIO, PRESETS, simulate, type Scenario } from "../lib/model";

const share = (value: number, max: number) =>
  max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

export function SimulatorPage() {
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIO);
  const result = useMemo(() => simulate(scenario), [scenario]);
  /** The 100%-converted case, used only to scale the thin bars under each figure. */
  const best = useMemo(() => simulate({ ...scenario, undergroundPct: 100 }), [scenario]);

  const update = (patch: Partial<Scenario>) =>
    setScenario((current) => ({ ...current, ...patch }));

  const activePreset = PRESETS.find((p) => p.undergroundPct === scenario.undergroundPct)?.id;

  const lossSaved = result.baseLossPct - result.lossPct;
  const outageSaved = result.baseOutageHours - result.outageHours;
  const lossSpan = result.baseLossPct - best.lossPct;
  const outageSpan = result.baseOutageHours - best.outageHours;

  return (
    <main id="simulator">
      <header className="kr-hero">
        <div className="kr-hero-bg" aria-hidden="true">
          <div className="kr-orb kr-o1" />
          <div className="kr-orb kr-o2" />
          <div className="kr-grid" />
        </div>

        <div className="kr-container">
          <span className="kr-eyebrow">
            <i />
            Credosis Phase 02 · Frontend track
          </span>

          <h1 className="gs-hero-title kr-display">
            What undergrounding actually{" "}
            <span className="kr-glow" data-text="buys back">
              buys back
            </span>
            .
          </h1>

          <p className="gs-hero-sub">
            Roughly a tenth of the power fed into Bangladesh's urban
            distribution network never reaches a paying customer. Some of it
            escapes as heat in overhead conductors; much of it disappears
            through illegal hooking on lines anyone can reach. GridIntelBD is a
            working model of one 9,000 km urban network — move the underground
            share and watch loss, unserved energy, savings and payback move
            together.
          </p>

          <div className="gs-hero-row">
            <div className="gs-seg" role="group" aria-label="Scenario presets">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={activePreset === preset.id}
                  onClick={() => update({ undergroundPct: preset.undergroundPct })}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <a className="kr-btn kr-btn-accent" href="#/field">
              See the field rig
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </header>

      <div className="kr-container">
        <section className="gs-kpis" id="results" aria-label="Scenario outcome">
          <KpiCard
            label="Distribution loss"
            value={result.lossPct.toFixed(1)}
            unit="%"
            icon={<Gauge size={14} />}
            progress={share(lossSaved, lossSpan)}
            sub={
              <>
                <span className="gs-chip gs-chip--good">−{lossSaved.toFixed(1)} pp</span>
                from {result.baseLossPct.toFixed(1)}% today
              </>
            }
          />
          <KpiCard
            label="Energy recovered"
            value={num(result.recoveredGWh)}
            unit="GWh/yr"
            icon={<Bolt size={14} />}
            progress={share(result.recoveredGWh, best.recoveredGWh)}
            sub={<>≈ {num(result.households)} households powered</>}
          />
          <KpiCard
            label="Value recovered"
            value={num(result.valueCrore)}
            unit="crore BDT/yr"
            icon={<Wallet size={14} />}
            progress={share(result.valueCrore, best.valueCrore)}
            sub={<>at BDT 9.4 per kWh avoided generation</>}
          />
          <KpiCard
            label="Outage hours"
            value={num(result.outageHours)}
            unit="h/yr"
            icon={<Clock size={14} />}
            progress={share(outageSaved, outageSpan)}
            sub={
              <>
                <span className="gs-chip gs-chip--good">−{num(outageSaved)} h</span>
                from {num(result.baseOutageHours)} h today
              </>
            }
          />
          <KpiCard
            label="Simple payback"
            value={result.paybackYears > 0 ? result.paybackYears.toFixed(1) : "—"}
            unit={result.paybackYears > 0 ? "years" : ""}
            icon={<Target size={14} />}
            progress={share(result.capexCrore, best.capexCrore)}
            sub={<>on BDT {num(result.capexCrore)} crore of capex</>}
          />
        </section>

        <section className="gs-work" aria-label="Scenario workspace">
          <ControlPanel scenario={scenario} onChange={update} />

          <div className="gs-stack">
            <NetworkDiagram scenario={scenario} result={result} />

            <div className="gs-2">
              <LossBreakdown scenario={scenario} result={result} />
              <TrajectoryChart result={result} />
            </div>

            <ComparisonTable scenario={scenario} result={result} />
            <BriefingNote scenario={scenario} result={result} />
          </div>
        </section>
      </div>

      <MethodSheet />
    </main>
  );
}
