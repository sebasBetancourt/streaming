import { Check, Plus } from "lucide-react";
import { useShelfItem } from "@/app/providers/ShelfContext";
import type { TitleEntity } from "@/entities/titles";

interface Props {
  item: TitleEntity;
  onSelect: (item: TitleEntity) => void;
}

/** Póster clicable (abre el detalle) con valoración y botón de "Mi Lista". Ocupa el ancho de su contenedor. */
export default function PosterCard({ item, onSelect }: Props) {
  const { inList, toggleList } = useShelfItem(item.id);
  const rated = item.ratingAvg !== "0.0";

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="block w-full overflow-hidden rounded-md bg-[#141414] text-left"
      >
        <span className="relative block aspect-[2/3]">
          {item.image ? (
            <img
              src={item.image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
            />
          ) : (
            <span className="block h-full w-full bg-gradient-to-b from-[#222] to-[#111]" />
          )}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-2 pb-2 pt-10">
            <span className="line-clamp-2 text-sm font-semibold leading-tight">{item.title}</span>
            {(rated || item.year) && (
              <span className="mt-0.5 block text-xs text-white/80">
                {rated && `★ ${item.ratingAvg}`}
                {rated && item.year ? " · " : null}
                {item.year ? item.year : null}
              </span>
            )}
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => void toggleList()}
        aria-pressed={inList}
        aria-label={inList ? `Quitar ${item.title} de Mi Lista` : `Añadir ${item.title} a Mi Lista`}
        title={inList ? "Quitar de Mi Lista" : "Añadir a Mi Lista"}
        className="absolute right-1.5 top-1.5 grid h-11 w-11 place-items-center rounded-full bg-black/70 ring-1 ring-white/30 transition hover:bg-black/90"
      >
        {inList ? <Check className="h-5 w-5" aria-hidden /> : <Plus className="h-5 w-5" aria-hidden />}
      </button>
    </div>
  );
}
