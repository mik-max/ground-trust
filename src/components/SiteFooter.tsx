import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-12 text-body text-mute sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo />
          <nav className="flex flex-wrap gap-6" aria-label="Footer">
            <Link to="/compare" className="hover:text-ink">
              Compare areas
            </Link>
            <Link to="/privacy" className="hover:text-ink">
              Privacy policy
            </Link>
            <Link to="/terms" className="hover:text-ink">
              Terms of use
            </Link>
          </nav>
        </div>
        <p className="text-caption">GroundTrust · A final-year project, Miva Open University</p>
        <p className="max-w-[90ch] text-[12px] leading-relaxed text-mute/80">
          Area list: INEC wards from Nigeria Operational Ward Boundaries (eHealth Africa &amp; Proxy Logics, GRID3, CC BY
          4.0) and places © OpenStreetMap contributors (ODbL). Photos from Unsplash by Obinna Okerekeocha, Nupo Deyon
          Daniel, Francis Odeyemi, Tunde Buremo, Muhammad-Taha Ibrahim, Stephen Olatunde, Joshua Oluwagbemiga and Namnso
          Ukpanah. Icons: Noto Emoji by Google (Apache License 2.0).
        </p>
      </div>
    </footer>
  );
}
