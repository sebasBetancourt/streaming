import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { TitleEntity, TitleType } from "@/entities/titles";
import type { TitleSort } from "@/shared/api/titles";
import { scrollBehavior } from "@/shared/lib/motion";
import { useInfiniteTitles } from "../hooks/useInfiniteTitles";
import EmptyState, { emptyStateButtonClass } from "./EmptyState";
import TitleGrid from "./TitleGrid";

interface Props {
  /** Sin categoría: todos los títulos del tipo. */
  categoryId?: string;
  title: string;
  /** Línea bajo el título (p. ej. el conteo), anunciada al cambiar. */
  subtitle: string;
  type?: TitleType;
  sort: TitleSort;
  onClear: () => void;
  onSelectItem: (item: TitleEntity) => void;
}

export default function CategoryResults({ categoryId, title, subtitle, type, sort, onClear, onSelectItem }: Props) {
  const { items, loading, error, hasMore, loadMore, retry } = useInfiniteTitles({ type, categoryId, sort });
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Si los resultados quedan fuera de la vista (p. ej. "Ver todo" al final de la página), se llevan vista y foco
  // a ellos. Desde las tarjetas ya están a la vista: el foco se queda en la tarjeta y aria-live anuncia el conteo.
  useEffect(() => {
    const h = headingRef.current;
    if (!h) return;
    const { top } = h.getBoundingClientRect();
    if (top >= 0 && top <= window.innerHeight) return;
    h.focus({ preventScroll: true });
    h.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  }, [categoryId]);

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
        <EmptyState title="No hay títulos en esta categoría" description="Prueba con otra categoría o quita el filtro." />
      ) : (
        <TitleGrid
          items={items}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onRetry={retry}
          onSelect={onSelectItem}
        />
      )}
    </section>
  );
}
