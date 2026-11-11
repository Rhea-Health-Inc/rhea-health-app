import type { AppRoute } from "@/types/navigation";
// Enterprise Administration workspace: permission model, workspace state, and
// realistic placeholder data. Client-side only until a backend is connected.

import { useSyncExternalStore } from "react";
import { getPractice } from "@/lib/practice";

/* ------------------------------- workspace ------------------------------- */

export type Workspace = "clinical" | "administration";
const WS_KEY = "rhea.workspace.v1";
const ROLE_KEY = "rhea.adminRole.v1";

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getWorkspace(): Workspace {
  if (typeof window === "undefined") return "clinical";
  return (window.localStorage.getItem(WS_KEY) as Workspace) || "clinical";
}

export function setWorkspace(w: Workspace) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WS_KEY, w);
  emit();
}

export function useWorkspace(): Workspace {
  return useSyncExternalStore(subscribe, getWorkspace, () => "clinical" as Workspace);
}

/* ----------------------------- roles & perms ----------------------------- */

export type AdminRoleId =
  | "org_admin"
  | "clinical_admin"
  | "billing_manager"
  | "it_security_admin"
  | "physician"
  | "specialist"
  | "nurse"
  | "medical_assistant"
  | "receptionist";

export type PermissionKey =
  | "admin.access"
  | "users.manage"
  | "departments.manage"
  | "roles.manage"
  | "licenses.manage"
  | "usage.view"
  | "billing.manage"
  | "integrations.manage"
  | "security.manage"
  | "audit.view"
  | "ai.govern";

export type PermissionCategory =
  | "Clinical"
  | "Patients"
  | "Documentation"
  | "Recording"
  | "Messaging"
  | "Users"
  | "Departments"
  | "Billing"
  | "Integrations"
  | "Security"
  | "Reporting"
  | "Administration";

export const ORG_LEVEL_CATEGORIES: PermissionCategory[] = [
  "Users",
  "Departments",
  "Billing",
  "Integrations",
  "Security",
  "Reporting",
  "Administration",
];

export type PermissionDef = {
  id: string;
  label: string;
  category: PermissionCategory;
  description: string;
};

export const PERMISSIONS: PermissionDef[] = [
  {
    id: "clinical.encounters",
    label: "Conduct encounters",
    category: "Clinical",
    description: "Start, join, and complete patient encounters.",
  },
  {
    id: "clinical.schedule",
    label: "Manage schedule",
    category: "Clinical",
    description: "View and modify the clinic schedule.",
  },
  {
    id: "patients.view",
    label: "View patients",
    category: "Patients",
    description: "Access the patient directory and charts.",
  },
  {
    id: "patients.edit",
    label: "Edit patient records",
    category: "Patients",
    description: "Create and update patient demographics.",
  },
  {
    id: "documentation.create",
    label: "Create documentation",
    category: "Documentation",
    description: "Generate and edit clinical notes.",
  },
  {
    id: "documentation.sign",
    label: "Sign documentation",
    category: "Documentation",
    description: "Apply a legal signature to a note.",
  },
  {
    id: "documentation.review",
    label: "Review others' notes",
    category: "Documentation",
    description: "Review and co-sign notes from other clinicians.",
  },
  {
    id: "recording.capture",
    label: "Record encounters",
    category: "Recording",
    description: "Capture ambient audio during a visit.",
  },
  {
    id: "recording.export",
    label: "Export recordings",
    category: "Recording",
    description: "Download or forward stored audio.",
  },
  {
    id: "messaging.patients",
    label: "Message patients",
    category: "Messaging",
    description: "Send and receive secure patient messages.",
  },
  {
    id: "users.view",
    label: "View users",
    category: "Users",
    description: "See the organization user directory.",
  },
  {
    id: "users.manage",
    label: "Manage users",
    category: "Users",
    description: "Invite, edit, and deactivate users.",
  },
  {
    id: "users.roles",
    label: "Change user roles",
    category: "Users",
    description: "Assign roles to organization members.",
  },
  {
    id: "departments.view",
    label: "View departments",
    category: "Departments",
    description: "See departments and their membership.",
  },
  {
    id: "departments.manage",
    label: "Manage departments",
    category: "Departments",
    description: "Create, edit, and deactivate departments.",
  },
  {
    id: "billing.view",
    label: "View billing",
    category: "Billing",
    description: "See invoices, contracts, and payment status.",
  },
  {
    id: "billing.manage",
    label: "Manage billing",
    category: "Billing",
    description: "Update billing details and purchase licenses.",
  },
  {
    id: "integrations.view",
    label: "View integrations",
    category: "Integrations",
    description: "See connected systems and sync status.",
  },
  {
    id: "integrations.manage",
    label: "Manage integrations",
    category: "Integrations",
    description: "Connect, configure, and disconnect systems.",
  },
  {
    id: "security.view",
    label: "View security settings",
    category: "Security",
    description: "Inspect authentication and access policy.",
  },
  {
    id: "security.manage",
    label: "Manage security settings",
    category: "Security",
    description: "Change SSO, MFA, session, and IP policy.",
  },
  {
    id: "security.audit",
    label: "View audit logs",
    category: "Security",
    description: "Read the organization-wide audit trail.",
  },
  {
    id: "reporting.usage",
    label: "View usage reporting",
    category: "Reporting",
    description: "Access organization usage analytics.",
  },
  {
    id: "admin.workspace",
    label: "Access administration workspace",
    category: "Administration",
    description: "Enter the enterprise administration workspace.",
  },
  {
    id: "admin.ai",
    label: "Govern AI policy",
    category: "Administration",
    description: "Set organization-level AI governance policy.",
  },
];

