// Shared by the link-preview functions (api/og.ts, api/share.ts). Files and
// folders starting with "_" are not deployed as functions themselves.
import { areaPhoto } from "../../src/components/areaPhotos.js";

// Same API that vercel.json proxies /api to.
const API_BASE = "https://groundtrust-api.onrender.com/api";

export type Band = "poor" | "fair" | "good" | "excellent";
type AspectKey = "power" | "water" | "security" | "roads_flooding" | "accessibility";

export interface PreviewArea {
  id: string;
  name: string;
  place: string;
  score: number | null;
  band: Band | null;
  residents: number;
  aspects: { key: AspectKey; label: string; score: number | null }[];
  photo: string | null;
}

export const ASPECTS: { key: AspectKey; label: string; icon: string }[] = [
  { key: "power", label: "Power", icon: "/icons/power.png" },
  { key: "water", label: "Water", icon: "/icons/water.png" },
  { key: "security", label: "Security", icon: "/icons/security.png" },
  { key: "roads_flooding", label: "Roads and flooding", icon: "/icons/roads-flooding.png" },
  { key: "accessibility", label: "Accessibility", icon: "/icons/accessibility.png" },
];

export const BAND_LABEL: Record<Band, string> = { excellent: "Excellent", good: "Good", fair: "Fair", poor: "Poor" };
export const BAND_COLOR: Record<Band, string> = { excellent: "#356f52", good: "#4c7a45", fair: "#86662a", poor: "#9a5236" };

// Fewer residents than this and a card says "Early ratings" instead of a
// band, so one or two reviews can't travel as a verdict.
export const EARLY_RATINGS_BELOW = 5;

export const isAreaId = (id: string | null): id is string => Boolean(id && /^[a-z0-9-]{1,120}$/i.test(id));

// The API can be asleep (Render free tier); give up after `timeoutMs` and
// let the caller fall back to a generic preview rather than hang the crawler.
export async function fetchPreviewArea(id: string, timeoutMs = 7000): Promise<PreviewArea | null> {
  try {
    const res = await fetch(`${API_BASE}/areas/${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    const data = await res.json();
    const lga: string | null = data.area.lga ?? null;
    return {
      id: data.area.id,
      name: data.area.name,
      place: `${lga ?? data.area.city} · ${data.area.state} State`,
      score: data.overall.score,
      band: data.overall.band,
      residents: data.overall.N,
      aspects: ASPECTS.map(({ key, label }) => {
        const row = data.aspects.find((a: { aspect: string }) => a.aspect === key);
        return { key, label, score: row && row.N > 0 ? row.score : null };
      }),
      photo: areaPhoto(data.area.name),
    };
  } catch {
    return null;
  }
}

export const fmt = (n: number | null) => (n === null ? "–" : n.toFixed(1));

export function describe(a: PreviewArea): string {
  if (a.score === null) return `No ratings yet for ${a.name}. Live there? Be the first to say what it's like.`;
  const rated = a.aspects
    .filter((x) => x.score !== null)
    .map((x) => `${x.label} ${fmt(x.score)}`)
    .join(" · ");
  const verdict =
    a.residents < EARLY_RATINGS_BELOW || !a.band ? "early ratings" : BAND_LABEL[a.band];
  return `Rated ${fmt(a.score)}/5 (${verdict}) by ${a.residents} resident${a.residents === 1 ? "" : "s"}. ${rated}.`;
}

// Changes whenever the numbers do, so chat apps fetch a fresh image instead
// of reusing one they cached against the old scores.
export const imageVersion = (a: PreviewArea) => [fmt(a.score), a.residents, ...a.aspects.map((x) => fmt(x.score))].join("-");

// "Ikoyi or Mushin?", "Ikoyi, Mushin or Ajegunle?"
export const choiceQuestion = (names: string[]) =>
  `${names.length > 1 ? `${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}` : names[0]}?`;
