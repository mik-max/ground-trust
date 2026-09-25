import { useEffect } from "react";
import { postGpsSample } from "../services/verification.service";
import { useAuthStore } from "../store/auth.store";

// Best-effort, silent background signal for the residency-verification tier
// system (files/HANDOFF.md §2.1) — the onboarding consent screen already
// sets this expectation ("when you open the review or contributions pages,
// the app may check whether your device is inside the area"). Fires once per
// areaIds change, tries
// every listed area against a single position read (the backend geofences
// each one independently, so only areas the device is actually near will
// be accepted). Never surfaces an error to the resident: permission denial,
// an unsupported browser, being outside every area's radius, and network
// blips are all silent no-ops here, same as the Review Composer's mic
// handling.
export function useGpsPresenceSample(areaIds: string[]) {
  const user = useAuthStore((s) => s.user);
  const key = areaIds.join(",");

  useEffect(() => {
    if (!key || user?.role !== "resident" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        for (const areaId of key.split(",")) {
          postGpsSample(areaId, position.coords.latitude, position.coords.longitude).catch(() => {});
        }
      },
      () => {},
      { maximumAge: 5 * 60 * 1000, timeout: 10000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, user?.role]);
}
