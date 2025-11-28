import { useRef, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useSearchTitles } from "./useSearchTitles";

export default function NetflixSearch({ onClose, onSelect }) {
  const [query, setQuery] = useState("");


  const { items, loading, error } = useSearchTitles(query);
  

  const modalRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        ref={modalRef}
        className="relative mx-auto mt-10 w-full max-w-screen-lg px-4 md:mt-16"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Barra */}
        <div className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 shadow-xl">
          <div className="h-9 w-9 flex items-center justify-center rounded-lg border border-white/10 opacity-90">
            <Search className="w-5 h-5" />
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca un título…"
            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/50"
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="px-3 py-1 border border-white/10 rounded-lg opacity-80 hover:opacity-100"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Resultados */}
        <div className="mt-6">
          {loading && <div className="text-white opacity-70">Buscando…</div>}

          {error && !loading && (
            <div className="text-red-400 opacity-70">Error: {error}</div>
          )}

          {!loading && !error && items.length === 0 && query && (
            <div className="opacity-60 mt-4 text-white">
              No se encontraron resultados
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="flex flex-wrap gap-4 p-8">
              {items.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                      onClose();     // ❌ Cierra Search
                      onSelect(item); // ✅ Abre ItemDialog con el item
                    }}
                  className="group relative border w-40 h-50 md:w-54 md:h-86 rounded-2xl overflow-hidden bg-black cursor-pointer"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-300 group-hover:opacity-100"
                    style={{
                      backgroundImage: item.posterUrl
                        ? `url(${item.posterUrl})`
                        : "linear-gradient(180deg,#222,#111)",
                    }}
                  />
                
                  {/* Degradado Netflix */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-100 transition-opacity duration-300"></div>
                
                  {/* Info inferior */}
                  <div className="absolute bottom-0 w-full px-3 pb-3 z-10">
                    <h3 className="text-white font-semibold text-sm md:text-base line-clamp-1">
                      {item.title}
                      
                    </h3>
                    <p className="text-gray-400 text-[11px] md:text-sm font-extrabold line-clamp-1">
                       {item.type}
                    </p>
                    <p className="text-gray-400 text-[11px] md:text-xs line-clamp-1">
                      {item.author}
                    </p>
                  </div>
                
                
                  {/* Borde glow Netflix */}
                  <div className="absolute inset-0 ring-0 ring-red-600/0 group-hover:ring-2 group-hover:ring-red-600/60 transition-all duration-300 rounded-lg"></div>
                </div>

              ))}
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
