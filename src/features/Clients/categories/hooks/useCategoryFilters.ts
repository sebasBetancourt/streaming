import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { TitleType } from "@/entities/titles";
import type { TitleSort } from "@/shared/api/titles";

export interface CategoryFilters {
  /** Sin valor: todos los tipos. */
  type?: TitleType;
  categoryId?: string;
  sort: TitleSort;
}

export const DEFAULT_SORT: TitleSort = "popular";
const TYPES: readonly string[] = ["movie", "tv", "anime"] satisfies TitleType[];
const SORTS: readonly string[] = ["popular", "rating", "recent"] satisfies TitleSort[];
const OBJECT_ID = /^[0-9a-f]{24}$/i;

/** Valores desconocidos (enlaces viejos o editados a mano) se ignoran en vez de romper la página. */
export function parseFilters(params: URLSearchParams): CategoryFilters {
  const type = params.get("type") ?? "";
  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "";
  return {
    type: TYPES.includes(type) ? (type as TitleType) : undefined,
    categoryId: OBJECT_ID.test(category) ? category : undefined,
    sort: SORTS.includes(sort) ? (sort as TitleSort) : DEFAULT_SORT,
  };
}

/** Solo escribe lo que difiere del valor por defecto, para URLs cortas y estables. */
export function filtersToParams(f: CategoryFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (f.type) params.set("type", f.type);
  if (f.categoryId) params.set("category", f.categoryId);
  if (f.sort !== DEFAULT_SORT) params.set("sort", f.sort);
  return params;
}

/** Filtros de la página guardados en la URL: Atrás/Adelante y los enlaces compartidos funcionan. */
export function useCategoryFilters() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);

  const update = useCallback(
    (patch: Partial<CategoryFilters>) => setParams(filtersToParams({ ...filters, ...patch })),
    [filters, setParams],
  );

  return {
    filters,
    setType: useCallback((type?: TitleType) => update({ type }), [update]),
    setCategory: useCallback((categoryId?: string) => update({ categoryId }), [update]),
    setSort: useCallback((sort: TitleSort) => update({ sort }), [update]),
  };
}
