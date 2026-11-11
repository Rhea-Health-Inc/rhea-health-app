import { useCallback, useEffect, useMemo, useState } from "react";
import {
  OUTPUT_PREF_DEFAULTS,
  appendAudit,
  buildDraft,
  loadOutput,
  saveOutput,
  type ClinicalOutput,
  type EncounterContext,
  type OutputKind,
  type OutputPrefs,
} from "@/lib/clinical-outputs";

const PREFS_KEY = "rhea.documentation.prefs";

/** Billing/prescription configuration lives with the Documentation preferences. */
export function loadOutputPrefs(): OutputPrefs {
  if (typeof window === "undefined") return OUTPUT_PREF_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return OUTPUT_PREF_DEFAULTS;
    return { ...OUTPUT_PREF_DEFAULTS, ...(JSON.parse(raw) as Partial<OutputPrefs>) };
  } catch {
    return OUTPUT_PREF_DEFAULTS;
  }
}

export function useOutputPrefs(): OutputPrefs {
  const [prefs, setPrefs] = useState<OutputPrefs>(OUTPUT_PREF_DEFAULTS);
  useEffect(() => setPrefs(loadOutputPrefs()), []);
  return prefs;
}

export interface ClinicalOutputState {
  output: ClinicalOutput | null;
  prefs: OutputPrefs;
  generate: () => void;
  regenerateSection: (section: string) => void;
  editField: (id: string, value: string) => void;
  removeField: (id: string) => void;
  restoreField: (id: string) => void;
  addField: (section: string, label: string) => void;
  startReview: () => void;
  approve: (options?: { signature?: string | null }) => void;
  finalize: () => void;
  reopen: () => void;
}

/**
 * Owns the Generate -> Review -> Edit -> Approve -> Finalize lifecycle for an
 * AI-assisted clinical output. Nothing advances past review without an explicit
 * clinician action, and every transition is appended to the audit trail.
 */
export function useClinicalOutput(
  kind: OutputKind,
  ctx: EncounterContext,
  actor: string,
): ClinicalOutputState {
  const prefs = useOutputPrefs();
  const [output, setOutput] = useState<ClinicalOutput | null>(null);

  useEffect(() => {
    setOutput(loadOutput(kind, ctx.encounterId));
  }, [kind, ctx.encounterId]);

  const commit = useCallback((next: ClinicalOutput) => {
    saveOutput(next);
    setOutput(next);
  }, []);

  const generate = useCallback(() => {
    commit(buildDraft(kind, ctx, prefs));
  }, [commit, ctx, kind, prefs]);

  const regenerateSection = useCallback(
    (section: string) => {
      setOutput((current) => {
        if (!current) return current;
        const fresh = buildDraft(kind, ctx, prefs);
        const next = appendAudit(
          {
            ...current,
            status: current.status === "finalized" ? current.status : "under-review",
            fields: current.fields.map((f) =>
              f.section === section ? (fresh.fields.find((n) => n.id === f.id) ?? f) : f,
            ),
          },
          "Regenerated",
          "Rhea AI",
          `${section} section regenerated at clinician request`,
        );
        saveOutput(next);
        return next;
      });
    },
    [ctx, kind, prefs],
  );

  const editField = useCallback((id: string, value: string) => {
    setOutput((current) => {
      if (!current) return current;
      const field = current.fields.find((f) => f.id === id);
      if (!field) return current;
      const wasAi = field.source === "ai";
      const next: ClinicalOutput = {
        ...current,
        aiContentModified: current.aiContentModified || (wasAi && value !== field.value),
        fields: current.fields.map((f) =>
          f.id === id
            ? {
                ...f,
                value,
                source: value.trim() ? "clinician" : f.required ? "missing" : "clinician",
              }
            : f,
        ),
      };
      saveOutput(next);
      return next;
    });
  }, []);

  const mark = useCallback(
    (id: string, removed: boolean) => {
      setOutput((current) => {
        if (!current) return current;
        const field = current.fields.find((f) => f.id === id);
        const next = appendAudit(
          { ...current, fields: current.fields.map((f) => (f.id === id ? { ...f, removed } : f)) },
          "Edited",
          actor,
          `${removed ? "Removed" : "Restored"} ${field?.label ?? id}`,
        );
        saveOutput(next);
        return next;
      });
    },
    [actor],
  );

  const removeField = useCallback((id: string) => mark(id, true), [mark]);
  const restoreField = useCallback((id: string) => mark(id, false), [mark]);

  const addField = useCallback(
    (section: string, label: string) => {
      setOutput((current) => {
        if (!current) return current;
        const next = appendAudit(
          {
            ...current,
            fields: [
              ...current.fields,
              {
                id: `custom-${Date.now()}`,
                section,
                label,
                value: "",
                source: "clinician" as const,
              },
            ],
          },
          "Edited",
          actor,
          `Added field "${label}"`,
        );
        saveOutput(next);
        return next;
      });
    },
    [actor],
  );

  const transition = useCallback((fn: (current: ClinicalOutput) => ClinicalOutput) => {
    setOutput((current) => {
      if (!current) return current;
      const next = fn(current);
      saveOutput(next);
      return next;
    });
  }, []);

  const startReview = useCallback(() => {
    transition((c) =>
      appendAudit({ ...c, status: "under-review" }, "Reviewed", actor, "Clinician review started"),
    );
  }, [actor, transition]);

  const approve = useCallback(
    (options?: { signature?: string | null }) => {
      transition((c) => {
        const signed = Boolean(options?.signature);
        const approved: ClinicalOutput = {
          ...c,
          status: "approved",
          approvedBy: actor,
          approvedAt: new Date().toISOString(),
          signatureApplied: c.signatureApplied || signed,
        };
        const withApproval = appendAudit(
          approved,
          "Approved",
          actor,
          c.aiContentModified
            ? "Approved after clinician edits to AI-generated content"
            : "Approved without changes to AI-generated content",
        );
        return signed ? appendAudit(withApproval, "Signature applied", actor) : withApproval;
      });
    },
    [actor, transition],
  );

  const finalize = useCallback(() => {
    transition((c) => appendAudit({ ...c, status: "finalized" }, "Finalized", actor));
  }, [actor, transition]);

  const reopen = useCallback(() => {
    transition((c) => appendAudit({ ...c, status: "under-review" }, "Reopened", actor));
  }, [actor, transition]);

  return useMemo(
    () => ({
      output,
      prefs,
      generate,
      regenerateSection,
      editField,
      removeField,
      restoreField,
      addField,
      startReview,
      approve,
      finalize,
      reopen,
    }),
    [
      output,
      prefs,
      generate,
      regenerateSection,
      editField,
      removeField,
      restoreField,
      addField,
      startReview,
      approve,
      finalize,
      reopen,
    ],
  );
}
