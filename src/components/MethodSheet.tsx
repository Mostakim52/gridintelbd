import { MODEL } from "../lib/model";
import { num } from "../lib/format";

const CARDS = [
  {
    tag: "Scope",
    title: "One network, measured twice",
    body: "Nine thousand circuit-kilometres of theft-prone urban distribution — the part where a hook can reach a conductor. The same network is costed once as it stands and once with a share of it ducted.",
    facts: [
      ["Network in scope", `${num(MODEL.networkKm)} km`],
      ["Energy input", `${num(MODEL.energyGWh)} GWh / yr`],
      ["Average load factor", MODEL.loadFactor.toFixed(2)],
      ["Household use", `${num(MODEL.householdKWhPerYear)} kWh / yr`],
    ],
  },
  {
    tag: "Losses",
    title: "Two ways to lose a unit",
    body: "Technical loss is heat in the conductor and it improves only modestly underground. Non-technical loss is energy that leaves the wire without a meter, and that is what a duct actually removes.",
    facts: [
      ["Technical — overhead", `${MODEL.techLossOverheadPct.toFixed(1)}%`],
      ["Technical — underground", `${MODEL.techLossUndergroundPct.toFixed(1)}%`],
      ["Residual theft — ducted", `${MODEL.theftLossUndergroundPct.toFixed(1)}%`],
      ["Outage hours", `${MODEL.outageHoursOverhead} / ${MODEL.outageHoursUnderground} h`],
    ],
  },
  {
    tag: "Cost",
    title: "What a kilometre buys",
    body: "Capex is a fixed programme cost plus a per-kilometre rate for cable, trenching and reinstatement. Recovered energy is valued at the generation it displaces, not at the retail tariff.",
    facts: [
      ["Capex per km", `BDT ${MODEL.capexCrorePerKm.toFixed(2)} crore`],
      ["Programme fixed", `BDT ${num(MODEL.fixedProgramCrore)} crore`],
      ["Avoided generation", `BDT ${MODEL.genCostTakaPerKWh.toFixed(1)} / kWh`],
      ["CO₂ factor", `${MODEL.co2KgPerKWh.toFixed(2)} kg / kWh`],
    ],
  },
];

/**
 * The light paper sheet that closes the page: the method, the constants, and
 * the honest caveats, on Kairo's white-card surface.
 */
export function MethodSheet() {
  return (
    <section className="kr-light-sec" id="method">
      <div className="kr-container">
        <div className="gs-sheet-head">
          <span className="kr-eyebrow">
            <i />
            Method
          </span>
          <h2>What this model is, and what it is not</h2>
          <p>
            A linear energy balance over a single urban network. Losses blend
            between the overhead and underground rates in proportion to the
            converted share, outages scale with a seasonal profile, and capex is
            a fixed programme cost plus a per-kilometre rate. Every number on
            the page comes from those twelve constants.
          </p>
        </div>

        <div className="gs-lcards">
          {CARDS.map((card) => (
            <article className="kr-lcard gs-lcard" key={card.tag}>
              <div className="kr-card-text">
                <span className="kr-tag">{card.tag}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <div className="gs-facts">
                  {card.facts.map(([term, value]) => (
                    <div className="gs-fact" key={term}>
                      <span>{term}</span>
                      <b>{value}</b>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="gs-caveat">
          <p>
            <strong>Two honest limits.</strong> Both benefits and capex scale
            with the converted share, so simple payback is close to
            scale-invariant — the number is stable because the trade is linear,
            not because the case is proven. And these constants are
            order-of-magnitude figures chosen to be defensible, not metered. The
            real constraints are the capital budget and how fast a city can
            actually open a trench. The field rig exists to replace the second
            limit with a measurement.
          </p>
        </div>
      </div>
    </section>
  );
}
