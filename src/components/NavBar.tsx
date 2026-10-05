import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { buttonClassName } from "./ui/Button";
import { Logo } from "./Logo";

// A floating white pill. On Home (`overlay`) it sits over the photo hero;
// everywhere else it sits at the top of the page on the canvas. Below md,
// the links collapse into a menu inside the same pill rather than being
// crammed into one row. Logging out lives on the Profile page.
export function NavBar({ overlay = false }: { overlay?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);

  function close() {
    setMenuOpen(false);
  }

  const linkClass = "text-mute transition-colors hover:text-ink";

  const links = (
    <>
      <Link to="/compare" onClick={close} className={linkClass}>
        Compare areas
      </Link>
      {user?.role === "resident" && (
        <Link to="/my-contributions" onClick={close} className={linkClass}>
          My contributions
        </Link>
      )}
      {user?.role === "government" && (
        <Link to="/gov" onClick={close} className={linkClass}>
          Flagged areas
        </Link>
      )}
      {user?.role === "admin" && (
        <>
          <Link to="/admin/government-accounts" onClick={close} className={linkClass}>
            Government accounts
          </Link>
          <Link to="/admin/moderation" onClick={close} className={linkClass}>
            Moderation
          </Link>
        </>
      )}
    </>
  );

  const actions = (
    <>
      {user ? (
        <Link to="/profile" onClick={close} className={linkClass}>
          Profile
        </Link>
      ) : (
        <Link to="/login" onClick={close} className={buttonClassName({ variant: "outline" })}>
          Log in
        </Link>
      )}
      {(!user || user.role === "resident") && (
        <Link
          to={user ? "/share" : "/login"}
          onClick={close}
          className={buttonClassName({ variant: "primary" }, "px-5! py-2.5! text-body!")}
        >
          Share your experience
        </Link>
      )}
    </>
  );

  return (
    <header className={overlay ? "absolute inset-x-0 top-5 z-[1200]" : "relative z-[1200] pt-5"}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <nav
          aria-label="Main"
          className={`rounded-[28px] bg-white/95 py-2.5 pl-5 pr-2.5 backdrop-blur ${
            overlay ? "shadow-hero" : "border border-line"
          }`}
        >
          <div className="flex items-center gap-6">
            <Logo />
            <div className="hidden flex-1 items-center gap-6 text-body md:flex">{links}</div>
            <div className="hidden items-center gap-4 text-body md:flex">{actions}</div>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink md:hidden"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {menuOpen && (
            <div className="flex flex-col items-start gap-4 px-1 pb-3 pt-5 text-body-lg md:hidden">
              {links}
              <div className="flex w-full flex-col items-start gap-4 border-t border-line pt-4">{actions}</div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
