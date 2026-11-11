import {
  Users,
  FileText,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { STATS } from "@/lib/mock";
import { SectionHeader } from "@/components/clinik/PageHeader";

const STAT_ICONS: LucideIcon[] = [Users, FileText, CheckCircle2, MessageSquare, AlertCircle, Clock];

export function StatsGrid() {
  return (
    <section aria-labelledby="todays-overview">
      <SectionHeader
        id="todays-overview"
        title="Today's overview"
        description="A summary of your workload across visits, documentation, and patient messages."
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {STATS.map((stat, i) => {
          const Icon = STAT_ICONS[i] ?? Users;
          return (
            <article
              key={stat.label}
              className="rounded-2xl bg-card hairline p-6 hover:shadow-[var(--shadow-clinik)] hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] text-muted-foreground font-normal">{stat.label}</h3>
                <Icon aria-hidden className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="mt-4 h-display text-[32px] font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-[14px] text-muted-foreground">{stat.hint}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
