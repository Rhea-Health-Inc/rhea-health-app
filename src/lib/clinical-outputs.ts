// Billing and Prescription are AI-assisted clinical outputs generated from an
// encounter. Both follow the same clinician-controlled workflow:
//
//   Generate draft -> Clinician review -> Edit -> Approve -> Finalize
//
// AI may extract, structure and suggest. It never finalizes, signs, submits a
// claim, or sends a prescription to a pharmacy. Every field records whether it
// was AI-generated or clinician-confirmed, and every transition is audited.

export type OutputKind = "billing" | "prescription";

export type OutputStatus = "draft" | "ai-generated" | "under-review" | "approved" | "finalized";

export const OUTPUT_STATUS_LABEL: Record<OutputStatus, string> = {
  draft: "Draft",
  "ai-generated": "AI generated",
  "under-review": "Under review",
  approved: "Approved",
  finalized: "Finalized",
};

export const OUTPUT_STATUS_TONE: Record<OutputStatus, string> = {
  draft: "bg-muted text-foreground",
  "ai-generated": "bg-primary/10 text-primary",
  "under-review": "bg-primary/10 text-primary",
  approved:
    "bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[var(--color-success)]",
  finalized:
    "bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[var(--color-success)]",
};

/** Where a field's current value came from. */
export type FieldSource = "ai" | "clinician" | "record" | "missing";

export const FIELD_SOURCE_LABEL: Record<FieldSource, string> = {
  ai: "AI suggested",
  clinician: "Clinician confirmed",
  record: "From record",
  missing: "Information required",
};

export const FIELD_SOURCE_TONE: Record<FieldSource, string> = {
  ai: "bg-primary/10 text-primary",
  clinician:
    "bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[var(--color-success)]",
  record: "bg-muted text-muted-foreground",
  missing: "bg-[color-mix(in_oklab,var(--color-destructive)_12%,transparent)] text-destructive",
};

export interface OutputField {
  id: string;
  section: string;
  label: string;
  value: string;
  source: FieldSource;
  /** Approval is blocked while a required field is empty. */
  required?: boolean;
  hint?: string;
  multiline?: boolean;
  /** Clinician removed this field as not applicable. */
  removed?: boolean;
}

export type AuditAction =
  | "Generated"
  | "Regenerated"
  | "Edited"
  | "Reviewed"
  | "Approved"
  | "Finalized"
  | "Signature applied"
  | "Reopened";

export interface AuditEntry {
  action: AuditAction;
  actor: string;
  at: string; // ISO timestamp
  detail?: string;
}

