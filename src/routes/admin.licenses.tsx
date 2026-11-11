import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/clinik/PageHeader";
import {
  Badge,
  GhostButton,
  Panel,
  PrimaryButton,
  StatCard,
  Table,
  Td,
  Tr,
  inputCls,
  statusTone,
} from "@/components/clinik/AdminUI";
import { RequirePermission } from "./admin";
import { LICENSE_SUMMARY, ORG_USERS, type AdminUser } from "@/lib/admin";

export const Route = createFileRoute("/admin/licenses")({
  head: () => ({
    meta: [
      { title: "Licenses - Rhea administration" },
      { name: "description", content: "Assign, revoke, and track Enterprise license utilization." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequirePermission permission="licenses.manage" label="license management">
      <LicensesPage />
    </RequirePermission>
  ),
});

function LicensesPage() {
  const [users, setUsers] = useState<AdminUser[]>(ORG_USERS);
  const [q, setQ] = useState("");
  const filtered = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()),
  );

  const setLicense = (u: AdminUser, license: AdminUser["license"]) => {
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, license } : x)));
    toast.success(
      license === "Assigned" ? `License assigned to ${u.name}` : `License revoked from ${u.name}`,
    );
  };

  return (
    <div className="px-12 py-14 max-w-6xl">
      <PageHeader
        breadcrumb={[{ label: "Administration", to: "/admin" }, { label: "Licenses" }]}
        title="Licenses"
        description="Enterprise licenses are purchased under contract and assigned to individual users."
        actions={
          <PrimaryButton
            onClick={() => toast.success("License purchase request sent to your account team")}
          >
            Request more licenses
          </PrimaryButton>
        }
      />

      <div className="grid gap-5 sm:grid-cols-4 mb-10">
        <StatCard label="Purchased" value={LICENSE_SUMMARY.purchased} />
        <StatCard label="Assigned" value={LICENSE_SUMMARY.assigned} tone="positive" />
        <StatCard label="Available" value={LICENSE_SUMMARY.available} />
        <StatCard
          label="Utilization"
          value={`${LICENSE_SUMMARY.utilization}%`}
          hint="Assigned against purchased licenses."
        />
      </div>

      <Panel padded={false}>
        <div className="px-8 pt-7 pb-5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users"
            className={`${inputCls} max-w-sm`}
          />
        </div>
        <Table head={["User", "Department", "License type", "Assigned", "Status", ""]}>
          {filtered.slice(0, 40).map((u) => (
            <Tr key={u.id}>
              <Td>
                <div className="font-medium">{u.name}</div>
                <div className="text-[12px] text-muted-foreground">{u.email}</div>
              </Td>
              <Td className="text-muted-foreground">{u.department}</Td>
              <Td className="text-muted-foreground">{u.licenseType}</Td>
              <Td className="text-muted-foreground whitespace-nowrap">
                {u.license === "Assigned" ? u.assignedDate : "-"}
              </Td>
              <Td>
                <Badge tone={statusTone(u.license)}>{u.license}</Badge>
              </Td>
              <Td className="text-right">
                {u.license === "Assigned" ? (
                  <GhostButton onClick={() => setLicense(u, "Unassigned")}>Revoke</GhostButton>
                ) : (
                  <GhostButton onClick={() => setLicense(u, "Assigned")}>Assign</GhostButton>
                )}
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
