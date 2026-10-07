import { useEffect, useRef, useState, type RefObject } from "react";
import { ChevronRight } from "lucide-react";
import type { CategorySummary } from "@/entities/categories";
import { mapTitle, type TitleEntity, type TitleType } from "@/entities/titles";
import { listTitles, type TitleSort } from "@/shared/api/titles";
import Row from "@/shared/components/Row";
import { useAsync } from "@/shared/hooks/useAsync";
import { ALL_CATEGORY } from "../hooks/useCategoryFilters";
import { allTitlesLabel } from "./TypeTabs";

const ROW_SIZE = 18;

interface Props {
  categories: CategorySummary[];
  type?: TitleType;
  sort: TitleSort;
  onSeeAll: (categoryId: string) => void;
  onSelectItem: (item: TitleEntity) => void;
}

/**
 * Una fila con todos los títulos del tipo (también los que aún no tienen género) y una por género.
 * Cada fila pide sus títulos al acercarse a la pantalla, no todas a la vez.
 */
export default function GenreRows({ categories, ...rest }: Props) {
  return (
    <div>
      <GenreRow name={allTitlesLabel(rest.type)} {...rest} />
      {categories.map((c) => (
        <GenreRow key={c.id} categoryId={c.id} name={c.name} {...rest} />
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

interface RowProps extends Omit<Props, "categories"> {
  /** Sin categoría: todos los títulos del tipo. */
  categoryId?: string;
  name: string;
}

function GenreRow({ categoryId, name, type, sort, onSeeAll, onSelectItem }: RowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref);
  const { data, loading, error, reload } = useAsync(
    (signal) =>
      near
        ? listTitles({ type, categoryId, sort, limit: ROW_SIZE }, signal).then((r) => r.items.map(mapTitle))
        : Promise.resolve(null),
    [near, type, categoryId, sort],
  );

  const seeAll = (
    <button
      type="button"
      onClick={() => onSeeAll(categoryId ?? ALL_CATEGORY)}
      aria-label={categoryId ? `Ver todos los títulos de ${name}` : `Ver ${name.toLowerCase()}`}
      className="flex h-11 flex-shrink-0 items-center gap-1 rounded-md px-2 text-sm text-white/80 transition hover:text-white"
    >
      Ver todo <ChevronRight className="h-4 w-4" aria-hidden />
    </button>
  );

  return (
    <div ref={ref}>
      {error ? (
        <section className="mb-8 md:mb-10">
          <h2 className="mb-2 text-xl font-semibold">{name}</h2>
          <p role="alert" className="text-sm text-white/75">
            No se pudo cargar esta fila.{" "}
            <button type="button" onClick={reload} className="underline hover:text-white">
              Reintentar
            </button>
          </p>
        </section>
      ) : (
        <Row
          title={name}
          items={data ?? []}
          loading={loading || !data}
          onSelectItem={onSelectItem}
          action={seeAll}
        />
      )}
    </div>
  );
}
