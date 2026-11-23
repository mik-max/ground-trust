import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { postGpsSample } from "../services/verification.service";

export type CheckInResult =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "checked-in"; areaNames: string[]; atNight: boolean }
  | { status: "outside" }
  | { status: "imprecise" }
  | { status: "refused" }
  | { status: "no-permission" }
  | { status: "failed" };

// Nigeria is UTC+1 all year; a night runs 9pm–6am (as on the server, which
// decides for itself — this only chooses the wording).
function isNightInNigeria(date = new Date()) {
  const hour = (date.getUTCHours() + 1) % 24;
  return hour >= 21 || hour < 6;
}

// A deliberate check-in, when the resident arrives from a night reminder or
// the app's "Check in" shortcut. Unlike useGpsPresenceSample (silent, in the
// background of a page), it says what happened, so the person knows whether
// tonight counted. Same derive-and-discard rule: the reading is sent once
// and never stored.
export function useCheckIn(areas: { id: string; name: string }[] | null, enabled: boolean, onCheckedIn: () => void) {
  const [result, setResult] = useState<CheckInResult>({ status: "idle" });
  const [attempt, setAttempt] = useState(0);
  const ran = useRef(-1);
  const ready = enabled && areas !== null && areas.length > 0;

  useEffect(() => {
    if (!ready || !areas || ran.current === attempt) return;
    ran.current = attempt;
    if (!navigator.geolocation) {
      setResult({ status: "failed" });
      return;
    }
    setResult({ status: "checking" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const outcomes = await Promise.allSettled(areas.map((a) => postGpsSample(a.id, latitude, longitude, accuracy)));

        const accepted = areas.filter((_, i) => outcomes[i].status === "fulfilled").map((a) => a.name);
        if (accepted.length > 0) {
          setResult({ status: "checked-in", areaNames: accepted, atNight: isNightInNigeria() });
          onCheckedIn();
          return;
        }
        const reasons = outcomes.map((o) =>
          o.status === "rejected" && isAxiosError(o.reason) ? (o.reason.response?.data as { reason?: string } | undefined)?.reason : undefined
        );
        if (reasons.includes("imprecise")) setResult({ status: "imprecise" });
        else if (reasons.every((r) => r === "outside_area")) setResult({ status: "outside" });
        else if (reasons.some((r) => r === "implausible_coordinates" || r === "impossible_travel")) setResult({ status: "refused" });
        else setResult({ status: "failed" });
      },
      (error) => setResult({ status: error.code === error.PERMISSION_DENIED ? "no-permission" : "failed" }),
      { enableHighAccuracy: true, maximumAge: 60 * 1000, timeout: 15000 }
    );
    // areas is read once per attempt; a new list mustn't trigger a second check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { result, retry };
}
