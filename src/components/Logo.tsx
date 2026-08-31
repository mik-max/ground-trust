import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { text } from "../styles/typography";

// Shared between NavBar and the auth pages so the wordmark doesn't drift —
// a small brand-green mark (location pin, matching the geo-first product)
// plus the wordmark, at whatever size the caller needs.
export function Logo({ className = "", markSize = 32, iconSize = 18 }: { className?: string; markSize?: number; iconSize?: number }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="flex shrink-0 items-center justify-center rounded-lg bg-brand text-white"
        style={{ height: markSize, width: markSize }}
      >
        <MapPin size={iconSize} />
      </span>
      <span className={text.heading}>GroundTrust</span>
    </Link>
  );
}
