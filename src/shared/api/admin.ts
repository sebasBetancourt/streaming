import type { Page } from "@/entities/titles";
import type { Role, UserProfile } from "@/entities/users";
import { http } from "./client";

export interface Metrics {
  users: number;
  titles: number;
  reviews: number;
  pending: number;
}

export const getMetrics = () => http.get<Metrics>("/admin/metrics").then((r) => r.data);

export const listUsers = (params: { skip?: number; limit?: number; search?: string } = {}) =>
  http.get<Page<UserProfile>>("/admin/users", { params }).then((r) => r.data);

export const setUserRole = (id: string, role: Role) =>
  http.patch<UserProfile>(`/admin/users/${id}/role`, { role }).then((r) => r.data);

export const setUserBanned = (id: string, banned: boolean) =>
  http.patch<UserProfile>(`/admin/users/${id}/status`, { banned }).then((r) => r.data);

export const deleteUser = (id: string) => http.delete(`/admin/users/${id}`).then(() => undefined);

export interface SyncKindStats {
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
  collisions: number;
  invalid: number;
  missing: number;
  unavailable: number;
  complete: boolean;
}

export interface SyncRun {
  id: string;
  status: "running" | "success" | "partial" | "failed";
  trigger: "cli" | "admin" | "cron";
  startedAt: string;
  finishedAt: string | null;
  stats: Partial<Record<"animes" | "series" | "movies", SyncKindStats>>;
  error: string | null;
}

export interface VimeusSyncStatus {
  configured: boolean;
  scheduled: boolean;
  running: boolean;
  last: SyncRun | null;
}

/** Lanza la sincronización en segundo plano (409 si ya hay una en curso). */
export const startVimeusSync = () => http.post<{ runId: string }>("/admin/vimeus/sync").then((r) => r.data);

export const getVimeusSyncStatus = (signal?: AbortSignal) =>
  http.get<VimeusSyncStatus>("/admin/vimeus/sync", { signal }).then((r) => r.data);
