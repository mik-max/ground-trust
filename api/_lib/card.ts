// The link-preview card layouts, kept apart from api/og.ts so they can be
// rendered outside Vercel too. Satori takes React-element-shaped objects;
// building them with h() keeps this free of a JSX build step.
import { ASPECTS, BAND_COLOR, BAND_LABEL, EARLY_RATINGS_BELOW, choiceQuestion, fmt, type PreviewArea } from "./area.js";

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
    ? h("div", { display: "flex", width: 408, height: 630, backgroundImage: `url(${a.photo})`, backgroundSize: "cover", backgroundPosition: "center" })
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

// ---------- WhatsApp Status / Stories card (laid out at 1080×1920) ----------

export const STORY = { width: 1080, height: 1920, scale: 2 / 3 };

function verdictChip(a: PreviewArea, size: number) {
  const early = a.residents < EARLY_RATINGS_BELOW || !a.band;
  return h("div", { display: "flex", alignItems: "center", gap: size * 0.45, padding: `${size * 0.38}px ${size * 0.8}px`, border: `2px solid ${LINE}`, borderRadius: 999, fontSize: size, color: TEXT, fontWeight: 500 }, [
    h("div", { width: size * 0.5, height: size * 0.5, borderRadius: 999, background: early ? FAINT : BAND_COLOR[a.band!] }),
    early ? "Early ratings" : BAND_LABEL[a.band!],
  ]);
}

export function storyCard(a: PreviewArea, origin: string) {
  const photo = a.photo
    ? h("div", { display: "flex", position: "absolute", top: 0, left: 0, width: 1080, height: 760, backgroundImage: `url(${a.photo})`, backgroundSize: "cover", backgroundPosition: "center 88%" })
    : h("div", { display: "flex", position: "absolute", top: 0, left: 0, width: 1080, height: 760, background: SUNK, alignItems: "center", justifyContent: "center" }, [img(`${origin}/icons/location.png`, 220)]);

  const rows = a.aspects.map((x, i) => {
    const low = x.score !== null && x.score < 2;
    return h("div", { display: "flex", alignItems: "center", gap: 28, height: 124 }, [
      img(`${origin}${ASPECTS[i].icon}`, 72),
      h("div", { display: "flex", width: 380, fontSize: 40, color: TEXT }, x.label),
      h("div", { display: "flex", flex: 1, height: 14, borderRadius: 999, background: SUNK }, [
        h("div", { display: "flex", width: `${x.score === null ? 0 : (x.score / 5) * 100}%`, height: 14, borderRadius: 999, background: low ? POOR : "#2f5d4f" }),
      ]),
      h("div", { display: "flex", width: 90, justifyContent: "flex-end", fontSize: 44, fontWeight: 500, color: x.score === null ? FAINT : low ? POOR : TEXT }, fmt(x.score)),
    ]);
  });

  return h("div", { display: "flex", flexDirection: "column", width: 1080, height: 1920, background: "#ffffff", fontFamily: "Geist", position: "relative" }, [
    photo,
    h("div", { display: "flex", position: "absolute", top: 380, left: 0, width: 1080, height: 380, backgroundImage: "linear-gradient(180deg, rgba(17,23,21,0) 0%, rgba(17,23,21,0.62) 100%)" }),
    h("div", { display: "flex", flexDirection: "column", position: "absolute", left: 72, right: 72, top: 560, color: "#ffffff" }, [
      h("div", { fontSize: 104, fontWeight: 500, letterSpacing: -4, lineHeight: 1 }, a.name),
      h("div", { fontSize: 36, marginTop: 14, color: "rgba(255,255,255,0.85)" }, a.place),
    ]),
    h("div", { display: "flex", flexDirection: "column", position: "absolute", top: 760, left: 0, width: 1080, height: 1160, padding: "64px 72px 60px" }, [
      a.score === null
        ? h("div", { display: "flex", flexDirection: "column", gap: 18 }, [
            h("div", { fontSize: 64, fontWeight: 500, letterSpacing: -2, color: INK }, "No ratings yet"),
            h("div", { fontSize: 36, color: MUTED }, "Live here? Be the first to say what it's like."),
          ])
        : h("div", { display: "flex", alignItems: "center", justifyContent: "space-between" }, [
            h("div", { display: "flex", alignItems: "baseline" }, [
              h("div", { fontSize: 168, lineHeight: 1, letterSpacing: -8, color: INK }, fmt(a.score)),
              h("div", { fontSize: 48, color: FAINT, marginLeft: 12 }, "/ 5"),
            ]),
            verdictChip(a, 38),
          ]),
      h("div", { display: "flex", fontSize: 32, color: MUTED, marginTop: 18 }, a.score === null ? "Scores appear as residents rate it" : `Rated by ${a.residents} resident${a.residents === 1 ? "" : "s"}`),
      h("div", { display: "flex", flexDirection: "column", marginTop: 52, gap: 8 }, rows),
      h("div", { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 36, borderTop: `2px solid ${LINE}` }, [
        h("div", { display: "flex", alignItems: "center", gap: 16, fontSize: 40, fontWeight: 500, color: INK }, [mark(44, INK), "GroundTrust"]),
        h("div", { display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: 28, color: MUTED }, [
          h("div", {}, "See the evidence"),
          h("div", { color: TEXT }, a.id.length <= 14 ? `ground-trust.vercel.app/areas/${a.id}` : "ground-trust.vercel.app"),
        ]),
      ]),
    ]),
  ]);
}

