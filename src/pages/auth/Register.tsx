import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import type { Role } from "../../types";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { text } from "../../styles/typography";

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
      <h1 className={text.displayMd}>Create an account</h1>

      <div className="flex gap-2">
        {(["resident", "newcomer"] as const).map((r) => (
          <Button
            key={r}
            type="button"
            variant="outline"
            active={role === r}
            onClick={() => setRole(r)}
            className="flex-1 capitalize"
          >
            {r}
          </Button>
        ))}
      </div>

      <TextInput
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Full name"
        required
      />
      <TextInput
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <TextInput
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="text-caption text-band-poor">{error}</p>}
      <Button type="submit">Create account</Button>
      <p className={`${text.body} text-mute`}>
        Already have an account?{" "}
        <Link to="/login" className="text-steel">
          Log in
        </Link>
      </p>
    </form>
  );
}
