import { useEffect, useRef, useState, type RefObject } from "react";
import { ChevronRight } from "lucide-react";
import type { CategorySummary } from "@/entities/categories";
import { mapTitle, type TitleEntity, type TitleType } from "@/entities/titles";
import { listTitles, type TitleSort } from "@/shared/api/titles";
import Row from "@/shared/components/Row";
import { useAsync } from "@/shared/hooks/useAsync";

const ROW_SIZE = 18;

interface Props {
  categories: CategorySummary[];
  type?: TitleType;
  sort: TitleSort;
  onSeeAll: (categoryId: string) => void;
  onSelectItem: (item: TitleEntity) => void;
}

/** Una fila por género. Cada fila pide sus títulos al acercarse a la pantalla, no todas a la vez. */
export default function GenreRows({ categories, ...rest }: Props) {
  return (
    <div>
      {categories.map((c) => (
        <GenreRow key={c.id} category={c} {...rest} />
      ))}
    </div>
  );
}

function useNearViewport(ref: RefObject<HTMLElement | null>) {
  const [near, setNear] = useState(() => typeof IntersectionObserver === "undefined");
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setNear(true), {
      rootMargin: "400px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, near]);
  return near;
}

function GenreRow({ category, type, sort, onSeeAll, onSelectItem }: Omit<Props, "categories"> & { category: CategorySummary }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref);
  const { data, loading, error, reload } = useAsync(
    (signal) =>
      near
        ? listTitles({ type, categoryId: category.id, sort, limit: ROW_SIZE }, signal).then((r) => r.map(mapTitle))
        : Promise.resolve(null),
    [near, type, category.id, sort],
  );

  const seeAll = (
    <button
      type="button"
      onClick={() => onSeeAll(category.id)}
      aria-label={`Ver todos los títulos de ${category.name}`}
      className="flex h-11 flex-shrink-0 items-center gap-1 rounded-md px-2 text-sm text-white/80 transition hover:text-white"
    >
      Ver todo <ChevronRight className="h-4 w-4" aria-hidden />
    </button>
  );

  return (
    <div ref={ref}>
      {error ? (
        <section className="mb-8 md:mb-10">
          <h2 className="mb-2 text-xl font-semibold">{category.name}</h2>
          <p role="alert" className="text-sm text-white/75">
            No se pudo cargar esta fila.{" "}
            <button type="button" onClick={reload} className="underline hover:text-white">
              Reintentar
            </button>
          </p>
        </section>
      ) : (
        <Row
          title={category.name}
          items={data ?? []}
          loading={loading || !data}
          onSelectItem={onSelectItem}
          action={seeAll}
        />
      )}
    </div>
  );
}