export type RoleDef = {
  id: AdminRoleId;
  name: string;
  type: "Administrative" | "Clinical" | "Operational";
  system: boolean;
  description: string;
  scope: PermissionKey[];
  permissions: string[];
  members: number;
};

const ALL_PERM_IDS = PERMISSIONS.map((p) => p.id);

export const ROLE_DEFS: RoleDef[] = [
  {
    id: "org_admin",
    name: "Organization Administrator",
    type: "Administrative",
    system: true,
    description: "Full administrative control over the organization, its users, and its contracts.",
    scope: [
      "admin.access",
      "users.manage",
      "departments.manage",
      "roles.manage",
      "licenses.manage",
      "usage.view",
      "billing.manage",
      "integrations.manage",
      "security.manage",
      "audit.view",
      "ai.govern",
    ],
    permissions: ALL_PERM_IDS,
    members: 3,
  },
  {
    id: "clinical_admin",
    name: "Clinical Administrator",
    type: "Administrative",
    system: true,
    description: "Clinical oversight plus user and department administration for clinical staff.",
    scope: ["admin.access", "users.manage", "departments.manage", "usage.view", "ai.govern"],
    permissions: [
      "clinical.encounters",
      "clinical.schedule",
      "patients.view",
      "patients.edit",
      "documentation.create",
      "documentation.sign",
      "documentation.review",
      "recording.capture",
      "messaging.patients",
      "users.view",
      "users.manage",
      "users.roles",
      "departments.view",
      "departments.manage",
      "reporting.usage",
      "admin.workspace",
      "admin.ai",
    ],
    members: 6,
  },
  {
    id: "billing_manager",
    name: "Billing Manager",
    type: "Administrative",
    system: true,
    description: "Contract, invoice, and license administration only. No clinical data access.",
    scope: ["admin.access", "billing.manage", "licenses.manage", "usage.view"],
    permissions: [
      "billing.view",
      "billing.manage",
      "reporting.usage",
      "users.view",
      "admin.workspace",
    ],
    members: 2,
  },
  {
    id: "it_security_admin",
    name: "IT / Security Administrator",
    type: "Administrative",
    system: true,
    description: "Security posture, identity, integrations, and the audit trail.",
    scope: ["admin.access", "security.manage", "integrations.manage", "audit.view", "usage.view"],
    permissions: [
      "security.view",
      "security.manage",
      "security.audit",
      "integrations.view",
      "integrations.manage",
      "users.view",
      "reporting.usage",
      "admin.workspace",
    ],
    members: 4,
  },
  {
    id: "physician",
    name: "Physician",
    type: "Clinical",
    system: true,
    description: "Full clinical documentation privileges within assigned departments.",
    scope: [],
    permissions: [
      "clinical.encounters",
      "clinical.schedule",
      "patients.view",
      "patients.edit",
      "documentation.create",
      "documentation.sign",
      "documentation.review",
      "recording.capture",
      "messaging.patients",
    ],
    members: 128,
  },
  {
    id: "specialist",
    name: "Specialist",
    type: "Clinical",
    system: true,
    description: "Specialty clinical documentation and consultation privileges.",
    scope: [],
    permissions: [
      "clinical.encounters",
      "patients.view",
      "patients.edit",
      "documentation.create",
      "documentation.sign",
      "recording.capture",
      "messaging.patients",
    ],
    members: 54,
  },
  {
    id: "nurse",
    name: "Nurse",
    type: "Clinical",
    system: true,
    description: "Encounter support, intake documentation, and patient messaging.",
    scope: [],
    permissions: [
      "clinical.encounters",
      "patients.view",
      "documentation.create",
      "recording.capture",
      "messaging.patients",
    ],
    members: 96,
  },
  {
    id: "medical_assistant",
    name: "Medical Assistant",
    type: "Clinical",
    system: true,
    description: "Intake and rooming support with limited documentation rights.",
    scope: [],
    permissions: ["clinical.schedule", "patients.view", "documentation.create"],
    members: 41,
  },
  {
    id: "receptionist",
    name: "Receptionist",
    type: "Operational",
    system: true,
    description: "Scheduling and front-desk coordination. No clinical record access.",
    scope: [],
    permissions: ["clinical.schedule", "patients.view", "messaging.patients"],
    members: 18,
  },
];

