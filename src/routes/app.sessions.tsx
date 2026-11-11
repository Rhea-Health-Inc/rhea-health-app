import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic } from "lucide-react";
import { APPOINTMENTS } from "@/lib/mock";
import { PageHeader } from "@/components/clinik/PageHeader";

export const Route = createFileRoute("/app/sessions")({
  component: Sessions,
});

function Sessions() {
  return (
    <div className="max-w-5xl mx-auto px-12 py-14">
      <div className="mb-6">
        <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Recordings</div>
        <h1 className="h-display text-[36px] mt-1">Sessions</h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          Ambient consultations captured today.
        </p>
      </div>
      <div className="rounded-2xl bg-card hairline overflow-hidden">
        {APPOINTMENTS.slice(0, 4).map((a, i) => (
          <Link
            key={a.id}
            to="/app/visit/$id"
            params={{ id: a.id }}
            className={`flex items-center gap-4 px-6 py-5 hover:bg-muted/60 transition ${i > 0 ? "border-t border-border/70" : ""}`}
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <img src={a.patient.photo} alt="" className="w-9 h-9 rounded-full object-cover" />
            <div className="flex-1">
              <div className="text-[15px] font-medium">{a.patient.name}</div>
              <div className="text-[14px] text-muted-foreground">
                {a.reason} · {a.time}
              </div>
            </div>
            <div className="text-[14px] text-muted-foreground">18 min · 12 speakers turns</div>
            <div className="text-[14px] text-primary">Transcribed</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
