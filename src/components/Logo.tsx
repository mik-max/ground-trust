import { PageLink } from "./ui/PageLink";
import { text } from "../styles/typography";

// The mark: a rounded square with a horizon line and a dot — "ground" and a
// point on it. Drawn in currentColor so it follows the wordmark's color
// (ink on light surfaces, white over the Home hero).
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="24" height="24" rx="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 17.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="13" cy="11" r="3.2" fill="currentColor" />
    </svg>
  );
}

// Shared between NavBar and the auth pages so the wordmark doesn't drift.
export function Logo({ className = "", markSize = 26 }: { className?: string; markSize?: number }) {
  return (
    <PageLink to="/" className={`inline-flex items-center gap-2.5 text-ink ${className}`}>
      <LogoMark size={markSize} />
      <span className={`${text.heading} font-semibold text-inherit`}>GroundTrust</span>
    </PageLink>
  );
}