export function roleById(id: string) {
  return ROLE_DEFS.find((r) => r.id === id);
}

/* --------------------------- current admin role --------------------------- */

export function getAdminRole(): AdminRoleId {
  if (typeof window === "undefined") return "physician";
  const stored = window.localStorage.getItem(ROLE_KEY) as AdminRoleId | null;
  if (stored) return stored;
  const practice = getPractice();
  if (!practice) return "physician";
  const me = practice.members.find((m) => m.email === practice.ownerEmail);
  if (!me || me.role === "owner" || me.role === "admin") return "org_admin";
  return "physician";
}

export function setAdminRole(role: AdminRoleId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROLE_KEY, role);
  emit();
}

export function useAdminRole(): AdminRoleId {
  return useSyncExternalStore(subscribe, getAdminRole, () => "physician" as AdminRoleId);
}

export function scopeFor(role: AdminRoleId): PermissionKey[] {
  return roleById(role)?.scope ?? [];
}

export function can(role: AdminRoleId, key: PermissionKey) {
  return scopeFor(role).includes(key);
}

export function canAccessAdmin(role: AdminRoleId) {
  return can(role, "admin.access");
}

/* ------------------------------- navigation ------------------------------- */

export type AdminNavItem = {
  to: AppRoute;
  label: string;
  permission: PermissionKey;
  icon: string;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { to: "/admin", label: "Overview", permission: "admin.access", icon: "LayoutDashboard" },
  { to: "/admin/users", label: "Users", permission: "users.manage", icon: "Users" },
  {
    to: "/admin/departments",
    label: "Departments",
    permission: "departments.manage",
    icon: "Building2",
  },
  {
    to: "/admin/roles",
    label: "Roles & permissions",
    permission: "roles.manage",
    icon: "ShieldCheck",
  },
  { to: "/admin/licenses", label: "Licenses", permission: "licenses.manage", icon: "BadgeCheck" },
  { to: "/admin/usage", label: "Usage", permission: "usage.view", icon: "BarChart3" },
  { to: "/admin/billing", label: "Billing", permission: "billing.manage", icon: "CreditCard" },
  {
    to: "/admin/integrations",
    label: "Integrations",
    permission: "integrations.manage",
    icon: "Plug",
  },
  { to: "/admin/security", label: "Security", permission: "security.manage", icon: "Lock" },
  { to: "/admin/audit", label: "Audit logs", permission: "audit.view", icon: "ScrollText" },
  { to: "/admin/ai-governance", label: "AI governance", permission: "ai.govern", icon: "Brain" },
];

