import { BellRing } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { text } from "../styles/typography";
import { useNightReminders } from "../hooks/useNightReminders";
import { promptInstall, useInstallStore } from "../pwa/install";

// My Contributions: lets a resident turn on a 9:30pm reminder on nights a
// check at home would help their verification. The reminder only opens the
// app; location is checked once, while it's open, as before.
export function NightRemindersCard() {
  const { state, busy, error, turnOn, turnOff } = useNightReminders();
  const canInstall = useInstallStore((s) => s.promptEvent !== null && !s.installed);

  if (state === "loading" || state === "unavailable") return null;

  return (
    <Card padding="sm" className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <BellRing size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden />
        <div className="flex flex-col gap-1">
          <h2 className={text.heading}>Night check-in reminders</h2>
          <p className="text-body text-mute">
            Your ratings count for more once your phone has been at home on three different nights. Get one reminder at
            9:30pm on nights a check would help. Tapping it opens GroundTrust, which checks your location once. It never
            tracks you in the background.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pl-[30px]">
        {state === "off" && (
          <Button type="button" variant="outline" active onClick={turnOn} disabled={busy}>
            Turn on reminders
          </Button>
        )}
        {state === "on" && (
          <>
            <span className="text-body text-ink">Reminders are on for this device.</span>
            <Button type="button" variant="link" className="text-body" onClick={turnOff} disabled={busy}>
              Turn off
            </Button>
          </>
        )}
        {state === "needs-install" && (
          <p className="text-body text-ink">
            On iPhone, add GroundTrust to your Home Screen first: tap Share, then Add to Home Screen. Open it from there to
            turn reminders on.
          </p>
        )}
        {state === "blocked" && (
          <p className="text-body text-ink">
            Notifications are blocked for GroundTrust. Allow them in your browser's site settings, then come back here.
          </p>
        )}
        {state === "unsupported" && (
          <p className="text-body text-ink">This browser can't show reminders. Chrome on Android supports them.</p>
        )}
        {canInstall && (
          <Button type="button" variant="outline" onClick={() => void promptInstall()}>
            Install the app
          </Button>
        )}
      </div>
      {error && <p className="pl-[30px] text-caption text-band-poor">{error}</p>}
    </Card>
  );
}
