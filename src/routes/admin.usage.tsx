import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/clinik/PageHeader";
import { BarChart, GhostButton, Panel, StatCard, Table, Td, Tr } from "@/components/clinik/AdminUI";
import { RequirePermission } from "./admin";
import { DEPARTMENTS, USAGE_SERIES } from "@/lib/admin";

export const Route = createFileRoute("/admin/usage")({
  head: () => ({
    meta: [
      { title: "Usage analytics - Rhea administration" },
      {
        name: "description",
        content: "Organization-wide documentation, recording, and AI usage analytics.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequirePermission permission="usage.view" label="usage analytics">
      <UsagePage />
    </RequirePermission>
  ),
});

function UsagePage() {
  return (
    <div className="px-12 py-14 max-w-6xl">
      <PageHeader
        breadcrumb={[{ label: "Administration", to: "/admin" }, { label: "Usage" }]}
        title="Usage"
        description="How your organization uses Rhea across departments, measured over the last seven months."
        actions={
          <GhostButton onClick={() => toast.success("Usage report export queued")}>
            Export report
          </GhostButton>
        }
      />

      <div className="grid gap-5 sm:grid-cols-4 mb-10">
        <StatCard label="Notes this month" value="6,420" hint="Month to date." />
        <StatCard label="Recording hours" value="968" hint="Ambient capture, month to date." />
        <StatCard label="Encounters" value="5,810" hint="Documented encounters." />
        <StatCard
          label="AI adoption"
          value="79%"
          hint="Clinicians using AI documentation weekly."
          tone="positive"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <Panel title="Documentation volume" description="Notes generated per month.">
          <BarChart data={USAGE_SERIES} valueKey="notes" label="Notes" />
        </Panel>
        <Panel title="Recording hours" description="Ambient capture per month.">
          <BarChart data={USAGE_SERIES} valueKey="hours" label="Hours" />
        </Panel>
      </div>

      <Panel
        title="Usage by department"
        description="Documentation activity across the organization."
        padded={false}
      >
        <Table head={["Department", "Clinicians", "Notes", "Recording hours", "AI adoption"]}>
          {DEPARTMENTS.map((d, i) => (
            <Tr key={d.id}>
              <Td className="font-medium">{d.name}</Td>
              <Td>{d.clinicians}</Td>
              <Td>{(820 + i * 137).toLocaleString()}</Td>
              <Td>{120 + i * 19}</Td>
              <Td className="text-muted-foreground">{62 + ((i * 5) % 30)}%</Td>
            </Tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
