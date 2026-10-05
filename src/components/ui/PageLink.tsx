import type { MouseEvent } from "react";
import { Link, useLocation, type LinkProps } from "react-router-dom";

// A Link for navigation chrome (nav bar, footer, logo). Clicking it while
// already on that page does nothing — no reload of the page's state, no
// flicker — and the link is marked as the current page for screen readers.
export function PageLink({ to, onClick, ...props }: LinkProps & { to: string }) {
  const { pathname } = useLocation();
  const current = pathname === to;

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (current) e.preventDefault();
    onClick?.(e);
  }

  return <Link to={to} onClick={handleClick} aria-current={current ? "page" : undefined} {...props} />;
}
