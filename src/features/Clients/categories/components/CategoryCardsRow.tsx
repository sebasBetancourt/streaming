import { useRef } from "react";
import type { CategorySummary } from "@/entities/categories";
import ArrowButton from "@/shared/components/ui/ArrowButton";
import { scrollBehavior } from "@/shared/lib/motion";
import CategoryCard from "./CategoryCard";

interface Props {
  categories: CategorySummary[];
  loading: boolean;
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function CategoryCardsRow({ categories, loading, selectedId, onSelect }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) =>
    trackRef.current?.scrollBy({ left: dir * Math.round(trackRef.current.clientWidth * 0.8), behavior: scrollBehavior() });

  return (
    <div className="group relative">
      <ArrowButton dir="left" onClick={() => scroll(-1)} />
      <ArrowButton dir="right" onClick={() => scroll(1)} />
      <ul ref={trackRef} className="scrollbar-hide flex gap-3 overflow-x-auto px-4 py-2 md:px-12">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <li key={i} aria-hidden className="shimmer h-28 w-44 flex-shrink-0 rounded-lg md:h-32 md:w-56" />
            ))
          : categories.map((c) => (
              <li key={c.id} className="flex-shrink-0">
                <CategoryCard category={c} selected={c.id === selectedId} onSelect={onSelect} />
              </li>
            ))}
      </ul>
    </div>
  );
}
