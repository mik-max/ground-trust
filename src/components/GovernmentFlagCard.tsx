import { useState } from "react";
import type { Flag, FlagResponseStatus } from "../types";
import { respondToFlag } from "../services/gov.service";
import { ASPECT_META } from "./aspectMeta";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/TextInput";
import { text } from "../styles/typography";

const RESPONSE_LABEL: Record<FlagResponseStatus, string> = {
  unacknowledged: "Not yet acknowledged",
  acknowledged: "Acknowledged",
  in_progress: "Action in progress",
};

// files/DESIGN_SYSTEM.md §5.7, extended: government can acknowledge a flag
// or mark action as in progress, with an optional note. There's no
// "resolve" action — a flag only clears when residents' scores recover.
export function GovernmentFlagCard({ flag: initialFlag }: { flag: Flag }) {
  const [flag, setFlag] = useState(initialFlag);
  const [note, setNote] = useState(initialFlag.responseNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const Icon = ASPECT_META[flag.aspect].icon;

  async function respond(status: Exclude<FlagResponseStatus, "unacknowledged">) {
    setSaving(true);
    setError(null);
    try {
      setFlag(await respondToFlag(flag.id, status, note));
    } catch {
      setError("Couldn't save your response. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card border="accent">
      <p className={text.heading}>{flag.area?.name ?? "Unknown area"}</p>
      <p className="text-body text-mute">
        {flag.area?.city}, {flag.area?.state}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-paper-2 text-ink">
          <Icon size={16} />
        </div>
        <p className="text-body text-ink">
          Flagged aspect: <span className="font-bold">{ASPECT_META[flag.aspect].label}</span>
        </p>
      </div>
      <p className="mt-2 text-caption text-mute">
        Below threshold for {flag.consecutiveWeeksBelowThreshold} consecutive week
        {flag.consecutiveWeeksBelowThreshold === 1 ? "" : "s"}
      </p>

      <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
        <p className="text-body text-ink">
          Status: <span className="font-bold">{RESPONSE_LABEL[flag.responseStatus]}</span>
          {flag.respondedAt && (
            <span className="text-caption text-mute">
              {" "}
              · {flag.respondedBy?.fullName ?? "Government"}, {new Date(flag.respondedAt).toLocaleDateString()}
            </span>
          )}
        </p>
        <Textarea
          placeholder="Optional note, e.g. what action is planned"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-label="Response note"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            active={flag.responseStatus === "acknowledged"}
            disabled={saving}
            onClick={() => respond("acknowledged")}
          >
            Acknowledge
          </Button>
          <Button
            variant="outline"
            active={flag.responseStatus === "in_progress"}
            disabled={saving}
            onClick={() => respond("in_progress")}
          >
            Mark action in progress
          </Button>
        </div>
        {error && <p className="text-caption text-mute">{error}</p>}
      </div>
    </Card>
  );
}
