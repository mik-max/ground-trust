import { useState } from "react";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
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
  // Which sign-in is in progress, so the button can show it and not be pressed twice.
  const [pending, setPending] = useState<"form" | "google" | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending("form");
    try {
      const { token, user } = await loginRequest({ email, password });
      setAuth(token, user);
      navigate(next, { replace: true });
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.status === 429
          ? "Too many attempts. Please wait a few minutes and try again."
          : "Invalid email or password."
      );
    } finally {
      setPending(null);
    }
  }

  // No role is sent — an unrecognized Google email means "no account yet,"
  // not "create one now." Logging in shouldn't silently sign someone up.
  async function handleGoogle(credential: string) {
    setError(null);
    setPending("google");
    try {
      const { token, user } = await googleAuth(credential);
      setAuth(token, user);
      navigate(next, { replace: true });
    } catch {
      setError("No account found for this Google email — register first.");
    } finally {
      setPending(null);
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
        <div className="flex flex-col gap-2">
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
          <Link to="/forgot-password" className="w-fit self-end text-caption text-brand underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-caption text-band-poor">{error}</p>}
        <Button
          type="submit"
          // Loading reads as "working on it", not greyed out like a disabled button.
          className={`w-full ${pending === "form" ? "disabled:cursor-progress disabled:opacity-90" : ""}`}
          disabled={pending !== null}
          aria-busy={pending === "form"}
        >
          {pending === "form" ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Logging in…
            </>
          ) : (
            "Log in"
          )}
        </Button>
        <GoogleAuthButton onCredential={handleGoogle} onError={() => setError("Google sign-in failed.")} />
        {pending === "google" && (
          <p className="-mt-2 flex items-center justify-center gap-2 text-caption text-mute" role="status">
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            Signing in with Google…
          </p>
        )}
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
