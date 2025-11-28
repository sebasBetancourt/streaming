import { useEffect, useState } from "react";
import { searchTitles } from "@/shared/api/searchTitles";
import { useDebounce } from "@/shared/hooks/useDebounce";

export function useSearchTitles(query) {
  const debounced = useDebounce(query.trim(), 300);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!debounced) {
      setItems([]);
      return;
    }

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const isCategory = /^[0-9a-fA-F]{24}$/.test(debounced);

        const data = await searchTitles({
          search: isCategory ? null : debounced,
          categoryId: isCategory ? debounced : null,
        });

        setItems(data || []);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [debounced]);

  return { items, loading, error };
}
