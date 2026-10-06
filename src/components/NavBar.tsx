import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { buttonClassName } from "./ui/Button";
import { PageLink } from "./ui/PageLink";
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
      <PageLink to="/compare" onClick={close} className={linkClass}>
        Compare areas
      </PageLink>
      {user?.role === "resident" && (
        <PageLink to="/my-contributions" onClick={close} className={linkClass}>
          My contributions
        </PageLink>
      )}
      {user?.role === "government" && (
        <PageLink to="/gov" onClick={close} className={linkClass}>
          Flagged areas
        </PageLink>
      )}
      {user?.role === "admin" && (
        <>
          <PageLink to="/admin/government-accounts" onClick={close} className={linkClass}>
            Government accounts
          </PageLink>
          <PageLink to="/admin/moderation" onClick={close} className={linkClass}>
            Moderation
          </PageLink>
        </>
      )}
    </>
  );

  const actions = (
    <>
      {user ? (
        <PageLink to="/profile" onClick={close} className={linkClass}>
          Profile
        </PageLink>
      ) : (
        <PageLink to="/login" onClick={close} className={buttonClassName({ variant: "outline" })}>
          Log in
        </PageLink>
      )}
      {(!user || user.role === "resident") && (
        <PageLink
          to={user ? "/share" : "/register?next=%2Fshare"}
          onClick={close}
          className={buttonClassName({ variant: "primary" }, "px-5! py-2.5! text-body!")}
        >
          Share your experience
        </PageLink>
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
