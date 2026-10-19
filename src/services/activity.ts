import { useAuthStore } from "../store/auth.store";

// Reports what visitors do (pages viewed, searches, shares) to the admin
// Activity page. A visitor is a random id kept in this browser; nothing
// identifies the person. Sending never blocks or breaks the page.

const KEY = "gt.visitor";

function visitorId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = (crypto.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`).replace(/-/g, "");
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "nostorage";
  }
}

export type ClientEvent = "page_view" | "search" | "share_opened" | "share_whatsapp" | "share_save_image" | "share_copy_link";

export function trackEvent(type: ClientEvent, data: { path?: string; areaId?: string; query?: string } = {}) {
  try {
    const token = useAuthStore.getState().token;
    void fetch("/api/activity", {
      method: "POST",
      keepalive: true,
      headers: { "content-type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ type, visitorId: visitorId(), path: data.path ?? location.pathname + location.search, ...data }),
    }).catch(() => {});
  } catch {
    // Tracking is never worth an error on the page.
  }
}

// /areas/<id> and /areas/<id>/review carry the area being looked at.
export function areaIdFromPath(pathname: string): string | undefined {
  const m = pathname.match(/^\/areas\/([^/]+)/);
  return m && m[1] !== "propose" ? decodeURIComponent(m[1]) : undefined;
}
