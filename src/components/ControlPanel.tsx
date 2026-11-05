import type { CSSProperties } from "react";
import { DEFAULT_SCENARIO, type Scenario } from "../lib/model";
import { num } from "../lib/format";
import { Reset } from "./Icons";
import { spot, useReveal } from "../lib/useReveal";

type Props = {
  scenario: Scenario;
  onChange: (patch: Partial<Scenario>) => void;
};

type SliderProps = {
  id: string;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (v: number) => void;
};

function Slider({
  id,
  label,
  hint,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: SliderProps) {
  const fill = ((value - min) / (max - min)) * 100;
  const style = { "--kr-fill": `${fill}%` } as CSSProperties;

  return (
    <div>
      <div className="gs-slider-head">
        <label className="gs-slider-label" htmlFor={id}>
          {label}
        </label>
        <span className="gs-slider-value">{display}</span>
      </div>
      <input
        className="gs-range"
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={style}
        aria-describedby={`${id}-hint`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <p className="gs-slider-hint" id={`${id}-hint`}>
        {hint}
      </p>
    </div>
  );
}

export function ControlPanel({ scenario, onChange }: Props) {
  const { ref, shown } = useReveal<HTMLElement>();

  return (
    <aside
      ref={ref}
      className={`kr-card gs-panel gs-sticky${shown ? " kr-in" : ""}`}
      onPointerMove={spot}
      aria-labelledby="gs-controls-title"
    >
      <div className="gs-panel-head">
        <div>
          <h2 className="gs-h2" id="gs-controls-title">
            Scenario controls
          </h2>
          <p className="gs-sub">Every figure and picture on this page recalculates as you drag.</p>
        </div>
        <button
          className="gs-ghost"
          type="button"
          onClick={() => onChange(DEFAULT_SCENARIO)}
          title="Reset to the default scenario"
        >
          <Reset size={12} />
          Reset
        </button>
      </div>

      <div className="gs-panel-body">
        <div className="gs-sliders">
          <Slider
            id="underground"
            label="Network underground"
            hint="Share of the 9,000 km urban network rebuilt as ducted cable. Conversion starts at the substation and works outward."
            min={0}
            max={100}
            step={1}
            value={scenario.undergroundPct}
            display={`${scenario.undergroundPct}%`}
            onChange={(v) => onChange({ undergroundPct: v })}
          />

          <Slider
            id="theft"
            label="Theft on overhead lines"
            hint="Non-technical loss from illegal hooking and meter tampering. Only the sections still overhead are exposed to it."
            min={2}
            max={12}
            step={0.1}
            value={scenario.theftPct}
            display={`${scenario.theftPct.toFixed(1)}%`}
            onChange={(v) => onChange({ theftPct: v })}
          />

          <Slider
            id="severity"
            label="Monsoon severity"
            hint="Multiplier on weather-driven outages — storms, flooding, falling trees and lightning on exposed conductors."
            min={0.5}
            max={2}
            step={0.05}
            value={scenario.severity}
            display={`${scenario.severity.toFixed(2)}×`}
            onChange={(v) => onChange({ severity: v })}
          />

          <Slider
            id="peak"
            label="System peak demand"
            hint="National evening peak. Higher demand makes every recovered megawatt-hour worth more during an outage."
            min={13000}
            max={21000}
            step={250}
            value={scenario.peakMW}
            display={`${num(scenario.peakMW)} MW`}
            onChange={(v) => onChange({ peakMW: v })}
          />
        </div>
      </div>

      <div className="gs-foot-note">
        <strong>Read it as a trade-off.</strong> More underground share buys back
        more energy and more outage hours, but the capex line rises with it.
      </div>
    </aside>
  );
}
