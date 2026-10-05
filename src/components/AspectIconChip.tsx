import type { Aspect } from "../types";
import { ASPECT_META } from "./aspectMeta";

// One fixed 3D icon per aspect, never varies. Decorative: the aspect's name
// is always written next to it, so the image itself carries no alt text.
export function AspectIcon({ aspect, size = 24, className = "" }: { aspect: Aspect; size?: number; className?: string }) {
  return (
    <img
      src={ASPECT_META[aspect].image}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className={`shrink-0 select-none ${className}`.trim()}
      style={{ width: size, height: size }}
    />
  );
}

export function AspectIconChip({ aspect }: { aspect: Aspect }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-paper-2">
      <AspectIcon aspect={aspect} size={24} />
    </div>
  );
}
