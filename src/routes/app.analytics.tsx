import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionHeader } from "@/components/clinik/PageHeader";

export const Route = createFileRoute("/app/analytics")({
  component: Analytics,
});

const STATS = [
  { label: "Patients seen", value: "128", hint: "This month" },
  { label: "Avg visit length", value: "18m", hint: "Down 6m vs last month" },
  { label: "Documentation time saved", value: "22m / visit", hint: "Ambient AI" },
  { label: "Hours saved", value: "47h", hint: "This month" },
  { label: "Completed notes", value: "112", hint: "Signed" },
  { label: "Pending documentation", value: "4", hint: "Draft" },
  { label: "Messages responded", value: "89", hint: "Under 2h avg" },
];

function Analytics() {
  return (
    <div className="max-w-6xl mx-auto px-12 py-14">
      <div className="mb-6">
        <div className="text-[12px] uppercase tracking-wider text-muted-foreground">
          Your practice
        </div>
        <h1 className="h-display text-[36px] mt-1">Analytics</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
        {STATS.slice(0, 4).map((s) => (
          <div key={s.label} className="rounded-2xl bg-card hairline p-6">
            <div className="text-[14px] text-muted-foreground">{s.label}</div>
            <div className="mt-2 h-display text-[30px] font-semibold">{s.value}</div>
            <div className="mt-1 text-[14px] text-muted-foreground">{s.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5 mb-12">
        <div className="col-span-2 rounded-2xl bg-card hairline p-8">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[18px] font-medium">Documentation time saved</div>
            <div className="text-[14px] text-muted-foreground">Last 8 weeks</div>
          </div>
          <MiniChart data={[8, 12, 14, 18, 17, 20, 22, 26]} />
        </div>
        <div className="rounded-2xl bg-card hairline p-8">
          <div className="text-[18px] font-medium mb-4">Visits per day</div>
          <div className="grid grid-cols-7 gap-1.5 items-end h-32">
            {[6, 9, 12, 8, 11, 4, 2].map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-full rounded-md bg-primary/70" style={{ height: `${v * 8}px` }} />
                <div className="text-[14px] text-muted-foreground">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {STATS.slice(4).map((s) => (
          <div key={s.label} className="rounded-2xl bg-card hairline p-6">
            <div className="text-[14px] text-muted-foreground">{s.label}</div>
            <div className="mt-2 h-display text-[30px] font-semibold">{s.value}</div>
            <div className="mt-1 text-[14px] text-muted-foreground">{s.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 90 - 5}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-40">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-primary)" stopOpacity="0.18" />
          <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
      />
      <polygon points={`0,100 ${pts} 100,100`} fill="url(#g)" />
    </svg>
  );
}
