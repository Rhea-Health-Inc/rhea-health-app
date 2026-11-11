import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/clinik/PageHeader";
import {
  Badge,
  Field,
  GhostButton,
  Modal,
  Panel,
  PrimaryButton,
  StatCard,
  Table,
  Td,
  Tr,
  inputCls,
} from "@/components/clinik/AdminUI";
import { RequirePermission } from "./admin";
import { DEPARTMENTS, ORG_USERS, type Department } from "@/lib/admin";

export const Route = createFileRoute("/admin/departments")({
  head: () => ({
    meta: [
      { title: "Departments - Rhea administration" },
      {
        name: "description",
        content: "Create and manage clinical departments, administrators, and membership.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequirePermission permission="departments.manage" label="department management">
      <DepartmentsPage />
    </RequirePermission>
  ),
});

function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(DEPARTMENTS);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [administrator, setAdministrator] = useState(ORG_USERS[0].name);
  const [location, setLocation] = useState("");

  const create = () => {
    if (!name.trim()) {
      toast.error("Department name is required");
      return;
    }
    setDepartments((prev) => [
      {
        id: `d_${Date.now()}`,
        name: name.trim(),
        administrator,
        users: 0,
        clinicians: 0,
        active: true,
        location: location || "Unassigned",
      },
      ...prev,
    ]);
    setName("");
    setLocation("");
    setCreateOpen(false);
    toast.success("Department created");
  };

  const toggle = (d: Department) => {
    setDepartments((prev) => prev.map((x) => (x.id === d.id ? { ...x, active: !x.active } : x)));
    toast.success(`${d.name} ${d.active ? "deactivated" : "activated"}`);
  };

  return (
    <div className="px-12 py-14 max-w-6xl">
      <PageHeader
        breadcrumb={[{ label: "Administration", to: "/admin" }, { label: "Departments" }]}
        title="Departments"
        description="Departments organize users, documentation templates, and reporting boundaries across the organization."
        actions={
          <PrimaryButton onClick={() => setCreateOpen(true)}>Create department</PrimaryButton>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3 mb-10">
        <StatCard label="Total departments" value={departments.length} />
        <StatCard
          label="Active"
          value={departments.filter((d) => d.active).length}
          tone="positive"
        />
        <StatCard
          label="Clinicians assigned"
          value={departments.reduce((s, d) => s + d.clinicians, 0)}
        />
      </div>

      <Panel padded={false}>
        <Table
          head={["Department", "Administrator", "Users", "Clinicians", "Location", "Status", ""]}
        >
          {departments.map((d) => (
            <Tr key={d.id}>
              <Td className="font-medium">{d.name}</Td>
              <Td className="text-muted-foreground">{d.administrator}</Td>
              <Td>{d.users}</Td>
              <Td>{d.clinicians}</Td>
              <Td className="text-muted-foreground">{d.location}</Td>
              <Td>
                <Badge tone={d.active ? "success" : "neutral"}>
                  {d.active ? "Active" : "Inactive"}
                </Badge>
              </Td>
              <Td className="text-right whitespace-nowrap">
                <button
                  onClick={() => setSelected(d)}
                  className="text-[14px] text-primary hover:underline mr-4"
                >
                  Manage
                </button>
                <button
                  onClick={() => toggle(d)}
                  className="text-[14px] text-muted-foreground hover:text-foreground"
                >
                  {d.active ? "Deactivate" : "Activate"}
                </button>
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create department"
        description="New departments start empty and can be populated from the user directory."
        footer={
          <>
            <GhostButton onClick={() => setCreateOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={create}>Create department</PrimaryButton>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Department name">
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Neurology"
            />
          </Field>
          <Field label="Department administrator">
            <select
              className={inputCls}
              value={administrator}
              onChange={(e) => setAdministrator(e.target.value)}
            >
              {ORG_USERS.slice(0, 20).map((u) => (
                <option key={u.id}>{u.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <input
              className={inputCls}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Tower B, Level 4"
            />
          </Field>
        </div>
      </Modal>

      {selected && (
        <Modal
          open
          wide
          onClose={() => setSelected(null)}
          title={selected.name}
          description={`${selected.users} users · ${selected.clinicians} clinicians · ${selected.location}`}
          footer={
            <>
              <GhostButton onClick={() => setSelected(null)}>Close</GhostButton>
              <PrimaryButton
                onClick={() => {
                  toast.success("Department updated");
                  setSelected(null);
                }}
              >
                Save changes
              </PrimaryButton>
            </>
          }
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Department name">
              <input className={inputCls} defaultValue={selected.name} />
            </Field>
            <Field label="Administrator">
              <select className={inputCls} defaultValue={selected.administrator}>
                {ORG_USERS.slice(0, 20).map((u) => (
                  <option key={u.id}>{u.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <input className={inputCls} defaultValue={selected.location} />
            </Field>
            <Field label="Default documentation template">
              <select className={inputCls} defaultValue="SOAP">
                <option>SOAP</option>
                <option>Problem-oriented</option>
                <option>Specialty consult</option>
              </select>
            </Field>
          </div>

          <div className="mt-8">
            <div className="text-[13px] font-medium text-muted-foreground mb-3">Members</div>
            <div className="rounded-xl hairline overflow-hidden">
              <Table head={["Name", "Role type", "Status"]}>
                {ORG_USERS.filter((u) => u.department === selected.name)
                  .slice(0, 10)
                  .map((u) => (
                    <Tr key={u.id}>
                      <Td>{u.name}</Td>
                      <Td className="text-muted-foreground">{u.userType}</Td>
                      <Td>
                        <Badge tone={u.status === "Active" ? "success" : "warning"}>
                          {u.status}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
              </Table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
