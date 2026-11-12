import { useState } from "react";
import { CheckCircle2, FileDown, Plus, RefreshCw, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { AiMark } from "@/components/clinik/AiMark";
import {
  FIELD_SOURCE_LABEL,
  FIELD_SOURCE_TONE,
  OUTPUT_STATUS_LABEL,
  OUTPUT_STATUS_TONE,
  formatAuditTime,
  missingRequired,
  outputToText,
  sections,
  type OutputKind,
} from "@/lib/clinical-outputs";
import { useClinicalOutput } from "@/hooks/use-clinical-output";
import type { EncounterContext } from "@/lib/clinical-outputs";

interface ClinicalOutputPanelProps {
  kind: OutputKind;
  ctx: EncounterContext;
  actor: string;
  onNotify: (message: string) => void;
}

const COPY: Record<OutputKind, { title: string; description: string; disabled: string }> = {
  billing: {
    title: "Billing draft",
    description:
      "Rhea prepares a billing draft from this encounter. Codes are AI-suggested only - nothing is submitted as a claim, and no charge is finalized without your approval.",
    disabled: "Billing output is turned off in Settings → Documentation → Billing.",
  },
  prescription: {
    title: "Prescription draft",
    description:
      "Rhea structures a prescription from information documented in this encounter. Medication details are never invented; missing details must be entered by you before approval.",
    disabled: "Prescription output is turned off in Settings → Documentation → Prescription.",
  },
};

export function ClinicalOutputPanel({ kind, ctx, actor, onNotify }: ClinicalOutputPanelProps) {
  const state = useClinicalOutput(kind, ctx, actor);
  const { output, prefs } = state;
  const [newField, setNewField] = useState("");
  const copy = COPY[kind];
  const enabled = kind === "billing" ? prefs.billingEnabled : prefs.prescriptionEnabled;

  if (!enabled) {
    return (
      <div className="rounded-2xl bg-card hairline p-8 text-[14px] text-muted-foreground">
        {copy.disabled}
      </div>
    );
  }

  if (!output) {
    return (
      <div className="rounded-2xl bg-card hairline p-8">
        <div className="text-[15px] font-medium mb-1">{copy.title}</div>
        <p className="text-[14px] text-muted-foreground mb-5 max-w-2xl leading-relaxed">
          {copy.description}
        </p>
        <button
          type="button"
          onClick={() => {
            state.generate();
            onNotify(`${copy.title} generated for review`);
          }}
          className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] hover:opacity-90 transition inline-flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" /> Generate{" "}
          {kind === "billing" ? "billing" : "prescription"} draft
        </button>
      </div>
    );
  }

  const missing = missingRequired(output);
  const locked = output.status === "finalized";
  const canApprove =
    missing.length === 0 &&
    (output.status === "ai-generated" ||
      output.status === "under-review" ||
      output.status === "draft");
  const needsSignature = kind === "prescription" && prefs.prescriptionRequireSignature;
  const hasSignature = Boolean(prefs.signature);

  const exportText = () => {
    const blob = new Blob([outputToText(output, prefs)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${kind}-${ctx.encounterId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify("Document exported");
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-card hairline p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="text-[15px] font-medium flex items-center gap-2.5">
              {copy.title} <AiMark />
            </div>
            <p className="text-[14px] text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              {copy.description}
            </p>
          </div>
          <span
            className={`shrink-0 text-[12px] uppercase tracking-wider px-2.5 py-1 rounded-full ${OUTPUT_STATUS_TONE[output.status]}`}
          >
            {OUTPUT_STATUS_LABEL[output.status]}
          </span>
        </div>

        {missing.length > 0 && (
          <div className="mt-4 rounded-xl bg-[color-mix(in_oklab,var(--color-destructive)_10%,transparent)] p-4">
            <div className="text-[14px] font-medium text-destructive">Information required</div>
            <p className="text-[14px] text-muted-foreground mt-1">
              {missing.map((f) => f.label).join(", ")} must be completed before this can be
              approved.
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={locked}
            onClick={() => {
              state.startReview();
              onNotify("Marked under review");
            }}
            className="h-10 px-4 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Start review
          </button>
          <button
            type="button"
            onClick={exportText}
            className="h-10 px-4 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center gap-1.5"
          >
            <FileDown className="w-3.5 h-3.5" /> Export
          </button>
          {output.status === "finalized" ? (
            <button
              type="button"
              onClick={() => {
                state.reopen();
                onNotify("Reopened for editing");
              }}
              className="h-10 px-4 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reopen
            </button>
          ) : output.status === "approved" ? (
            <button
              type="button"
              onClick={() => {
                state.finalize();
                onNotify(`${copy.title} finalized`);
              }}
              className="ml-auto h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] hover:opacity-90 transition inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Finalize
            </button>
          ) : (
            <button
              type="button"
              disabled={!canApprove || (needsSignature && !hasSignature)}
              onClick={() => {
                state.approve({ signature: needsSignature ? prefs.signature : null });
                onNotify(needsSignature ? "Approved and signed" : "Approved - ready to finalize");
              }}
              className="ml-auto h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] hover:opacity-90 transition inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {needsSignature ? "Approve & apply signature" : "Approve"}
            </button>
          )}
        </div>

        {needsSignature && !hasSignature && (
          <p className="mt-3 text-[14px] text-muted-foreground">
            A digital signature is required before a prescription can be approved. Save one in
            Settings → Documentation → Digital signature.
          </p>
        )}
      </div>

      {sections(output).map((section) => (
        <div key={section} className="rounded-2xl bg-card hairline p-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-[14px] font-medium">{section}</div>
            <button
              type="button"
              disabled={locked}
              onClick={() => {
                state.regenerateSection(section);
                onNotify(`${section} regenerated`);
              }}
              className="h-9 px-3 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate
            </button>
          </div>

          <div className="space-y-4">
            {output.fields
              .filter((f) => f.section === section)
              .map((f) => (
                <div key={f.id} className={f.removed ? "opacity-55" : undefined}>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[14px] text-muted-foreground">{f.label}</span>
                    <span
                      className={`text-[12px] uppercase tracking-wider px-2 py-0.5 rounded-full ${FIELD_SOURCE_TONE[f.source]}`}
                    >
                      {FIELD_SOURCE_LABEL[f.source]}
                    </span>
                    {f.required && (
                      <span className="text-[12px] text-muted-foreground">Required</span>
                    )}
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() =>
                        f.removed ? state.restoreField(f.id) : state.removeField(f.id)
                      }
                      className="ml-auto text-[12px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" /> {f.removed ? "Restore" : "Remove"}
                    </button>
                  </div>
                  {f.multiline ? (
                    <textarea
                      value={f.value}
                      disabled={locked || f.removed}
                      onChange={(e) => state.editField(f.id, e.target.value)}
                      rows={Math.max(2, f.value.split("\n").length + 1)}
                      className="w-full resize-y rounded-xl hairline bg-card px-3.5 py-2.5 text-[14px] leading-relaxed outline-none focus:border-primary disabled:opacity-60"
                    />
                  ) : (
                    <input
                      value={f.value}
                      disabled={locked || f.removed}
                      onChange={(e) => state.editField(f.id, e.target.value)}
                      className="w-full h-11 rounded-xl hairline bg-card px-3.5 text-[14px] outline-none focus:border-primary disabled:opacity-60"
                    />
                  )}
                  {f.hint && <p className="text-[12px] text-muted-foreground mt-1">{f.hint}</p>}
                </div>
              ))}
          </div>
        </div>
      ))}

      <div className="rounded-2xl bg-card hairline p-6">
        <div className="text-[14px] font-medium mb-3">Add information</div>
        <div className="flex items-center gap-2">
          <input
            value={newField}
            disabled={locked}
            onChange={(e) => setNewField(e.target.value)}
            placeholder="Field name"
            className="flex-1 h-11 rounded-xl hairline bg-card px-3.5 text-[14px] outline-none focus:border-primary"
          />
          <button
            type="button"
            disabled={locked || !newField.trim()}
            onClick={() => {
              state.addField("Notes", newField.trim());
              setNewField("");
              onNotify("Field added");
            }}
            className="h-11 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-card hairline p-6">
        <div className="text-[14px] font-medium mb-3">History</div>
        <ol className="space-y-2">
          {output.audit
            .slice()
            .reverse()
            .map((a, i) => (
              <li key={`${a.at}-${i}`} className="text-[14px] flex flex-wrap gap-x-2">
                <span className="text-foreground">{a.action}</span>
                <span className="text-muted-foreground">by {a.actor}</span>
                <span className="text-muted-foreground">· {formatAuditTime(a.at)}</span>
                {a.detail && (
                  <span className="text-muted-foreground w-full text-[12px]">{a.detail}</span>
                )}
              </li>
            ))}
        </ol>
        {output.approvedAt && (
          <p className="text-[12px] text-muted-foreground mt-3">
            Approved by {output.approvedBy} on {formatAuditTime(output.approvedAt)}.{" "}
            {output.aiContentModified
              ? "AI-generated content was modified before approval."
              : "AI-generated content was approved unmodified."}
          </p>
        )}
      </div>
    </div>
  );
}
