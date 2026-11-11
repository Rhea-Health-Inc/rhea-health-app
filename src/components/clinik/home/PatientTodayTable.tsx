import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { APPOINTMENTS, type Appointment } from "@/lib/mock";
import { SectionHeader } from "@/components/clinik/PageHeader";
import { StatusPill, STATUS_ORDER } from "@/components/clinik/StatusPill";

type SortKey = "time" | "patient" | "reason" | "room" | "status";
type SortDir = "asc" | "desc";

const GRID = "grid grid-cols-[80px_1.4fr_1.4fr_100px_120px_40px] gap-4";

/** Converts a "9:05 AM" label into minutes past midnight for sorting. */
function parseTime(label: string): number {
  const match = label.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  const hours = (Number(match[1]) % 12) + (/PM/i.test(match[3]) ? 12 : 0);
  return hours * 60 + Number(match[2]);
}

const COMPARATORS: Record<SortKey, (a: Appointment, b: Appointment) => number> = {
  time: (a, b) => parseTime(a.time) - parseTime(b.time),
  patient: (a, b) => a.patient.name.localeCompare(b.patient.name),
  reason: (a, b) => a.reason.localeCompare(b.reason),
  room: (a, b) => a.room.localeCompare(b.room),
  status: (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9),
};

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "time", label: "Time" },
  { key: "patient", label: "Patient" },
  { key: "reason", label: "Reason" },
  { key: "room", label: "Room" },
  { key: "status", label: "Status" },
];

export function PatientTodayTable() {
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    const direction = sortDir === "asc" ? 1 : -1;
    return [...APPOINTMENTS].sort((a, b) => COMPARATORS[sortKey](a, b) * direction);
  }, [sortKey, sortDir]);

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <section aria-labelledby="patients-today">
      <SectionHeader
        id="patients-today"
        title="Patients today"
        description="Sort by time, patient, reason, room, or status to plan the rest of your clinic."
        actions={
          <Link
            to="/app/schedule"
            className="text-[14px] text-muted-foreground hover:text-foreground"
          >
            See schedule
          </Link>
        }
      />
      <div className="rounded-2xl bg-card hairline overflow-hidden">
        <div
          role="row"
          className={`${GRID} px-6 py-4 border-b border-border/70 bg-muted/40 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold`}
        >
          {COLUMNS.map((col) => (
            <SortHeader
              key={col.key}
              label={col.label}
              sortKey={col.key}
              current={sortKey}
              dir={sortDir}
              onSort={onSort}
            />
          ))}
          <div />
        </div>
        {sorted.map((a, i) => (
          <Link
            key={a.id}
            to="/app/visit/$id"
            params={{ id: a.id }}
            className={`${GRID} items-center px-6 py-4 hover:bg-muted/60 transition ${
              i > 0 ? "border-t border-border/70" : ""
            }`}
          >
            <div>
              <div className="text-[14px] font-medium text-foreground">{a.time}</div>
              <div className="text-[14px] text-muted-foreground">{a.duration}</div>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={a.patient.photo}
                alt=""
                loading="lazy"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="min-w-0">
                <div className="text-[14px] font-medium text-foreground truncate">
                  {a.patient.name}
                </div>
                <div className="text-[14px] text-muted-foreground truncate">
                  {a.patient.age} · {a.patient.sex} · {a.patient.mrn}
                </div>
              </div>
            </div>
            <div className="text-[14px] text-foreground truncate">{a.reason}</div>
            <div className="text-[14px] text-muted-foreground truncate">{a.room}</div>
            <div>
              <StatusPill status={a.status} />
            </div>
            <ChevronRight aria-hidden className="w-4 h-4 text-muted-foreground justify-self-end" />
          </Link>
        ))}
      </div>
    </section>
  );
}

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}

function SortHeader({ label, sortKey, current, dir, onSort }: SortHeaderProps) {
  const active = current === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className={`flex items-center gap-1 text-left hover:text-foreground transition ${
        active ? "text-foreground" : ""
      }`}
    >
      {label}
      {active &&
        (dir === "asc" ? (
          <ArrowUp aria-hidden className="w-3 h-3" />
        ) : (
          <ArrowDown aria-hidden className="w-3 h-3" />
        ))}
    </button>
  );
}
