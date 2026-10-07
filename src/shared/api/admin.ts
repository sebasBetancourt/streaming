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
