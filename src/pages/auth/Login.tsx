import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { googleAuth, login as loginRequest } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { TextInput } from "../../components/ui/TextInput";
import { GoogleAuthButton } from "../../components/auth/GoogleAuthButton";
import { text } from "../../styles/typography";
import { nextPath, withNext } from "../../utils/nextPath";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const next = nextPath(location.search);
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
      navigate(next, { replace: true });
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
      navigate(next, { replace: true });
    } catch {
      setError("No account found for this Google email — register first.");
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <h1 className={text.displayMd}>Log in</h1>
          <p className={`mt-1 ${text.body} text-mute`}>Welcome back to GroundTrust</p>
        </div>

        <Field label="Email">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@domain.com"
            className="w-full"
            required
          />
        </Field>
        <Field label="Password">
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full"
            required
          />
        </Field>

        {error && <p className="text-caption text-band-poor">{error}</p>}
        <Button type="submit" className="w-full">
          Log in
        </Button>
        <GoogleAuthButton onCredential={handleGoogle} onError={() => setError("Google sign-in failed.")} />
        <p className={`${text.body} text-mute`}>
          No account?{" "}
          <Link to={next === "/" ? "/register" : withNext("/register", next)} className="font-medium text-brand">
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
