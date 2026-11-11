export type EncounterStatus = "In progress" | "Checked in" | "Upcoming" | "Completed";

const STATUS_STYLES: Record<string, string> = {
  "In progress": "bg-primary/10 text-primary",
  "Checked in":
    "bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[var(--color-success)]",
  Upcoming: "bg-muted text-muted-foreground",
  Completed: "bg-muted text-muted-foreground",
};

/** Relative ordering used when sorting an encounter list by status. */
export const STATUS_ORDER: Record<string, number> = {
  "In progress": 0,
  "Checked in": 1,
  Upcoming: 2,
  Completed: 3,
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`text-[12px] uppercase tracking-wider px-2 py-1 rounded-full font-medium ${
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}
