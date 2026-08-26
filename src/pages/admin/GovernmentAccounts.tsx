import { useEffect, useState } from "react";
import type { GovernmentAccount } from "../../types";
import { createGovernmentAccount, listGovernmentAccounts } from "../../services/admin.service";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { TextInput } from "../../components/ui/TextInput";
import { text } from "../../styles/typography";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// files/HANDOFF.md §2.5 — government accounts are never self-service; an
// authenticated admin provisions them directly here. No invite-email flow
// yet (flagged as an open question in the same section) — this creates the
// account outright with the password the admin sets.
export function AdminGovernmentAccounts() {
  const [accounts, setAccounts] = useState<GovernmentAccount[] | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    listGovernmentAccounts().then(setAccounts);
  }

  useEffect(refresh, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createGovernmentAccount({ fullName, email, password });
      setFullName("");
      setEmail("");
      setPassword("");
      refresh();
    } catch {
      setError("Couldn't create that account — the email may already be in use.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className={text.displayMd}>Government Accounts</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
        <h2 className={text.heading}>Provision a new account</h2>
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
        <Button type="submit" disabled={submitting} className="w-fit">
          {submitting ? "Creating..." : "Create account"}
        </Button>
      </form>

      <div>
        <h2 className={text.heading}>Existing accounts</h2>
        {accounts === null ? (
          <p className={`${text.body} text-mute`}>Loading...</p>
        ) : accounts.length === 0 ? (
          <p className={`${text.body} text-mute`}>No government accounts provisioned yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {accounts.map((a) => (
              <li key={a.id}>
                <Card className="flex items-center justify-between">
                  <div>
                    <p className="text-body-lg text-ink">{a.fullName}</p>
                    <p className="text-caption text-mute">{a.email}</p>
                  </div>
                  <p className="text-caption text-mute">Since {formatDate(a.createdAt)}</p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
