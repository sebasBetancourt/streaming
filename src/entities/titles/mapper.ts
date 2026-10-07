import type { TitleDto, TitleEntity } from "./types";

export function formatDuration(t: Pick<TitleDto, "type" | "seasons" | "episodes">): string {
  return t.type === "movie" ? "Película" : `${t.seasons || 1} Temp / ${t.episodes || 1} eps`;
}

export function mapTitle(raw: TitleDto, index = 0): TitleEntity {
  const rating = Number(raw.ratingAvg);
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    type: raw.type,
    status: raw.status,
    year: raw.year,
    image: raw.posterUrl ?? "",
    posterUrl: raw.posterUrl,
    ratingAvg: Number.isFinite(rating) ? rating.toFixed(1) : "0.0",
    duration: formatDuration(raw),
    categories: raw.categories.map((c) => c.name),
    categoryIds: raw.categories.map((c) => c.id),
    rank: index + 1,
    creator: raw.creator || "Desconocido",
    author: raw.author || "Desconocido",
    embedUrl: raw.embedUrl,
    likes: raw.likes,
    dislikes: raw.dislikes,
    seasons: raw.seasons,
    episodes: raw.episodes,
    createdAt: raw.createdAt,
  };
}
