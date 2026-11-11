import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useDialogDismiss } from "@/hooks/use-dialog-dismiss";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "positive" | "warning";
}) {
  return (
    <div className="rounded-2xl bg-card hairline p-6 shadow-[var(--shadow-clinik-sm)]">
      <div className="text-[13px] font-medium text-muted-foreground">{label}</div>
      <div
        className={`mt-2 text-[26px] font-semibold tracking-[-0.02em] ${
          tone === "positive" ? "text-primary" : tone === "warning" ? "text-amber-700" : ""
        }`}
      >
        {value}
      </div>
      {hint && <div className="mt-2 text-[12px] text-muted-foreground leading-relaxed">{hint}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  padded = true,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-card hairline shadow-[var(--shadow-clinik-sm)] overflow-hidden">
      {(title || actions) && (
        <div className="flex items-start justify-between gap-6 flex-wrap px-8 pt-7 pb-5">
          <div className="min-w-0">
            {title && <div className="text-[18px] font-medium tracking-[-0.01em]">{title}</div>}
            {description && (
              <div className="mt-1.5 text-[14px] text-muted-foreground leading-relaxed max-w-2xl">
                {description}
              </div>
            )}
          </div>
          {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={padded ? "px-8 pb-8" : ""}>{children}</div>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const map: Record<string, string> = {
    neutral: "bg-muted text-muted-foreground",
    success: "bg-primary/10 text-primary",
    warning: "bg-amber-500/12 text-amber-700",
    danger: "bg-red-500/10 text-red-700",
    info: "bg-sky-500/10 text-sky-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): "neutral" | "success" | "warning" | "danger" | "info" {
  const s = status.toLowerCase();
  if (["active", "connected", "assigned", "success", "paid", "enabled", "enforced"].includes(s))
    return "success";
  if (["invited", "pending", "degraded", "trialing"].includes(s)) return "warning";
  if (["deactivated", "disconnected", "failed", "revoked", "overdue"].includes(s)) return "danger";
  if (["unassigned", "read-only"].includes(s)) return "neutral";
  return "neutral";
}

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border">
            {head.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-[12px] uppercase tracking-[0.1em] font-semibold text-muted-foreground whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3.5 text-[14px] align-middle ${className}`}>{children}</td>;
}

export function Tr({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-border/60 last:border-0 ${onClick ? "cursor-pointer hover:bg-muted/60" : ""} transition`}
    >
      {children}
    </tr>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <ModalPanel
      onClose={onClose}
      title={title}
      description={description}
      footer={footer}
      wide={wide}
    >
      {children}
    </ModalPanel>
  );
}

function ModalPanel({
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const { backdropProps, panelProps } = useDialogDismiss(onClose);
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/25 backdrop-blur-sm p-4 sm:p-8"
      {...backdropProps}
    >
      <div
        {...panelProps}
        aria-labelledby="admin-modal-title"
        className={`w-full ${wide ? "max-w-4xl" : "max-w-xl"} my-8 rounded-2xl bg-card hairline shadow-[var(--shadow-clinik-lg)] outline-none`}
      >
        <div className="flex items-start justify-between gap-6 px-8 pt-7 pb-5 border-b border-border">
          <div className="min-w-0">
            <div id="admin-modal-title" className="text-[20px] font-semibold tracking-[-0.015em]">
              {title}
            </div>
            {description && (
              <div className="mt-1.5 text-[14px] text-muted-foreground leading-relaxed">
                {description}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 -m-1 text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-8 py-7">{children}</div>
        {footer && (
          <div className="px-8 py-5 border-t border-border flex items-center justify-end gap-3 flex-wrap">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export const inputCls =
  "w-full h-11 rounded-xl hairline bg-card px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-foreground/80 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block mt-1.5 text-[12px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition"
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition"
    >
      {children}
    </button>
  );
}

export function KeyValue({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.label}>
          <div className="text-[13px] font-medium text-muted-foreground">{it.label}</div>
          <div className="mt-1.5 text-[15px]">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

export function BarChart({
  data,
  valueKey,
  label,
}: {
  data: { month: string; [k: string]: number | string }[];
  valueKey: string;
  label: string;
}) {
  const values = data.map((d) => Number(d[valueKey]));
  const max = Math.max(...values, 1);
  return (
    <div>
      <div className="text-[13px] font-medium text-muted-foreground mb-4">{label}</div>
      <div className="flex items-end gap-3 h-40">
        {data.map((d) => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition"
                style={{ height: `${(Number(d[valueKey]) / max) * 100}%` }}
                title={`${d.month}: ${Number(d[valueKey]).toLocaleString()}`}
              />
            </div>
            <div className="text-[12px] text-muted-foreground">{d.month}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
