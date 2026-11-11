import logoUrl from "@/assets/rhea-logo.png";

export function Logo({ className = "", height = 36 }: { className?: string; height?: number }) {
  return (
    <img
      src={logoUrl}
      alt="Rhea Health"
      height={height}
      style={{ height, width: "auto" }}
      className={className}
    />
  );
}
