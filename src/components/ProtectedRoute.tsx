import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import type { Role } from "../types";
import { withNext } from "../utils/nextPath";

interface ProtectedRouteProps {
  allow: Role[];
  children: React.ReactNode;
}

export function ProtectedRoute({ allow, children }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  // Signed out: log in, then come back here. Signed in with the wrong role:
  // log in as someone who can see it.
  if (!user || !allow.includes(user.role)) {
    return <Navigate to={withNext("/login", location.pathname + location.search)} replace />;
  }
  return <>{children}</>;
}
