import { useNavigate } from "react-router-dom";
import { Mail, User as UserIcon, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { BackLink } from "../components/ui/BackLink";
import { text } from "../styles/typography";

const ROLE_LABEL: Record<string, string> = {
  resident: "Resident",
  government: "Government",
  admin: "Admin",
};

// A basic account page — who's logged in, and how to log out — that didn't
// exist anywhere before this (no way to see your own account details once
// signed in).
export function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <BackLink to="/" label="All areas" />
      <h1 className={text.displayMd}>Profile</h1>

      <Card className="flex max-w-md flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-paper-2 text-brand">
            <UserIcon size={18} />
          </div>
          <div>
            <p className="text-caption text-mute">Name</p>
            <p className="text-body-lg text-ink">{user.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-paper-2 text-brand">
            <Mail size={18} />
          </div>
          <div>
            <p className="text-caption text-mute">Email</p>
            <p className="text-body-lg text-ink">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-paper-2 text-brand">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-caption text-mute">Role</p>
            <p className="text-body-lg text-ink">{ROLE_LABEL[user.role] ?? user.role}</p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-fit"
        >
          Log out
        </Button>
      </Card>
    </div>
  );
}
