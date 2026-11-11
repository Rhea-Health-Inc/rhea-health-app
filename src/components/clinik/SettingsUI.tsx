import type { ReactNode } from "react";
import { PageHeader } from "@/components/clinik/PageHeader";

export function SettingsHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <PageHeader
      breadcrumb={[
        { label: "Workspace", to: "/app" },
        { label: "Settings", to: "/app/settings" },
        { label: title },
      ]}
      title={title}
      description={description}
      actions={actions}
    />
  );
}

export function Section({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="mb-5 flex items-end justify-between gap-6 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-[22px] font-semibold tracking-[-0.015em]">{title}</h2>
          {description && (
            <p className="text-[15px] text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions}
      </div>
      <div className="rounded-2xl bg-card hairline p-8 shadow-[var(--shadow-clinik-sm)]">
        {children}
      </div>
    </section>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div className="min-w-0">
        <div className="text-[15px] font-medium">{label}</div>
        {description && (
          <div className="text-[14px] text-muted-foreground mt-1 leading-relaxed">
            {description}
          </div>
        )}
      </div>

      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`shrink-0 w-11 h-6 rounded-full transition relative ${
          checked ? "bg-primary" : "bg-muted hairline"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function OptionCards<T extends string>({
  value,
  onChange,
  options,
  columns = 3,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; description?: string }[];
  columns?: number;
}) {
  return (
    <div
      className={`grid gap-4 grid-cols-1 ${
        columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3"
      }`}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`text-left rounded-xl p-5 transition hairline ${
              active ? "border-primary bg-primary/5" : "bg-card hover:bg-muted"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-3.5 h-3.5 rounded-full border ${
                  active ? "border-primary bg-primary" : "border-border"
                }`}
              />
              <span className="text-[15px] font-medium">{o.label}</span>
            </div>
            {o.description && (
              <div className="text-[14px] text-muted-foreground mt-1.5">{o.description}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}) {
  return (
    <label className="block">
      {label && <span className="block text-[13px] font-medium text-foreground mb-2">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-xl hairline bg-card px-3.5 text-[15px] outline-none focus:border-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
