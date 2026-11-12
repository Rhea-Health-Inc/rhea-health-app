import logoUrl from "@/assets/rhea-logo.png";

export function Logo({ className = "", height = 36 }: { className?: string; height?: number }) {
  return (
    <img
      src={logoUrl}
      alt="Rhea Health"
      height={height}
      style={{ height, width: "auto" }}
      // The wordmark's "health" is black, so in dark mode the logo sits on a
      // small white chip (border-box keeps the outer height unchanged);
      // otherwise it would vanish against dark backgrounds.
      className={`${className} dark:bg-white dark:rounded-md dark:px-1.5 dark:py-1`}
    />
  );
}
