// Appearance preferences: persisted to localStorage and applied to <html>
// as classes so the whole interface updates immediately.

export type Theme = "light" | "dark" | "system";
export type Density = "comfortable" | "compact";
export type SidebarMode = "expanded" | "collapsed";
export type FontSize = "small" | "medium" | "large";

export type Appearance = {
  theme: Theme;
  density: Density;
  sidebar: SidebarMode;
  reduceMotion: boolean;
  fontSize: FontSize;
  highContrast: boolean;
};

export const DEFAULT_APPEARANCE: Appearance = {
  theme: "system",
  density: "comfortable",
  sidebar: "expanded",
  reduceMotion: false,
  fontSize: "medium",
  highContrast: false,
};

const KEY = "rhea.appearance";
const listeners = new Set<(a: Appearance) => void>();

export function readAppearance(): Appearance {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_APPEARANCE;
    return { ...DEFAULT_APPEARANCE, ...(JSON.parse(raw) as Partial<Appearance>) };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function writeAppearance(a: Appearance) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* ignore */
  }
  applyAppearance(a);
  listeners.forEach((l) => l(a));
}

export function subscribeAppearance(fn: (a: Appearance) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function applyAppearance(a: Appearance) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const prefersDark =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const dark = a.theme === "dark" || (a.theme === "system" && prefersDark);

  root.classList.toggle("dark", dark);
  root.classList.toggle("density-compact", a.density === "compact");
  root.classList.toggle("reduce-motion", a.reduceMotion);
  root.classList.toggle("high-contrast", a.highContrast);
  root.classList.remove("fs-small", "fs-medium", "fs-large");
  root.classList.add(`fs-${a.fontSize}`);
}
