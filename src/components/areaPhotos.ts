// Photos for the few areas we have licensed images of (Unsplash; credited
// in SiteFooter). Matched by name since area ids differ between databases.
// Every other area gets the calm placeholder in AreaCard.
const PHOTOS: Record<string, string> = {
  mushin: "/images/area-mushin.jpg",
  ikoyi: "/images/area-ikoyi.jpg",
  ajegunle: "/images/area-ajegunle.jpg",
  "lekki phase 1": "/images/area-lekki.jpg",
  yaba: "/images/area-yaba.jpg",
  surulere: "/images/area-surulere.jpg",
};

export function areaPhoto(name: string): string | null {
  return PHOTOS[name.trim().toLowerCase()] ?? null;
}
