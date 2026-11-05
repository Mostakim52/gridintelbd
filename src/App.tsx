import { KrFooter } from "./components/KrFooter";
import { KrNav } from "./components/KrNav";
import { useRoute } from "./lib/route";
import { FieldTestPage } from "./pages/FieldTestPage";
import { SimulatorPage } from "./pages/SimulatorPage";

export default function App() {
  const route = useRoute();

  return (
    <div className="kr gs-app">
      <button
        type="button"
        className="gs-skip"
        onClick={() => {
          const main = document.getElementById("main-content");
          main?.scrollIntoView({ block: "start" });
          main?.focus();
        }}
      >
        Skip to main content
      </button>
      <KrNav route={route} />
      <div id="main-content" tabIndex={-1}>
        {route === "field" ? <FieldTestPage /> : <SimulatorPage />}
      </div>
      <KrFooter />
    </div>
  );
}
