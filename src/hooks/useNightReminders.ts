import { useCallback, useEffect, useState } from "react";
import { deleteSubscription, getPushPublicKey, saveSubscription } from "../services/push.service";
import { isIos, isStandalone } from "../pwa/install";

// What the reminders switch can do on this device:
//   loading      still finding out
//   unavailable  the server has no reminder keys, so they aren't offered
//   unsupported  this browser can't receive them
//   needs-install  an iPhone in Safari: add to Home Screen first
//   blocked      the person said no to notifications for this site
//   off / on     ready either way
export type ReminderState = "loading" | "unavailable" | "unsupported" | "needs-install" | "blocked" | "off" | "on";

// The browser wants the server's public key as raw bytes.
function keyBytes(base64Url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64Url + "=".repeat((4 - (base64Url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

async function currentRegistration() {
  return (await navigator.serviceWorker?.getRegistration()) ?? null;
}

export function useNightReminders() {
  const [state, setState] = useState<ReminderState>("loading");
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const key = await getPushPublicKey().catch(() => null);
      if (cancelled) return;
      if (!key) return setState("unavailable");
      setPublicKey(key);

      const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      if (!supported) return setState(isIos() && !isStandalone() ? "needs-install" : "unsupported");
      if (Notification.permission === "denied") return setState("blocked");

      const registration = await currentRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (cancelled) return;
      if (!registration) return setState("unsupported");
      if (subscription) {
        // Re-link it to whoever is signed in now (a shared phone, or a
        // subscription the server dropped).
        await saveSubscription(subscription).catch(() => {});
        return setState("on");
      }
      setState("off");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const turnOn = useCallback(async () => {
    if (!publicKey) return;
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "off");
        return;
      }
      const registration = await currentRegistration();
      if (!registration) {
        setState("unsupported");
        return;
      }
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) }));
      await saveSubscription(subscription);
      setState("on");
    } catch {
      setError("Couldn't turn reminders on. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }, [publicKey]);

  const turnOff = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const subscription = await (await currentRegistration())?.pushManager.getSubscription();
      if (subscription) {
        await deleteSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setState("off");
    } catch {
      setError("Couldn't turn reminders off. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }, []);

  return { state, busy, error, turnOn, turnOff };
}
