import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { Crumb } from "@/types/navigation";

export type { Crumb };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-[12px] text-muted-foreground"
    >
      {items.map((c, i) => (
        <span key={`${c.label}-${i}`} className="inline-flex items-center gap-1.5">
          {i > 0 && <ChevronRight aria-hidden className="w-3 h-3 opacity-60" />}
          {c.to && i < items.length - 1 ? (
            <Link to={c.to} className="hover:text-foreground transition">
              {c.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? "text-foreground/70" : undefined}>
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  breadcrumb,
  title,
  description,
  actions,
  className = "mb-10",
}: {
  breadcrumb: Crumb[];
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Bottom margin utility; pages with their own section rhythm override it (Home uses "mb-16" to match its space-y-16). */
  className?: string;
}) {
  return (
    <header className={className}>
      <Breadcrumb items={breadcrumb} />
      <div className="mt-4 flex items-start justify-between gap-6 flex-wrap">
        <div className="min-w-0">
          <h1 className="h-display text-[32px] font-semibold tracking-[-0.02em]">{title}</h1>
          {description && (
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}

export function SectionHeader({
  id,
  title,
  description,
  actions,
}: {
  /** Set when the surrounding <section> uses aria-labelledby. */
  id?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-6 flex-wrap">
      <div className="min-w-0">
        <h2 id={id} className="text-[22px] font-semibold tracking-[-0.015em]">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-[15px] text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0 pt-1">{actions}</div>}
    </div>
  );
}
