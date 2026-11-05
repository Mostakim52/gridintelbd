import { clsx } from "clsx";
import type { CSSProperties } from "react";
import type { Summary, TheftEvent } from "../lib/field";
import { Activity, Bolt, Plug, Radio } from "./Icons";

type Props = {
  summary: Summary;
  events: TheftEvent[];
  liveA: number;
  liveB: number;
  light: boolean;
  onLight: (light: boolean) => void;
};

const clock = (t: number) => {
  const h = Math.floor(t / 3600) % 24;
  const m = Math.floor(t / 60) % 60;
  const s = t % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

/**
 * The phone is drawn entirely in CSS by the system; this fills its screen with
 * the rig's live differential, so the same measurement is visible in the
 * technician's hand and on the wall display.
 */
export function MeterPhone({ summary, events, liveA, liveB, light, onLight }: Props) {
  const latest = events[events.length - 1];
  const barScale = 14;

  return (
    <section
      className={clsx("kr-card gs-panel", light && "kr-light-on")}
      aria-labelledby="phone-title"
    >
      <div className="gs-panel-head">
        <div>
          <h2 className="gs-h2" id="phone-title">
            In the technician's hand
          </h2>
          <p className="gs-sub">
            Same reading, same second — the logger's view, not a screenshot.
          </p>
        </div>

        <div className="kr-theme-switch" role="group" aria-label="Meter screen theme">
          <span className="kr-knob" aria-hidden="true" />
          <button type="button" className={clsx(!light && "kr-on")} aria-pressed={!light} onClick={() => onLight(false)}>
            Dark
          </button>
          <button type="button" className={clsx(light && "kr-on")} aria-pressed={light} onClick={() => onLight(true)}>
            Light
          </button>
        </div>
      </div>

      <div className="gs-phone-stage">
        <div className="kr-phone" style={{ "--kr-pw": "248px" } as CSSProperties}>
          <div className="kr-screen">
            <div className="kr-island" />
            <div className="kr-app gs-app-screen">
              <div className="kr-app-status">
                <span>{clock(9 * 3600 + 41 * 60)}</span>
                <span>
                  <span className="kr-sb-bat">
                    <i />
                  </span>
                </span>
              </div>

              <div className="kr-app-head">
                <div>
                  <small>RIG-02 · Dhanmondi 9/A</small>
                  <b>Span delta</b>
                </div>
                <div className="kr-app-av">GS</div>
              </div>

              <div className="gs-meter-card">
                <div className="gs-meter-top">
                  <small>
                    <i />
                    Live
                  </small>
                  <span style={{ font: "600 0.56em var(--kr-font-mono)", color: "var(--kr-a-muted)" }}>
                    1 s
                  </span>
                </div>
                <div className="gs-meter-val">
                  <b>{summary.gap.toFixed(1)}</b>
                  <span>pp</span>
                </div>
                <div className="gs-meter-split">
                  <div>
                    <span>A overhead</span>
                    <b>{liveA.toFixed(1)}%</b>
                  </div>
                  <div>
                    <span>B ducted</span>
                    <b>{liveB.toFixed(1)}%</b>
                  </div>
                </div>
              </div>

              <div className="kr-app-week">
                <div className="kr-app-week-h">
                  <span>Loss by span</span>
                  <b>now</b>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.55em" }}>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        font: "600 0.55em var(--kr-font-mono)",
                        color: "var(--kr-a-muted)",
                        marginBottom: "0.25em",
                      }}
                    >
                      <span>A</span>
                      <span>{liveA.toFixed(1)}%</span>
                    </div>
                    <div className="gs-pbar">
                      <i style={{ width: `${Math.min(100, (liveA / barScale) * 100)}%`, background: "var(--kr-accent)" }} />
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        font: "600 0.55em var(--kr-font-mono)",
                        color: "var(--kr-a-muted)",
                        marginBottom: "0.25em",
                      }}
                    >
                      <span>B</span>
                      <span>{liveB.toFixed(1)}%</span>
                    </div>
                    <div className="gs-pbar">
                      <i
                        style={{
                          width: `${Math.min(100, (liveB / barScale) * 100)}%`,
                          background: "var(--kr-mint)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="kr-app-list-h">Latest event</div>
              <div className="kr-app-row">
                <div className="kr-app-dot" style={{ "--kr-c": "var(--kr-rose)" } as CSSProperties}>
                  <i />
                </div>
                <div>
                  <b>{latest ? `${latest.kind} ${latest.pole}` : "No events in window"}</b>
                  <small>{latest ? clock(latest.at) : "span A clear"}</small>
                </div>
                <em style={{ color: "var(--kr-rose)" }}>{latest ? `+${latest.peak.toFixed(1)}` : "—"}</em>
              </div>

              <div className="kr-app-tab">
                <span className="kr-act">
                  <Activity size={16} />
                </span>
                <span>
                  <Bolt size={16} />
                </span>
                <span className="kr-app-plus" style={{ width: "2.2em", height: "2.2em" }}>
                  <Radio size={14} />
                </span>
                <span>
                  <Plug size={16} />
                </span>
                <span>
                  <Plug size={16} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
