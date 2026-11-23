/// <reference lib="webworker" />
// GroundTrust's service worker, built by vite-plugin-pwa (see vite.config.ts).
// Two jobs: keep the app's own files so it starts quickly on a weak
// connection, and show the night check-in reminders the server sends.
// It never reads location: a reminder only opens the app, and the app
// checks location once, while it's open.
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare const self: ServiceWorkerGlobalScope;

// A new version takes over as soon as it's installed. Open pages keep the
// code they loaded (the app is one bundle, nothing loads later), and the
// next visit gets the new version.
self.addEventListener("install", () => {
  void self.skipWaiting();
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Every page of the app is the same index.html (it's a single-page app), so
// opening any page works from the saved copy. API calls, uploads and the
// share-image function always go to the network.
registerRoute(new NavigationRoute(createHandlerBoundToURL("/index.html"), { denylist: [/^\/api\//, /^\/uploads\//] }));

interface ReminderPayload {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
}

self.addEventListener("push", (event) => {
  let payload: ReminderPayload = {};
  try {
    payload = event.data?.json() ?? {};
  } catch {
    payload = { body: event.data?.text() };
  }
  event.waitUntil(
    self.registration.showNotification(payload.title ?? "GroundTrust", {
      body: payload.body,
      icon: "/pwa-192.png",
      badge: "/pwa-badge-96.png",
      // One reminder replaces the last, so they never stack up.
      tag: payload.tag ?? "night-checkin",
      data: { url: payload.url ?? "/my-contributions?checkin=1" },
    })
  );
});

// Tapping the reminder opens the check-in page: in an open GroundTrust
// window if there is one, otherwise a new one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data as { url?: string } | null)?.url ?? "/", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const open = windows.find((w) => new URL(w.url).origin === self.location.origin);
      if (open) {
        try {
          await open.focus();
          await open.navigate(target);
          return;
        } catch {
          // A window this worker doesn't control can't be navigated; open a new one.
        }
      }
      await self.clients.openWindow(target);
    })()
  );
});
