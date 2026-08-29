import api from "./api";
import type { AuthUser, Role } from "../types";

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function signup(input: { fullName: string; email: string; password: string; role: Role }) {
  const { data } = await api.post<AuthResponse>("/auth/signup", input);
  return data;
}

export async function login(input: { email: string; password: string }) {
  const { data } = await api.post<AuthResponse>("/auth/login", input);
  return data;
}

// `role` is only used if this Google email has no account yet — omit it on
// the Login page (logging in shouldn't silently create an account) and
// pass the selected role on the Register page. `isNewUser` tells the
// Register page whether to show the residency-sampling consent screen
// (once, on real signup) or just log straight in (existing account).
export async function googleAuth(credential: string, role?: Role) {
  const { data } = await api.post<AuthResponse & { isNewUser: boolean }>("/auth/google", { credential, role });
  return data;
}