/* ------------------------------- org data -------------------------------- */

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRoleId;
  department: string;
  userType: "Clinical" | "Administrative" | "Operational";
  license: "Assigned" | "Unassigned" | "Pending";
  status: "Active" | "Invited" | "Deactivated";
  lastActive: string;
  licenseType: "Enterprise clinician" | "Enterprise administrator" | "Read-only";
  assignedDate: string;
};

const FIRST = [
  "Amara",
  "Daniel",
  "Priya",
  "Marcus",
  "Elena",
  "Tobias",
  "Sofia",
  "Owen",
  "Nadia",
  "Isaac",
  "Ruth",
  "Victor",
  "Mei",
  "Jonah",
  "Clara",
  "Femi",
  "Hannah",
  "Liam",
  "Yara",
  "Caleb",
  "Ingrid",
  "Samuel",
  "Leila",
  "Noah",
];
const LAST = [
  "Okonkwo",
  "Whitfield",
  "Raman",
  "Delacroix",
  "Fitzgerald",
  "Nakamura",
  "Alvarez",
  "Brennan",
  "Haddad",
  "Lindqvist",
  "Mbeki",
  "Sorensen",
  "Zhao",
  "Kowalski",
  "Duarte",
  "Adeyemi",
  "Rosenthal",
  "Gallagher",
  "Haruna",
  "Vance",
  "Bergstrom",
  "Ohene",
  "Farouk",
  "Castellanos",
];

export const DEPARTMENT_NAMES = [
  "Internal Medicine",
  "Cardiology",
  "Emergency Medicine",
  "Pediatrics",
  "Oncology",
  "Orthopedics",
  "Psychiatry",
  "Radiology",
];

const USER_ROLES: AdminRoleId[] = [
  "physician",
  "specialist",
  "nurse",
  "medical_assistant",
  "receptionist",
  "clinical_admin",
  "billing_manager",
  "it_security_admin",
  "org_admin",
];

function typeFor(role: AdminRoleId): AdminUser["userType"] {
  if (["org_admin", "clinical_admin", "billing_manager", "it_security_admin"].includes(role))
    return "Administrative";
  if (role === "receptionist") return "Operational";
  return "Clinical";
}

export const ORG_USERS: AdminUser[] = Array.from({ length: 48 }, (_, i) => {
  const role = USER_ROLES[i % USER_ROLES.length];
  const status: AdminUser["status"] =
    i % 13 === 0 ? "Invited" : i % 17 === 0 ? "Deactivated" : "Active";
  const license: AdminUser["license"] =
    status === "Deactivated"
      ? "Unassigned"
      : status === "Invited"
        ? "Pending"
        : i % 9 === 0
          ? "Unassigned"
          : "Assigned";
  return {
    id: `u_${100 + i}`,
    name: `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}`,
    email: `${FIRST[i % FIRST.length].toLowerCase()}.${LAST[(i * 7) % LAST.length].toLowerCase()}@toronto-general.org`,
    role,
    department: DEPARTMENT_NAMES[i % DEPARTMENT_NAMES.length],
    userType: typeFor(role),
    license,
    status,
    lastActive:
      status === "Invited"
        ? "Never"
        : ["2 minutes ago", "1 hour ago", "Yesterday", "3 days ago", "2 weeks ago"][i % 5],
    licenseType:
      typeFor(role) === "Administrative"
        ? "Enterprise administrator"
        : typeFor(role) === "Clinical"
          ? "Enterprise clinician"
          : "Read-only",
    assignedDate:
      license === "Assigned"
        ? `2026-0${(i % 7) + 1}-${String((i % 27) + 1).padStart(2, "0")}`
        : "-",
  };
});

export type Department = {
  id: string;
  name: string;
  administrator: string;
  users: number;
  clinicians: number;
  active: boolean;
  location: string;
};

