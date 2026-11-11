/** Primary visit-note formats a clinician can pick as their default. */
export type NoteFormat = "soap" | "problem" | "focused" | "narrative";

export const NOTE_FORMATS: { value: NoteFormat; label: string; description: string }[] = [
  {
    value: "soap",
    label: "SOAP",
    description: "Standard structured documentation for general primary-care encounters.",
  },
  {
    value: "problem",
    label: "Problem-Oriented",
    description:
      "Problem-oriented documentation for chronic disease management and encounters involving multiple active conditions.",
  },
  {
    value: "focused",
    label: "Focused",
    description: "Concise documentation for single-issue or acute encounters.",
  },
  {
    value: "narrative",
    label: "Narrative",
    description: "A flowing prose account of the clinical encounter.",
  },
];

export const NOTE_FORMAT_LABEL: Record<NoteFormat, string> = {
  soap: "SOAP note",
  problem: "Problem-Oriented note",
  focused: "Focused note",
  narrative: "Narrative note",
};

export function isNoteFormat(v: unknown): v is NoteFormat {
  return v === "soap" || v === "problem" || v === "focused" || v === "narrative";
}

const PREFS_KEY = "rhea.documentation.prefs";

/** Saved default format; SOAP when nothing valid is stored. */
export function loadDefaultNoteFormat(): NoteFormat {
  if (typeof window === "undefined") return "soap";
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    const t = raw ? (JSON.parse(raw) as { template?: unknown }).template : undefined;
    return isNoteFormat(t) ? t : "soap";
  } catch {
    return "soap";
  }
}

/** Per-encounter override; never touches the saved default. */
export function loadEncounterFormat(encounterId: string): NoteFormat | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(`rhea.format.${encounterId}`);
  return isNoteFormat(v) ? v : null;
}

export function saveEncounterFormat(encounterId: string, format: NoteFormat): void {
  try {
    window.localStorage.setItem(`rhea.format.${encounterId}`, format);
  } catch {
    /* ignore */
  }
}
