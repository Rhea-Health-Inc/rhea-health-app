import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Upload, Pen, Trash2 } from "lucide-react";
import { SettingsHeader, Section, Toggle, Select } from "@/components/clinik/SettingsUI";
import {
  BILLING_FORMATS,
  CODING_SYSTEMS,
  OUTPUT_PREF_DEFAULTS,
  PRESCRIPTION_FORMATS,
  type OutputPrefs,
} from "@/lib/clinical-outputs";
import { NOTE_FORMATS, isNoteFormat, type NoteFormat } from "@/lib/note-formats";

export const Route = createFileRoute("/app/settings/ai-documentation")({
  component: AIDocumentationSettings,
});

type Template = NoteFormat | "custom";

type Prefs = {
  template: Template;
  style: "concise" | "balanced" | "detailed";
  language: "standard" | "expanded" | "patient";
  assistance: number; // 0-2
  auto: Record<string, boolean>;
  requireApproval: boolean;
  signature: string | null; // data URL
  signOff: string;
  includeCredentials: boolean;
  credentials: string;
  referralTemplate: string;
  consultTemplate: string;
} & OutputPrefs;

const STORAGE_KEY = "rhea.documentation.prefs";

const AUTO_ITEMS: { id: string; label: string; description: string }[] = [
  {
    id: "generate",
    label: "Auto-generate notes after recording",
    description: "Rhea drafts the note as soon as a recording ends.",
  },
  {
    id: "save",
    label: "Auto-save drafts",
    description: "Drafts are saved continuously while you edit.",
  },
  {
    id: "summary",
    label: "Auto-generate visit summary",
    description: "Produce a short encounter summary alongside the note.",
  },
  {
    id: "tasks",
    label: "Auto-suggest follow-up tasks",
    description: "Surface orders, referrals, and recalls mentioned in the visit.",
  },
  {
    id: "meds",
    label: "Auto-detect medications",
    description: "Extract medication names, doses, and changes.",
  },
  {
    id: "dx",
    label: "Auto-detect diagnoses",
    description: "Identify diagnoses and map them to problem list entries.",
  },
  {
    id: "procedures",
    label: "Auto-detect procedures",
    description: "Capture procedures performed during the encounter.",
  },
  {
    id: "missing",
    label: "Auto-highlight missing documentation",
    description: "Flag sections that look incomplete before signing.",
  },
  {
    id: "formatting",
    label: "Auto formatting",
    description: "Automatically format notes before they are presented for clinician review.",
  },
  {
    id: "speakers",
    label: "Speaker identification",
    description:
      "Distinguish clinician from patient throughout the recording and attribute dialogue correctly in generated documentation.",
  },
];

const DEFAULTS: Prefs = {
  ...OUTPUT_PREF_DEFAULTS,
  template: "soap",
  style: "balanced",
  language: "standard",
  assistance: 1,
  auto: {
    generate: true,
    save: true,
    summary: true,
    tasks: true,
    meds: true,
    dx: true,
    procedures: false,
    missing: true,
    formatting: true,
    speakers: true,
  },
  requireApproval: true,
  signature: null,
  signOff: "Electronically signed by Dr. Jane Smith, MD",
  includeCredentials: true,
  credentials: "MD, MRCGP",
  referralTemplate: "standard",
  consultTemplate: "structured",
};

const REFERRAL_TEMPLATES = [
  { value: "standard", label: "Standard Referral Letter" },
  { value: "urgent", label: "Urgent Referral" },
  { value: "specialist", label: "Specialist Referral (detailed)" },
  { value: "brief", label: "Brief Referral Note" },
];

const CONSULT_TEMPLATES = [
  { value: "structured", label: "Structured Consultation" },
  { value: "narrative", label: "Narrative Consultation" },
  { value: "followup", label: "Follow-up Consultation" },
  { value: "opinion", label: "Specialist Opinion" },
];

const TEMPLATES: { value: Template; label: string; description: string; disabled?: boolean }[] = [
  ...NOTE_FORMATS,
  {
    value: "custom",
    label: "Custom Template",
    description: "Coming soon - build your own structure.",
    disabled: true,
  },
];

