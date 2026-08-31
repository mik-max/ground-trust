import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { buttonClassName } from "./ui/Button";
import { text } from "../styles/typography";

// Below md, every resident-role link (CTA + My Contributions + Profile +
// Log out) had to fit in one row with no wrap/collapse strategy — the CTA's
// own text wrapped onto multiple lines and visually overlapped the logo.
// Collapses to a hamburger menu below md instead of trying to cram
// everything into a single row at every width.
export function NavBar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function close() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    close();
    navigate("/login");
  }

  const links = (
    <>
      {user?.role === "resident" && (
        <>
          <Link
            to="/share"
            onClick={close}
            className={buttonClassName({ variant: "primary" }, "w-full px-4! py-2! text-center md:w-auto")}
          >
            Talk about your environment
          </Link>
          <Link to="/my-contributions" onClick={close} className="text-mute">
            My Contributions
          </Link>
        </>
      )}
      {user?.role === "government" && (
        <Link to="/gov" onClick={close} className="text-brand">
          Government Dashboard
        </Link>
      )}
      {user?.role === "admin" && (
        <>
          <Link to="/admin/government-accounts" onClick={close} className="text-brand">
            Government Accounts
          </Link>
          <Link to="/admin/moderation" onClick={close} className="text-brand">
            Moderation Queue
          </Link>
        </>
      )}
      {user && (
        <Link to="/profile" onClick={close} className="text-mute">
          Profile
        </Link>
      )}
      {user ? (
        <button type="button" onClick={handleLogout} className="text-left text-mute">
          Log out
        </button>
      ) : (
        <Link to="/login" onClick={close} className="text-brand">
          Log in
        </Link>
      )}
    </>
  );

  return (
    <nav className="border-b border-line bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/" className={text.heading}>
          GroundTrust
        </Link>
        <div className="hidden items-center gap-4 text-body md:flex">{links}</div>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="p-2.5 text-ink md:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && <div className="mt-4 flex flex-col items-start gap-4 text-body md:hidden">{links}</div>}
    </nav>
  );
}
