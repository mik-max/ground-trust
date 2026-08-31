import type { LucideIcon } from "lucide-react";

// A restrained "spot illustration" system rather than stock photography or
// hand-drawn scenes — layered soft-brand-tint circles behind a single
// Lucide icon, plus two small accent dots (one brand green, one amber, the
// warmth role amber otherwise never gets in this app — see the design
// audit notes). Geometric and reusable rather than bespoke per screen, so
// it stays consistent everywhere and never risks looking amateurish the
// way freehand illustration can without a real visual iteration loop.
export function SpotIllustration({ icon: Icon, className = "" }: { icon: LucideIcon; className?: string }) {
  return (
    <div className={`relative flex h-32 w-32 shrink-0 items-center justify-center ${className}`}>
      <div className="absolute inset-0 rounded-full bg-brand/[6%]" />
      <div className="absolute inset-3 rounded-full bg-brand/[8%]" />
      <div className="absolute inset-7 rounded-full bg-brand/10" />
      <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-amber/40" />
      <div className="absolute bottom-5 left-2 h-2 w-2 rounded-full bg-brand/30" />
      <Icon size={40} strokeWidth={1.5} className="relative text-brand" />
    </div>
  );
}
