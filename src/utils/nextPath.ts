// Where to go after signing in or up, from a "?next=" parameter. Only paths
// inside this app are accepted ("/share", not "//evil.com" or a full URL),
// so the parameter can't be used to send someone to another site.
export function nextPath(search: string, fallback = "/"): string {
  const next = new URLSearchParams(search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}

export const withNext = (path: string, next: string) => `${path}?next=${encodeURIComponent(next)}`;