export const DEPARTMENTS: Department[] = DEPARTMENT_NAMES.map((name, i) => {
  const users = ORG_USERS.filter((u) => u.department === name);
  return {
    id: `d_${i + 1}`,
    name,
    administrator:
      users.find((u) => u.userType === "Administrative")?.name ?? users[0]?.name ?? "Unassigned",
    users: users.length,
    clinicians: users.filter((u) => u.userType === "Clinical").length,
    active: i !== 7,
    location: [
      "Tower A, Level 3",
      "Tower B, Level 1",
      "Emergency Wing",
      "Tower C, Level 2",
      "Cancer Centre",
      "Tower A, Level 5",
      "Annex",
      "Imaging Suite",
    ][i],
  };
});

export const LICENSE_SUMMARY = {
  purchased: 320,
  get assigned() {
    return ORG_USERS.filter((u) => u.license === "Assigned").length + 240;
  },
  get available() {
    return LICENSE_SUMMARY.purchased - LICENSE_SUMMARY.assigned;
  },
  get utilization() {
    return Math.round((LICENSE_SUMMARY.assigned / LICENSE_SUMMARY.purchased) * 100);
  },
};

export type ActivityEvent = {
  id: string;
  actor: string;
  action: string;
  resource: string;
  department: string;
  at: string;
  result: "Success" | "Failed" | "Pending";
  ip: string;
  session: string;
  category:
    "Users" | "Departments" | "Licenses" | "Integrations" | "Security" | "Billing" | "Patients";
  details: string;
};

const ACTIONS: [ActivityEvent["category"], string, string][] = [
  ["Users", "User created", "Directory"],
  ["Users", "User deactivated", "Directory"],
  ["Users", "Role changed", "Roles & permissions"],
  ["Departments", "Department created", "Departments"],
  ["Licenses", "License assigned", "Licenses"],
  ["Licenses", "License revoked", "Licenses"],
  ["Integrations", "Integration updated", "Epic EHR"],
  ["Security", "Security setting changed", "Session policy"],
  ["Security", "Failed sign-in", "Identity provider"],
  ["Billing", "Billing information changed", "Contract"],
  ["Patients", "Patient record accessed", "Chart"],
  ["Users", "Permission changed", "Custom role"],
];

export const AUDIT_EVENTS: ActivityEvent[] = Array.from({ length: 60 }, (_, i) => {
  const [category, action, resource] = ACTIONS[i % ACTIONS.length];
  const user = ORG_USERS[(i * 5) % ORG_USERS.length];
  const d = new Date(Date.UTC(2026, 7, 11, 16, 0) - i * 47 * 60000);
  return {
    id: `evt_${9000 - i}`,
    actor: user.name,
    action,
    resource,
    department: user.department,
    at: d.toISOString().slice(0, 16).replace("T", " "),
    result: (action === "Failed sign-in"
      ? "Failed"
      : i % 19 === 0
        ? "Pending"
        : "Success") as ActivityEvent["result"],
    ip: `10.${(i % 5) + 12}.4.${(i * 13) % 250}`,
    session: `sess_${(80000 + i * 37).toString(16)}`,
    category,
    details: `${action} performed by ${user.name} on ${resource}. Change recorded from the ${user.department} department network.`,
  };
});

export const RECENT_ACTIVITY = AUDIT_EVENTS.slice(0, 8);

export type AttentionItem = {
  id: string;
  title: string;
  detail: string;
  severity: "high" | "medium" | "low";
  to: AppRoute;
};

export const ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: "a1",
    title: "4 pending user invitations",
    detail: "Invitations sent more than 7 days ago have not been accepted.",
    severity: "medium",
    to: "/admin/users",
  },
  {
    id: "a2",
    title: "12 unassigned licenses",
    detail: "Purchased Enterprise licenses are not yet assigned to a user.",
    severity: "low",
    to: "/admin/licenses",
  },
  {
    id: "a3",
    title: "Calendar integration sync failing",
    detail: "The Exchange calendar connector last synced 2 days ago.",
    severity: "high",
    to: "/admin/integrations",
  },
  {
    id: "a4",
    title: "MFA not enforced for 6 administrators",
    detail: "Organization policy requires MFA for all administrative roles.",
    severity: "high",
    to: "/admin/security",
  },
  {
    id: "a5",
    title: "Department administrator missing",
    detail: "Radiology has no assigned department administrator.",
    severity: "medium",
    to: "/admin/departments",
  },
];

