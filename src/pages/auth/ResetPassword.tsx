import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { CheckCircle2 } from "lucide-react";
import { resetPassword } from "../../services/auth.service";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Button, buttonClassName } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { TextInput } from "../../components/ui/TextInput";
import { text } from "../../styles/typography";

const MIN_LENGTH = 8;

// Reached from the emailed link (?token=...). Sets a new password, which
// also signs the account out on every other device.
export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_LENGTH) return setError(`Use at least ${MIN_LENGTH} characters.`);
    if (password !== confirm) return setError("The two passwords don't match.");
    setSaving(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.status === 429
          ? "Too many attempts. Please wait a few minutes and try again."
          : isAxiosError(err) && err.response?.data?.error
            ? err.response.data.error
            : "Couldn't change the password. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <div className="flex flex-col gap-4">
          <h1 className={text.displayMd}>This link is incomplete</h1>
          <p className={`${text.body} text-mute`}>Open the link from your email again, or ask for a new one.</p>
          <Link to="/forgot-password" className={buttonClassName({ variant: "primary" }, "w-fit")}>
            Get a new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {done ? (
        <div className="flex flex-col gap-5">
          <CheckCircle2 size={32} className="text-brand" />
          <div>
            <h1 className={text.displayMd}>Password changed</h1>
            <p className={`mt-2 ${text.body} text-mute`}>
              You can log in with your new password now. For your security, you've been signed out on other devices.
            </p>
          </div>
          <Link to="/login" className={buttonClassName({ variant: "primary" }, "w-fit")}>
            Log in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <h1 className={text.displayMd}>Choose a new password</h1>
            <p className={`mt-1 ${text.body} text-mute`}>At least {MIN_LENGTH} characters.</p>
          </div>
          <Field label="New password">
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              autoComplete="new-password"
              minLength={MIN_LENGTH}
              required
            />
          </Field>
          <Field label="Confirm new password">
            <TextInput
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full"
              autoComplete="new-password"
              required
            />
          </Field>
          {error && (
            <p className="text-caption text-band-poor" role="alert">
              {error}{" "}
              {error.includes("expired") && (
                <Link to="/forgot-password" className="font-medium text-brand underline">
                  Get a new link
                </Link>
              )}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving…" : "Change password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
