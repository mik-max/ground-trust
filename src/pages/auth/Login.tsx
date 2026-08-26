import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as loginRequest } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";

export function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { token, user } = await loginRequest({ email, password });
      setAuth(token, user);
      navigate("/");
    } catch {
      setError("Invalid email or password.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="text-display-md font-display font-bold text-ink">Log in</h1>
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
        Log in
      </button>
      <p className="text-body text-mute">
        No account?{" "}
        <Link to="/register" className="text-steel">
          Register
        </Link>
      </p>
    </form>
  );
}
