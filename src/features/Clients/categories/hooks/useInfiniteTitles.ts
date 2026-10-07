import { useCallback, useEffect, useRef, useState } from "react";
import { mapTitle, type TitleEntity, type TitleType } from "@/entities/titles";
import { listTitles, type TitleSort } from "@/shared/api/titles";

interface Query {
  type?: TitleType;
  categoryId?: string;
  sort?: TitleSort;
}

interface State {
  items: TitleEntity[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
}

const initial: State = { items: [], loading: true, error: null, hasMore: true };

/**
 * Listado paginado que se reinicia al cambiar la consulta. Cancela la petición en curso y descarta
 * respuestas obsoletas, así que cambiar rápido de filtro no mezcla resultados.
 */
export function useInfiniteTitles({ type, categoryId, sort }: Query, pageSize = 24) {
  const [state, setState] = useState<State>(initial);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const busy = useRef(false);

  const load = useCallback(
    async (skip: number) => {
      controller.current?.abort();
      const ctrl = (controller.current = new AbortController());
      const id = ++requestId.current;
      busy.current = true;
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const page = (await listTitles({ type, categoryId, sort, skip, limit: pageSize }, ctrl.signal)).items.map(mapTitle);
        if (id !== requestId.current) return;
        setState((s) => {
          const prev = skip === 0 ? [] : s.items;
          const seen = new Set(prev.map((it) => it.id));
          return {
            items: [...prev, ...page.filter((it) => !seen.has(it.id))],
            loading: false,
            error: null,
            hasMore: page.length === pageSize,
          };
        });
      } catch (e) {
        if (id !== requestId.current || ctrl.signal.aborted) return;
        setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e : new Error(String(e)) }));
      } finally {
        if (id === requestId.current) busy.current = false;
      }
    },
    [type, categoryId, sort, pageSize],
  );

  useEffect(() => {
    setState(initial);
    void load(0);
    return () => controller.current?.abort();
  }, [load]);

  const { items, hasMore, error } = state;
  const loadMore = useCallback(() => {
    if (!busy.current && hasMore && !error) void load(items.length);
  }, [load, items.length, hasMore, error]);
  const retry = useCallback(() => void load(items.length), [load, items.length]);

  return { ...state, loadMore, retry };
}
