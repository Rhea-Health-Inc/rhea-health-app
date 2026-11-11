import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, History } from "lucide-react";
import { APPOINTMENTS } from "@/lib/mock";
import { StatusPill } from "@/components/clinik/StatusPill";
import { PageHeader } from "@/components/clinik/PageHeader";

export const Route = createFileRoute("/app/schedule")({
  component: Schedule,
});

function Schedule() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <div className="max-w-5xl mx-auto px-12 py-14">
      <PageHeader
        breadcrumb={[{ label: "Workspace", to: "/app" }, { label: "Today's schedule" }]}
        title={today}
        description={`${APPOINTMENTS.length} patients scheduled. Open an encounter to record, review the transcript, or sign documentation.`}
      />

      <ol className="relative border-l border-border/70 ml-3 space-y-6">
        {APPOINTMENTS.map((a) => (
          <li key={a.id} className="pl-6 relative">
            <span
              className={`absolute -left-[7px] top-6 w-3.5 h-3.5 rounded-full border-2 border-background ${
                a.status === "In progress" ? "bg-primary" : "bg-border"
              }`}
            />
            <div className="rounded-2xl bg-card hairline p-6 hover:shadow-[var(--shadow-clinik)] hover:-translate-y-0.5 transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-20">
                  <div className="text-[14px] font-medium">{a.time}</div>
                  <div className="text-[14px] text-muted-foreground">{a.duration}</div>
                </div>
                <img
                  src={a.patient.photo}
                  alt={a.patient.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[15px] font-medium text-foreground truncate">
                      {a.patient.name}
                    </div>
                    <span className="text-[14px] text-muted-foreground">
                      {a.patient.age} · {a.patient.sex} · {a.patient.mrn}
                    </span>
                  </div>
                  <div className="text-[14px] text-muted-foreground mt-0.5">{a.reason}</div>
                  <div className="text-[14px] text-muted-foreground mt-1">{a.room}</div>
                </div>
                <StatusPill status={a.status} />
                <div className="flex items-center gap-2">
                  <Link
                    to="/app/visit/$id"
                    params={{ id: a.id }}
                    search={{ tab: "history" }}
                    className="text-[14px] px-3 h-9 rounded-full hairline bg-card text-foreground hover:bg-muted transition inline-flex items-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5" /> View history
                  </Link>
                  <Link
                    to="/app/visit/$id"
                    params={{ id: a.id }}
                    search={{ tab: "workspace" }}
                    className="text-[14px] px-4 h-9 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition inline-flex items-center gap-1.5"
                  >
                    Start visit <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
