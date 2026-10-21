// GET /api/share?area=<id> (or ?areas=a,b for /compare) — what link-preview
// crawlers (WhatsApp, X, iMessage, Telegram, Slack...) get for an area or a
// comparison: the app's own index.html with its title, description and
// preview image in the <head>. vercel.json routes only crawler user agents here; people get the
// normal static app. Serving the real index.html means a person whose
// browser looks like a crawler still gets the working app.
import { choiceQuestion, describe, fetchPreviewArea, imageVersion, isAreaId } from "./_lib/area.js";
import { CARD_HEIGHT, CARD_WIDTH, SQUARE } from "./_lib/card.js";

export const config = { runtime: "edge" };

const SITE = "GroundTrust";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type Meta = { pageUrl: string; title: string; description: string; image: string; width: number; height: number; cached: boolean };

async function areaMeta(origin: string, id: string | null): Promise<Meta> {
  const area = isAreaId(id) ? await fetchPreviewArea(id) : null;
  return {
    pageUrl: `${origin}/areas/${encodeURIComponent(id ?? "")}`,
    title: area ? `${area.name} · ${SITE}` : `An area on ${SITE}`,
    description: area ? describe(area) : "What residents say about power, water, security, flooding and access in their area.",
    image: area ? `${origin}/api/og?area=${encodeURIComponent(area.id)}&v=${encodeURIComponent(imageVersion(area))}` : `${origin}/api/og`,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    cached: Boolean(area),
  };
}

// /compare?areas=a,b[,c]: the square comparison card.
async function compareMeta(origin: string, ids: string[]): Promise<Meta> {
  const found = (await Promise.all(ids.map((id) => fetchPreviewArea(id)))).filter((a) => a !== null);
  const pageUrl = `${origin}/compare?areas=${ids.map(encodeURIComponent).join(",")}`;
  if (found.length < 2) {
    return { ...(await areaMeta(origin, found[0]?.id ?? null)), pageUrl, cached: false };
  }
  const names = found.map((a) => a.name);
  const title = `${choiceQuestion(names)} · ${SITE}`;
  const description = found
    .map((a) => `${a.name} ${a.score === null ? "not rated yet" : `${a.score.toFixed(1)}/5 from ${a.residents} resident${a.residents === 1 ? "" : "s"}`}`)
    .join(" · ");
  const version = found.map(imageVersion).join("_");
  return {
    pageUrl,
    title,
    description: `${description}. Compare power, water, security, flooding and access side by side.`,
    image: `${origin}/api/og?compare=${found.map((a) => encodeURIComponent(a.id)).join(",")}&v=${encodeURIComponent(version)}`,
    width: SQUARE.width * SQUARE.scale,
    height: SQUARE.height * SQUARE.scale,
    cached: found.length === ids.length,
  };
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const compareIds = (url.searchParams.get("areas") ?? "").split(",").filter(isAreaId).slice(0, 3);
  const [meta, shell] = await Promise.all([
    url.searchParams.has("areas") ? compareMeta(origin, compareIds) : areaMeta(origin, url.searchParams.get("area")),
    fetch(`${origin}/index.html`).then((r) => r.text()),
  ]);
  const { pageUrl, title, description, image } = meta;

  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${esc(pageUrl)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${SITE}">`,
    `<meta property="og:url" content="${esc(pageUrl)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta property="og:image:width" content="${meta.width}">`,
    `<meta property="og:image:height" content="${meta.height}">`,
    `<meta property="og:image:alt" content="${esc(`${title.replace(` · ${SITE}`, "")}: resident ratings on ${SITE}`)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${esc(image)}">`,
  ].join("\n    ");

  // Swap the shell's site-wide <title>/meta block for the area's own.
  const html = shell
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<!-- share-meta -->[\s\S]*?<!-- \/share-meta -->/, "")
    .replace("</head>", `    ${tags}\n  </head>`);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": meta.cached ? "public, max-age=0, s-maxage=600, stale-while-revalidate=86400" : "public, max-age=0, s-maxage=60",
    },
  });
}