// ---------- Comparison card (square, laid out at 1080×1080) ----------

export const SQUARE = { width: 1080, height: 1080, scale: 1 };

export function compareCard(areas: PreviewArea[], origin: string) {
  const n = areas.length;
  const question = choiceQuestion(areas.map((a) => a.name));
  const colW = n === 3 ? 270 : 380;
  const header = h("div", { display: "flex", gap: 24, paddingBottom: 24, borderBottom: `2px solid ${LINE}` }, [
    h("div", { display: "flex", width: 70 }),
    ...areas.map((a) =>
      h("div", { display: "flex", flexDirection: "column", width: colW }, [
        h("div", { fontSize: n === 3 ? 38 : 46, fontWeight: 500, letterSpacing: -1.5, color: INK, lineHeight: 1.05 }, a.name),
        h("div", { display: "flex", flexDirection: "column", fontSize: 24, color: MUTED, marginTop: 8, lineHeight: 1.3 }, [
          h("div", {}, a.place.split(" · ")[0]),
          h("div", {}, `${a.residents} resident${a.residents === 1 ? "" : "s"}`),
        ]),
        h("div", { display: "flex", alignItems: "baseline", marginTop: 14 }, [
          h("div", { fontSize: n === 3 ? 64 : 76, letterSpacing: -3, color: a.score === null ? FAINT : INK, lineHeight: 1 }, fmt(a.score)),
          h("div", { fontSize: 26, color: FAINT, marginLeft: 8 }, "/ 5"),
        ]),
      ]),
    ),
  ]);
  const rows = ASPECTS.map((asp, i) =>
    h("div", { display: "flex", gap: 24, alignItems: "center", height: 104, borderBottom: i < ASPECTS.length - 1 ? `2px solid ${SUNK}` : "none" }, [
      h("div", { display: "flex", width: 70 }, [img(`${origin}${asp.icon}`, 54)]),
      ...areas.map((a) => {
        const v = a.aspects[i].score;
        const low = v !== null && v < 2;
        return h("div", { display: "flex", alignItems: "center", gap: 16, width: colW }, [
          h("div", { display: "flex", width: v === null ? 0 : Math.round((v / 5) * (colW - 110)), height: 10, borderRadius: 999, background: low ? POOR : "#2f5d4f" }),
          h("div", { fontSize: 36, fontWeight: 500, color: v === null ? FAINT : low ? POOR : TEXT }, fmt(v)),
        ]);
      }),
    ]),
  );
  return h("div", { display: "flex", flexDirection: "column", width: 1080, height: 1080, background: "#ffffff", fontFamily: "Geist", padding: "64px 72px 56px" }, [
    h("div", { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 44 }, [
      h("div", { display: "flex", fontSize: 50, fontWeight: 500, letterSpacing: -2, color: INK, maxWidth: 700 }, question),
      h("div", { display: "flex", alignItems: "center", gap: 12, fontSize: 30, fontWeight: 500, color: INK }, [mark(34, INK), "GroundTrust"]),
    ]),
    header,
    h("div", { display: "flex", flexDirection: "column" }, rows),
    h("div", { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", fontSize: 26, color: MUTED }, [
      h("div", {}, "Scores out of 5, from residents' ratings"),
      h("div", { color: TEXT }, "ground-trust.vercel.app/compare"),
    ]),
  ]);
}
