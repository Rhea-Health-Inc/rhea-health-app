import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Sparkles } from "lucide-react";
import { CLINICIAN } from "@/lib/mock";
import { PageHeader } from "@/components/clinik/PageHeader";
import { StatsGrid } from "@/components/clinik/home/StatsGrid";
import { EncounterTracker } from "@/components/clinik/home/EncounterTracker";
import { PatientTodayTable } from "@/components/clinik/home/PatientTodayTable";
import { ReviewQueue } from "@/components/clinik/home/ReviewQueue";
import { TranscriptSync } from "@/components/clinik/home/TranscriptSync";

export const Route = createFileRoute("/app/")({
  component: Home,
});

function Home() {
  // CLINICIAN.name includes the "Dr." title ("Dr. Sarah Chen") — greet by surname.
  const surname =
    CLINICIAN.name
      .replace(/^Dr\.\s*/, "")
      .split(" ")
      .at(-1) ?? CLINICIAN.name;

  return (
    <div className="max-w-6xl mx-auto px-12 py-14 space-y-16">
      <PageHeader
        className="mb-16"
        breadcrumb={[{ label: "Workspace", to: "/app" }, { label: "Home" }]}
        title={`Good morning, Dr. ${surname}.`}
        description="Here's your day at a glance. Rhea has prepared drafts for your first two patients."
        actions={
          <Link
            to="/app/schedule"
            className="inline-flex items-center h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition"
          >
            View schedule <ChevronRight aria-hidden className="w-4 h-4 ml-1" />
          </Link>
        }
      />

      <StatsGrid />
      <EncounterTracker />
      <PatientTodayTable />

      <div className="grid lg:grid-cols-2 gap-6">
        <ReviewQueue />
        <TranscriptSync />
      </div>

      <aside className="rounded-2xl bg-primary/[0.06] hairline p-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Sparkles aria-hidden className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-medium text-foreground">
            AI prepared 3 draft notes overnight
          </p>
          <p className="text-[14px] text-muted-foreground mt-1">
            Marta Kellner, Daniel Ortega, and Priya Menon have draft summaries ready for your
            review.
          </p>
        </div>
        <Link
          to="/app/documentation"
          className="text-[14px] text-primary hover:underline whitespace-nowrap shrink-0"
        >
          Review drafts →
        </Link>
      </aside>
    </div>
  );
}
