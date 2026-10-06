// GET /api/og?area=<id> — the link-preview image for an area, drawn from its
// live scores. Without ?area (or if the area can't be loaded) it draws a
// site card. A Node function rather than Edge: the renderer (satori +
// resvg) is far larger than Edge's ~1MB limit. Icons, photos and the font
// ship inside the function (vercel.json includeFiles) and are read from
// disk, so rendering never depends on fetching the site itself.
import { readFile } from "node:fs/promises";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { fetchPreviewArea, isAreaId } from "./_lib/area";
import { CARD_HEIGHT, CARD_WIDTH, areaCard, scaleCard, siteCard, type Node } from "./_lib/card";

const ROOT = process.cwd();
const MIME: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

const fileCache = new Map<string, Promise<Buffer>>();
const read = (p: string) => {
  if (!fileCache.has(p)) fileCache.set(p, readFile(path.join(ROOT, p)));
  return fileCache.get(p)!;
};

async function dataUri(publicPath: string) {
  const file = path.normalize(publicPath).replace(/^(\.\.[/\\])+/, "");
  const data = await read(path.join("public", file));
  return `data:${MIME[path.extname(file)] ?? "application/octet-stream"};base64,${data.toString("base64")}`;
}

// Swap the card's site paths ("/icons/power.png", url(/images/...)) for
// inline data, which is what satori renders from.
async function inlineAssets(node: unknown): Promise<unknown> {
  if (Array.isArray(node)) return Promise.all(node.map(inlineAssets));
  if (!node || typeof node !== "object") return node;
  const { type, props } = node as Node;
  const next = { ...props };
  if (type === "img" && typeof props.src === "string" && props.src.startsWith("/")) next.src = await dataUri(props.src);
  const bg = props.style?.backgroundImage;
  if (typeof bg === "string" && bg.startsWith("url(/")) {
    next.style = { ...props.style, backgroundImage: `url(${await dataUri(bg.slice(4, -1))})` };
  }
  next.children = await inlineAssets(props.children);
  return { type, props: next };
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("area");
  const area = isAreaId(id) ? await fetchPreviewArea(id) : null;
  const [regular, medium, tree] = await Promise.all([
    read("api/_assets/Geist-Regular.ttf"),
    read("api/_assets/Geist-Medium.ttf"),
    inlineAssets(scaleCard(area ? areaCard(area, "") : siteCard(""))),
  ]);

  const svg = await satori(tree as never, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts: [
      { name: "Geist", data: regular, weight: 400, style: "normal" },
      { name: "Geist", data: medium, weight: 500, style: "normal" },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: CARD_WIDTH } }).render().asPng();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      // Cached at Vercel's edge, so a sleeping API only slows the first request.
      "Cache-Control":
        area || !id ? "public, max-age=0, s-maxage=3600, stale-while-revalidate=604800" : "public, max-age=0, s-maxage=60",
    },
  });
}
