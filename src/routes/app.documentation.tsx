import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { APPOINTMENTS } from "@/lib/mock";
import { PageHeader } from "@/components/clinik/PageHeader";
import { DOC_STATUS_LABEL, DOC_STATUS_TONE, type DocStatus } from "@/lib/documentation";

export const Route = createFileRoute("/app/documentation")({
  component: Documentation,
});

const TABS: { key: DocStatus; label: string }[] = [
  { key: "pending", label: "Pending notes" },
  { key: "needs-review", label: "Needs review" },
  { key: "draft", label: "Drafts" },
  { key: "signed", label: "Recently signed" },
  { key: "completed", label: "Completed" },
];

// Deterministically bucket appointments across tabs so each section is populated.
const BUCKETS: Record<DocStatus, string[]> = {
  pending: ["a3", "a5"],
  "needs-review": ["a1", "a2"],
  draft: ["a4", "a6"],
  signed: ["a1", "a4"],
  completed: ["a2", "a6"],
};

function Documentation() {
  const [tab, setTab] = useState<DocStatus>("pending");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const ids = BUCKETS[tab];
    return APPOINTMENTS.filter((a) => ids.includes(a.id)).filter((a) =>
      a.patient.name.toLowerCase().includes(q.toLowerCase()),
    );
  }, [tab, q]);

  return (
    <div className="max-w-6xl mx-auto px-12 py-14">
      <PageHeader
        breadcrumb={[{ label: "Workspace", to: "/app" }, { label: "Documentation" }]}
        title="Documentation"
        description="Review, edit, and sign the clinical notes Rhea drafts from your recorded encounters."
      />

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-1 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-[14px] px-3 h-10 -mb-px border-b-2 transition ${
                tab === t.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 h-10 rounded-full hairline bg-card px-4 w-72">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search notes"
            className="flex-1 bg-transparent text-[14px] outline-none"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-card hairline overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-4 border-b border-border text-[12px] uppercase tracking-wider text-muted-foreground">
          <div className="col-span-4">Patient</div>
          <div className="col-span-3">Visit</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Updated</div>
          <div className="col-span-1 text-right">Status</div>
        </div>
        {rows.length === 0 && (
          <div className="px-5 py-10 text-center text-[14px] text-muted-foreground">
            No documentation in this section.
          </div>
        )}
        {rows.map((a, i) => (
          <Link
            key={a.id}
            to="/app/visit/$id"
            params={{ id: a.id }}
            search={{ tab: "documentation", doc: tab }}
            className={`grid grid-cols-12 items-center px-6 py-5 hover:bg-muted/60 transition ${
              i > 0 ? "border-t border-border/70" : ""
            }`}
          >
            <div className="col-span-4 flex items-center gap-3">
              <img src={a.patient.photo} className="w-8 h-8 rounded-full object-cover" alt="" />
              <div>
                <div className="text-[14px] font-medium">{a.patient.name}</div>
                <div className="text-[14px] text-muted-foreground">{a.patient.mrn}</div>
              </div>
            </div>
            <div className="col-span-3 text-[14px] text-foreground truncate">{a.reason}</div>
            <div className="col-span-2 text-[14px] text-muted-foreground">SOAP</div>
            <div className="col-span-2 text-[14px] text-muted-foreground">Today, {a.time}</div>
            <div className="col-span-1 text-right">
              <span
                className={`text-[12px] uppercase tracking-wider px-2 py-1 rounded-full ${DOC_STATUS_TONE[tab]}`}
              >
                {DOC_STATUS_LABEL[tab]}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
