import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { googleAuth, login as loginRequest } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { GoogleAuthButton } from "../../components/auth/GoogleAuthButton";
import { text } from "../../styles/typography";

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

  // No role is sent — an unrecognized Google email means "no account yet,"
  // not "create one now." Logging in shouldn't silently sign someone up.
  async function handleGoogle(credential: string) {
    setError(null);
    try {
      const { token, user } = await googleAuth(credential);
      setAuth(token, user);
      navigate("/");
    } catch {
      setError("No account found for this Google email — register first.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className={text.displayMd}>Log in</h1>
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
      <Button type="submit">Log in</Button>
      <GoogleAuthButton onCredential={handleGoogle} onError={() => setError("Google sign-in failed.")} />
      <p className={`${text.body} text-mute`}>
        No account?{" "}
        <Link to="/register" className="text-brand">
          Register
        </Link>
      </p>
    </form>
  );
}