export interface ClinicalOutput {
  kind: OutputKind;
  encounterId: string;
  status: OutputStatus;
  fields: OutputField[];
  audit: AuditEntry[];
  /** True when clinician edits changed AI-generated content before approval. */
  aiContentModified: boolean;
  signatureApplied: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export interface EncounterContext {
  encounterId: string;
  dateOfService: string;
  time: string;
  duration: string;
  encounterType: string;
  reason: string;
  room: string;
  clinician: string;
  clinicianCredentials: string;
  patient: { name: string; age: number; sex: string; mrn: string };
  diagnoses: string[];
  procedures: string[];
  medications: string[];
  findings: string;
  plan: string;
}

/** Billing/prescription configuration held in Documentation settings. */
export interface OutputPrefs {
  billingEnabled: boolean;
  billingAuto: boolean;
  billingFormat: string;
  codingSystem: string;
  billingScope: "clinician" | "practice" | "organization";
  providerNpi: string;
  billingContact: string;
  prescriptionEnabled: boolean;
  prescriptionAuto: boolean;
  prescriptionFormat: string;
  prescriptionRequireSignature: boolean;
  prescriptionFooter: string;
  defaultPharmacy: string;
  /** Shared with the Digital signature section of Documentation settings. */
  signature: string | null;
}

export const OUTPUT_PREF_DEFAULTS: OutputPrefs = {
  billingEnabled: true,
  billingAuto: false,
  billingFormat: "itemized",
  codingSystem: "icd10-cpt",
  billingScope: "practice",
  providerNpi: "",
  billingContact: "",
  prescriptionEnabled: true,
  prescriptionAuto: false,
  prescriptionFormat: "standard",
  prescriptionRequireSignature: true,
  prescriptionFooter:
    "This prescription is issued following clinician review. Not valid without clinician signature.",
  defaultPharmacy: "",
  signature: null,
};

export const CODING_SYSTEMS = [
  { value: "icd10-cpt", label: "ICD-10-CM + CPT" },
  { value: "icd10-hcpcs", label: "ICD-10-CM + HCPCS" },
  { value: "icd10-only", label: "ICD-10-CM only" },
  { value: "snomed", label: "SNOMED CT" },
  { value: "none", label: "No coding suggestions" },
];

export const BILLING_FORMATS = [
  { value: "itemized", label: "Itemized statement" },
  { value: "summary", label: "Summary charge sheet" },
  { value: "claim", label: "Claim-style worksheet" },
];

export const PRESCRIPTION_FORMATS = [
  { value: "standard", label: "Standard prescription" },
  { value: "detailed", label: "Detailed with counselling notes" },
  { value: "compact", label: "Compact single-medication" },
];

const now = () => new Date().toISOString();

function entry(action: AuditAction, actor: string, detail?: string): AuditEntry {
  return { action, actor, at: now(), detail };
}

/** Best-effort split of a free-text medication line from the encounter. */
function parseMedication(line: string | undefined) {
  if (!line) return { name: "", strength: "", frequency: "" };
  const clean = line.replace(/\(.*?\)/g, "").trim();
  const strength = clean.match(/\d+(\.\d+)?\s?(mg|mcg|g|ml|units?)/i)?.[0] ?? "";
  const frequency = clean.match(/\b(OD|BID|TID|QID|QHS|PRN|daily|nightly|weekly)\b/i)?.[0] ?? "";
  const name = clean.split(/\s+/)[0] ?? "";
  return { name, strength, frequency };
}

export function buildBillingDraft(ctx: EncounterContext, prefs: OutputPrefs): ClinicalOutput {
  const coding = CODING_SYSTEMS.find((c) => c.value === prefs.codingSystem)?.label ?? "";
  const fields: OutputField[] = [
    {
      id: "dos",
      section: "Encounter",
      label: "Date of service",
      value: ctx.dateOfService,
      source: "record",
      required: true,
    },
    {
      id: "patient",
      section: "Encounter",
      label: "Patient",
      value: `${ctx.patient.name} · ${ctx.patient.mrn}`,
      source: "record",
      required: true,
    },
    {
      id: "clinician",
      section: "Encounter",
      label: "Rendering clinician",
      value: [ctx.clinician, ctx.clinicianCredentials].filter(Boolean).join(", "),
      source: "record",
      required: true,
    },
    {
      id: "npi",
      section: "Encounter",
      label: "Provider identifier (NPI)",
      value: prefs.providerNpi,
      source: prefs.providerNpi ? "record" : "missing",
      hint: "Configured in Settings → Documentation → Billing.",
    },
    {
      id: "type",
      section: "Encounter",
      label: "Encounter type",
      value: ctx.encounterType,
      source: "ai",
      required: true,
    },
    {
      id: "reason",
      section: "Encounter",
      label: "Reason for visit",
      value: ctx.reason,
      source: "record",
      required: true,
    },
    {
      id: "duration",
      section: "Encounter",
      label: "Documented duration",
      value: ctx.duration,
      source: ctx.duration ? "record" : "missing",
    },
    {
      id: "dx",
      section: "Clinical",
      label: "Diagnoses",
      value: ctx.diagnoses.join("\n"),
      source: ctx.diagnoses.length ? "ai" : "missing",
      required: true,
      multiline: true,
    },
    {
      id: "procedures",
      section: "Clinical",
      label: "Procedures / services performed",
      value: ctx.procedures.join("\n"),
      source: ctx.procedures.length ? "ai" : "missing",
      hint: ctx.procedures.length
        ? undefined
        : "No procedure was documented in this encounter. Add one if a service was performed.",
      multiline: true,
    },
    {
      id: "findings",
      section: "Clinical",
      label: "Relevant clinical findings",
      value: ctx.findings,
      source: ctx.findings ? "ai" : "missing",
      multiline: true,
    },
    {
      id: "support",
      section: "Clinical",
      label: "Supporting documentation",
      value: "Encounter note for this visit",
      source: "record",
    },
    {
      id: "codes",
      section: "Coding",
      label: "Suggested diagnosis codes",
      value: prefs.codingSystem === "none" ? "" : suggestDxCodes(ctx.diagnoses).join("\n"),
      source: prefs.codingSystem === "none" ? "missing" : "ai",
      hint: "AI-suggested only. Verify against the documented encounter before approval.",
      multiline: true,
    },
    {
      id: "service-code",
      section: "Coding",
      label: "Suggested service code",
      value:
        prefs.codingSystem === "none"
          ? ""
          : "Office/outpatient visit, established patient - level to be confirmed",
      source: prefs.codingSystem === "none" ? "missing" : "ai",
      hint: "Level of service must be confirmed by the clinician.",
    },
    {
      id: "coding-system",
      section: "Coding",
      label: "Coding system",
      value: coding,
      source: "record",
    },
    {
      id: "notes",
      section: "Notes",
      label: "Notes relevant to billing",
      value: "",
      source: "clinician",
      multiline: true,
    },
  ];

  return {
    kind: "billing",
    encounterId: ctx.encounterId,
    status: "ai-generated",
    fields,
    audit: [entry("Generated", "Rhea AI", "Billing draft prepared from encounter context")],
    aiContentModified: false,
    signatureApplied: false,
  };
}

function suggestDxCodes(diagnoses: string[]): string[] {
  const map: Record<string, string> = {
    angina: "I20.9 - Angina pectoris, unspecified",
    hypertension: "I10 - Essential (primary) hypertension",
    hyperlipidemia: "E78.5 - Hyperlipidemia, unspecified",
    fatigue: "R53.83 - Other fatigue",
  };
  return diagnoses.map((d) => {
    const hit = Object.keys(map).find((k) => d.toLowerCase().includes(k));
    return hit ? `${map[hit]} (suggested for "${d}")` : `Code required for "${d}"`;
  });
}

export function buildPrescriptionDraft(ctx: EncounterContext, prefs: OutputPrefs): ClinicalOutput {
  const med = parseMedication(ctx.medications[0]);
  const supported = Boolean(med.name);
  const fields: OutputField[] = [
    {
      id: "patient",
      section: "Patient",
      label: "Patient",
      value: `${ctx.patient.name} · ${ctx.patient.age} · ${ctx.patient.mrn}`,
      source: "record",
      required: true,
    },
    {
      id: "prescriber",
      section: "Prescriber",
      label: "Prescriber",
      value: [ctx.clinician, ctx.clinicianCredentials].filter(Boolean).join(", "),
      source: "record",
      required: true,
    },
    {
      id: "date",
      section: "Prescriber",
      label: "Date written",
      value: ctx.dateOfService,
      source: "record",
      required: true,
    },
    {
      id: "medication",
      section: "Medication",
      label: "Medication",
      value: med.name,
      source: supported ? "ai" : "missing",
      required: true,
      hint: supported
        ? "Extracted from the encounter. Confirm before approval."
        : "No medication was documented in this encounter. Clinician input is required.",
    },
    {
      id: "strength",
      section: "Medication",
      label: "Strength",
      value: med.strength,
      source: med.strength ? "ai" : "missing",
      required: true,
      hint: med.strength ? undefined : "Clinician input required.",
    },
    {
      id: "dosage",
      section: "Medication",
      label: "Dosage",
      value: "",
      source: "missing",
      required: true,
      hint: "Clinician input required - not inferred by Rhea.",
    },
    {
      id: "route",
      section: "Medication",
      label: "Route",
      value: "",
      source: "missing",
      required: true,
      hint: "Clinician input required - not inferred by Rhea.",
    },
    {
      id: "frequency",
      section: "Medication",
      label: "Frequency",
      value: med.frequency,
      source: med.frequency ? "ai" : "missing",
      required: true,
      hint: med.frequency ? undefined : "Clinician input required.",
    },
    {
      id: "duration",
      section: "Medication",
      label: "Duration",
      value: "",
      source: "missing",
      required: true,
      hint: "Clinician input required - not inferred by Rhea.",
    },
    {
      id: "quantity",
      section: "Medication",
      label: "Quantity",
      value: "",
      source: "missing",
      required: true,
      hint: "Clinician input required - not inferred by Rhea.",
    },
    {
      id: "refills",
      section: "Medication",
      label: "Refills",
      value: "",
      source: "missing",
      required: true,
      hint: "Clinician input required - no default applied.",
    },
    {
      id: "instructions",
      section: "Instructions",
      label: "Instructions to patient",
      value: "",
      source: "missing",
      required: true,
      multiline: true,
      hint: "Clinician input required.",
    },
    {
      id: "notes",
      section: "Instructions",
      label: "Clinical notes",
      value: ctx.plan ? `Plan from encounter: ${ctx.plan}` : "",
      source: ctx.plan ? "ai" : "clinician",
      multiline: true,
    },
    {
      id: "pharmacy",
      section: "Instructions",
      label: "Pharmacy",
      value: prefs.defaultPharmacy,
      source: prefs.defaultPharmacy ? "record" : "missing",
      hint: "Optional. Configured in Settings → Documentation → Prescription.",
    },
  ];

  return {
    kind: "prescription",
    encounterId: ctx.encounterId,
    status: "ai-generated",
    fields,
    audit: [
      entry(
        "Generated",
        "Rhea AI",
        supported
          ? "Prescription draft prepared from documented medication. Clinical details require clinician input."
          : "Prescription shell prepared. No medication documented - clinician input required.",
      ),
    ],
    aiContentModified: false,
    signatureApplied: false,
  };
}

export function buildDraft(
  kind: OutputKind,
  ctx: EncounterContext,
  prefs: OutputPrefs,
): ClinicalOutput {
  return kind === "billing" ? buildBillingDraft(ctx, prefs) : buildPrescriptionDraft(ctx, prefs);
}

export function sections(output: ClinicalOutput): string[] {
  return [...new Set(output.fields.map((f) => f.section))];
}

/** Required fields still missing a value. Approval is blocked while non-empty. */
export function missingRequired(output: ClinicalOutput): OutputField[] {
  return output.fields.filter((f) => !f.removed && f.required && !f.value.trim());
}

export function appendAudit(
  output: ClinicalOutput,
  action: AuditAction,
  actor: string,
  detail?: string,
): ClinicalOutput {
  return { ...output, audit: [...output.audit, entry(action, actor, detail)] };
}

export function formatAuditTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function storageKeyFor(kind: OutputKind, encounterId: string): string {
  return `rhea.output.${kind}.${encounterId}`;
}

export function loadOutput(kind: OutputKind, encounterId: string): ClinicalOutput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKeyFor(kind, encounterId));
    return raw ? (JSON.parse(raw) as ClinicalOutput) : null;
  } catch {
    return null;
  }
}

export function saveOutput(output: ClinicalOutput): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKeyFor(output.kind, output.encounterId),
      JSON.stringify(output),
    );
  } catch {
    /* ignore */
  }
}

/** Plain-text export of a finalized or in-review output. */
export function outputToText(output: ClinicalOutput, prefs: OutputPrefs): string {
  const header = output.kind === "billing" ? "BILLING DRAFT" : "PRESCRIPTION";
  const lines = sections(output).flatMap((s) => [
    `\n${s.toUpperCase()}`,
    ...output.fields
      .filter((f) => f.section === s && !f.removed)
      .map((f) => `  ${f.label}: ${f.value.trim() || "[information required]"}`),
  ]);
  const footer =
    output.kind === "prescription" && prefs.prescriptionFooter
      ? `\n\n${prefs.prescriptionFooter}`
      : "";
  const signature = output.signatureApplied ? "\n\nDigital signature applied." : "";
  return `${header} - ${OUTPUT_STATUS_LABEL[output.status]}${lines.join("\n")}${signature}${footer}`;
}
