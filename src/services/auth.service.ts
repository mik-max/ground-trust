import api from "./api";
import type { AuthUser } from "../types";

interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Self-service signup always creates a resident — government/admin are
// provisioned separately, and there's no other self-service role (see
// backend/src/controllers/auth.controller.ts for why "newcomer" was
// removed: it never gated anything a logged-out visitor couldn't already
// do, since every read/browse/compare path in this app is public).
export async function signup(input: { fullName: string; email: string; password: string }) {
  const { data } = await api.post<AuthResponse>("/auth/signup", input);
  return data;
}

export async function login(input: { email: string; password: string }) {
  const { data } = await api.post<AuthResponse>("/auth/login", input);
  return data;
}

// `isSignup` only matters if this Google email has no account yet — omit
// it on the Login page (logging in shouldn't silently create an account)
// and pass true on the Register page. `isNewUser` tells the Register page
// whether to show the residency-sampling consent screen (once, on a real
// signup) or just log straight in (existing account).
export async function googleAuth(credential: string, isSignup?: boolean) {
  const { data } = await api.post<AuthResponse & { isNewUser: boolean }>("/auth/google", { credential, isSignup });
  return data;
}
