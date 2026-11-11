import { useEffect, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import type { EncounterContext } from "@/lib/clinical-outputs";
import type { NoteFormat } from "@/lib/note-formats";

type Soap = { S: string; O: string; A: string; P: string };
type Sections = { title: string; value: string }[];

function draftFor(format: Exclude<NoteFormat, "soap">, soap: Soap): Sections {
  if (format === "problem")
    return [
      { title: "Active problems", value: soap.A },
      { title: "Subjective & interval history", value: soap.S },
      { title: "Objective findings", value: soap.O },
      { title: "Plan by problem", value: soap.P },
    ];
  if (format === "focused")
    return [
      { title: "Chief concern", value: soap.S.split("\n")[0] ?? "" },
      { title: "Key findings", value: soap.O },
      { title: "Impression & plan", value: `${soap.A}\n${soap.P}`.trim() },
    ];
  return [
    {
      title: "Narrative",
      value: [soap.S, soap.O, soap.A, soap.P].join(" ").replace(/\n+/g, " ").trim(),
    },
  ];
}

function usePersisted(key: string, initial: () => Sections) {
  const [value, setValue] = useState<Sections | null>(null);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      setValue(raw ? (JSON.parse(raw) as Sections) : initial());
    } catch {
      setValue(initial());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const update = (next: Sections | null) => {
    setValue(next);
    try {
      if (next) window.localStorage.setItem(key, JSON.stringify(next));
      else window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  };
  return [value, update] as const;
}

function SectionEditor({
  sections,
  onChange,
}: {
  sections: Sections;
  onChange: (s: Sections) => void;
}) {
  return (
    <div className="space-y-3">
      {sections.map((s, i) => (
        <div key={s.title} className="rounded-2xl bg-card hairline p-6">
          <div className="text-[14px] font-medium mb-3">{s.title}</div>
          <textarea
            value={s.value}
            onChange={(e) =>
              onChange(sections.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))
            }
            rows={Math.max(3, s.value.split("\n").length + 1)}
            className="w-full resize-y bg-transparent text-[14px] leading-relaxed text-foreground/90 outline-none"
          />
        </div>
      ))}
    </div>
  );
}

/** Primary note rendered in a non-SOAP format, drafted from the encounter. */
export function FormattedNote({
  format,
  encounterId,
  soap,
}: {
  format: Exclude<NoteFormat, "soap">;
  encounterId: string;
  soap: Soap;
}) {
  const [sections, setSections] = usePersisted(`rhea.note.${format}.${encounterId}`, () =>
    draftFor(format, soap),
  );
  if (!sections) return null;
  return <SectionEditor sections={sections} onChange={setSections} />;
}

const LETTER_COPY = {
  referral: {
    title: "Referral letter",
    description: "Rhea drafts a referral letter from this encounter for your review.",
  },
  discharge: {
    title: "Discharge summary",
    description: "Rhea drafts a discharge summary from this encounter for your review.",
  },
} as const;

function draftLetter(kind: "referral" | "discharge", ctx: EncounterContext, soap: Soap): Sections {
  const who = `${ctx.patient.name}, ${ctx.patient.age}, ${ctx.patient.sex} (${ctx.patient.mrn})`;
  if (kind === "referral")
    return [
      { title: "Recipient", value: "" },
      { title: "Patient", value: who },
      { title: "Reason for referral", value: ctx.reason },
      { title: "Clinical summary", value: `${soap.S}\n${soap.O}`.trim() },
      { title: "Assessment", value: soap.A },
      { title: "Requested action", value: soap.P },
      { title: "Referring clinician", value: `${ctx.clinician}, ${ctx.clinicianCredentials}` },
    ];
  return [
    { title: "Patient", value: who },
    { title: "Date of service", value: `${ctx.dateOfService} · ${ctx.time}` },
    { title: "Presenting concern", value: ctx.reason },
    { title: "Findings", value: soap.O },
    { title: "Diagnoses", value: ctx.diagnoses.join("\n") },
    { title: "Medications", value: ctx.medications.join("\n") },
    { title: "Follow-up plan", value: soap.P },
    { title: "Discharging clinician", value: `${ctx.clinician}, ${ctx.clinicianCredentials}` },
  ];
}

/** Referral letter / discharge summary, generated on demand. */
export function GeneratedLetter({
  kind,
  ctx,
  soap,
  onNotify,
}: {
  kind: "referral" | "discharge";
  ctx: EncounterContext;
  soap: Soap;
  onNotify: (m: string) => void;
}) {
  const [sections, setSections] = usePersisted(`rhea.letter.${kind}.${ctx.encounterId}`, () => []);
  const copy = LETTER_COPY[kind];
  const generate = () => {
    setSections(draftLetter(kind, ctx, soap));
    onNotify(`${copy.title} generated for review`);
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="rounded-2xl bg-card hairline p-8">
        <div className="text-[15px] font-medium mb-1">{copy.title}</div>
        <p className="text-[14px] text-muted-foreground mb-5 max-w-2xl leading-relaxed">
          {copy.description}
        </p>
        <button
          type="button"
          onClick={generate}
          className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] hover:opacity-90 transition inline-flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" /> Generate {copy.title.toLowerCase()}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-card hairline p-6 flex items-center justify-between gap-4">
        <div className="text-[15px] font-medium">{copy.title}</div>
        <button
          type="button"
          onClick={generate}
          className="h-10 px-4 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Regenerate
        </button>
      </div>
      <SectionEditor sections={sections} onChange={setSections} />
    </div>
  );
}
