import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { TitleEntity, TitleType } from "@/entities/titles";
import type { TitleSort } from "@/shared/api/titles";
import Pagination from "@/shared/components/Pagination";
import { scrollBehavior } from "@/shared/lib/motion";
import { usePaginatedTitles } from "../hooks/usePaginatedTitles";
import { titlesLabel } from "./CategoryCard";
import EmptyState, { emptyStateButtonClass } from "./EmptyState";
import TitleGrid from "./TitleGrid";

interface Props {
  /** Sin categoría: todos los títulos del tipo. */
  categoryId?: string;
  title: string;
  type?: TitleType;
  sort: TitleSort;
  search: string;
  page: number;
  onPageChange: (page: number) => void;
  onClear: () => void;
  onSelectItem: (item: TitleEntity) => void;
}

const noop = () => {};

export default function CategoryResults({
  categoryId, title, type, sort, search, page, onPageChange, onClear, onSelectItem,
}: Props) {
  const { items, total, totalPages, initialLoading, loading, error, retry } = usePaginatedTitles({
    type, categoryId, sort, search, page,
  });
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Si los resultados quedan fuera de la vista ("Ver todo" al final de la página, o cambiar de página desde los
  // controles de abajo), se llevan vista y foco a ellos. Desde las tarjetas ya están a la vista: el foco se queda.
  useEffect(() => {
    const h = headingRef.current;
    if (!h) return;
    const { top } = h.getBoundingClientRect();
    if (top >= 0 && top <= window.innerHeight) return;
    h.focus({ preventScroll: true });
    h.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  }, [categoryId, page]);

  // Un enlace a una página que ya no existe (hay menos resultados) lleva a la última.
  useEffect(() => {
    if (!loading && !error && total > 0 && page > totalPages) onPageChange(totalPages);
  }, [loading, error, total, page, totalPages, onPageChange]);

  const subtitle = initialLoading
    ? "Cargando..."
    : [
        `${titlesLabel(total)}${search ? ` para “${search}”` : ""}`,
        totalPages > 1 && `página ${Math.min(page, totalPages)} de ${totalPages}`,
      ].filter(Boolean).join(" · ");

  return (
    <section aria-labelledby="category-results-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="category-results-heading" ref={headingRef} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold outline-none">
            {title}
          </h2>
          <p aria-live="polite" className="text-sm text-white/75">
            {subtitle}
          </p>
        </div>
        <button type="button" onClick={onClear} className={`${emptyStateButtonClass} flex items-center gap-2`}>
          <X className="h-4 w-4" aria-hidden /> Quitar filtro
        </button>
      </div>

      {!loading && !error && items.length === 0 ? (
        search ? (
          <EmptyState title={`No hay resultados para “${search}”`} description="Prueba con otro nombre o quita algún filtro." />
        ) : (
          <EmptyState title="No hay títulos en esta categoría" description="Prueba con otra categoría o quita el filtro." />
        )
      ) : (
        <>
          <TitleGrid
            items={loading ? [] : items}
            loading={loading}
            error={error}
            hasMore={false}
            onLoadMore={noop}
            onRetry={retry}
            onSelect={onSelectItem}
          />
          {!error && <Pagination page={page} totalPages={totalPages} onChange={onPageChange} disabled={loading} />}
        </>
      )}
    </section>
  );
}
