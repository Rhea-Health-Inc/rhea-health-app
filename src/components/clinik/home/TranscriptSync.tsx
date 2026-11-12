import { useEffect, useRef, useState } from "react";
import { RefreshCw, CircleDot } from "lucide-react";
import { TRANSCRIPT, AI_CARDS } from "@/lib/mock";
import { SectionHeader } from "@/components/clinik/PageHeader";

type SoapKey = "S" | "O" | "A" | "P";
type SoapNote = Record<SoapKey, string>;

const SOAP_KEYS: readonly SoapKey[] = ["S", "O", "A", "P"];

const SOAP_LABELS: Record<SoapKey, string> = {
  S: "Subjective",
  O: "Objective",
  A: "Assessment",
  P: "Plan",
};

const EMPTY_NOTE: SoapNote = { S: "", O: "", A: "", P: "" };

const GENERATED_NOTE: SoapNote = {
  S: `${AI_CARDS.chiefComplaint} ${AI_CARDS.symptoms.join("; ")}.`,
  O: "BP avg 128/82 (home log). No acute distress.",
  A: `${AI_CARDS.conditions.join(", ")}.`,
  P: `${AI_CARDS.followups.join(" ")} ${AI_CARDS.tests.join(" ")}`,
};

const SYNC_DELAY_MS = 900;

export function TranscriptSync() {
  const [soap, setSoap] = useState<SoapNote>(EMPTY_NOTE);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [dirty, setDirty] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Guards against a state update after the section unmounts mid-sync.
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const sync = () => {
    if (syncing) return;
    setSyncing(true);
    timerRef.current = setTimeout(() => {
      setSoap(GENERATED_NOTE);
      setSyncing(false);
      setSynced(true);
      setDirty(false);
    }, SYNC_DELAY_MS);
  };

  const statusMessage = synced
    ? dirty
      ? "You have unsaved edits."
      : "SOAP fields updated from live transcript."
    : "Push latest transcript segments into the structured SOAP note.";

  return (
    <section aria-labelledby="transcript-to-soap" className="flex flex-col">
      <SectionHeader
        id="transcript-to-soap"
        title="Transcript to SOAP"
        description="Watch a captured conversation become a structured, editable note."
        actions={<span className="text-[13px] text-muted-foreground">Marta Kellner · 8:30 AM</span>}
      />
      <div className="rounded-2xl bg-card hairline p-6 flex-1 flex flex-col">
        <div className="grid md:grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="rounded-xl bg-muted/40 p-4 overflow-y-auto min-h-0">
            <h3 className="text-[12px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
              Transcript
            </h3>
            <ul className="space-y-2">
              {TRANSCRIPT.slice(0, 4).map((line, i) => (
                <li key={i} className="text-[14px]">
                  <span
                    className={`font-medium ${
                      line.s === "doctor" ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {line.s === "doctor" ? "Dr." : "Pt."}
                  </span>{" "}
                  <span className="text-foreground/80">{line.t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-card hairline p-4 overflow-y-auto min-h-0">
            <div className="text-[12px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between font-semibold">
              <h3>SOAP note</h3>
              {synced && (
                <span
                  className={`text-[12px] inline-flex items-center gap-1 ${
                    dirty ? "text-muted-foreground" : "text-[var(--color-success)]"
                  }`}
                >
                  <CircleDot aria-hidden className="w-3 h-3" /> {dirty ? "Edited" : "Synced"}
                </span>
              )}
            </div>
            {SOAP_KEYS.map((key) => (
              <div key={key} className="mb-2">
                <label htmlFor={`soap-${key}`} className="text-[12px] font-semibold text-primary">
                  {key}{" "}
                  <span className="text-muted-foreground font-normal">· {SOAP_LABELS[key]}</span>
                </label>
                <textarea
                  id={`soap-${key}`}
                  value={soap[key]}
                  disabled={!synced && !soap[key]}
                  placeholder={synced ? "" : "Sync to fill this section…"}
                  onChange={(e) => {
                    const { value } = e.target;
                    setSoap((s) => ({ ...s, [key]: value }));
                    setDirty(true);
                  }}
                  rows={2}
                  className="mt-1 w-full resize-y bg-transparent text-[14px] text-foreground/90 outline-none rounded-lg px-2 py-1 hover:bg-muted/50 focus:bg-muted/50 focus:ring-1 focus:ring-primary/40 transition placeholder:text-muted-foreground/70 disabled:opacity-50"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mt-4">
          <p role="status" className="text-[14px] text-muted-foreground min-w-0">
            {statusMessage}
          </p>
          <button
            type="button"
            onClick={sync}
            disabled={syncing}
            className="text-[14px] px-4 h-9 shrink-0 whitespace-nowrap rounded-full bg-primary text-primary-foreground hover:opacity-90 transition inline-flex items-center gap-1.5 disabled:opacity-60"
          >
            <RefreshCw aria-hidden className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : synced ? "Re-sync" : "Sync to SOAP"}
          </button>
        </div>
      </div>
    </section>
  );
}
