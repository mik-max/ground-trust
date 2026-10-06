// GET /api/og — share images drawn from live scores: an area's chat link
// preview (?area=<id>), its WhatsApp Status card (&format=story), or a
// comparison card (?compare=a,b[,c]). Without a usable area, or if the API
// can't be reached, it draws the site card. A Node function rather than Edge: the renderer (satori +
// resvg) is far larger than Edge's ~1MB limit. resvg runs as WebAssembly so
// the function doesn't depend on a native binary for the CPU it lands on. Icons, photos and the font
// ship inside the function (vercel.json includeFiles) and are read from
// disk, so rendering never depends on fetching the site itself.
import { readFile } from "node:fs/promises";
import path from "node:path";
import satori from "satori";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { fetchPreviewArea, isAreaId } from "./_lib/area.js";
import { CARD_HEIGHT, CARD_WIDTH, SQUARE, STORY, areaCard, compareCard, scaleCard, siteCard, storyCard, type Node } from "./_lib/card.js";

const ROOT = process.cwd();
const MIME: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

// Loaded once per warm instance.
let wasmReady: Promise<void> | null = null;
// (A reload of this module in the Vite dev server finds resvg already set up, which is fine.)
const ensureWasm = () =>
  (wasmReady ??= readFile(path.join(ROOT, "node_modules/@resvg/resvg-wasm/index_bg.wasm"))
    .then((wasm) => initWasm(wasm))
    .catch((err: unknown) => {
      if (!String(err).includes("Already initialized")) throw err;
    }));

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

// Area photos live on Cloudinary. If one can't be fetched in time, the card
// still renders, just without the photo.
async function remoteDataUri(url: string) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(String(res.status));
    const type = res.headers.get("content-type") ?? "image/jpeg";
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
  }
}

// Swap the card's image references (site paths like "/icons/power.png" and
// the Cloudinary photo URL) for inline data, which is what satori renders from.
async function inlineAssets(node: unknown): Promise<unknown> {
  if (Array.isArray(node)) return Promise.all(node.map(inlineAssets));
  if (!node || typeof node !== "object") return node;
  const { type, props } = node as Node;
  const next = { ...props };
  if (type === "img" && typeof props.src === "string" && props.src.startsWith("/")) next.src = await dataUri(props.src);
  const bg = props.style?.backgroundImage;
  if (typeof bg === "string" && bg.startsWith("url(/")) {
    next.style = { ...props.style, backgroundImage: `url(${await dataUri(bg.slice(4, -1))})` };
  } else if (typeof bg === "string" && bg.startsWith("url(https://")) {
    next.style = { ...props.style, backgroundImage: `url(${await remoteDataUri(bg.slice(4, -1))})` };
  }
  next.children = await inlineAssets(props.children);
  return { type, props: next };
}

type Layout = { tree: unknown; width: number; height: number; name: string; complete: boolean };

// ?format=link (default): the chat link preview. ?format=story: the 9:16
// WhatsApp Status card. ?compare=a,b[,c]: the square comparison card.
async function chooseLayout(params: URLSearchParams): Promise<Layout> {
  const link = (tree: unknown, name: string, complete: boolean): Layout =>
    ({ tree: scaleCard(tree), width: CARD_WIDTH, height: CARD_HEIGHT, name, complete });

  const compareIds = (params.get("compare") ?? "").split(",").filter(isAreaId).slice(0, 3);
  if (compareIds.length > 0) {
    const found = (await Promise.all(compareIds.map((id) => fetchPreviewArea(id)))).filter((a) => a !== null);
    if (found.length >= 2) {
      return {
        tree: scaleCard(compareCard(found, ""), SQUARE.scale),
        width: Math.round(SQUARE.width * SQUARE.scale),
        height: Math.round(SQUARE.height * SQUARE.scale),
        name: `compare-${found.map((a) => a.id).join("-")}`,
        complete: found.length === compareIds.length,
      };
    }
    if (found.length === 1) return link(areaCard(found[0], ""), found[0].id, false);
    return link(siteCard(""), "groundtrust", false);
  }

  const id = params.get("area");
  if (!isAreaId(id)) return link(siteCard(""), "groundtrust", id === null);
  const area = await fetchPreviewArea(id);
  if (!area) return link(siteCard(""), "groundtrust", false);
  if (params.get("format") === "story") {
    return {
      tree: scaleCard(storyCard(area, ""), STORY.scale),
      width: Math.round(STORY.width * STORY.scale),
      height: Math.round(STORY.height * STORY.scale),
      name: `${area.id}-status`,
      complete: true,
    };
  }
  return link(areaCard(area, ""), area.id, true);
}

export async function GET(request: Request) {
  const layout = await chooseLayout(new URL(request.url).searchParams);
  const [, regular, medium, tree] = await Promise.all([
    ensureWasm(),
    read("api/_assets/Geist-Regular.ttf"),
    read("api/_assets/Geist-Medium.ttf"),
    inlineAssets(layout.tree),
  ]);

  const svg = await satori(tree as never, {
    width: layout.width,
    height: layout.height,
    fonts: [
      { name: "Geist", data: regular, weight: 400, style: "normal" },
      { name: "Geist", data: medium, weight: 500, style: "normal" },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: layout.width } }).render().asPng();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="${layout.name}.png"`,
      // The in-app share sheet fetches the image to save or share it.
      "Access-Control-Allow-Origin": "*",
      // Cached at Vercel's edge, so a sleeping API only slows the first
      // request. Fallbacks (API unreachable) are cached briefly so the real
      // card replaces them soon.
      "Cache-Control": layout.complete
        ? "public, max-age=0, s-maxage=3600, stale-while-revalidate=604800"
        : "public, max-age=0, s-maxage=60",
    },
  });
}
