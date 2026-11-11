import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/clinik/PageHeader";
import { Badge, GhostButton, Panel, Table, Td, Tr, statusTone } from "@/components/clinik/AdminUI";
import { RequirePermission } from "./admin";
import { INTEGRATIONS, type Integration } from "@/lib/admin";

export const Route = createFileRoute("/admin/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations - Rhea administration" },
      {
        name: "description",
        content: "Connected EHR, calendar, identity, and data systems for your organization.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequirePermission permission="integrations.manage" label="integration management">
      <IntegrationsPage />
    </RequirePermission>
  ),
});

function IntegrationsPage() {
  const [items, setItems] = useState<Integration[]>(INTEGRATIONS);
  const set = (id: string, status: Integration["status"], msg: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status, lastSync: status === "Connected" ? "Just now" : i.lastSync }
          : i,
      ),
    );
    toast.success(msg);
  };

  return (
    <div className="px-12 py-14 max-w-6xl">
      <PageHeader
        breadcrumb={[{ label: "Administration", to: "/admin" }, { label: "Integrations" }]}
        title="Integrations"
        description="Organization-level connections to clinical and identity systems. Department settings inherit from these connections."
      />
      <Panel padded={false}>
        <Table head={["System", "Type", "Scope", "Last sync", "Owner", "Status", ""]}>
          {items.map((i) => (
            <Tr key={i.id}>
              <Td className="font-medium">{i.name}</Td>
              <Td className="text-muted-foreground">{i.type}</Td>
              <Td className="text-muted-foreground">{i.scope}</Td>
              <Td className="text-muted-foreground whitespace-nowrap">{i.lastSync}</Td>
              <Td className="text-muted-foreground">{i.owner}</Td>
              <Td>
                <Badge tone={statusTone(i.status)}>{i.status}</Badge>
              </Td>
              <Td className="text-right whitespace-nowrap">
                {i.status === "Connected" ? (
                  <GhostButton onClick={() => set(i.id, "Disconnected", `${i.name} disconnected`)}>
                    Disconnect
                  </GhostButton>
                ) : (
                  <GhostButton onClick={() => set(i.id, "Connected", `${i.name} connected`)}>
                    Connect
                  </GhostButton>
                )}
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
