import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-6 text-caption text-mute">
      <span>GroundTrust · A final-year project, Miva Open University</span>
      <span className="w-full text-[11px] leading-snug sm:order-last">
        Area list: INEC wards from Nigeria Operational Ward Boundaries (eHealth Africa &amp; Proxy Logics, GRID3, CC BY 4.0)
        and places © OpenStreetMap contributors (ODbL).
      </span>
      <span className="flex gap-4">
        <Link to="/privacy" className="hover:text-ink">
          Privacy policy
        </Link>
        <Link to="/terms" className="hover:text-ink">
          Terms of use
        </Link>
      </span>
    </footer>
  );
}
