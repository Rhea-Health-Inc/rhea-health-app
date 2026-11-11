import logoAsset from "@/assets/rhea-logo.png.asset.json";

export function Logo({ className = "", height = 36 }: { className?: string; height?: number }) {
  return (
    <img
      src={logoAsset.url}
      alt="Rhea Health"
      height={height}
      style={{ height, width: "auto" }}
      className={className}
    />
  );
}
