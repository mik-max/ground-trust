import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { buttonClassName } from "./ui/Button";
import { Logo } from "./Logo";

export function NavBar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between border-b border-line bg-white px-6 py-4">
      <Logo markSize={28} iconSize={16} />
      <div className="flex items-center gap-4 text-body">
        {user?.role === "resident" && (
          <>
            <Link to="/share" className={buttonClassName({ variant: "primary" }, "px-4! py-2!")}>
              Talk about your environment
            </Link>
            <Link to="/my-contributions" className="text-mute">
              My Contributions
            </Link>
          </>
        )}
        {user?.role === "government" && (
          <Link to="/gov" className="text-brand">
            Government Dashboard
          </Link>
        )}
        {user?.role === "admin" && (
          <>
            <Link to="/admin/government-accounts" className="text-brand">
              Government Accounts
            </Link>
            <Link to="/admin/moderation" className="text-brand">
              Moderation Queue
            </Link>
          </>
        )}
        {user && (
          <Link to="/profile" className="text-mute">
            Profile
          </Link>
        )}
        {user ? (
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-mute"
          >
            Log out
          </button>
        ) : (
          <Link to="/login" className="text-brand">
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}
