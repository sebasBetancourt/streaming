import { useRef, type ReactNode } from "react";
import type { TitleEntity } from "@/entities/titles";
import { scrollBehavior } from "@/shared/lib/motion";
import PosterCard from "./PosterCard";
import ArrowButton from "./ui/ArrowButton";

interface Props {
  title: string;
  items: TitleEntity[];
  loading: boolean;
  onSelectItem: (item: TitleEntity) => void;
  /** Acción junto al título (p. ej. "Ver todo"). */
  action?: ReactNode;
}

const CELL = "w-32 flex-shrink-0 sm:w-36 md:w-44";

export default function Row({ title, items, loading, onSelectItem, action }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);

  const scroll = (dir: 1 | -1) =>
    trackRef.current?.scrollBy({
      left: dir * Math.round(trackRef.current.clientWidth * 0.9),
      behavior: scrollBehavior(),
    });

  return (
    <section className="mb-8 md:mb-10">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {action}
      </div>

      <div className="group relative">
        <ArrowButton dir="left" onClick={() => scroll(-1)} />
        <ArrowButton dir="right" onClick={() => scroll(1)} />

        <ul ref={trackRef} className="scrollbar-hide flex gap-3 overflow-x-auto py-1">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <li key={i} aria-hidden className={`${CELL} shimmer aspect-[2/3] rounded-md`} />
              ))
            : items.map((it) => (
                <li key={it.id} className={CELL}>
                  <PosterCard item={it} onSelect={onSelectItem} />
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
}
