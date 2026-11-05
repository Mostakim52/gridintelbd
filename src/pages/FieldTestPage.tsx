import { useEffect, useMemo, useState } from "react";
import { ChannelCard } from "../components/ChannelCard";
import { MeterPhone } from "../components/MeterPhone";
import { Panel } from "../components/Panel";
import { RigDiagram } from "../components/RigDiagram";
import { ArrowRight, Pause, Play, Plug } from "../components/Icons";
import {
  buildSeries,
  makeEvent,
  MODELLED,
  RIG,
  SPANS,
  summarise,
  WINDOWS,
  type TheftEvent,
  type WindowId,
} from "../lib/field";

const clock = (t: number) => {
  const h = Math.floor(t / 3600) % 24;
  const m = Math.floor(t / 60) % 60;
  const s = t % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

export function FieldTestPage() {
  /** Sample counter. Starts an hour in so the 1-hour trend has history. */
  const [tick, setTick] = useState(3600);
  const [events, setEvents] = useState<TheftEvent[]>([]);
  const [win, setWin] = useState<WindowId>("1m");
  const [paused, setPaused] = useState(false);
  const [light, setLight] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 900);
    return () => window.clearInterval(id);
  }, [paused]);

  const stepSec = WINDOWS.find((w) => w.id === win)?.stepSec ?? 1;
  const series = useMemo(
    () => buildSeries(tick, events, 60, stepSec),
    [tick, events, stepSec],
  );
  const summary = summarise(series);
  const live = series[series.length - 1] ?? { a: 0, b: 0, t: 0 };

  const inject = () => {
    const event = makeEvent(tick - 16);
    setEvents((prev) => [...prev.slice(-9), { ...event, id: (prev[prev.length - 1]?.id ?? 0) + 1 }]);
  };

  const delivering = Math.abs(summary.gap) > 0;

  /* --- does the model's assumption survive the meter? --- */
  const deltaA = summary.a - MODELLED.a;
  const deltaB = summary.b - MODELLED.b;
  const holdsA = Math.abs(deltaA) <= SPANS.a.band;
  const holdsB = Math.abs(deltaB) <= SPANS.b.band;

  return (
    <main>
      <header className="kr-hero">
        <div className="kr-hero-bg" aria-hidden="true">
          <div className="kr-orb kr-o1" />
          <div className="kr-orb kr-o2" />
          <div className="kr-grid" />
        </div>

        <div className="kr-container">
          <span className="kr-eyebrow">
            <i />
            Field rig · {RIG.id} · {RIG.site}
          </span>

          <h1 className="gs-hero-title kr-display">
            Two spans. Four meters.{" "}
            <span className="kr-grad">One honest number.</span>
          </h1>

          <p className="gs-hero-sub">
            Span A is bare overhead conductor. Span B is the same route in a
            duct. Both are metered at each end with class {RIG.ctClass} current
            transformers and GPS-synchronised clocks sampling every{" "}
            {RIG.sampleRate} — so the difference between what goes in and what
            comes out is <strong>measured</strong>, not assumed.
          </p>

          <div className="gs-gapfig" style={{ marginTop: 34 }}>
            <b>{summary.gap.toFixed(1)}</b>
            <small>pp differential · span A minus span B</small>
          </div>

          <div className="gs-hero-row">
            <span className={delivering && !paused ? "gs-live" : "gs-live gs-live--off"}>
              <i />
              {paused ? "Feed paused" : `Sampling · ${stepSec} s bins`}
            </span>

            <button className="kr-btn kr-btn-accent" type="button" onClick={inject}>
              <Plug size={15} />
              Inject a hook
            </button>

            <button className="gs-ghost" type="button" onClick={() => setEvents([])}>
              Clear events
            </button>
          </div>
        </div>
      </header>

      <div className="kr-container">
        <section className="gs-readout" aria-label="Instrument summary">
          <div className="kr-card gs-panel" style={{ padding: "20px 22px" }}>
            <span className="kr-tag" style={{ marginBottom: 10 }}>
              Span A · measured
            </span>
            <div className="gs-fig-row">
              <span className="gs-fig">{summary.a.toFixed(1)}</span>
              <span className="gs-fig-unit">% loss</span>
            </div>
            <p className="gs-kpi-sub">{SPANS.a.build}</p>
          </div>

          <div className="kr-card gs-panel" style={{ padding: "20px 22px" }}>
            <span className="kr-tag" style={{ marginBottom: 10 }}>
              Span B · measured
            </span>
            <div className="gs-fig-row">
              <span className="gs-fig">{summary.b.toFixed(1)}</span>
              <span className="gs-fig-unit">% loss</span>
            </div>
            <p className="gs-kpi-sub">{SPANS.b.build}</p>
          </div>

          <div className="kr-card gs-panel" style={{ padding: "20px 22px" }}>
            <span className="kr-tag" style={{ marginBottom: 10 }}>
              Events detected
            </span>
            <div className="gs-fig-row">
              <span className="gs-fig">{events.length}</span>
              <span className="gs-fig-unit">on span A</span>
            </div>
            <p className="gs-kpi-sub">
              {events.length === 0 ? "No hooking in this window" : `Latest at ${clock(events[events.length - 1].at)}`}
            </p>
          </div>

          <div className="kr-card gs-panel" style={{ padding: "20px 22px" }}>
            <span className="kr-tag" style={{ marginBottom: 10 }}>
              Uncertainty
            </span>
            <div className="gs-fig-row">
              <span className="gs-fig">±{RIG.uncertainty.toFixed(2)}</span>
              <span className="gs-fig-unit">pp</span>
            </div>
            <p className="gs-kpi-sub">
              two-meter differential, {RIG.runningDays} days running
            </p>
          </div>
        </section>

        <div className="gs-stack" style={{ marginTop: 18 }}>
          <Panel
            title="Four measurement points, one logger"
            note={`${RIG.spanKm.toFixed(2)} km of ${RIG.voltageKv} kV lateral, instrumented at both ends. Energy in minus energy out over the interval is the span loss — no model in the path.`}
            aside={
              <div className="gs-controls-row">
                <div className="gs-seg" role="group" aria-label="Trend window">
                  {WINDOWS.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      aria-pressed={win === w.id}
                      onClick={() => setWin(w.id)}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
                <button
                  className="gs-ghost"
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-pressed={paused}
                >
                  {paused ? <Play size={12} /> : <Pause size={12} />}
                  {paused ? "Resume" : "Pause"}
                </button>
              </div>
            }
            flush
          >
            <div className="gs-schematic">
              <RigDiagram summary={summary} liveA={live.a} liveB={live.b} />
            </div>
          </Panel>

          <div className="gs-2">
            <ChannelCard
              span={SPANS.a}
              summary={summary}
              series={series}
              live={live.a}
              points={series.length}
            />
            <ChannelCard
              span={SPANS.b}
              summary={summary}
              series={series}
              live={live.b}
              points={series.length}
            />
          </div>

          <Panel
            title="Does the model survive the meter?"
            note="The simulator assumes 11.6% loss on overhead sections and 3.4% on ducted ones. The rig measures the same construction from two ends of a real span."
            aside={
              <span className={holdsA ? "gs-chip gs-chip--good" : "gs-chip gs-chip--rose"}>
                {holdsA ? "INSIDE BAND" : "OUTSIDE BAND"}
              </span>
            }
          >
            <div className="gs-recon">
              <div className="gs-recon-cell">
                <span>Model assumes · A</span>
                <b>{MODELLED.a.toFixed(1)}%</b>
              </div>
              <div className="gs-recon-cell">
                <span>Meter measures · A</span>
                <b>{summary.a.toFixed(1)}%</b>
              </div>
              <div className="gs-recon-cell">
                <span>Difference</span>
                <b>
                  {deltaA >= 0 ? "+" : "−"}
                  {Math.abs(deltaA).toFixed(1)} pp
                </b>
              </div>
              <div className={holdsA ? "gs-recon-cell is-good" : "gs-recon-cell"}>
                <span>Verdict</span>
                <b>{holdsA ? "holds" : deltaA > 0 ? "model low" : "model high"}</b>
              </div>
            </div>

            <p className="gs-sub" style={{ marginTop: 18, maxWidth: "78ch" }}>
              Span B measures {summary.b.toFixed(1)}% against a modelled{" "}
              {MODELLED.b.toFixed(1)}% — {holdsB ? "inside" : "outside"} its ±
              {SPANS.b.band.toFixed(1)} band, so the duct behaves as expected.
              Span A is the one worth arguing about: every hook you inject pushes
              the measured mean up, and the model's flat{" "}
              {MODELLED.a.toFixed(1)}% is only right on a quiet day. That is the
              real finding — theft is not a constant, so the case for a duct is
              strongest where the hooking is worst.
            </p>
          </Panel>

          <div className="gs-2">
            <Panel
              title="Detector log"
              note="Every hooking event the differential picks up, with the loss it added."
              aside={
                <span className="gs-chip gs-chip--mute">
                  {events.length === 0 ? "CLEAR" : "SPAN A"}
                </span>
              }
            >
              {events.length === 0 ? (
                <p className="gs-empty">
                  No events in this window. Inject a hook to see what the meter
                  catches.
                </p>
              ) : (
                <div className="gs-events">
                  {[...events].reverse().slice(0, 6).map((event) => (
                    <div className="gs-event" key={event.id}>
                      <i>⚡</i>
                      <div className="gs-event-msg">
                        {event.kind} {event.pole}
                        <em>
                          {clock(event.at)} · {event.spanTicks} s · span A
                        </em>
                      </div>
                      <b>+{event.peak.toFixed(1)} pp</b>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <MeterPhone
              summary={summary}
              events={events}
              liveA={live.a}
              liveB={live.b}
              light={light}
              onLight={setLight}
            />
          </div>

          <div className="kr-cta gs-cta">
            <div>
              <h2>Now ask the same question across 9,000 km.</h2>
              <p>
                The rig proves the mechanism on 1.24 km. The model asks what that
                mechanism is worth at network scale — and shows exactly which
                assumption your capital is betting on.
              </p>
            </div>
            <div className="gs-cta-actions">
              <a className="kr-btn kr-btn-light" href="#/">
                Open the simulator
                <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
