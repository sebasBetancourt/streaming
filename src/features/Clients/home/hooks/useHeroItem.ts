import { useEffect, useState } from "react";
import { HERO_TITLE_ID } from "@/app/config";
import { mapTitle, type TitleEntity } from "@/entities/titles";
import { getTitle, listTitles } from "@/shared/api/titles";

export function useHeroItem() {
  const [item, setItem] = useState<TitleEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const raw = HERO_TITLE_ID ? await getTitle(HERO_TITLE_ID) : (await listTitles({ limit: 1 }))[0];
        if (!cancelled && raw) setItem(mapTitle(raw));
      } catch (e) {
        console.error("No se pudo cargar el título destacado:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { item, loading };
}
