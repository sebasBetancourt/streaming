import { fetchTitles } from "@/shared/api/titles";
import { mapMovie } from "@/entities/movies/mapper";

export async function getTitles() {
  const raw = await fetchTitles();
  const list = Array.isArray(raw) ? raw : raw.data || raw.titles || [];
  return list.map(mapMovie);
}
