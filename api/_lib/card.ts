// The link-preview card layouts, kept apart from api/og.ts so they can be
// rendered outside Vercel too. Satori takes React-element-shaped objects;
// building them with h() keeps this free of a JSX build step.
import { ASPECTS, BAND_COLOR, BAND_LABEL, EARLY_RATINGS_BELOW, fmt, type PreviewArea } from "./area";

const INK = "#111715";
const TEXT = "#1b2320";
const MUTED = "#616b66";
const FAINT = "#9aa39e";
const SUNK = "#eef0ed";
const LINE = "#e1e5e1";
const POOR = "#9a5236";

export type Style = Record<string, string | number>;
export type Node = { type: string; props: { style?: Style; src?: string; width?: number; height?: number; children?: unknown } };
const h = (type: string, style: Style, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});
const img = (src: string, size: number, style: Style = {}) => h("img", { width: size, height: size, ...style }, undefined, { src, width: size, height: size });

function mark(size: number, color: string) {
  // The logo mark, drawn with boxes (satori has no SVG <use>).
  return h("div", { display: "flex", width: size, height: size, border: `${Math.round(size / 13)}px solid ${color}`, borderRadius: size * 0.28, alignItems: "center", justifyContent: "center", position: "relative" }, [
    h("div", { width: size * 0.25, height: size * 0.25, borderRadius: 999, background: color, marginTop: -size * 0.18 }),
    h("div", { position: "absolute", left: size * 0.18, right: size * 0.18, bottom: size * 0.24, height: Math.round(size / 13), borderRadius: 9, background: color }),
  ]);
}

export function areaCard(a: PreviewArea, origin: string) {
  const early = a.residents < EARLY_RATINGS_BELOW || !a.band;
  const left = a.photo
    ? h("div", { display: "flex", width: 408, height: 630, backgroundImage: `url(${origin}${a.photo})`, backgroundSize: "cover", backgroundPosition: "center" })
    : h("div", { display: "flex", width: 408, height: 630, background: SUNK, alignItems: "center", justifyContent: "center" }, [img(`${origin}/icons/location.png`, 150)]);

  const verdict = a.score === null
    ? h("div", { display: "flex", fontSize: 30, color: MUTED }, "No ratings yet")
    : h("div", { display: "flex", alignItems: "center", gap: 22 }, [
        h("div", { display: "flex", alignItems: "baseline" }, [
          h("div", { fontSize: 112, lineHeight: 1, letterSpacing: -5, color: INK }, fmt(a.score)),
          h("div", { fontSize: 32, color: FAINT, marginLeft: 8 }, "/ 5"),
        ]),
        h("div", { display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", border: `2px solid ${LINE}`, borderRadius: 999, fontSize: 28, color: TEXT, fontWeight: 500 }, [
          h("div", { width: 14, height: 14, borderRadius: 999, background: early ? FAINT : BAND_COLOR[a.band!] }),
          early ? "Early ratings" : BAND_LABEL[a.band!],
        ]),
      ]);

  const tiles = h("div", { display: "flex", gap: 14 }, a.aspects.map((x, i) =>
    h("div", { display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 128, padding: "26px 0 22px", borderRadius: 20, background: SUNK }, [
      img(`${origin}${ASPECTS[i].icon}`, 62),
      h("div", { fontSize: 34, fontWeight: 500, color: x.score === null ? FAINT : x.score < 2 ? POOR : TEXT }, fmt(x.score)),
    ]),
  ));

  return h("div", { display: "flex", width: 1200, height: 630, background: "#ffffff", fontFamily: "Geist" }, [
    left,
    h("div", { display: "flex", flexDirection: "column", flex: 1, padding: "48px 52px 40px 52px" }, [
      h("div", { fontSize: 64, fontWeight: 500, letterSpacing: -2.5, color: INK, lineHeight: 1 }, a.name),
      h("div", { fontSize: 26, color: MUTED, marginTop: 10 }, a.place),
      h("div", { display: "flex", marginTop: 26 }, [verdict]),
      h("div", { display: "flex", marginTop: 34 }, [tiles]),
      h("div", { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }, [
        h("div", { fontSize: 24, color: MUTED }, a.score === null ? "Be the first to rate it" : `Rated by ${a.residents} resident${a.residents === 1 ? "" : "s"}`),
        h("div", { display: "flex", alignItems: "center", gap: 12, fontSize: 26, fontWeight: 500, color: INK }, [mark(30, INK), "GroundTrust"]),
      ]),
    ]),
  ]);
}

// Plain dark ground on purpose: a full-bleed photo pushes the PNG past
// WhatsApp's ~300KB preview limit.
export function siteCard(origin: string) {
  return h("div", { display: "flex", width: 1200, height: 630, fontFamily: "Geist", position: "relative", background: INK }, [
    h("div", { display: "flex", flexDirection: "column", position: "relative", padding: "60px 72px", width: "100%", color: "#fff" }, [
      h("div", { display: "flex", alignItems: "center", gap: 14, fontSize: 32, fontWeight: 500 }, [mark(36, "#ffffff"), "GroundTrust"]),
      h("div", { display: "flex", flexDirection: "column", fontSize: 88, fontWeight: 500, letterSpacing: -3.5, lineHeight: 1.02, marginTop: "auto" }, [
        h("div", {}, "Know a neighbourhood"),
        h("div", { color: "rgba(255,255,255,0.6)" }, "before you move in."),
      ]),
      h("div", { display: "flex", gap: 14, marginTop: 34 }, ASPECTS.map((x) =>
        h("div", { display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: "rgba(255,255,255,0.14)", fontSize: 24 }, [img(`${origin}${x.icon}`, 30), x.label]),
      )),
    ]),
  ]);
}


// WhatsApp skips preview images over roughly 300KB, and a photo rendered at
// 1200×630 as PNG is well over that. Cards are laid out at 1200×630 and
// scaled down as a whole before rendering.
export const CARD_SCALE = 0.65;
export const CARD_WIDTH = Math.round(1200 * CARD_SCALE);
export const CARD_HEIGHT = Math.round(630 * CARD_SCALE);

const UNSCALED = new Set(["flex", "fontWeight", "opacity", "zIndex"]);

export function scaleCard(node: unknown, k = CARD_SCALE): unknown {
  if (Array.isArray(node)) return node.map((n) => scaleCard(n, k));
  if (!node || typeof node !== "object") return node;
  const { type, props } = node as Node;
  const style: Style = {};
  for (const [key, v] of Object.entries(props.style ?? {})) {
    if (UNSCALED.has(key) || (key === "lineHeight" && typeof v === "number" && v < 4)) style[key] = v;
    else if (typeof v === "number") style[key] = Math.round(v * k * 100) / 100;
    else style[key] = v.replace(/(-?\d*\.?\d+)px/g, (_, n) => `${Math.round(Number(n) * k * 100) / 100}px`);
  }
  const extra: Record<string, unknown> = {};
  if (props.width !== undefined) extra.width = Math.round(props.width * k);
  if (props.height !== undefined) extra.height = Math.round(props.height * k);
  return { type, props: { ...props, ...extra, style, children: scaleCard(props.children, k) } };
}
