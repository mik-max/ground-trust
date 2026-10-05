// Empty-state art: a single 3D icon from the same Noto 3D set as the aspect
// icons (public/icons/), sitting on a soft neutral disc. Calm and
// consistent everywhere, instead of per-screen illustrations.
export const ILLUSTRATIONS = {
  location: "/icons/location.png",
  neighbourhood: "/icons/neighbourhood.png",
  government: "/icons/government.png",
  voice: "/icons/voice.png",
  comments: "/icons/comments.png",
  search: "/icons/search.png",
  allClear: "/icons/all-clear.png",
  inbox: "/icons/inbox.png",
  map: "/icons/map.png",
  home: "/icons/home.png",
} as const;

export type IllustrationName = keyof typeof ILLUSTRATIONS;

export function SpotIllustration({ name, className = "" }: { name: IllustrationName; className?: string }) {
  return (
    <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-paper-2 ${className}`}>
      <img src={ILLUSTRATIONS[name]} alt="" width={56} height={56} className="h-14 w-14 select-none" />
    </div>
  );
}
