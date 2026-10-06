// GET /api/share?area=<id> — what link-preview crawlers (WhatsApp, X,
// iMessage, Telegram, Slack...) get for /areas/<id>: the app's own
// index.html with that area's title, description and preview image in the
// <head>. vercel.json routes only crawler user agents here; people get the
// normal static app. Serving the real index.html means a person whose
// browser looks like a crawler still gets the working app.
import { describe, fetchPreviewArea, imageVersion, isAreaId } from "./_lib/area.js";
import { CARD_HEIGHT, CARD_WIDTH } from "./_lib/card.js";

export const config = { runtime: "edge" };

const SITE = "GroundTrust";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const id = url.searchParams.get("area");
  const [area, shell] = await Promise.all([
    isAreaId(id) ? fetchPreviewArea(id) : Promise.resolve(null),
    fetch(`${origin}/index.html`).then((r) => r.text()),
  ]);

  const pageUrl = `${origin}/areas/${encodeURIComponent(id ?? "")}`;
  const title = area ? `${area.name} · ${SITE}` : `An area on ${SITE}`;
  const description = area
    ? describe(area)
    : "What residents say about power, water, security, flooding and access in their area.";
  const image = area ? `${origin}/api/og?area=${encodeURIComponent(area.id)}&v=${encodeURIComponent(imageVersion(area))}` : `${origin}/api/og`;

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
    `<meta property="og:image:width" content="${CARD_WIDTH}">`,
    `<meta property="og:image:height" content="${CARD_HEIGHT}">`,
    `<meta property="og:image:alt" content="${esc(area ? `${area.name}: resident ratings on ${SITE}` : SITE)}">`,
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
      "Cache-Control": area ? "public, max-age=0, s-maxage=600, stale-while-revalidate=86400" : "public, max-age=0, s-maxage=60",
    },
  });
}
