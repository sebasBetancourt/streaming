import type { TitleSort } from "@/shared/api/titles";

export const SORT_OPTIONS: { value: TitleSort; label: string }[] = [
  { value: "popular", label: "Populares" },
  { value: "rating", label: "Mejor valoradas" },
  { value: "recent", label: "Recientes" },
];

interface Props {
  value: TitleSort;
  onChange: (value: TitleSort) => void;
}

export default function SortSelect({ value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-white/80">Ordenar por</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TitleSort)}
        className="h-11 rounded-md border border-white/20 bg-black px-3 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
      >
        {SORT_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
