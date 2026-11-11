// Documentation status model shared between the Documentation list and the
// Visit workspace. The list section decides which status a note appears
// under; the visit workspace reads it back to render matching UI.

export type DocStatus = "pending" | "needs-review" | "draft" | "signed" | "completed";

export const DOC_STATUS_LABEL: Record<DocStatus, string> = {
  pending: "Pending",
  "needs-review": "Needs review",
  draft: "Draft",
  signed: "Signed",
  completed: "Completed",
};

export const DOC_STATUS_TONE: Record<DocStatus, string> = {
  pending: "bg-[color-mix(in_oklab,var(--color-destructive)_12%,transparent)] text-destructive",
  "needs-review": "bg-primary/10 text-primary",
  draft: "bg-muted text-foreground",
  signed:
    "bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[var(--color-success)]",
  completed:
    "bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[var(--color-success)]",
};

export function isDocStatus(v: unknown): v is DocStatus {
  return typeof v === "string" && v in DOC_STATUS_LABEL;
}
