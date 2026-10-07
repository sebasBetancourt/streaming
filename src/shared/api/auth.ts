import type { SessionUser } from "@/entities/users";
import { http } from "./client";

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  country?: string;
}

export interface LoginResponse {
  message: string;
  user: SessionUser;
  token: string;
}

export const register = (input: RegisterInput) =>
  http.post<{ message: string }>("/auth/register", input).then((r) => r.data);

export const login = (credentials: { email: string; password: string }) =>
  http.post<LoginResponse>("/auth/login", credentials).then((r) => r.data);

export const verifySession = () =>
  http.get<{ valid: boolean }>("/auth/verify").then((r) => r.data.valid);
