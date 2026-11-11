import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  BadgeCheck,
  BarChart3,
  CreditCard,
  Plug,
  Lock,
  ScrollText,
  Brain,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";
import { WorkspaceSwitcher } from "@/components/clinik/WorkspaceSwitcher";
import {
  ADMIN_NAV,
  canAccessAdmin,
  can,
  roleById,
  useAdminRole,
  type PermissionKey,
} from "@/lib/admin";
import { usePractice } from "@/lib/practice";
import { useAppearance } from "@/hooks/use-appearance";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Administration - Rhea" },
      {
        name: "description",
        content: "Enterprise administration workspace for your organization.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const ICONS: Record<string, typeof Users> = {
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  BadgeCheck,
  BarChart3,
  CreditCard,
  Plug,
  Lock,
  ScrollText,
  Brain,
};

export function AccessDenied({ what = "this administrative area" }: { what?: string }) {
  const navigate = useNavigate();
  const role = useAdminRole();
  return (
    <div className="px-12 py-14 max-w-2xl">
      <div className="rounded-2xl bg-card hairline p-10 shadow-[var(--shadow-clinik-sm)]">
        <ShieldAlert className="w-7 h-7 text-amber-700" />
        <h1 className="mt-5 h-display text-[28px] font-semibold tracking-[-0.02em]">
          Access restricted
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Your assigned role,{" "}
          <span className="text-foreground">{roleById(role)?.name ?? "Clinician"}</span>, is not
          authorized to open {what}. Ask an Organization Administrator to grant the required
          permission.
        </p>
        <button
          onClick={() => navigate({ to: "/app" })}
          className="mt-7 h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to clinical workspace
        </button>
      </div>
    </div>
  );
}

/** Route-level permission gate. Rendered inside every administration section. */
export function RequirePermission({
  permission,
  label,
  children,
}: {
  permission: PermissionKey;
  label: string;
  children: React.ReactNode;
}) {
  const role = useAdminRole();
  if (!canAccessAdmin(role) || !can(role, permission)) return <AccessDenied what={label} />;
  return <>{children}</>;
}

function AdminLayout() {
  const role = useAdminRole();
  const practice = usePractice();
  const { appearance } = useAppearance();
  const collapsed = appearance.sidebar === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!canAccessAdmin(role)) {
    return (
      <div className="rhea-app min-h-screen bg-background text-foreground">
        <AccessDenied what="the Enterprise Administration workspace" />
      </div>
    );
  }

  const orgName = practice?.name ?? "Your organization";
  const items = ADMIN_NAV.filter((n) => can(role, n.permission));

  return (
    <div className="rhea-app min-h-screen w-full flex bg-background text-foreground">
      <aside
        className={`${collapsed ? "w-[72px]" : "w-[260px]"} shrink-0 h-screen sticky top-0 flex flex-col border-r border-border/70 bg-[color-mix(in_oklab,var(--color-background)_60%,var(--color-surface))]`}
      >
        <div
          className={`h-[72px] flex items-center ${collapsed ? "px-4 justify-center" : "px-5"} gap-3`}
        >
          <OrgMark practice={practice} compact />
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[14px] font-semibold truncate">Rhea Health</div>
              <div className="text-[12px] text-muted-foreground truncate">{orgName}</div>
            </div>
          )}
        </div>

        <WorkspaceSwitcher collapsed={collapsed} />

        <nav className="px-3 flex-1 overflow-y-auto pb-4">
          {!collapsed && (
            <div className="px-3 mb-2 mt-4 text-[12px] uppercase tracking-[0.12em] text-muted-foreground/80 font-semibold">
              Administration
            </div>
          )}
          <div className="space-y-1">
            {items.map((n) => {
              const active = n.to === "/admin" ? pathname === "/admin" : pathname.startsWith(n.to);
              const Icon = ICONS[n.icon] ?? Users;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  title={collapsed ? n.label : undefined}
                  className={`relative flex items-center ${collapsed ? "justify-center px-0" : "px-3"} gap-3 h-10 rounded-full text-[14px] transition ${
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary"
                    />
                  )}
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{n.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-border/70">
          <div className={`px-3 py-2 ${collapsed ? "hidden" : ""}`}>
            <div className="text-[12px] uppercase tracking-[0.12em] text-muted-foreground/80 font-semibold">
              Signed in as
            </div>
            <div className="text-[14px] text-foreground truncate">{roleById(role)?.name}</div>
          </div>
          <Link
            to="/app"
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-[14px] text-muted-foreground hover:text-foreground hover:bg-muted transition ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" /> {!collapsed && "Clinical workspace"}
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <AdminOrgHeader />
        <Outlet />
      </main>
    </div>
  );
}

function OrgMark({
  practice,
  compact = false,
}: {
  practice: ReturnType<typeof usePractice>;
  compact?: boolean;
}) {
  const size = compact ? "w-9 h-9" : "w-14 h-14";
  if (practice?.logo) {
    return (
      <img
        src={practice.logo}
        alt={`${practice.name} logo`}
        className={`${size} rounded-xl object-cover hairline shrink-0`}
      />
    );
  }
  const initials = (practice?.name ?? "Rhea Health")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div
      className={`${size} rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0 ${
        compact ? "text-[14px]" : "text-[18px]"
      }`}
    >
      {initials}
    </div>
  );
}

export function AdminOrgHeader() {
  const practice = usePractice();
  const role = useAdminRole();
  return (
    <div className="border-b border-border/70 bg-[color-mix(in_oklab,var(--color-background)_70%,var(--color-surface))]">
      <div className="px-12 py-7 flex items-center gap-5 flex-wrap">
        <OrgMark practice={practice} />
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-muted-foreground">Rhea Health</div>
          <div className="text-[22px] font-semibold tracking-[-0.015em] truncate">
            {practice?.name ?? "Your organization"}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[12px] uppercase tracking-[0.12em] text-muted-foreground/80 font-semibold">
            Enterprise administration
          </div>
          <div className="text-[14px] text-foreground">{roleById(role)?.name}</div>
        </div>
      </div>
    </div>
  );
}
