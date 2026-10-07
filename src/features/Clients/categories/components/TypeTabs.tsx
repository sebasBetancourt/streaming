import type { TitleType } from "@/entities/titles";

export const TYPE_OPTIONS: { value?: TitleType; label: string }[] = [
  { value: undefined, label: "Todo" },
  { value: "movie", label: "Películas" },
  { value: "tv", label: "Series" },
  { value: "anime", label: "Anime" },
];

interface Props {
  value?: TitleType;
  onChange: (value?: TitleType) => void;
}

export default function TypeTabs({ value, onChange }: Props) {
  return (
    <div role="group" aria-label="Tipo de contenido" className="flex flex-wrap gap-2">
      {TYPE_OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`h-11 rounded-full px-4 text-sm font-medium transition md:px-5 ${
              active ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
