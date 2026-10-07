import { useEffect, useState } from "react";
import { mapTitle, type TitleEntity } from "@/entities/titles";
import { listTitles } from "@/shared/api/titles";
import { useDebounce } from "@/shared/hooks/useDebounce";

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export function useSearchTitles(query: string) {
  const debounced = useDebounce(query.trim(), 300);
  const [items, setItems] = useState<TitleEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!debounced) {
      setItems([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");

    // Un id de 24 hex se interpreta como id de categoría (atajo heredado)
    const params = OBJECT_ID.test(debounced) ? { categoryId: debounced } : { search: debounced };
    listTitles({ ...params, limit: 30 }, controller.signal)
      .then((data) => setItems(data.map(mapTitle)))
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Error al buscar");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debounced]);

  return { items, loading, error };
}
