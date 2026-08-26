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