const ASSIST_LABEL = ["Minimal assistance", "Balanced", "Maximum assistance"];
const ASSIST_HELP = [
  "Rhea stays close to the original conversation, using the clinician's own phrasing with minimal restructuring.",
  "Rhea lightly organises the conversation into the chosen template while preserving your wording.",
  "Rhea infers formatting and organisation, expands shorthand, and structures the note fully on your behalf.",
];

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      ...DEFAULTS,
      ...parsed,
      template: isNoteFormat(parsed.template) ? parsed.template : "soap",
      auto: { ...DEFAULTS.auto, ...(parsed.auto ?? {}) },
    };
  } catch {
    return DEFAULTS;
  }
}

function AIDocumentationSettings() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [saved, setSaved] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    const stored = loadPrefs();
    setPrefs(stored);
    setSaved(stored);
  }, []);

  const dirty = JSON.stringify(prefs) !== JSON.stringify(saved);
  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs((p) => ({ ...p, [k]: v }));

  const preview = useMemo(() => buildPreview(prefs), [prefs]);

  const persist = (next: Prefs) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setSaved(next);
  };

  return (
    <div className="max-w-4xl mx-auto px-12 py-14">
      <SettingsHeader
        title="Documentation"
        description="Control how Rhea AI drafts documentation from your recorded encounters. Changes apply to every new note."
      />

      <Section
        title="Default documentation format"
        description="The primary note Rhea drafts for new encounters. You can still switch format for an individual visit."
      >
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {TEMPLATES.map((t) => {
            const active = prefs.template === t.value;
            return (
              <button
                key={t.value}
                disabled={t.disabled}
                onClick={() => set("template", t.value)}
                className={`text-left rounded-xl p-4 transition hairline ${
                  t.disabled
                    ? "opacity-55 cursor-not-allowed bg-card"
                    : active
                      ? "border-primary bg-primary/5"
                      : "bg-card hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-full border ${active ? "border-primary bg-primary" : "border-border"}`}
                  />
                  <span className="text-[14px] font-medium">{t.label}</span>
                </div>
                <div className="text-[14px] text-muted-foreground mt-1.5">{t.description}</div>
              </button>
            );
          })}
        </div>
      </Section>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-4">
        <div className="rounded-2xl bg-card hairline p-8">
          <h2 className="text-[15px] font-medium mb-1">Documentation style</h2>
          <p className="text-[14px] text-muted-foreground mb-4">
            How much detail Rhea includes in each section.
          </p>
          <Select
            value={prefs.style}
            onChange={(v) => set("style", v as Prefs["style"])}
            options={[
              { value: "concise", label: "Concise" },
              { value: "balanced", label: "Balanced" },
              { value: "detailed", label: "Detailed" },
            ]}
          />
        </div>
        <div className="rounded-2xl bg-card hairline p-8">
          <h2 className="text-[15px] font-medium mb-1">Clinical language</h2>
          <p className="text-[14px] text-muted-foreground mb-4">
            Terminology level used in generated text.
          </p>
          <Select
            value={prefs.language}
            onChange={(v) => set("language", v as Prefs["language"])}
            options={[
              { value: "standard", label: "Standard Clinical" },
              { value: "expanded", label: "Expanded Clinical" },
              { value: "patient", label: "Patient-Friendly Summaries" },
            ]}
          />
        </div>
      </div>

      <Section
        title="AI assistance"
        description="Higher assistance lets Rhea infer formatting and organisation. Lower assistance keeps the note closer to the original conversation."
      >
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={prefs.assistance}
          onChange={(e) => set("assistance", Number(e.target.value))}
          aria-label="AI assistance level"
          className="w-full accent-[var(--color-primary)]"
        />
        <div className="flex justify-between text-[14px] text-muted-foreground mt-2">
          <span>Minimal</span>
          <span>Balanced</span>
          <span>Maximum</span>
        </div>
        <div className="mt-4 rounded-xl bg-muted p-4">
          <div className="text-[14px] font-medium">{ASSIST_LABEL[prefs.assistance]}</div>
          <div className="text-[14px] text-muted-foreground mt-1">
            {ASSIST_HELP[prefs.assistance]}
          </div>
        </div>
      </Section>

      <Section
        title="Auto behaviors"
        description="What Rhea does automatically around each encounter."
      >
        <div className="divide-y divide-border">
          {AUTO_ITEMS.map((a) => (
            <Toggle
              key={a.id}
              label={a.label}
              description={a.description}
              checked={!!prefs.auto[a.id]}
              onChange={(v) => set("auto", { ...prefs.auto, [a.id]: v })}
            />
          ))}
        </div>
      </Section>

      <Section
        title="Signature workflow"
        description="Controls whether documentation can be finalised without a clinician review step."
      >
        <Toggle
          label="Require manual approval before finalizing documentation"
          description="Notes remain in Needs review until you approve and sign them."
          checked={prefs.requireApproval}
          onChange={(v) => set("requireApproval", v)}
        />
      </Section>

      <DigitalSignature value={prefs.signature} onChange={(v) => set("signature", v)} />

      <Section
        title="Document defaults"
        description="Personalisation applied to finalised documents, letters, and summaries."
      >
        <label className="block mb-4">
          <span className="block text-[14px] text-muted-foreground mb-1.5">Preferred sign-off</span>
          <input
            value={prefs.signOff}
            onChange={(e) => set("signOff", e.target.value)}
            placeholder="Electronically signed by Dr. Jane Smith, MD"
            className="w-full h-11 rounded-xl hairline bg-card px-3.5 text-[14px] outline-none focus:border-primary"
          />
        </label>

        <div className="divide-y divide-border mb-4">
          <Toggle
            label="Include credentials after name"
            description="Automatically append professional credentials to your signature on finalized documentation."
            checked={prefs.includeCredentials}
            onChange={(v) => set("includeCredentials", v)}
          />
        </div>

        {prefs.includeCredentials && (
          <label className="block mb-4">
            <span className="block text-[14px] text-muted-foreground mb-1.5">Credentials</span>
            <input
              value={prefs.credentials}
              onChange={(e) => set("credentials", e.target.value)}
              placeholder="MD, MRCGP"
              className="w-full h-11 rounded-xl hairline bg-card px-3.5 text-[14px] outline-none focus:border-primary"
            />
          </label>
        )}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <Select
            label="Default referral letter template"
            value={prefs.referralTemplate}
            onChange={(v) => set("referralTemplate", v)}
            options={REFERRAL_TEMPLATES}
          />
          <Select
            label="Default consultation template"
            value={prefs.consultTemplate}
            onChange={(v) => set("consultTemplate", v)}
            options={CONSULT_TEMPLATES}
          />
        </div>
      </Section>

      <Section
        title="Billing"
        description="How Rhea prepares billing drafts from an encounter. Suggested codes are always marked as AI-generated and require your review - Rhea never submits a claim or finalizes a charge."
      >
        <div className="divide-y divide-border mb-4">
          <Toggle
            label="Billing output enabled"
            description="Offer Billing as a documentation output on every encounter."
            checked={prefs.billingEnabled}
            onChange={(v) => set("billingEnabled", v)}
          />
          <Toggle
            label="Generate billing draft automatically after documentation"
            description="Prepare the billing draft as soon as the encounter note is ready. The draft still requires clinician review."
            checked={prefs.billingAuto}
            onChange={(v) => set("billingAuto", v)}
          />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-4">
          <Select
            label="Default billing format"
            value={prefs.billingFormat}
            onChange={(v) => set("billingFormat", v)}
            options={BILLING_FORMATS}
          />
          <Select
            label="Default coding system"
            value={prefs.codingSystem}
            onChange={(v) => set("codingSystem", v)}
            options={CODING_SYSTEMS}
          />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <Select
            label="Billing information scope"
            value={prefs.billingScope}
            onChange={(v) => set("billingScope", v as Prefs["billingScope"])}
            options={[
              { value: "clinician", label: "Clinician" },
              { value: "practice", label: "Practice" },
              { value: "organization", label: "Organization" },
            ]}
          />
          <label className="block">
            <span className="block text-[14px] text-muted-foreground mb-1.5">
              Provider identifier (NPI or equivalent)
            </span>
            <input
              value={prefs.providerNpi}
              onChange={(e) => set("providerNpi", e.target.value)}
              placeholder="Not all regions require this"
              className="w-full h-11 rounded-xl hairline bg-card px-3.5 text-[14px] outline-none focus:border-primary"
            />
          </label>
        </div>

        <label className="block mt-4">
          <span className="block text-[14px] text-muted-foreground mb-1.5">Billing contact</span>
          <input
            value={prefs.billingContact}
            onChange={(e) => set("billingContact", e.target.value)}
            placeholder="billing@practice.health"
            className="w-full h-11 rounded-xl hairline bg-card px-3.5 text-[14px] outline-none focus:border-primary"
          />
        </label>

        <p className="text-[14px] text-muted-foreground mt-4 leading-relaxed">
          Provider name, credentials, practice name and address are taken from your profile and
          Practice settings - they are not duplicated here.
        </p>
      </Section>

      <Section
        title="Prescription"
        description="How Rhea assists with prescription drafts. Medication details always come from the encounter or your input - Rhea never applies medication defaults."
      >
        <div className="divide-y divide-border mb-4">
          <Toggle
            label="Prescription output enabled"
            description="Offer Prescription as a documentation output on every encounter."
            checked={prefs.prescriptionEnabled}
            onChange={(v) => set("prescriptionEnabled", v)}
          />
          <Toggle
            label="Generate prescription draft when clinically appropriate"
            description="Prepare a prescription draft when a medication is documented in the encounter."
            checked={prefs.prescriptionAuto}
            onChange={(v) => set("prescriptionAuto", v)}
          />
          <div className="flex items-start justify-between gap-6 py-4">
            <div className="min-w-0">
              <div className="text-[15px] font-medium">
                Require clinician review before finalization
              </div>
              <div className="text-[14px] text-muted-foreground mt-1 leading-relaxed">
                Always on. A prescription can never be finalized without explicit clinician
                approval.
              </div>
            </div>
            <span className="shrink-0 text-[12px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              Always on
            </span>
          </div>
          <Toggle
            label="Require digital signature before finalization"
            description="Applies the signature saved in the Digital signature section above."
            checked={prefs.prescriptionRequireSignature}
            onChange={(v) => set("prescriptionRequireSignature", v)}
          />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <Select
            label="Default prescription format"
            value={prefs.prescriptionFormat}
            onChange={(v) => set("prescriptionFormat", v)}
            options={PRESCRIPTION_FORMATS}
          />
          <label className="block">
            <span className="block text-[14px] text-muted-foreground mb-1.5">
              Default pharmacy (optional)
            </span>
            <input
              value={prefs.defaultPharmacy}
              onChange={(e) => set("defaultPharmacy", e.target.value)}
              placeholder="Leave blank if not applicable"
              className="w-full h-11 rounded-xl hairline bg-card px-3.5 text-[14px] outline-none focus:border-primary"
            />
          </label>
        </div>

        <label className="block mt-4">
          <span className="block text-[14px] text-muted-foreground mb-1.5">
            Prescription footer / standing instructions
          </span>
          <textarea
            value={prefs.prescriptionFooter}
            onChange={(e) => set("prescriptionFooter", e.target.value)}
            rows={3}
            className="w-full resize-y rounded-xl hairline bg-card px-3.5 py-2.5 text-[14px] leading-relaxed outline-none focus:border-primary"
          />
        </label>

        <p className="text-[14px] text-muted-foreground mt-4 leading-relaxed">
          Rhea does not send prescriptions to pharmacies. Finalized prescriptions remain documents
          you can connect to an e-prescribing workflow later.
        </p>
      </Section>

      <Section title="Preview" description="A sample note generated with your current settings.">
        <pre className="rounded-xl bg-muted p-4 text-[14px] leading-relaxed whitespace-pre-wrap font-sans">
          {preview}
        </pre>
        {prefs.signature && (
          <div className="mt-3 rounded-xl bg-muted p-4">
            <div className="text-[14px] text-muted-foreground mb-2">Applied signature</div>
            <img
              src={prefs.signature}
              alt="Saved digital signature"
              className="h-14 object-contain"
            />
          </div>
        )}
      </Section>

      <div className="sticky bottom-4 mt-6 rounded-2xl bg-card hairline shadow-[var(--shadow-clinik)] px-5 py-3 flex items-center gap-3">
        <span className="text-[14px] text-muted-foreground">
          {dirty ? "Unsaved changes" : "All changes saved"}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              setPrefs(DEFAULTS);
              toast.success("Documentation defaults restored");
            }}
            className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restore defaults
          </button>
          <button
            disabled={!dirty}
            onClick={() => {
              persist(prefs);
              toast.success("Documentation preferences saved");
            }}
            className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function DigitalSignature({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirtyCanvas = useRef(false);
  const [mode, setMode] = useState<"upload" | "draw">("upload");

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * c.width,
      y: ((e.clientY - r.top) / r.height) * c.height,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    c.setPointerCapture(e.pointerId);
    const ctx = c.getContext("2d")!;
    const p = point(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1c1c1c";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    drawing.current = true;
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    dirtyCanvas.current = true;
  };

  const end = () => {
    drawing.current = false;
  };

  const clearCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    dirtyCanvas.current = false;
  };

  const onFile = (file: File) => {
    if (!/^image\/(png|jpeg|jpg|svg\+xml)$/.test(file.type)) {
      toast.error("Please upload a PNG, JPG, or SVG file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result));
      toast.success("Signature uploaded");
    };
    reader.readAsDataURL(file);
  };

  return (
    <Section
      title="Digital signature"
      description="Your digital signature is automatically applied when you review and approve clinical documentation, referral letters, discharge summaries, consultation notes, and other finalized documents."
    >
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setMode("upload")}
          className={`h-10 px-5 rounded-full text-[14px] transition inline-flex items-center gap-2 hairline ${
            mode === "upload"
              ? "border-primary bg-primary/5 text-primary"
              : "bg-card hover:bg-muted"
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Upload signature
        </button>
        <button
          onClick={() => setMode("draw")}
          className={`h-10 px-5 rounded-full text-[14px] transition inline-flex items-center gap-2 hairline ${
            mode === "draw" ? "border-primary bg-primary/5 text-primary" : "bg-card hover:bg-muted"
          }`}
        >
          <Pen className="w-3.5 h-3.5" /> Draw signature
        </button>
      </div>

      {mode === "upload" ? (
        <div className="rounded-xl bg-muted p-6 text-center">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
          <p className="text-[14px] text-muted-foreground mb-3">
            PNG, JPG or SVG. Transparent backgrounds work best.
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition"
          >
            {value ? "Replace signature" : "Choose file"}
          </button>
        </div>
      ) : (
        <div>
          <canvas
            ref={canvasRef}
            width={900}
            height={260}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            aria-label="Signature drawing canvas"
            className="w-full h-[160px] rounded-xl bg-background hairline touch-none cursor-crosshair"
          />
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={clearCanvas}
              className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition"
            >
              Clear
            </button>
            <button
              onClick={() => {
                clearCanvas();
                toast.success("Canvas reset - draw your signature again");
              }}
              className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition"
            >
              Redraw
            </button>
            <button
              onClick={() => {
                if (!dirtyCanvas.current) {
                  toast.error("Draw your signature first");
                  return;
                }
                onChange(canvasRef.current!.toDataURL("image/png"));
                toast.success("Signature saved");
              }}
              className="ml-auto h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition"
            >
              Save signature
            </button>
          </div>
        </div>
      )}

      <div className="mt-5">
        <div className="text-[14px] text-muted-foreground mb-2">Signature preview</div>
        <div className="rounded-xl bg-card hairline p-6 flex items-center justify-between gap-4">
          {value ? (
            <img src={value} alt="Saved digital signature" className="h-16 object-contain" />
          ) : (
            <span className="text-[14px] text-muted-foreground">No signature saved yet.</span>
          )}
          {value && (
            <button
              onClick={() => {
                onChange(null);
                toast.success("Signature removed");
              }}
              className="shrink-0 h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center gap-2 text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          )}
        </div>
      </div>
    </Section>
  );
}

function buildPreview(p: Prefs) {
  const patientFriendly = p.language === "patient";
  const expanded = p.language === "expanded";
  const detail = p.style;

  const subjective = patientFriendly
    ? "You came in today because of a cough and mild chest tightness that started about three days ago."
    : expanded
      ? "Patient is a 46-year-old female presenting with a three-day history of non-productive cough associated with intermittent substernal chest tightness, without fever, dyspnoea at rest, or haemoptysis."
      : "46F with 3-day non-productive cough and intermittent chest tightness. No fever or dyspnoea.";

  const objective =
    detail === "concise"
      ? "T 37.1, HR 78, BP 122/78, SpO2 98% RA. Chest clear."
      : "Temp 37.1 C, HR 78, BP 122/78, RR 16, SpO2 98% on room air. Chest clear to auscultation bilaterally, no wheeze or crackles. Cardiovascular exam unremarkable.";

  const assessment = patientFriendly
    ? "This looks like a viral chest infection that should settle on its own."
    : "Likely viral upper respiratory tract infection. Low suspicion for pneumonia or cardiac cause.";

  const plan = [
    "Supportive care, fluids, and rest.",
    p.auto.meds ? "Medication detected: paracetamol 1 g PRN, max 4 g/24h." : null,
    p.auto.dx ? "Diagnosis detected: J06.9 Acute upper respiratory infection." : null,
    p.auto.procedures ? "Procedure detected: none performed this encounter." : null,
    p.auto.tasks ? "Follow-up task suggested: review in 7 days if symptoms persist." : null,
    p.auto.missing ? "Missing documentation: social history not captured." : null,
  ].filter(Boolean) as string[];

  const speakers = p.auto.speakers
    ? '\n\nSPEAKER ATTRIBUTION\nClinician: "How long has the cough been going on?"\nPatient: "About three days now."'
    : "\n\nSPEAKER ATTRIBUTION\nSpeaker identification off - dialogue recorded without attribution.";

  const body =
    p.template === "narrative"
      ? `${subjective} ${objective} ${assessment} Plan: ${plan.join(" ")}`
      : p.template === "problem"
        ? `PROBLEM: Cough, 3 days\n  Status: Active\n  Assessment: ${assessment}\n  Plan:\n${plan.map((l) => `   - ${l}`).join("\n")}`
        : p.template === "focused"
          ? `CHIEF CONCERN\nCough, 3 days.\n\nKEY FINDINGS\n${objective}\n\nIMPRESSION & PLAN\n${assessment}\n${plan.map((l) => `- ${l}`).join("\n")}`
          : `S: ${subjective}\n\nO: ${objective}\n\nA: ${assessment}\n\nP:\n${plan.map((l) => `- ${l}`).join("\n")}`;

  const formatted = p.auto.formatting ? body : body.replace(/\n{2,}/g, "\n");

  const header = `Generated by Rhea - ${ASSIST_LABEL[p.assistance]} - ${detail[0].toUpperCase() + detail.slice(1)} style${
    p.auto.formatting ? " - Auto-formatted for review" : " - Raw formatting"
  }`;
  const footer = p.requireApproval
    ? "\n\nStatus: Needs review - manual approval required before signing."
    : "\n\nStatus: Auto-finalised - no manual approval required.";
  const summary = p.auto.summary
    ? "\n\nVISIT SUMMARY\nViral respiratory infection, supportive care, review in one week."
    : "";

  const referral = REFERRAL_TEMPLATES.find((t) => t.value === p.referralTemplate)?.label ?? "";
  const consult = CONSULT_TEMPLATES.find((t) => t.value === p.consultTemplate)?.label ?? "";
  const signOffLine = `${p.signOff}${p.includeCredentials && p.credentials ? `, ${p.credentials}` : ""}`;
  const signBlock = `\n\nSIGN-OFF\n${signOffLine}${
    p.signature ? "\nDigital signature applied." : "\nNo digital signature saved."
  }`;
  const defaults = `\n\nDOCUMENT DEFAULTS\nReferral letters: ${referral}\nConsultations: ${consult}`;

  return `${header}\n\n${formatted}${summary}${speakers}${signBlock}${defaults}${footer}`;
}
