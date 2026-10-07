import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { TitleType } from "@/entities/titles";
import type { TitleSort } from "@/shared/api/titles";

/** Valor de `category` que muestra todos los títulos del tipo, tengan género o no. */
export const ALL_CATEGORY = "all";

export interface CategoryFilters {
  /** Sin valor: todos los tipos. */
  type?: TitleType;
  /** Id de una categoría o `ALL_CATEGORY`. */
  categoryId?: string;
  sort: TitleSort;
  /** Texto a buscar en el nombre; vacío: sin búsqueda. */
  search: string;
  /** Página de resultados, desde 1. */
  page: number;
}

export const DEFAULT_SORT: TitleSort = "popular";
export const MAX_SEARCH = 100;
const TYPES: readonly string[] = ["movie", "tv", "anime"] satisfies TitleType[];
const SORTS: readonly string[] = ["popular", "rating", "recent"] satisfies TitleSort[];
const OBJECT_ID = /^[0-9a-f]{24}$/i;

/** Valores desconocidos (enlaces viejos o editados a mano) se ignoran en vez de romper la página. */
export function parseFilters(params: URLSearchParams): CategoryFilters {
  const type = params.get("type") ?? "";
  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "";
  const page = Number(params.get("page"));
  return {
    type: TYPES.includes(type) ? (type as TitleType) : undefined,
    categoryId: OBJECT_ID.test(category) || category === ALL_CATEGORY ? category : undefined,
    sort: SORTS.includes(sort) ? (sort as TitleSort) : DEFAULT_SORT,
    search: (params.get("q") ?? "").trim().slice(0, MAX_SEARCH),
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

/** Solo escribe lo que difiere del valor por defecto, para URLs cortas y estables. */
export function filtersToParams(f: CategoryFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (f.type) params.set("type", f.type);
  if (f.categoryId) params.set("category", f.categoryId);
  if (f.sort !== DEFAULT_SORT) params.set("sort", f.sort);
  if (f.search) params.set("q", f.search);
  if (f.page > 1) params.set("page", String(f.page));
  return params;
}

/**
 * Filtros de la página guardados en la URL: Atrás/Adelante y los enlaces compartidos funcionan.
 * Cambiar cualquier filtro vuelve a la página 1.
 */
export function useCategoryFilters() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);

  const update = useCallback(
    (patch: Partial<CategoryFilters>, replace = false) =>
      setParams(filtersToParams({ ...filters, page: 1, ...patch }), { replace }),
    [filters, setParams],
  );

  return {
    filters,
    setType: useCallback((type?: TitleType) => update({ type }), [update]),
    setCategory: useCallback((categoryId?: string) => update({ categoryId }), [update]),
    setSort: useCallback((sort: TitleSort) => update({ sort }), [update]),
    // Escribir no llena el historial: cada búsqueda reemplaza a la anterior.
    setSearch: useCallback((search: string) => update({ search: search.trim().slice(0, MAX_SEARCH) }, true), [update]),
    setPage: useCallback((page: number) => update({ page }), [update]),
  };
}
