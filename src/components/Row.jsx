import { useRef } from "react";
import ArrowButton from "./ui/ArrowButton";

export default function Row({ title, items, loading, onSelectItem }) {
  const trackRef = useRef(null);

  const scrollAmt = () => {
    const el = trackRef.current;
    if (!el) return 0;
    return Math.round(el.clientWidth * 0.9);
  };

  const left = () =>
    trackRef.current?.scrollBy({ left: -scrollAmt(), behavior: "smooth" });
  const right = () =>
    trackRef.current?.scrollBy({ left: scrollAmt(), behavior: "smooth" });

  return (
    <section className="content-section">
      <h2 className="mb-6 text-xl font-semibold">{title}</h2>

      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <ArrowButton dir="left" onClick={left} />
        <ArrowButton dir="right" onClick={right} />

        <div
          ref={trackRef}
          className="scrollbar-hide netflix-section-padding flex gap-3 overflow-x-auto"
        >
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
                  className="group/item relative h-44 w-32 flex-shrink-0 overflow-hidden rounded-md md:h-84 md:w-54 cursor-pointer transition hover:scale-105 focus-visible:ring-2"
                  style={{ backgroundColor: "#141414" }}
                  title={it.title}
                >
                  <div
                    className="absolute inset-0 bg-center transition-transform group-hover/item:scale-110"
                    style={{
                      backgroundImage: it.poster
                        ? `url(${it.poster})`
                        : "linear-gradient(180deg,#222,#111)",
                      backgroundSize: "cover",
                    }}
                  />

                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/item:opacity-700 transition-opacity flex flex-col justify-end p-2 text-white">
                    <h3 className="text-sm font-bold truncate">{it.title}</h3>
                    {it.author && (
                      <p className="text-xs opacity-80 truncate">
                        {it.author}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-1 text-xs">
                      {it.rating && (
                        <span className="bg-gray-400/100 text-black px-1.5 py-0.5 rounded">
                          ⭐ {it.rating.toFixed(1)}
                        </span>
                      )}
                      {it.year && <span className="opacity-70">{it.year}</span>}
                    </div>
                    {it.description && (
                      <p className="text-[11px] opacity-70 line-clamp-2 mt-1">
                        {it.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
