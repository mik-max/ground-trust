import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import type { Role } from "../types";

interface ProtectedRouteProps {
  allow: Role[];
  children: React.ReactNode;
}

export function ProtectedRoute({ allow, children }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);

  if (!user || !allow.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
