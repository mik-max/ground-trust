import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { googleAuth, signup } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { TextInput } from "../../components/ui/TextInput";
import { GoogleAuthButton } from "../../components/auth/GoogleAuthButton";
import { text } from "../../styles/typography";

// Self-service signup always creates a resident — Government is
// invite-only (files/DESIGN_SYSTEM.md §6.1), and there's no other
// self-service role since browsing/comparing/reading is already public
// with no account needed at all (see auth.service.ts for why the old
// resident/newcomer role picker is gone).
export function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Every self-signup is a resident, so every self-signup sees the
  // residency-sampling consent screen once, right after — not on every
  // subsequent login.
  function afterAuth(isNewSignup: boolean) {
    navigate(isNewSignup ? "/onboarding/consent" : "/");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { token, user } = await signup({ fullName, email, password });
      setAuth(token, user);
      afterAuth(true);
    } catch {
      setError("Couldn't create your account — that email may already be registered.");
    }
  }

  async function handleGoogle(credential: string) {
    setError(null);
    try {
      const { token, user, isNewUser } = await googleAuth(credential, true);
      setAuth(token, user);
      afterAuth(isNewUser);
    } catch {
      setError("Couldn't sign up with Google — please try again.");
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <h1 className={text.displayMd}>Sign up</h1>
          <p className={`mt-1 ${text.body} text-mute`}>Create your account for free</p>
        </div>

        <Field label="Your name">
          <TextInput
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Name lastname"
            className="w-full"
            required
          />
        </Field>
        <Field label="Your e-mail">
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
          Create account
        </Button>
        <GoogleAuthButton
          text="signup_with"
          onCredential={handleGoogle}
          onError={() => setError("Google sign-in failed.")}
        />
        <p className={`${text.body} text-mute`}>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
