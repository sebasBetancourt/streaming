import { useRef } from "react";
import type { TitleEntity } from "@/entities/titles";
import ArrowButton from "./ui/ArrowButton";

interface Props {
  title: string;
  items: TitleEntity[];
  loading: boolean;
  onSelectItem: (item: TitleEntity) => void;
}

export default function Row({ title, items, loading, onSelectItem }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollAmt = () => Math.round((trackRef.current?.clientWidth ?? 0) * 0.9);
  const left = () => trackRef.current?.scrollBy({ left: -scrollAmt(), behavior: "smooth" });
  const right = () => trackRef.current?.scrollBy({ left: scrollAmt(), behavior: "smooth" });

  return (
    <section className="content-section">
      <h2 className="mb-6 text-xl font-semibold">{title}</h2>

      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <ArrowButton dir="left" onClick={left} />
        <ArrowButton dir="right" onClick={right} />

        <div ref={trackRef} className="scrollbar-hide netflix-section-padding flex gap-3 overflow-x-auto">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="relative h-74 w-32 flex-shrink-0 overflow-hidden rounded-md md:h-74 md:w-84"
                />
              ))
            : items.map((it) => (
                <div
                  key={it.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectItem(it)}
                  className="group/item relative h-44 w-32 flex-shrink-0 cursor-pointer overflow-hidden rounded-md transition hover:scale-105 focus-visible:ring-2 md:h-84 md:w-54"
                  style={{ backgroundColor: "#141414" }}
                  title={it.title}
                >
                  <div
                    className="absolute inset-0 bg-center transition-transform group-hover/item:scale-110"
                    style={{
                      backgroundImage: it.image ? `url(${it.image})` : "linear-gradient(180deg,#222,#111)",
                      backgroundSize: "cover",
                    }}
                  />

                  <div className="absolute inset-0 flex flex-col justify-end bg-black/70 p-2 text-white opacity-0 transition-opacity group-hover/item:opacity-100">
                    <h3 className="truncate text-sm font-bold">{it.title}</h3>
                    <p className="truncate text-xs opacity-80">{it.author}</p>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="rounded bg-gray-400 px-1.5 py-0.5 text-black">⭐ {it.ratingAvg}</span>
                      {it.year && <span className="opacity-70">{it.year}</span>}
                    </div>
                    {it.description && (
                      <p className="mt-1 line-clamp-2 text-[11px] opacity-70">{it.description}</p>
                    )}
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
