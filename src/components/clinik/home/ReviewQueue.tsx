import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, X, Undo2 } from "lucide-react";
import { APPOINTMENTS } from "@/lib/mock";
import { SectionHeader } from "@/components/clinik/PageHeader";
import { useReviewQueue, type ReviewItem } from "@/hooks/use-review-queue";

const REVIEW_ITEMS: ReviewItem[] = [
  {
    id: "r1",
    patient: "Marta Kellner",
    photo: APPOINTMENTS[0].patient.photo,
    note: "SOAP · Follow-up, stable angina",
    reason: "Awaiting sign-off",
    waited: "12 min",
    priority: "high",
  },
  {
    id: "r2",
    patient: "Daniel Ortega",
    photo: APPOINTMENTS[1].patient.photo,
    note: "New patient intake",
    reason: "Missing family history",
    waited: "38 min",
    priority: "high",
  },
  {
    id: "r3",
    patient: "Priya Menon",
    photo: APPOINTMENTS[4].patient.photo,
    note: "Annual physical summary",
    reason: "Draft ready",
    waited: "1 h",
    priority: "normal",
  },
  {
    id: "r4",
    patient: "Samuel Achebe",
    photo: APPOINTMENTS[3].patient.photo,
    note: "Post-op check, knee",
    reason: "Draft ready",
    waited: "2 h",
    priority: "normal",
  },
];

const ICON_BTN =
  "text-[12px] rounded-full hairline bg-card hover:bg-muted transition inline-flex items-center justify-center";

export function ReviewQueue() {
  const { items, lastAction, act, undo } = useReviewQueue(REVIEW_ITEMS);

  return (
    <section aria-labelledby="review-queue" className="flex flex-col">
      <SectionHeader
        id="review-queue"
        title="Review queue"
        description="Drafts waiting on your approval."
        actions={<span className="text-[13px] text-muted-foreground">{items.length} pending</span>}
      />
      <div className="rounded-2xl bg-card hairline overflow-hidden flex-1 flex flex-col">
        {items.length === 0 && (
          <p className="p-8 text-center text-[14px] text-muted-foreground">
            Queue clear. Nice work.
          </p>
        )}
        {items.map((r, i) => (
          <article
            key={r.id}
            className={`flex-1 flex flex-col justify-center gap-3 px-6 py-4 ${
              i > 0 ? "border-t border-border/70" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <img
                src={r.photo}
                alt=""
                loading="lazy"
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-medium text-foreground">{r.patient}</h3>
                  {r.priority === "high" && (
                    <span className="text-[12px] px-1.5 py-0.5 rounded-full bg-[color-mix(in_oklab,var(--color-destructive)_12%,transparent)] text-destructive font-medium">
                      Priority
                    </span>
                  )}
                </div>
                <p className="text-[14px] text-muted-foreground">{r.note}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {r.reason} · waited {r.waited}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => act(r.id, "dismissed")}
                className={`${ICON_BTN} w-8 h-8 text-muted-foreground hover:text-foreground`}
                aria-label={`Dismiss ${r.patient} note`}
                title="Dismiss"
              >
                <X aria-hidden className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => act(r.id, "approved")}
                className={`${ICON_BTN} px-3 h-8 gap-1.5`}
                aria-label={`Approve ${r.patient} note`}
              >
                <Check aria-hidden className="w-3.5 h-3.5" /> Approve
              </button>
              <Link
                to="/app/documentation"
                className="text-[12px] px-3 h-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition inline-flex items-center gap-1.5"
              >
                Open <ArrowRight aria-hidden className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        ))}
        {lastAction && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border/70 bg-muted/40"
          >
            <p className="text-[14px] text-foreground">
              {lastAction.kind === "approved" ? "Approved" : "Dismissed"} ·{" "}
              {lastAction.item.patient}
            </p>
            <button type="button" onClick={undo} className={`${ICON_BTN} px-3 h-8 gap-1.5`}>
              <Undo2 aria-hidden className="w-3.5 h-3.5" /> Undo
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
