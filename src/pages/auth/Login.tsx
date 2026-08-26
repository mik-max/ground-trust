import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as loginRequest } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
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
      <p className={`${text.body} text-mute`}>
        No account?{" "}
        <Link to="/register" className="text-steel">
          Register
        </Link>
      </p>
    </form>
  );
}
