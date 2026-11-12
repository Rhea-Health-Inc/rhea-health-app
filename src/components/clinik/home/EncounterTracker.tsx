import { useMemo } from "react";
import { APPOINTMENTS } from "@/lib/mock";
import { SectionHeader } from "@/components/clinik/PageHeader";

interface Stage {
  key: string;
  /** Appointment statuses that count towards this stage. */
  match: readonly string[];
  /** Fixed count for stages that are not derived from appointment status. */
  fixedCount?: number;
  caption: string;
}

const STAGES: readonly Stage[] = [
  { key: "Scheduled", match: ["Upcoming"], caption: "patients" },
  { key: "Checked in", match: ["Checked in"], caption: "patients" },
  { key: "In room", match: ["In progress"], caption: "patients" },
  { key: "Documented", match: [], fixedCount: 3, caption: "AI drafts" },
  { key: "Signed", match: ["Completed"], caption: "patients" },
];

export function EncounterTracker() {
  const stages = useMemo(
    () =>
      STAGES.map((stage) => ({
        ...stage,
        count:
          stage.fixedCount ?? APPOINTMENTS.filter((a) => stage.match.includes(a.status)).length,
      })),
    [],
  );

  return (
    <section aria-labelledby="encounter-status">
      <SectionHeader
        id="encounter-status"
        title="Encounter status"
        description="Where each of today's encounters sits in the recording, drafting, and signature workflow."
        actions={
          <span className="text-[13px] text-muted-foreground">
            {APPOINTMENTS.length} encounters today
          </span>
        }
      />
      <div className="rounded-2xl bg-card hairline px-6 py-6">
        <ol className="flex">
          {stages.map((stage, i) => (
            <li key={stage.key} className="relative flex-1 flex flex-col items-center text-center">
              {/* Connector halves run through the circle centres (18px = half of w-9)
                  and meet at each circle, so the line is continuous across the card. */}
              {i > 0 && (
                <span aria-hidden className="absolute top-[18px] left-0 w-1/2 h-px bg-border" />
              )}
              {i < stages.length - 1 && (
                <span aria-hidden className="absolute top-[18px] right-0 w-1/2 h-px bg-border" />
              )}
              <span
                className={`relative w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-medium ${
                  stage.count > 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {stage.count}
              </span>
              <span className="mt-2 text-[14px] font-medium text-foreground">{stage.key}</span>
              <span className="text-[12px] text-muted-foreground">{stage.caption}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
