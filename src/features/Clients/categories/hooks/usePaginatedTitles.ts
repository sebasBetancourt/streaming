import { mapTitle, type TitleType } from "@/entities/titles";
import { listTitles, type TitleSort } from "@/shared/api/titles";
import { useAsync } from "@/shared/hooks/useAsync";

export const PAGE_SIZE = 24;

interface Query {
  type?: TitleType;
  categoryId?: string;
  sort?: TitleSort;
  search?: string;
  /** Desde 1; viene de la URL. */
  page: number;
}

/**
 * Una página de resultados filtrada, ordenada y paginada en el backend. Mientras llega la siguiente
 * página se conservan la anterior y el total, así la rejilla y los controles no parpadean.
 */
export function usePaginatedTitles({ type, categoryId, sort, search, page }: Query, pageSize = PAGE_SIZE) {
  const { data, loading, error, reload } = useAsync(
    (signal) =>
      listTitles({ type, categoryId, sort, search: search || undefined, skip: (page - 1) * pageSize, limit: pageSize }, signal)
        .then((r) => ({ items: r.items.map(mapTitle), total: r.total })),
    [type, categoryId, sort, search, page, pageSize],
  );
  const total = data?.total ?? 0;
  return {
    items: data?.items ?? [],
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    /** `true` hasta que llega la primera respuesta (aún no se conoce el total). */
    initialLoading: loading && !data,
    loading,
    error,
    retry: reload,
  };
}
