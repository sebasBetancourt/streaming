import { API_URL } from "@/app/config";

/** Las rutas del backend (`/api/v1/…`) se resuelven contra la URL de la API; las absolutas se dejan igual. */
export const assetUrl = (path: string | null | undefined): string | null =>
  path ? (path.startsWith("/") ? `${API_URL}${path}` : path) : null;
