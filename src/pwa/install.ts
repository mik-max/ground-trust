import { create } from "zustand";

// Chrome and Edge (Android, desktop) fire this when the app can be
// installed. It isn't in TypeScript's DOM types yet.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Opened from the Home Screen icon rather than a browser tab.
export function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
}

// iPhones and iPads (iPadOS reports itself as a Mac with a touch screen).
// Safari there has no install prompt: people add the app with Share → Add
// to Home Screen, and only then can it show notifications.
export function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

interface InstallState {
  promptEvent: BeforeInstallPromptEvent | null;
  installed: boolean;
}

export const useInstallStore = create<InstallState>(() => ({
  promptEvent: null,
  installed: typeof window !== "undefined" && isStandalone(),
}));

// Called once at startup (main.tsx): the event fires early, often before
// any page that offers "Install" has rendered, so it's kept here.
export function listenForInstallPrompt(): void {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    useInstallStore.setState({ promptEvent: event as BeforeInstallPromptEvent });
  });
  window.addEventListener("appinstalled", () => {
    useInstallStore.setState({ promptEvent: null, installed: true });
  });
}

// Shows the browser's own install dialog. It can only be shown once per
// event; the browser fires a new one later if the person said no.
export async function promptInstall(): Promise<void> {
  const event = useInstallStore.getState().promptEvent;
  if (!event) return;
  useInstallStore.setState({ promptEvent: null });
  await event.prompt();
}
