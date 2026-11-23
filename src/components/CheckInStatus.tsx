import { Check, MapPin } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import type { CheckInResult } from "../hooks/useCheckIn";

function listNames(names: string[]) {
  return names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function message(result: CheckInResult): string | null {
  switch (result.status) {
    case "checking":
      return "Checking your location…";
    case "checked-in":
      return result.atNight
        ? `Checked in at home in ${listNames(result.areaNames)}. Tonight counts toward your verification.`
        : `Location confirmed in ${listNames(result.areaNames)}. Only checks between 9pm and 6am count toward verification.`;
    case "outside":
      return "You're not inside any of your areas right now. Try again when you're at home.";
    case "imprecise":
      return "Your location isn't precise enough to check. Turn on precise location (GPS) for your browser and try again.";
    case "refused":
      return "This location check couldn't be accepted. Try again from home in a little while.";
    case "no-permission":
      return "GroundTrust can't see your location. Allow location for this site, then try again.";
    case "failed":
      return "Couldn't check in right now. Check your connection and try again.";
    default:
      return null;
  }
}

// The result of a deliberate check-in (from a reminder or the app shortcut).
export function CheckInStatus({ result, onRetry }: { result: CheckInResult; onRetry: () => void }) {
  const text = message(result);
  if (!text) return null;
  const done = result.status === "checked-in";
  const canRetry = !done && result.status !== "checking";

  return (
    <Card padding="sm" className="flex items-start gap-3" role="status" aria-live="polite">
      {done ? (
        <Check size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden />
      ) : (
        <MapPin size={18} className="mt-0.5 shrink-0 text-mute" aria-hidden />
      )}
      <div className="flex flex-col gap-2">
        <p className="text-body text-ink">{text}</p>
        {canRetry && (
          <Button type="button" variant="link" className="w-fit text-body" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    </Card>
  );
}
