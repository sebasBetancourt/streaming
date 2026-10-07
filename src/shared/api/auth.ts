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

/** Responde igual exista o no el correo. */
export const forgotPassword = (email: string) =>
  http.post<{ message: string }>("/auth/forgot-password", { email }).then((r) => r.data);

/** Rechaza con `ApiError` (status 400) si el enlace no es válido o caducó. */
export const validateResetToken = (token: string) =>
  http.post<{ valid: true }>("/auth/reset-password/validate", { token }).then((r) => r.data);

export const resetPassword = (token: string, password: string) =>
  http.post<{ message: string }>("/auth/reset-password", { token, password }).then((r) => r.data);
