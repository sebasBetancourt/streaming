export type TitleType = "movie" | "tv" | "anime";
export type TitleStatus = "pending" | "approved" | "rejected";

/** Forma que devuelve la API (`/api/v1/titles/*`). */
export interface TitleDto {
  id: string;
  type: TitleType;
  title: string;
  description: string;
  author: string | null;
  year: number | null;
  seasons: number | null;
  episodes: number | null;
  posterUrl: string | null;
  images: string[];
  status: TitleStatus;
  tmdbId: number | null;
  imdbId: string | null;
  embedUrl: string | null;
  backdropUrl: string | null;
  quality: string | null;
  ratingAvg: number;
  ratingCount: number;
  likes: number;
  dislikes: number;
  createdById: string | null;
  createdAt: string;
  categories: { id: string; name: string }[];
  creator: string | null;
}

/** Forma que consume la UI. */
export interface TitleEntity {
  id: string;
  title: string;
  description: string;
  type: TitleType;
  status: TitleStatus;
  year: number | null;
  image: string;
  posterUrl: string | null;
  /** Imagen horizontal (16:9) si existe; si no, el póster. */
  backdrop: string;
  quality: string | null;
  /** Promedio con un decimal, p. ej. "4.5". */
  ratingAvg: string;
  duration: string;
  categories: string[];
  categoryIds: string[];
  rank: number;
  creator: string;
  author: string;
  embedUrl: string | null;
  likes: number;
  dislikes: number;
  seasons: number | null;
  episodes: number | null;
  createdAt: string;
}

export interface Page<T> {
  items: T[];
  total: number;
}
