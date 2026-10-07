import { useState } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { MailCheck } from "lucide-react";
import { requestPasswordReset } from "../../services/auth.service";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { TextInput } from "../../components/ui/TextInput";
import { text } from "../../styles/typography";

// Ask for a reset link. The answer is the same whether or not an account
// exists, so this page never reveals who has signed up.
export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      setSent(await requestPasswordReset(email));
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.status === 429
          ? "Too many requests. Please wait a while before asking for another link."
          : isAxiosError(err) && err.response?.data?.error
            ? err.response.data.error
            : "Couldn't send the link. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthLayout>
      {sent ? (
        <div className="flex flex-col gap-5">
          <MailCheck size={32} className="text-brand" />
          <div>
            <h1 className={text.displayMd}>Check your email</h1>
            <p className={`mt-2 ${text.body} text-mute`}>
              {sent} The link works once, for the next hour. If it doesn't arrive in a few minutes, check your spam folder.
            </p>
          </div>
          <Link to="/login" className="font-medium text-brand">
            Back to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <h1 className={text.displayMd}>Forgot your password?</h1>
            <p className={`mt-1 ${text.body} text-mute`}>Enter the email you signed up with and we'll send you a link to reset it.</p>
          </div>
          <Field label="Email">
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@domain.com"
              className="w-full"
              autoComplete="email"
              required
            />
          </Field>
          {error && (
            <p className="text-caption text-band-poor" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={sending}>
            {sending ? "Sending…" : "Send reset link"}
          </Button>
          <p className={`${text.body} text-mute`}>
            Remembered it?{" "}
            <Link to="/login" className="font-medium text-brand">
              Log in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
