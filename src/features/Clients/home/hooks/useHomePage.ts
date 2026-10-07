import { useEffect, useState } from "react";
import { mapTitle, type TitleEntity, type TitleType } from "@/entities/titles";
import { listTitles } from "@/shared/api/titles";

const ROW_SIZE = 30;
const TYPES: TitleType[] = ["movie", "tv", "anime"];

export function useHomePage() {
  const [byType, setByType] = useState<Record<TitleType, TitleEntity[]>>({ movie: [], tv: [], anime: [] });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TitleEntity | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    // Una petición por tipo: con una sola lista mezclada, series y anime quedarían casi vacíos.
    Promise.all(TYPES.map((type) => listTitles({ type, limit: ROW_SIZE }, controller.signal)))
      .then(([movie, tv, anime]) =>
        setByType({ movie: movie.map(mapTitle), tv: tv.map(mapTitle), anime: anime.map(mapTitle) }),
      )
      .catch((e: unknown) => {
        if (!controller.signal.aborted) console.error("Error cargando títulos:", e);
      })
      .finally(() => !controller.signal.aborted && setLoading(false));
    return () => controller.abort();
  }, []);

  return { movies: byType.movie, series: byType.tv, animes: byType.anime, loading, selected, setSelected };
}
