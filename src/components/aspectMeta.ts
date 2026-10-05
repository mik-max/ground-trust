import { Accessibility, Droplet, Route, Shield, Zap, type LucideIcon } from "lucide-react";
import type { Aspect } from "../types";

// One fixed icon per aspect. `image` is the 3D icon (Google Noto 3D emoji,
// Apache 2.0 — see public/icons/) used everywhere an aspect is shown;
// `icon` is the flat Lucide fallback for tight, text-sized spots.
// `hint` is the one-line meaning shown where residents first meet the
// categories (Home's "What residents rate").
export const ASPECT_META: Record<Aspect, { label: string; icon: LucideIcon; image: string; hint: string }> = {
  power: { label: "Power", icon: Zap, image: "/icons/power.png", hint: "How many hours of light, and how often it goes off." },
  water: { label: "Water", icon: Droplet, image: "/icons/water.png", hint: "Whether supply is steady and the water is clean." },
  security: { label: "Security", icon: Shield, image: "/icons/security.png", hint: "How safe it feels, day and night." },
  roads_flooding: {
    label: "Roads and flooding",
    icon: Route,
    image: "/icons/roads-flooding.png",
    hint: "Road condition, and what happens when it rains.",
  },
  accessibility: {
    label: "Accessibility",
    icon: Accessibility,
    image: "/icons/accessibility.png",
    hint: "How easy it is for everyone to get around.",
  },
};

export const ASPECT_ORDER: Aspect[] = ["power", "water", "security", "roads_flooding", "accessibility"];
