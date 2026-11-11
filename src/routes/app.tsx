import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useDialogDismiss } from "@/hooks/use-dialog-dismiss";
import {
  Home,
  Calendar,
  Users,
  Mic,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  Building2,
  Search,
  Bell,
  LifeBuoy,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/clinik/Logo";
import { WorkspaceSwitcher } from "@/components/clinik/WorkspaceSwitcher";

import { CLINICIAN, APPOINTMENTS } from "@/lib/mock";
import { signOut } from "@/lib/auth";
import { usePractice } from "@/lib/practice";
import { useAppearance } from "@/hooks/use-appearance";
import type { NavItem } from "@/types/navigation";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Workspace - Rhea" },
      { name: "description", content: "Your Rhea clinician workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppLayout,
});

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Clinic",
    items: [
      { to: "/app", label: "Home", icon: Home, exact: true },
      { to: "/app/schedule", label: "Today's schedule", icon: Calendar },
      { to: "/app/patients", label: "Patients", icon: Users },
    ],
  },
  {
    label: "Documentation",
    items: [
      { to: "/app/sessions", label: "Sessions", icon: Mic },
      { to: "/app/documentation", label: "Documentation", icon: FileText },
      { to: "/app/messages", label: "Messages", icon: MessageSquare },
    ],
  },
  {
    label: "Administration",
    items: [
      { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/app/practice", label: "Practice", icon: Building2, requiresOrgAdmin: true },
      { to: "/app/settings", label: "Settings", icon: Settings },
    ],
  },
];

function AppLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { appearance } = useAppearance();
  const practice = usePractice();
  const isOrgAdmin =
    !!practice &&
    ["owner", "admin"].includes(
      practice.members.find((m) => m.email === practice.ownerEmail)?.role ?? "owner",
    );
  const collapsed = appearance.sidebar === "collapsed";
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/signin" });
  };

  return (
    <div className="rhea-app min-h-screen w-full flex bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? "w-[72px]" : "w-[260px]"} shrink-0 h-screen sticky top-0 flex flex-col border-r border-border/70 bg-[color-mix(in_oklab,var(--color-background)_60%,var(--color-surface))]`}
      >
        <div className={`h-[72px] flex items-center ${collapsed ? "px-4 justify-center" : "px-5"}`}>
          {collapsed ? (
            <span className="text-[15px] font-semibold text-primary">R</span>
          ) : (
            <Logo height={32} />
          )}
        </div>

        <WorkspaceSwitcher collapsed={collapsed} />

        <button
          type="button"
          aria-label="Search"
          aria-keyshortcuts="Meta+K Control+K"
          onClick={() => setPaletteOpen(true)}
          className="mx-4 mb-6 h-10 rounded-xl hairline bg-card text-left px-3 flex items-center gap-2 text-[14px] text-muted-foreground hover:bg-muted transition"
        >
          <Search aria-hidden className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>Search…</span>}
          {!collapsed && (
            <span className="ml-auto text-[14px] px-1.5 py-0.5 rounded-lg bg-muted text-muted-foreground">
              ⌘K
            </span>
          )}
        </button>

        <nav className="px-3 flex-1 overflow-y-auto space-y-7 pb-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <div className="px-3 mb-2 text-[12px] uppercase tracking-[0.12em] text-muted-foreground/80 font-semibold">
                  {group.label}
                </div>
              )}
              <div className="space-y-1">
                {group.items
                  .filter((n) => !n.requiresOrgAdmin || isOrgAdmin)
                  .map((n) => {
                    const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
                    const Icon = n.icon;
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
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border/70 space-y-1.5">
          <div className={`px-3 py-2 ${collapsed ? "hidden" : ""}`}>
            <div className="text-[12px] uppercase tracking-[0.12em] text-muted-foreground/80 font-semibold">
              Hospital
            </div>
            <div className="text-[14px] text-foreground truncate">{CLINICIAN.hospital}</div>
          </div>
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-full hover:bg-muted transition cursor-pointer ${collapsed ? "justify-center" : ""}`}
          >
            <img
              src={CLINICIAN.photo}
              alt={CLINICIAN.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-medium truncate">{CLINICIAN.name}</div>
                <div className="text-[14px] text-muted-foreground truncate">{CLINICIAN.role}</div>
              </div>
            )}
            <button
              aria-label="Notifications"
              className={`relative rounded-full p-1.5 -m-1 hover:bg-muted text-muted-foreground hover:text-foreground transition ${collapsed ? "hidden" : ""}`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              className={`flex-1 text-[14px] text-muted-foreground hover:text-foreground px-3 py-2 rounded-full hover:bg-muted transition inline-flex items-center gap-2 ${collapsed ? "hidden" : ""}`}
            >
              <LifeBuoy className="w-3.5 h-3.5" /> Help
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 text-[14px] text-muted-foreground hover:text-foreground px-3 py-2 rounded-full hover:bg-muted transition inline-flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" /> {!collapsed && "Sign out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { backdropProps, panelProps } = useDialogDismiss(onClose);

  const results = useMemo(
    () =>
      [
        ...APPOINTMENTS.map((a) => ({
          group: "Patients",
          label: a.patient.name,
          hint: a.reason,
          go: () => navigate({ to: "/app/visit/$id", params: { id: a.id } }),
        })),
        { group: "Navigate", label: "Home", hint: "Dashboard", go: () => navigate({ to: "/app" }) },
        {
          group: "Navigate",
          label: "Documentation",
          hint: "Pending & signed notes",
          go: () => navigate({ to: "/app/documentation" }),
        },
        {
          group: "Navigate",
          label: "Messages",
          hint: "Secure patient messaging",
          go: () => navigate({ to: "/app/messages" }),
        },
        {
          group: "Navigate",
          label: "Analytics",
          hint: "Your clinician metrics",
          go: () => navigate({ to: "/app/analytics" }),
        },
      ].filter((r) => {
        const needle = q.toLowerCase();
        return r.label.toLowerCase().includes(needle) || r.hint.toLowerCase().includes(needle);
      }),
    [q, navigate],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-foreground/10 backdrop-blur-sm"
      {...backdropProps}
    >
      <div
        {...panelProps}
        aria-label="Search"
        className="w-full max-w-xl rounded-2xl bg-card hairline shadow-[var(--shadow-clinik-lg)] overflow-hidden outline-none"
      >
        <div className="flex items-center gap-2 px-4 h-12 border-b border-border">
          <Search aria-hidden className="w-4 h-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search patients, notes, doctors, messages…"
            aria-label="Search patients, notes, doctors, messages"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <span className="text-[14px] px-1.5 py-0.5 rounded-lg bg-muted text-muted-foreground">
            ESC
          </span>
        </div>
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <div className="px-4 py-6 text-sm text-muted-foreground">No results</div>
          )}
          {results.slice(0, 12).map((r, i) => (
            <button
              type="button"
              key={i}
              onClick={() => {
                r.go();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/70 transition"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[14px] text-foreground">{r.label}</div>
                <div className="text-[14px] text-muted-foreground truncate">{r.hint}</div>
              </div>
              <span className="text-[12px] uppercase tracking-wider text-muted-foreground">
                {r.group}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
