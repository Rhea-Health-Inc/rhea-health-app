import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Mic,
  Square,
  Sparkles,
  Save,
  Send,
  FileDown,
  Printer,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  AlertTriangle,
  Pill,
  Activity,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { APPOINTMENTS, TRANSCRIPT, AI_CARDS, HISTORY, CLINICIAN } from "@/lib/mock";
import {
  DOC_STATUS_LABEL,
  DOC_STATUS_TONE,
  isDocStatus,
  type DocStatus,
} from "@/lib/documentation";
import { ClinicalOutputPanel } from "@/components/clinik/visit/ClinicalOutputPanel";
import type { EncounterContext } from "@/lib/clinical-outputs";
import {
  NOTE_FORMATS,
  NOTE_FORMAT_LABEL,
  loadDefaultNoteFormat,
  loadEncounterFormat,
  saveEncounterFormat,
  type NoteFormat,
} from "@/lib/note-formats";
import { FormattedNote, GeneratedLetter } from "@/components/clinik/visit/EncounterNotes";

type VisitSearch = {
  tab?: "workspace" | "documentation" | "history";
  doc?: DocStatus;
};

export const Route = createFileRoute("/app/visit/$id")({
  validateSearch: (raw: Record<string, unknown>): VisitSearch => {
    const tab = raw.tab;
    const doc = raw.doc;
    return {
      tab: tab === "workspace" || tab === "documentation" || tab === "history" ? tab : undefined,
      doc: isDocStatus(doc) ? doc : undefined,
    };
  },
  loader: ({ params }) => {
    const appt = APPOINTMENTS.find((a) => a.id === params.id);
    if (!appt) throw notFound();
    return { appt };
  },
  component: Visit,
  notFoundComponent: () => (
    <div className="p-10">
      <div className="text-sm text-muted-foreground">Appointment not found.</div>
      <Link to="/app/schedule" className="text-sm text-primary hover:underline">
        Back to schedule
      </Link>
    </div>
  ),
});

type Phase = "idle" | "recording" | "processing" | "review";
type Tab = "workspace" | "documentation" | "history";

