import type { Page, TitleDto, TitleType } from "@/entities/titles";
import { http } from "./client";

export interface ListTitlesParams {
  skip?: number;
  limit?: number;
  type?: TitleType;
  categoryId?: string;
  search?: string;
}

export interface CreateTitleInput {
  title: string;
  description: string;
  type: TitleType;
  year: number;
  author: string;
  categoriesIds: string[];
  posterUrl?: string;
  seasons?: number;
  episodes?: number;
}

export type UpdateTitleInput = Partial<Omit<CreateTitleInput, "posterUrl" | "seasons" | "episodes">> & {
  posterUrl?: string | null;
  seasons?: number | null;
  episodes?: number | null;
};

export const listTitles = (params: ListTitlesParams = {}, signal?: AbortSignal) =>
  http.get<TitleDto[]>("/titles/list", { params, signal }).then((r) => r.data);

export const listMyCollection = (params: { skip?: number; limit?: number; type?: TitleType } = {}) =>
  http.get<TitleDto[]>("/titles/list/collection", { params }).then((r) => r.data);

export const getTitle = (id: string) => http.get<TitleDto>(`/titles/${id}`).then((r) => r.data);

export const createTitle = (input: CreateTitleInput) =>
  http.post<{ message: string; id: string }>("/titles/create", input).then((r) => r.data);

// ---- admin
export interface AdminTitlesParams {
  skip?: number;
  limit?: number;
  type?: TitleType;
  status?: "pending" | "approved" | "rejected";
  search?: string;
}

export const adminListTitles = (params: AdminTitlesParams) =>
  http.get<Page<TitleDto>>("/admin/titles", { params }).then((r) => r.data);

export const updateTitle = (id: string, input: UpdateTitleInput) =>
  http.patch<TitleDto>(`/titles/${id}`, input).then((r) => r.data);

export const approveTitle = (id: string) => http.patch(`/titles/${id}/approve`).then(() => undefined);
export const rejectTitle = (id: string) => http.patch(`/titles/${id}/reject`).then(() => undefined);
export const deleteTitle = (id: string) => http.delete(`/titles/${id}`).then(() => undefined);
export const setTitleEmbed = (id: string, embedUrl: string | null) =>
  http.put(`/titles/${id}/embed`, { embedUrl }).then(() => undefined);
