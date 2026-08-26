import { Accessibility, Droplet, Route, Shield, ZapOff, type LucideIcon } from "lucide-react";
import type { Aspect } from "../types";

// Icon set per files/DESIGN_SYSTEM.md §4 (Lucide, two-tone navy/white).
// "road" has no direct Lucide match, so `Route` is used in its place.
export const ASPECT_META: Record<Aspect, { label: string; icon: LucideIcon }> = {
  power: { label: "Power", icon: ZapOff },
  water: { label: "Water", icon: Droplet },
  security: { label: "Security", icon: Shield },
  roads_flooding: { label: "Roads/Flood", icon: Route },
  accessibility: { label: "Accessibility", icon: Accessibility },
};

export const ASPECT_ORDER: Aspect[] = ["power", "water", "security", "roads_flooding", "accessibility"];
