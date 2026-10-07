import type { Category } from "@/entities/categories";
import { http } from "./client";

export const listCategories = (params: { skip?: number; limit?: number } = {}) =>
  http.get<Category[]>("/categories/list", { params }).then((r) => r.data);

export const createCategory = (name: string) =>
  http.post<{ category: Category }>("/categories/create", { name }).then((r) => r.data.category);

export const renameCategory = (id: string, name: string) =>
  http.patch<Category>(`/categories/${id}`, { name }).then((r) => r.data);

export const deleteCategory = (id: string) => http.delete(`/categories/${id}`).then(() => undefined);
