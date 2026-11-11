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
  Table,
  Td,
  Tr,
  inputCls,
} from "@/components/clinik/AdminUI";
import { RequirePermission } from "./admin";
import {
  ORG_LEVEL_CATEGORIES,
  PERMISSIONS,
  ROLE_DEFS,
  type PermissionCategory,
  type RoleDef,
} from "@/lib/admin";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({
    meta: [
      { title: "Roles and permissions - Rhea administration" },
      {
        name: "description",
        content: "Define roles and control what each role can do across the organization.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequirePermission permission="roles.manage" label="roles and permissions">
      <RolesPage />
    </RequirePermission>
  ),
});

const CATEGORIES = Array.from(new Set(PERMISSIONS.map((p) => p.category))) as PermissionCategory[];

function RolesPage() {
  const [roles, setRoles] = useState<RoleDef[]>(ROLE_DEFS);
  const [selected, setSelected] = useState<RoleDef | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [baseRole, setBaseRole] = useState(ROLE_DEFS[0].id);

  const togglePerm = (roleId: string, permId: string) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? {
              ...r,
              permissions: r.permissions.includes(permId)
                ? r.permissions.filter((p) => p !== permId)
                : [...r.permissions, permId],
            }
          : r,
      ),
    );
    setSelected((s) =>
      s && s.id === roleId
        ? {
            ...s,
            permissions: s.permissions.includes(permId)
              ? s.permissions.filter((p) => p !== permId)
              : [...s.permissions, permId],
          }
        : s,
    );
  };

  const createRole = () => {
    if (!newName.trim()) {
      toast.error("Role name is required");
      return;
    }
    const base = roles.find((r) => r.id === baseRole)!;
    const role: RoleDef = {
      ...base,
      id: `custom_${Date.now()}` as RoleDef["id"],
      name: newName.trim(),
      system: false,
      members: 0,
      description: `Custom role derived from ${base.name}.`,
    };
    setRoles((prev) => [...prev, role]);
    setNewName("");
    setCreateOpen(false);
    toast.success("Custom role created");
  };

  return (
    <div className="px-12 py-14 max-w-6xl">
      <PageHeader
        breadcrumb={[{ label: "Administration", to: "/admin" }, { label: "Roles & permissions" }]}
        title="Roles and permissions"
        description="Roles determine what each member can see and change. Organization-level permissions are restricted to administrative roles."
        actions={
          <PrimaryButton onClick={() => setCreateOpen(true)}>Create custom role</PrimaryButton>
        }
      />

      <Panel padded={false}>
        <Table head={["Role", "Type", "Members", "Permissions", "Origin", ""]}>
          {roles.map((r) => (
            <Tr key={r.id}>
              <Td>
                <div className="font-medium">{r.name}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5 max-w-md">
                  {r.description}
                </div>
              </Td>
              <Td className="text-muted-foreground">{r.type}</Td>
              <Td>{r.members}</Td>
              <Td>{r.permissions.length}</Td>
              <Td>
                <Badge tone={r.system ? "neutral" : "info"}>{r.system ? "System" : "Custom"}</Badge>
              </Td>
              <Td className="text-right">
                <button
                  onClick={() => setSelected(r)}
                  className="text-[14px] text-primary hover:underline"
                >
                  View permissions
                </button>
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      {selected && (
        <Modal
          open
          wide
          onClose={() => setSelected(null)}
          title={selected.name}
          description={`${selected.type} role · ${selected.permissions.length} permissions granted`}
          footer={
            <>
              <GhostButton onClick={() => setSelected(null)}>Close</GhostButton>
              <PrimaryButton
                onClick={() => {
                  toast.success("Permissions saved");
                  setSelected(null);
                }}
              >
                Save permissions
              </PrimaryButton>
            </>
          }
        >
          <div className="space-y-8">
            {CATEGORIES.map((cat) => {
              const orgLevel = ORG_LEVEL_CATEGORIES.includes(cat);
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="text-[15px] font-medium">{cat}</div>
                    {orgLevel && <Badge tone="warning">Organization level</Badge>}
                  </div>
                  <div className="space-y-2">
                    {PERMISSIONS.filter((p) => p.category === cat).map((p) => {
                      const granted = selected.permissions.includes(p.id);
                      const locked = selected.system;
                      return (
                        <label
                          key={p.id}
                          className={`flex items-start gap-3 rounded-xl hairline px-4 py-3 ${
                            locked ? "opacity-70" : "hover:bg-muted/60 cursor-pointer"
                          } transition`}
                        >
                          <input
                            type="checkbox"
                            checked={granted}
                            disabled={locked}
                            onChange={() => togglePerm(selected.id, p.id)}
                            className="mt-1 w-4 h-4 accent-[var(--color-primary)]"
                          />
                          <span className="min-w-0">
                            <span className="block text-[14px] font-medium">{p.label}</span>
                            <span className="block text-[12px] text-muted-foreground mt-0.5">
                              {p.description}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {selected.system && (
              <p className="text-[13px] text-muted-foreground">
                System roles are read-only. Duplicate this role as a custom role to change its
                permissions.
              </p>
            )}
          </div>
        </Modal>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create custom role"
        description="Start from an existing role, then adjust its permissions."
        footer={
          <>
            <GhostButton onClick={() => setCreateOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={createRole}>Create role</PrimaryButton>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Role name">
            <input
              className={inputCls}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Regional compliance lead"
            />
          </Field>
          <Field label="Base role">
            <select
              className={inputCls}
              value={baseRole}
              onChange={(e) => setBaseRole(e.target.value as RoleDef["id"])}
            >
              {ROLE_DEFS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
