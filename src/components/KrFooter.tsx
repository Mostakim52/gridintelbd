import { href } from "../lib/route";
import { ArrowRight, Bolt } from "./Icons";

export function KrFooter() {
  return (
    <footer>
      <div className="kr-container">
        <div className="kr-foot">
          <div>
            <a className="kr-brand" href="#/">
              <span className="kr-mark">
                <b>
                  <Bolt size={15} />
                </b>
              </span>
              GridIntelBD
            </a>
            <p>
              A working scenario model and a field measurement rig, built for
              the Credosis Internship Program, Phase 02.
            </p>
          </div>

          <div>
            <h5>Pages</h5>
            <a href={href("home")}>Undergrounding model</a>
            <a href={href("field")}>Field rig A/B</a>
            <a href="#simulator">Scenario controls</a>
          </div>

          <div>
            <h5>Method</h5>
            <a href="#method">Assumptions</a>
            <a href="#method">Loss derivation</a>
            <a href="#method">Limitations</a>
          </div>

          <div>
            <h5>Reading</h5>
            <a href="#results">Key figures</a>
            <a href="#briefing">Briefing note</a>
            <a href={href("field")}>
              Meter vs model <ArrowRight size={13} />
            </a>
          </div>
        </div>

        <div className="kr-foot-bottom">
          <span>Model constants are illustrative — see the method sheet.</span>
          <span>Sensors are simulated, not field-installed.</span>
        </div>

        <div className="kr-wordmark gs-wordmark" aria-hidden="true">
          Grid<span>IntelBD</span>
        </div>
      </div>
    </footer>
  );
}
