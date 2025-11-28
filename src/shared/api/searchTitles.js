import { api } from "@/app/apiClient";

export async function searchTitles({ search, categoryId }) {
  const params = new URLSearchParams();
  params.append("skip", "0");

  if (categoryId) params.append("categoriesId", categoryId);
  if (search) params.append("search", search);

  const queryString = params.toString();

  const res = await api.get(`/titles/list?${queryString}`);

  return res.data;
}
