import { useEffect, useRef } from "react";
import type { TitleEntity } from "@/entities/titles";
import PosterCard from "@/shared/components/PosterCard";
import { emptyStateButtonClass, emptyStatePrimaryButtonClass } from "./EmptyState";
import GridSkeleton from "./GridSkeleton";

interface Props {
  items: TitleEntity[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onSelect: (item: TitleEntity) => void;
}

/** Rejilla de posters con scroll infinito; el botón "Cargar más" queda como respaldo. */
export default function TitleGrid({ items, loading, error, hasMore, onLoadMore, onRetry, onSelect }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const canLoadMore = hasMore && !loading && !error;

  // Se vuelve a observar tras cada página: si el final sigue a la vista, se pide la siguiente.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !canLoadMore || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && onLoadMore(), {
      rootMargin: "600px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [canLoadMore, onLoadMore]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((it) => (
          <li key={it.id}>
            <PosterCard item={it} onSelect={onSelect} />
          </li>
        ))}
        {loading && <GridSkeleton count={items.length ? 6 : 12} />}
      </ul>

      {error && (
        <div role="alert" className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-white/80">No se pudieron cargar los títulos. {error.message}</p>
          <button type="button" onClick={onRetry} className={emptyStatePrimaryButtonClass}>
            Reintentar
          </button>
        </div>
      )}

      {canLoadMore && (
        <div ref={sentinelRef} className="mt-8 flex justify-center">
          <button type="button" onClick={onLoadMore} className={emptyStateButtonClass}>
            Cargar más
          </button>
        </div>
      )}
    </>
  );
}
