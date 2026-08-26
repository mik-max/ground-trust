import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import type { Role } from "../../types";

// Role choice is resident/newcomer only — Government is invite-only, per
// files/DESIGN_SYSTEM.md §6.1.
export function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("resident");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { token, user } = await signup({ fullName, email, password, role });
      setAuth(token, user);
      navigate("/");
    } catch {
      setError("Couldn't create your account — that email may already be registered.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="text-display-md font-display font-bold text-ink">Create an account</h1>

      <div className="flex gap-2">
        {(["resident", "newcomer"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 rounded-md border px-4 py-2 text-body capitalize ${
              role === r ? "border-ink bg-ink text-white" : "border-line text-ink"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Full name"
        required
        className="rounded-md border border-line px-4 py-3 text-body-lg"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="rounded-md border border-line px-4 py-3 text-body-lg"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="rounded-md border border-line px-4 py-3 text-body-lg"
      />
      {error && <p className="text-caption text-band-poor">{error}</p>}
      <button type="submit" className="rounded-md bg-ink px-6 py-3 text-body-lg text-white">
        Create account
      </button>
      <p className="text-body text-mute">
        Already have an account?{" "}
        <Link to="/login" className="text-steel">
          Log in
        </Link>
      </p>
    </form>
  );
}
