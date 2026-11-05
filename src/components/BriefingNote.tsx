import { useState } from "react";
import { buildBriefing } from "../lib/briefing";
import type { Result, Scenario } from "../lib/model";
import { Check, Copy } from "./Icons";
import { Panel } from "./Panel";

type Props = { scenario: Scenario; result: Result };

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for non-secure origins, where the async clipboard API is blocked.
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
}

export function BriefingNote({ scenario, result }: Props) {
  const [copied, setCopied] = useState(false);
  const text = buildBriefing(scenario, result);

  const onCopy = async () => {
    try {
      await copyText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Panel
      title="Briefing note"
      note="Generated from this scenario — the one-page version a decision maker reads."
      aside={
        <button className="gs-ghost" type="button" onClick={onCopy}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      }
    >
      <div className="gs-note-box" id="briefing">
        <pre>{text}</pre>
      </div>
    </Panel>
  );
}
