import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  statusTone,
} from "@/components/clinik/AdminUI";
import { RequirePermission } from "./admin";
import { DEPARTMENT_NAMES, ORG_USERS, ROLE_DEFS, roleById, type AdminUser } from "@/lib/admin";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User management - Rhea administration" },
      {
        name: "description",
        content: "Invite, filter, and manage every user across your organization.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequirePermission permission="users.manage" label="user management">
      <UsersPage />
    </RequirePermission>
  ),
});

function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(ORG_USERS);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [license, setLicense] = useState("all");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          (dept === "all" || u.department === dept) &&
          (role === "all" || u.role === role) &&
          (status === "all" || u.status === status) &&
          (license === "all" || u.license === license) &&
          (q.trim() === "" ||
            `${u.name} ${u.email} ${u.department}`.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [users, q, dept, role, status, license],
  );

  const update = (id: string, patch: Partial<AdminUser>) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  return (
    <div className="px-12 py-14 max-w-6xl">
      <PageHeader
        breadcrumb={[{ label: "Administration", to: "/admin" }, { label: "Users" }]}
        title="Users"
        description="Every person with access to your organization, including clinicians, administrators, and operational staff."
        actions={<PrimaryButton onClick={() => setInviteOpen(true)}>Invite user</PrimaryButton>}
      />

      <Panel padded={false}>
        <div className="px-8 pt-7 pb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, department"
            className={`${inputCls} lg:col-span-2`}
          />
          <select value={dept} onChange={(e) => setDept(e.target.value)} className={inputCls}>
            <option value="all">All departments</option>
            {DEPARTMENT_NAMES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
            <option value="all">All roles</option>
            {ROLE_DEFS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
              <option value="all">Any status</option>
              <option>Active</option>
              <option>Invited</option>
              <option>Deactivated</option>
            </select>
            <select
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              className={inputCls}
            >
              <option value="all">Any license</option>
              <option>Assigned</option>
              <option>Unassigned</option>
              <option>Pending</option>
            </select>
          </div>
        </div>

        <div className="px-8 pb-3 text-[13px] text-muted-foreground">
          {filtered.length} of {users.length} users
        </div>

        <Table head={["Name", "Email", "Role", "Department", "License", "Status", "Last active"]}>
          {filtered.slice(0, 40).map((u) => (
            <Tr key={u.id} onClick={() => setSelected(u)}>
              <Td className="font-medium">{u.name}</Td>
              <Td className="text-muted-foreground">{u.email}</Td>
              <Td>{roleById(u.role)?.name ?? u.role}</Td>
              <Td className="text-muted-foreground">{u.department}</Td>
              <Td>
                <Badge tone={statusTone(u.license)}>{u.license}</Badge>
              </Td>
              <Td>
                <Badge tone={statusTone(u.status)}>{u.status}</Badge>
              </Td>
              <Td className="text-muted-foreground whitespace-nowrap">{u.lastActive}</Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      <UserDetail
        user={selected}
        onClose={() => setSelected(null)}
        onUpdate={(patch) => {
          if (!selected) return;
          update(selected.id, patch);
          setSelected({ ...selected, ...patch });
        }}
      />

      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={(u) => {
          setUsers((prev) => [u, ...prev]);
          setInviteOpen(false);
          toast.success(`Invitation sent to ${u.email}`);
        }}
      />
    </div>
  );
}

function UserDetail({
  user,
  onClose,
  onUpdate,
}: {
  user: AdminUser | null;
  onClose: () => void;
  onUpdate: (patch: Partial<AdminUser>) => void;
}) {
  if (!user) return null;
  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={user.name}
      description={`${roleById(user.role)?.name} · ${user.department}`}
      footer={
        <>
          <GhostButton onClick={onClose}>Close</GhostButton>
          {user.status !== "Deactivated" ? (
            <GhostButton
              onClick={() => {
                onUpdate({ status: "Deactivated", license: "Unassigned" });
                toast.success(`${user.name} deactivated and license released`);
              }}
            >
              Deactivate user
            </GhostButton>
          ) : (
            <GhostButton
              onClick={() => {
                onUpdate({ status: "Active" });
                toast.success(`${user.name} reactivated`);
              }}
            >
              Reactivate user
            </GhostButton>
          )}
          <PrimaryButton onClick={() => toast.success("User profile saved")}>
            Save changes
          </PrimaryButton>
        </>
      }
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Full name">
          <input className={inputCls} defaultValue={user.name} />
        </Field>
        <Field label="Work email">
          <input className={inputCls} defaultValue={user.email} />
        </Field>
        <Field label="Role">
          <select
            className={inputCls}
            value={user.role}
            onChange={(e) => onUpdate({ role: e.target.value as AdminUser["role"] })}
          >
            {ROLE_DEFS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Department">
          <select
            className={inputCls}
            value={user.department}
            onChange={(e) => onUpdate({ department: e.target.value })}
          >
            {DEPARTMENT_NAMES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="License" hint={`Assigned ${user.assignedDate} · ${user.licenseType}`}>
          <select
            className={inputCls}
            value={user.license}
            onChange={(e) => onUpdate({ license: e.target.value as AdminUser["license"] })}
          >
            <option>Assigned</option>
            <option>Unassigned</option>
            <option>Pending</option>
          </select>
        </Field>
        <Field label="User type">
          <input className={inputCls} defaultValue={user.userType} readOnly />
        </Field>
      </div>

      <div className="mt-8 rounded-xl bg-muted/50 p-5">
        <div className="text-[13px] font-medium text-muted-foreground">Recent activity</div>
        <ul className="mt-3 space-y-2 text-[14px]">
          <li>Signed in from the organization network - {user.lastActive}</li>
          <li>Documentation signed in {user.department}</li>
          <li>
            License {user.license.toLowerCase()} on {user.assignedDate}
          </li>
        </ul>
      </div>
    </Modal>
  );
}

function InviteDialog({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (u: AdminUser) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminUser["role"]>("physician");
  const [department, setDepartment] = useState(DEPARTMENT_NAMES[0]);
  const [assignLicense, setAssignLicense] = useState(true);

  const submit = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and work email are required");
      return;
    }
    onInvite({
      id: `u_new_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      department,
      userType: roleById(role)?.type ?? "Clinical",
      license: assignLicense ? "Assigned" : "Unassigned",
      status: "Invited",
      lastActive: "Never",
      licenseType:
        roleById(role)?.type === "Administrative"
          ? "Enterprise administrator"
          : "Enterprise clinician",
      assignedDate: new Date().toISOString().slice(0, 10),
    });
    setName("");
    setEmail("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite user"
      description="The invitation is sent by email and expires after 14 days."
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={submit}>Send invitation</PrimaryButton>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Full name">
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dr. Amara Okonkwo"
          />
        </Field>
        <Field label="Work email">
          <input
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@organization.health"
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Role">
            <select
              className={inputCls}
              value={role}
              onChange={(e) => setRole(e.target.value as AdminUser["role"])}
            >
              {ROLE_DEFS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Department">
            <select
              className={inputCls}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {DEPARTMENT_NAMES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
        </div>
        <label className="flex items-start gap-3 text-[14px]">
          <input
            type="checkbox"
            checked={assignLicense}
            onChange={(e) => setAssignLicense(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[var(--color-primary)]"
          />
          <span>
            Assign an Enterprise license immediately
            <span className="block text-[12px] text-muted-foreground mt-0.5">
              Unchecked users are invited without consuming a license.
            </span>
          </span>
        </label>
      </div>
    </Modal>
  );
}
