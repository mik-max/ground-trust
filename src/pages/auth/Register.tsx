import { useState } from "react";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { googleAuth, signup } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { TextInput } from "../../components/ui/TextInput";
import { GoogleAuthButton } from "../../components/auth/GoogleAuthButton";
import { text } from "../../styles/typography";
import { nextPath, withNext } from "../../utils/nextPath";

// Self-service signup always creates a resident — Government is
// invite-only (files/DESIGN_SYSTEM.md §6.1), and there's no other
// self-service role since browsing/comparing/reading is already public
// with no account needed at all (see auth.service.ts for why the old
// resident/newcomer role picker is gone).
export function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const next = nextPath(location.search);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Which sign-in is in progress, so the button can show it and not be pressed twice.
  const [pending, setPending] = useState<"form" | "google" | null>(null);

  // Every self-signup is a resident, so every self-signup sees the
  // residency-sampling consent screen once, right after — not on every
  // subsequent login.
  function afterAuth(isNewSignup: boolean) {
    navigate(isNewSignup ? withNext("/onboarding/consent", next === "/" ? "/share" : next) : next, { replace: true });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending("form");
    try {
      const { token, user } = await signup({ fullName, email, password });
      setAuth(token, user);
      afterAuth(true);
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.status === 429
          ? "Too many attempts. Please wait a few minutes and try again."
          : "Couldn't create your account — that email may already be registered."
      );
    } finally {
      setPending(null);
    }
  }

  async function handleGoogle(credential: string) {
    setError(null);
    setPending("google");
    try {
      const { token, user, isNewUser } = await googleAuth(credential, true);
      setAuth(token, user);
      afterAuth(isNewUser);
    } catch {
      setError("Couldn't sign up with Google — please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <h1 className={text.displayMd}>Sign up</h1>
          <p className={`mt-1 ${text.body} text-mute`}>Create your account for free</p>
        </div>

        <Field label="Name">
          <TextInput
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Name lastname"
            className="w-full"
            required
          />
        </Field>
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
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
        <GoogleAuthButton
          text="signup_with"
          onCredential={handleGoogle}
          onError={() => setError("Google sign-in failed.")}
        />
        {pending === "google" && (
          <p className="-mt-2 flex items-center justify-center gap-2 text-caption text-mute" role="status">
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            Signing up with Google…
          </p>
        )}
        <p className="text-caption text-mute">
          By creating an account you agree to the{" "}
          <Link to="/terms" className="text-brand underline">
            Terms of use
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-brand underline">
            Privacy policy
          </Link>
          .
        </p>
        <p className={`${text.body} text-mute`}>
          Already have an account?{" "}
          <Link to={next === "/" ? "/login" : withNext("/login", next)} className="font-medium text-brand">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
