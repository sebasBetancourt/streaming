import axios, { AxiosError } from "axios";
import { API_BASE } from "@/app/config";
import { storage } from "@/shared/lib/storage";

/** Evento que dispara el cliente cuando el backend rechaza el token (401 con sesión activa). */
export const SESSION_EXPIRED_EVENT = "pf:session-expired";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const http = axios.create({ baseURL: API_BASE });

http.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    if (axios.isCancel(error)) throw error;
    const err = error as AxiosError<{ message?: string }>;
    const status = err.response?.status;
    if (status === 401 && storage.getToken()) window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    const message =
      err.response?.data?.message ??
      (err.request && !err.response ? "No se pudo conectar con el servidor" : err.message);
    throw new ApiError(message, status);
  },
);