function Visit() {
  const { appt } = Route.useLoaderData();
  const search = Route.useSearch();
  const initialTab: Tab = search.tab ?? "workspace";
  const initialDocStatus: DocStatus =
    search.doc ?? (initialTab === "documentation" ? "draft" : "draft");

  const [phase, setPhase] = useState<Phase>("idle");
  const [tab, setTab] = useState<Tab>(initialTab);
  const [docStatus, setDocStatus] = useState<DocStatus>(initialDocStatus);
  const [elapsed, setElapsed] = useState(0);
  const [visible, setVisible] = useState(0);
  const [savedAt, setSavedAt] = useState<string>("just now");

  // Keep local state in sync when the URL search changes (e.g. list → visit).
  useEffect(() => {
    if (search.tab) setTab(search.tab);
    if (search.doc) setDocStatus(search.doc);
  }, [search.tab, search.doc]);

  useEffect(() => {
    if (phase !== "recording") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    const r = setInterval(() => setVisible((v) => Math.min(v + 1, TRANSCRIPT.length)), 2200);
    return () => {
      clearInterval(t);
      clearInterval(r);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "processing") {
      const t = setTimeout(() => {
        setPhase("review");
        setTab("documentation");
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    const t = setInterval(() => setSavedAt("just now"), 15000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="h-16 border-b border-border/70 flex items-center px-6 gap-4 bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <Link
          to="/app/schedule"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[14px]"
        >
          <ChevronLeft className="w-4 h-4" /> Schedule
        </Link>
        <div className="h-4 w-px bg-border" />
        <img
          src={appt.patient.photo}
          alt={appt.patient.name}
          className="w-7 h-7 rounded-full object-cover"
        />
        <div className="text-[14px]">
          <span className="font-medium">{appt.patient.name}</span>
          <span className="text-muted-foreground"> · {appt.reason}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <TabBtn active={tab === "workspace"} onClick={() => setTab("workspace")}>
            Workspace
          </TabBtn>
          <TabBtn active={tab === "documentation"} onClick={() => setTab("documentation")}>
            Documentation
          </TabBtn>
          <TabBtn active={tab === "history"} onClick={() => setTab("history")}>
            History
          </TabBtn>
          <div className="ml-3 text-[14px] text-muted-foreground inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" /> Saved {savedAt}
          </div>
        </div>
      </div>

      {tab === "workspace" && (
        <div className="grid grid-cols-12 flex-1 min-h-0">
          <PatientPanel appt={appt} />
          <Consultation
            phase={phase}
            setPhase={setPhase}
            elapsed={elapsed}
            fmt={fmt}
            visible={visible}
          />
          <AiPanel active={phase === "recording"} />
        </div>
      )}

      {tab === "documentation" && (
        <Documentation
          appt={appt}
          phase={phase}
          docStatus={docStatus}
          setDocStatus={setDocStatus}
          onSaved={() => setSavedAt("just now")}
        />
      )}
      {tab === "history" && <HistoryTab patientName={appt.patient.name} />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[14px] px-4 h-9 rounded-full transition ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

/* -------- Left column: patient -------- */
function PatientPanel({ appt }: { appt: (typeof APPOINTMENTS)[number] }) {
  const p = appt.patient;
  return (
    <aside className="col-span-3 border-r border-border/70 p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center text-center">
        <img
          src={p.photo}
          alt={p.name}
          className="w-20 h-20 rounded-full object-cover ring-4 ring-background shadow-[var(--shadow-clinik)]"
        />
        <div className="mt-3 text-[16px] font-semibold">{p.name}</div>
        <div className="text-[14px] text-muted-foreground">
          {p.age} · {p.sex === "F" ? "Female" : "Male"} · {p.mrn}
        </div>
      </div>

      <Section title="Alerts">
        <div className="flex items-start gap-2 rounded-xl bg-primary/[0.06] p-3">
          <AlertTriangle className="w-4 h-4 text-primary mt-0.5" />
          <div className="text-[14px] text-foreground">Penicillin allergy · rash</div>
        </div>
      </Section>

      <Section title="Contact">
        <Kv k="Phone" v="(415) 555-0134" />
        <Kv k="Email" v="marta.k@proton.me" />
      </Section>

      <Section title="Care team">
        <Kv k="Primary" v="Dr. Sarah Chen" />
        <Kv k="DOB" v="Apr 12, 1983" />
      </Section>

      <Section title="Medications">
        <MedRow name="Metoprolol" dose="50 mg BID" />
        <MedRow name="Atorvastatin" dose="20 mg QHS" />
        <MedRow name="Aspirin" dose="81 mg daily" />
      </Section>

      <Section title="Conditions">
        <Tag>Stable angina</Tag>
        <Tag>Essential hypertension</Tag>
        <Tag>Hyperlipidemia</Tag>
      </Section>

      <Section title="Insurance">
        <Kv k="Plan" v="BlueShield PPO" />
        <Kv k="Member ID" v="B934-2210" />
      </Section>

      <Section title="Emergency contact">
        <Kv k="Adam Kellner" v="Spouse · (415) 555-9821" />
      </Section>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <div className="text-[12px] uppercase tracking-[0.12em] font-semibold text-muted-foreground/80 mb-2">
        {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between text-[14px]">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-foreground">{v}</span>
    </div>
  );
}
function MedRow({ name, dose }: { name: string; dose: string }) {
  return (
    <div className="flex items-center gap-2 text-[14px]">
      <Pill className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-foreground">{name}</span>
      <span className="text-muted-foreground ml-auto">{dose}</span>
    </div>
  );
}
function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block text-[14px] px-2 py-1 rounded-full bg-muted text-foreground mr-1 mb-1">
      {children}
    </span>
  );
}

/* -------- Middle column: consultation -------- */
function Consultation({
  phase,
  setPhase,
  elapsed,
  fmt,
  visible,
}: {
  phase: Phase;
  setPhase: (p: Phase) => void;
  elapsed: number;
  fmt: (s: number) => string;
  visible: number;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [visible]);

  return (
    <section className="col-span-6 p-6 flex flex-col max-h-[calc(100vh-4rem)]">
      {phase === "idle" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div className="mt-4 text-[14px] font-medium">Ready when you are</div>
            <div className="mt-1 text-[14px] text-muted-foreground">
              Start recording to capture the consultation. Rhea will draft the note automatically.
            </div>
            <button
              onClick={() => setPhase("recording")}
              className="mt-6 h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] hover:opacity-90 transition inline-flex items-center gap-2"
            >
              <Mic className="w-3.5 h-3.5" /> Start recording
            </button>
          </div>
        </div>
      )}

      {phase === "recording" && (
        <>
          <div className="rounded-2xl bg-card hairline p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </div>
              <div className="flex-1 h-10 flex items-center gap-1">
                {Array.from({ length: 40 }).map((_, i) => (
                  <span
                    key={i}
                    className="wave-bar w-[3px] bg-primary/70 rounded-sm"
                    style={{ height: "100%", animationDelay: `${i * 0.08}s` }}
                  />
                ))}
              </div>
              <div className="tabular-nums text-[14px] text-foreground">{fmt(elapsed)}</div>
              <button
                onClick={() => setPhase("processing")}
                className="h-10 px-5 rounded-full bg-foreground text-background text-[14px] hover:opacity-90 transition inline-flex items-center gap-2"
              >
                <Square className="w-3 h-3" /> Finish recording
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 mt-4 rounded-2xl hairline p-6 overflow-y-auto space-y-3"
          >
            {TRANSCRIPT.slice(0, visible).map((l, i) => (
              <div key={i} className={`flex ${l.s === "doctor" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                    l.s === "doctor" ? "bg-muted text-foreground" : "bg-primary/10 text-foreground"
                  }`}
                >
                  <div
                    className={`text-[12px] uppercase tracking-wider mb-0.5 ${l.s === "doctor" ? "text-muted-foreground" : "text-primary"}`}
                  >
                    {l.s === "doctor" ? "Dr. Chen" : "Patient"}
                  </div>
                  {l.t}
                </div>
              </div>
            ))}
            {visible < TRANSCRIPT.length && (
              <div className="text-[14px] text-muted-foreground pl-1">
                Transcribing<span className="caret">…</span>
              </div>
            )}
          </div>
        </>
      )}

      {phase === "processing" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="mt-4 text-[14px] font-medium">AI processing</div>
            <div className="mt-1 text-[14px] text-muted-foreground">
              Structuring your conversation into clinical documentation…
            </div>
          </div>
        </div>
      )}

      {phase === "review" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[var(--color-success)] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="mt-4 text-[14px] font-medium">Documentation is ready</div>
            <div className="mt-1 text-[14px] text-muted-foreground">
              Open the Documentation tab to review and sign.
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* -------- Right column: AI assistant -------- */
function AiPanel({ active }: { active: boolean }) {
  const cards = [
    {
      title: "Chief complaint",
      icon: Stethoscope,
      body: <p className="text-[14px] text-foreground/90">{AI_CARDS.chiefComplaint}</p>,
    },
    { title: "Symptoms detected", icon: Activity, body: <List items={AI_CARDS.symptoms} /> },
    { title: "Medications mentioned", icon: Pill, body: <List items={AI_CARDS.medications} /> },
    {
      title: "Conditions mentioned",
      icon: Stethoscope,
      body: <List items={AI_CARDS.conditions} />,
    },
    { title: "Tests mentioned", icon: Activity, body: <List items={AI_CARDS.tests} /> },
    { title: "Follow-up tasks", icon: Sparkles, body: <List items={AI_CARDS.followups} /> },
    {
      title: "Potential missing info",
      icon: AlertTriangle,
      body: <List items={AI_CARDS.missing} />,
    },
    {
      title: "Suggested sections",
      icon: Sparkles,
      body: (
        <div className="flex flex-wrap gap-1.5">
          {AI_CARDS.suggested.map((s) => (
            <span key={s} className="text-[14px] px-2 py-1 rounded-full bg-primary/10 text-primary">
              {s}
            </span>
          ))}
        </div>
      ),
    },
  ];
  return (
    <aside className="col-span-3 p-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[color-mix(in_oklab,var(--color-background)_50%,var(--color-surface))]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <div className="text-[14px] font-medium">AI Clinical Assistant</div>
        {active && (
          <span className="ml-auto text-[14px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            Live
          </span>
        )}
      </div>
      <div className="space-y-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="rounded-2xl bg-card hairline p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <div className="text-[12px] uppercase tracking-wider text-muted-foreground">
                  {c.title}
                </div>
              </div>
              {c.body}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[14px] text-muted-foreground leading-relaxed">
        Rhea summarizes conversation. It does not provide diagnoses or clinical decisions.
      </p>
    </aside>
  );
}

function List({ items }: { items: string[] }) {
  if (items.length === 0)
    return <p className="text-[14px] text-muted-foreground">None mentioned.</p>;
  return (
    <ul className="space-y-1">
      {items.map((i) => (
        <li key={i} className="text-[14px] text-foreground/90 flex gap-2">
          <span className="text-muted-foreground">·</span>
          {i}
        </li>
      ))}
    </ul>
  );
}

/* -------- Documentation tab -------- */

const DEFAULT_SOAP: Record<"S" | "O" | "A" | "P", string> = {
  S: "42 y/o F with stable angina, follow-up. Reports exertional chest tightness improving on metoprolol 50 mg BID. No angina at rest this week. Occasional palpitations post-caffeine. No lightheadedness or dyspnea.",
  O: "Vitals: BP 128/82, HR 74, SpO₂ 98%, T 36.8°C. General: well-appearing, in no acute distress. Cardiac: regular rate and rhythm, no murmurs or gallops. Lungs: clear bilaterally. Home BP log averages 128/82 mm Hg.",
  A: "1) Stable angina - improving on current therapy.\n2) Essential hypertension - well controlled.\n3) Hyperlipidemia - pending repeat lipid panel.",
  P: "Continue metoprolol 50 mg BID and atorvastatin 20 mg QHS. Repeat lipid panel in 6 weeks. Return to clinic in 3 months or sooner if symptoms worsen. Patient education on caffeine and palpitations. Escalate to cardiology if angina at rest develops.",
};

function Documentation({
  appt,
  phase,
  docStatus,
  setDocStatus,
  onSaved,
}: {
  appt: (typeof APPOINTMENTS)[number];
  phase: Phase;
  docStatus: DocStatus;
  setDocStatus: (s: DocStatus) => void;
  onSaved: () => void;
}) {
  const [noteTab, setNoteTab] = useState<
    "note" | "referral" | "discharge" | "billing" | "prescription"
  >("note");
  const [format, setFormat] = useState<NoteFormat>("soap");
  const [defaultFormat, setDefaultFormat] = useState<NoteFormat>("soap");
  useEffect(() => {
    const def = loadDefaultNoteFormat();
    setDefaultFormat(def);
    setFormat(loadEncounterFormat(appt.id) ?? def);
  }, [appt.id]);
  const changeFormat = (f: NoteFormat) => {
    setFormat(f);
    saveEncounterFormat(appt.id, f);
  };
  const draft = phase !== "review" && phase !== "idle";
  const storageKey = `rhea.soap.${appt.id}`;
  const [soap, setSoap] = useState<typeof DEFAULT_SOAP>(() => {
    if (typeof window === "undefined") return DEFAULT_SOAP;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) return { ...DEFAULT_SOAP, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return DEFAULT_SOAP;
  });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("saved");
  const [toast, setToast] = useState<string | null>(null);
  const saveTimer = useRef<number | null>(null);

  // Autosave whenever SOAP changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSaveState("saving");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(soap));
      } catch {
        /* ignore */
      }
      setSaveState("saved");
      onSaved();
    }, 500);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soap]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const created = new Date();
  const createdLabel = created.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const updatedLabel = saveState === "saving" ? "Saving…" : "Just now";

  // Encounter context handed to the billing/prescription generators. Only
  // information actually present in this encounter is passed through.
  const encounterContext: EncounterContext = useMemo(
    () => ({
      encounterId: appt.id,
      dateOfService: createdLabel,
      time: appt.time,
      duration: appt.duration,
      encounterType: appt.reason.toLowerCase().includes("new patient")
        ? "New patient office visit"
        : "Established patient office visit",
      reason: appt.reason,
      room: appt.room,
      clinician: CLINICIAN.name,
      clinicianCredentials: CLINICIAN.role,
      patient: {
        name: appt.patient.name,
        age: appt.patient.age,
        sex: appt.patient.sex === "F" ? "Female" : "Male",
        mrn: appt.patient.mrn,
      },
      diagnoses: AI_CARDS.conditions,
      procedures: AI_CARDS.procedures,
      medications: AI_CARDS.medications,
      findings: soap.O,
      plan: soap.P,
    }),
    [appt, createdLabel, soap.O, soap.P],
  );

  return (
    <div className="max-w-5xl mx-auto w-full px-12 py-14">
      {/* Header */}
      <div className="mb-8">
        <div className="text-[12px] uppercase tracking-[0.12em] font-semibold text-muted-foreground/80">
          Generated documentation
        </div>
        <div className="flex items-start justify-between gap-6 mt-1">
          <div>
            <h2 className="h-display text-[32px] font-semibold tracking-[-0.02em]">
              {appt.patient.name} · {appt.reason}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-muted-foreground">
              <span>
                {appt.patient.age} · {appt.patient.sex === "F" ? "Female" : "Male"} ·{" "}
                {appt.patient.mrn}
              </span>
              <span>
                Visit: {appt.time} · {appt.room}
              </span>
              <span>Type: {NOTE_FORMATS.find((f) => f.value === format)?.label}</span>
              <span>Created {createdLabel}</span>
              <span>Updated {updatedLabel}</span>
            </div>
          </div>
          <span
            className={`shrink-0 text-[12px] uppercase tracking-wider px-2.5 py-1 rounded-full ${DOC_STATUS_TONE[docStatus]}`}
          >
            {DOC_STATUS_LABEL[docStatus]}
          </span>
        </div>
      </div>

      {/* Action bar — two clear groups, wraps cleanly */}
      <div className="mb-6 rounded-2xl bg-card hairline p-3 flex flex-wrap items-center gap-2">
        <ActionBtn icon={RefreshCw} onClick={() => flash("Regenerating note…")}>
          Regenerate
        </ActionBtn>
        <ActionBtn icon={Save} onClick={() => flash("Draft saved")}>
          Save draft
        </ActionBtn>
        <ActionBtn icon={FileDown} onClick={() => flash("Exported to PDF")}>
          Export
        </ActionBtn>
        <ActionBtn icon={Printer} onClick={() => window.print()}>
          Print
        </ActionBtn>
        <ActionBtn icon={Send} onClick={() => flash("Sent to EHR")}>
          Send to EHR
        </ActionBtn>
        <div className="flex-1" />
        <button
          onClick={() => {
            setDocStatus("signed");
            flash("Note approved and signed");
          }}
          className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] hover:opacity-90 transition inline-flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Approve &amp; sign
        </button>
      </div>

      {/* Note type tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-6">
        {[
          ["note", NOTE_FORMAT_LABEL[format]],
          ["referral", "Referral letter"],
          ["discharge", "Discharge summary"],
          ["billing", "Billing"],
          ["prescription", "Prescription"],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setNoteTab(k as typeof noteTab)}
            className={`text-[14px] px-3 h-9 -mb-px border-b-2 transition ${
              noteTab === k
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {noteTab === "note" && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-muted-foreground mr-1">Format for this encounter</span>
          {NOTE_FORMATS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => changeFormat(f.value)}
              className={`h-8 px-3 rounded-full text-[13px] transition hairline ${
                format === f.value
                  ? "border-primary bg-primary/5 text-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
              {f.value === defaultFormat && (
                <span className="ml-1 text-[12px] text-muted-foreground">(default)</span>
              )}
            </button>
          ))}
        </div>
      )}

      {noteTab === "note" && format === "soap" ? (
        <div className="space-y-3">
          {(["S", "O", "A", "P"] as const).map((letter) => (
            <SoapEditor
              key={letter}
              letter={letter}
              title={{ S: "Subjective", O: "Objective", A: "Assessment", P: "Plan" }[letter]}
              value={soap[letter]}
              onChange={(v) => setSoap((prev) => ({ ...prev, [letter]: v }))}
            />
          ))}
          <div className="text-[14px] text-muted-foreground flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${saveState === "saved" ? "bg-[var(--color-success)]" : "bg-primary animate-pulse"}`}
            />
            {saveState === "saved" ? "All edits auto-saved" : "Auto-saving edits…"}
            {draft && <span>· drafted from live transcript</span>}
          </div>
        </div>
      ) : noteTab === "note" ? (
        <FormattedNote
          key={format}
          format={format as Exclude<NoteFormat, "soap">}
          encounterId={appt.id}
          soap={soap}
        />
      ) : noteTab === "billing" || noteTab === "prescription" ? (
        <ClinicalOutputPanel
          kind={noteTab}
          ctx={encounterContext}
          actor={CLINICIAN.name}
          onNotify={flash}
        />
      ) : (
        <GeneratedLetter
          key={noteTab}
          kind={noteTab}
          ctx={encounterContext}
          soap={soap}
          onNotify={flash}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-40 rounded-xl bg-foreground text-background px-4 py-3 text-[14px] shadow-[var(--shadow-clinik-lg)]">
          {toast}
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  children,
  onClick,
}: {
  icon: LucideIcon;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 px-4 rounded-full hairline bg-card text-[14px] text-foreground hover:bg-muted transition inline-flex items-center gap-1.5"
    >
      <Icon className="w-3.5 h-3.5" /> {children}
    </button>
  );
}

function SoapEditor({
  letter,
  title,
  value,
  onChange,
}: {
  letter: string;
  title: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl bg-card hairline p-6 hover:shadow-[var(--shadow-clinik)] transition">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary text-[14px] font-semibold flex items-center justify-center">
          {letter}
        </span>
        <div className="text-[14px] font-medium">{title}</div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.max(3, value.split("\n").length + 1)}
        className="w-full resize-y bg-transparent text-[14px] leading-relaxed text-foreground/90 outline-none focus:ring-0 whitespace-pre-wrap"
      />
    </div>
  );
}

/* -------- History tab -------- */
function HistoryTab({ patientName }: { patientName: string }) {
  return (
    <div className="max-w-3xl mx-auto w-full px-12 py-14">
      <div className="text-[12px] uppercase tracking-[0.12em] font-semibold text-muted-foreground/80">
        Patient history
      </div>
      <h2 className="h-display text-[32px] font-semibold tracking-[-0.02em] mt-2 mb-2">
        Previous visits
      </h2>
      <p className="text-[15px] leading-relaxed text-muted-foreground mb-8">
        {patientName}'s timeline of visits, notes, and previous providers.
      </p>
      <ol className="relative border-l border-border/70 ml-3 space-y-4">
        {HISTORY.map((h, i) => (
          <li key={i} className="pl-6 relative">
            <span className="absolute -left-[6px] top-5 w-3 h-3 rounded-full bg-border border-2 border-background" />
            <details className="rounded-2xl bg-card hairline p-6 group">
              <summary className="flex items-center gap-4 cursor-pointer list-none">
                <div className="w-24 text-[14px] text-muted-foreground">{h.date}</div>
                <div className="flex-1">
                  <div className="text-[14px] font-medium">{h.reason}</div>
                  <div className="text-[14px] text-muted-foreground">
                    {h.provider} · {h.summary}
                  </div>
                </div>
                <span className="text-[14px] text-muted-foreground group-open:hidden">Expand</span>
              </summary>
              <div className="mt-4 grid grid-cols-3 gap-3 text-[14px]">
                <div className="rounded-xl bg-muted/60 p-3">
                  <div className="text-[12px] uppercase tracking-wider text-muted-foreground mb-1">
                    Notes
                  </div>
                  Signed SOAP note
                </div>
                <div className="rounded-xl bg-muted/60 p-3">
                  <div className="text-[12px] uppercase tracking-wider text-muted-foreground mb-1">
                    Labs
                  </div>
                  Lipid panel
                </div>
                <div className="rounded-xl bg-muted/60 p-3">
                  <div className="text-[12px] uppercase tracking-wider text-muted-foreground mb-1">
                    Meds
                  </div>
                  No changes
                </div>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
