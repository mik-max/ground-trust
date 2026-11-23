import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import { isIos, promptInstall, useInstallStore } from "../pwa/install";

const DISMISSED_KEY = "gt-install-dismissed-at";
const QUIET_DAYS = 30;

function dismissedRecently(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISSED_KEY));
    return at > 0 && Date.now() - at < QUIET_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

// A small, dismissible offer to add GroundTrust to the phone's home screen.
// Phones only. Android gets the browser's install dialog; iPhone Safari has
// none, so it gets the two taps to make instead. Saying no hides it for 30 days.
export function InstallBanner() {
  const canPrompt = useInstallStore((s) => s.promptEvent !== null);
  const installed = useInstallStore((s) => s.installed);
  const [hidden, setHidden] = useState(dismissedRecently);
  const [isPhone, setIsPhone] = useState(false);
  // My Contributions offers installing in its reminders card already.
  const onContributions = useLocation().pathname === "/my-contributions";

  useEffect(() => {
    setIsPhone(window.matchMedia("(max-width: 767px) and (pointer: coarse)").matches);
  }, []);

  const iosHint = isIos() && !canPrompt;
  if (hidden || installed || !isPhone || onContributions || (!canPrompt && !iosHint)) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // Private browsing: it just shows again next visit.
    }
    setHidden(true);
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 flex items-start gap-3 rounded-lg border border-line bg-white p-4 shadow-hero">
      <div className="flex flex-1 flex-col gap-2">
        <p className="text-body text-ink">
          {iosHint
            ? "Add GroundTrust to your Home Screen: tap Share, then Add to Home Screen."
            : "Add GroundTrust to your phone for quick access and night check-in reminders."}
        </p>
        {canPrompt && (
          <Button type="button" variant="outline" active className="w-fit" onClick={() => void promptInstall()}>
            Install
          </Button>
        )}
      </div>
      <button type="button" onClick={dismiss} aria-label="Not now" className="-m-1 p-1 text-mute hover:text-ink">
        <X size={18} />
      </button>
    </div>
  );
}
