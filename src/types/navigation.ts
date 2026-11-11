import type { LucideIcon } from "lucide-react";
import type { FileRouteTypes } from "@/routeTree.gen";

/**
 * Every navigable path in the app, derived from the generated route tree.
 * Using this instead of `string` makes `<Link to={...}>` type-check without
 * `as any` casts and turns a renamed/removed route into a compile error.
 */
export type AppRoute = FileRouteTypes["to"];

/** A single breadcrumb entry. The last entry is rendered as plain text. */
export interface Crumb {
  label: string;
  to?: AppRoute;
}

/** A sidebar navigation entry. */
export interface NavItem {
  to: AppRoute;
  label: string;
  icon: LucideIcon;
  /** Match the pathname exactly rather than by prefix. */
  exact?: boolean;
  requiresOrgAdmin?: boolean;
}
