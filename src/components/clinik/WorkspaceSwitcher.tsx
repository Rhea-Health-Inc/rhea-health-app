import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronsUpDown, Stethoscope, Building2 } from "lucide-react";
import {
  canAccessAdmin,
  setWorkspace,
  useAdminRole,
  useWorkspace,
  type Workspace,
} from "@/lib/admin";

export function WorkspaceSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const [open, setOpen] = useState(false);
  const role = useAdminRole();
  const workspace = useWorkspace();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const hasAdmin = canAccessAdmin(role);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const choose = (w: Workspace) => {
    setWorkspace(w);
    setOpen(false);
    navigate({ to: w === "administration" ? "/admin" : "/app" });
  };

  const current = workspace === "administration" && hasAdmin ? "administration" : "clinical";
  const Icon = current === "administration" ? Building2 : Stethoscope;

  if (!hasAdmin) {
    return (
      <div
        className={`mx-4 mb-3 h-10 rounded-xl hairline bg-card flex items-center gap-2 ${
          collapsed ? "justify-center px-0" : "px-3"
        } text-[14px]`}
        title="Clinical workspace"
      >
        <Stethoscope className="w-4 h-4 text-primary shrink-0" />
        {!collapsed && <span className="truncate">Clinical</span>}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative mx-4 mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={collapsed ? "Switch workspace" : undefined}
        className={`w-full h-10 rounded-xl hairline bg-card flex items-center gap-2 ${
          collapsed ? "justify-center px-0" : "px-3"
        } text-[14px] hover:bg-muted transition`}
      >
        <Icon className="w-4 h-4 text-primary shrink-0" />
        {!collapsed && (
          <>
            <span className="truncate">
              {current === "administration" ? "Administration" : "Clinical"}
            </span>
            <ChevronsUpDown className="ml-auto w-3.5 h-3.5 text-muted-foreground" />
          </>
        )}
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-40 left-0 right-0 mt-2 min-w-[220px] rounded-xl bg-card hairline shadow-[var(--shadow-clinik-lg)] p-1.5"
        >
          <div className="px-2.5 py-2 text-[12px] uppercase tracking-[0.12em] text-muted-foreground/80 font-semibold">
            Workspaces
          </div>
          {[
            {
              id: "clinical" as const,
              label: "Clinical",
              hint: "Encounters, documentation, patients",
              icon: Stethoscope,
            },
            {
              id: "administration" as const,
              label: "Administration",
              hint: "Organization-wide enterprise admin",
              icon: Building2,
            },
          ].map((w) => (
            <button
              key={w.id}
              role="option"
              aria-selected={current === w.id}
              onClick={() => choose(w.id)}
              className="w-full flex items-start gap-2.5 px-2.5 py-2.5 rounded-lg text-left hover:bg-muted transition"
            >
              <w.icon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] text-foreground">{w.label}</span>
                <span className="block text-[12px] text-muted-foreground truncate">{w.hint}</span>
              </span>
              {current === w.id && <Check className="w-4 h-4 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
