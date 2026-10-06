// GET /api/og?area=<id> — the 1200×630 link-preview image for an area,
// drawn from its live scores (see files/design-concept share-card sketch).
// Without ?area (or if the area can't be loaded) it draws a site card.
import { ImageResponse } from "@vercel/og";
import { fetchPreviewArea, isAreaId } from "./_lib/area";
import { CARD_HEIGHT, CARD_WIDTH, areaCard, scaleCard, siteCard } from "./_lib/card";

export const config = { runtime: "edge" };

async function font(file: string) {
  return (await fetch(new URL(`./_assets/${file}`, import.meta.url))).arrayBuffer();
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const id = url.searchParams.get("area");
  const area = isAreaId(id) ? await fetchPreviewArea(id) : null;
  const [regular, medium] = await Promise.all([font("Geist-Regular.ttf"), font("Geist-Medium.ttf")]);

  return new ImageResponse(scaleCard(area ? areaCard(area, origin) : siteCard(origin)) as never, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts: [
      { name: "Geist", data: regular, weight: 400, style: "normal" },
      { name: "Geist", data: medium, weight: 500, style: "normal" },
    ],
    headers: {
      // Cached at Vercel's edge, so a sleeping API only slows the first request.
      "Cache-Control": area || !id ? "public, max-age=0, s-maxage=3600, stale-while-revalidate=604800" : "public, max-age=0, s-maxage=60",
    },
  });
}
