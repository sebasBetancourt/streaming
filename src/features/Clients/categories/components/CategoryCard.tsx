import type { CategorySummary } from "@/entities/categories";

interface Props {
  category: CategorySummary;
  selected: boolean;
  onSelect: (id: string) => void;
}

export const titlesLabel = (n: number) => `${n.toLocaleString("es")} ${n === 1 ? "título" : "títulos"}`;

/** Tarjeta de género: póster del título mejor valorado de fondo, nombre y número de títulos. */
export default function CategoryCard({ category, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(category.id)}
      className={`group relative block h-28 w-44 overflow-hidden rounded-lg bg-[#1f1f1f] text-left md:h-32 md:w-56 ${
        selected ? "ring-2 ring-white ring-offset-2 ring-offset-black" : ""
      }`}
    >
      {category.posterUrl && (
        <img
          src={category.posterUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-[center_25%] motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/10" />
      <span className="absolute inset-x-0 bottom-0 p-3">
        <span className="block truncate text-base font-semibold md:text-lg">{category.name}</span>
        <span className="block text-xs text-white/85">{titlesLabel(category.count)}</span>
      </span>
    </button>
  );
}
