import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/clinik/PageHeader";
import {
  Badge,
  Modal,
  Panel,
  Table,
  Td,
  Tr,
  inputCls,
  statusTone,
  GhostButton,
} from "@/components/clinik/AdminUI";
import { RequirePermission } from "./admin";
import { AUDIT_EVENTS, type ActivityEvent } from "@/lib/admin";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit logs - Rhea administration" },
      {
        name: "description",
        content: "Immutable record of administrative and clinical access events.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequirePermission permission="audit.view" label="audit logs">
      <AuditPage />
    </RequirePermission>
  ),
});

function AuditPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<ActivityEvent | null>(null);

  const rows = useMemo(
    () =>
      AUDIT_EVENTS.filter(
        (e) =>
          (category === "all" || e.category === category) &&
          `${e.actor} ${e.action} ${e.resource}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, category],
  );

  return (
    <div className="px-12 py-14 max-w-6xl">
      <PageHeader
        breadcrumb={[{ label: "Administration", to: "/admin" }, { label: "Audit logs" }]}
        title="Audit logs"
        description="Every administrative change and record access is written to an immutable log retained for seven years."
      />
      <Panel padded={false}>
        <div className="px-8 pt-7 pb-5 flex gap-3 flex-wrap">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search user, action, resource"
            className={`${inputCls} max-w-sm`}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputCls} max-w-[220px]`}
          >
            <option value="all">All categories</option>
            {[
              "Users",
              "Departments",
              "Licenses",
              "Integrations",
              "Security",
              "Billing",
              "Patients",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <Table head={["Timestamp", "User", "Action", "Resource", "Category", "Result", ""]}>
          {rows.slice(0, 40).map((e) => (
            <Tr key={e.id} onClick={() => setSelected(e)}>
              <Td className="text-muted-foreground whitespace-nowrap">{e.at}</Td>
              <Td>{e.actor}</Td>
              <Td>{e.action}</Td>
              <Td className="text-muted-foreground">{e.resource}</Td>
              <Td className="text-muted-foreground">{e.category}</Td>
              <Td>
                <Badge tone={statusTone(e.result)}>{e.result}</Badge>
              </Td>
              <Td className="text-right text-[14px] text-primary">Details</Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      {selected && (
        <Modal
          open
          onClose={() => setSelected(null)}
          title={selected.action}
          description={`${selected.at} · ${selected.category}`}
          footer={<GhostButton onClick={() => setSelected(null)}>Close</GhostButton>}
        >
          <div className="space-y-3 text-[14px]">
            <div>
              <span className="text-muted-foreground">Event ID:</span> {selected.id}
            </div>
            <div>
              <span className="text-muted-foreground">User:</span> {selected.actor}
            </div>
            <div>
              <span className="text-muted-foreground">Department:</span> {selected.department}
            </div>
            <div>
              <span className="text-muted-foreground">Resource:</span> {selected.resource}
            </div>
            <div>
              <span className="text-muted-foreground">IP address:</span> {selected.ip}
            </div>
            <div>
              <span className="text-muted-foreground">Session:</span> {selected.session}
            </div>
            <p className="pt-3 leading-relaxed">{selected.details}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