export type Integration = {
  id: string;
  name: string;
  type: "EHR" | "Calendar" | "Secure messaging" | "Identity provider" | "SSO" | "Data / API";
  status: "Connected" | "Degraded" | "Disconnected" | "Pending";
  lastSync: string;
  scope: string;
  owner: string;
};

export const INTEGRATIONS: Integration[] = [
  {
    id: "i1",
    name: "Epic",
    type: "EHR",
    status: "Connected",
    lastSync: "6 minutes ago",
    scope: "Encounters, problems, medications",
    owner: "IT / Security Administration",
  },
  {
    id: "i2",
    name: "Cerner Millennium",
    type: "EHR",
    status: "Pending",
    lastSync: "Never",
    scope: "Read-only chart sync",
    owner: "IT / Security Administration",
  },
  {
    id: "i3",
    name: "Microsoft Exchange",
    type: "Calendar",
    status: "Degraded",
    lastSync: "2 days ago",
    scope: "Clinic schedules",
    owner: "Clinical Administration",
  },
  {
    id: "i4",
    name: "TigerConnect",
    type: "Secure messaging",
    status: "Connected",
    lastSync: "14 minutes ago",
    scope: "Care-team messaging",
    owner: "Clinical Administration",
  },
  {
    id: "i5",
    name: "Okta",
    type: "Identity provider",
    status: "Connected",
    lastSync: "1 hour ago",
    scope: "SCIM user provisioning",
    owner: "IT / Security Administration",
  },
  {
    id: "i6",
    name: "Azure AD SAML",
    type: "SSO",
    status: "Connected",
    lastSync: "1 hour ago",
    scope: "Single sign-on for all users",
    owner: "IT / Security Administration",
  },
  {
    id: "i7",
    name: "Analytics warehouse",
    type: "Data / API",
    status: "Disconnected",
    lastSync: "3 weeks ago",
    scope: "Nightly usage export",
    owner: "Reporting",
  },
];

export const USAGE_SERIES = [
  { month: "Feb", notes: 8120, hours: 1240, encounters: 7420, ai: 62 },
  { month: "Mar", notes: 9040, hours: 1385, encounters: 8180, ai: 65 },
  { month: "Apr", notes: 9610, hours: 1452, encounters: 8770, ai: 68 },
  { month: "May", notes: 10240, hours: 1580, encounters: 9310, ai: 71 },
  { month: "Jun", notes: 11380, hours: 1712, encounters: 10240, ai: 74 },
  { month: "Jul", notes: 12060, hours: 1804, encounters: 10930, ai: 77 },
  { month: "Aug", notes: 6420, hours: 968, encounters: 5810, ai: 79 },
];

export const INVOICES = [
  {
    id: "INV-2026-0081",
    date: "2026-08-01",
    period: "Aug 2026",
    amount: 48000,
    status: "Paid",
    po: "PO-88213",
  },
  {
    id: "INV-2026-0074",
    date: "2026-07-01",
    period: "Jul 2026",
    amount: 48000,
    status: "Paid",
    po: "PO-88213",
  },
  {
    id: "INV-2026-0066",
    date: "2026-06-01",
    period: "Jun 2026",
    amount: 46500,
    status: "Paid",
    po: "PO-88213",
  },
  {
    id: "INV-2026-0059",
    date: "2026-05-01",
    period: "May 2026",
    amount: 46500,
    status: "Paid",
    po: "PO-88101",
  },
  {
    id: "INV-2026-0051",
    date: "2026-04-01",
    period: "Apr 2026",
    amount: 46500,
    status: "Paid",
    po: "PO-88101",
  },
  {
    id: "INV-2026-0044",
    date: "2026-03-01",
    period: "Mar 2026",
    amount: 44000,
    status: "Refunded",
    po: "PO-88101",
  },
];
