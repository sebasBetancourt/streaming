import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function NetflixSearch({ onClose }) {
  const [query, setQuery] = useState("");          
  const [debounced, setDebounced] = useState("");  
  const [items, setItems] = useState([]);          
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef(null);
  const modalRef = useRef(null);

  // Debounce del input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch dinámico según el texto
  useEffect(() => {
    if (!debounced) {
      setItems([]);
      return;
    }

    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        params.append("skip", "0");

        if (/^[0-9a-fA-F]{24}$/.test(debounced)) {
          params.append("categoriesId", debounced);
        } else {
          // Buscar por título o autor
          params.append("search", debounced);
        }

        const res = await fetch(`${API_URL}/titles/list?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setItems(data);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Error fetching titles");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [debounced]);

  // manejar input
  const onInput = (e) => setQuery(e.target.value);
  const clearInput = () => setQuery("");

  // Cerrar al hacer click fuera del modal
  useEffect(() => {
    const handleClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        if (onClose) onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const results = useMemo(() => items, [items]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-label="Cerrar búsqueda"></div>

      <div
        ref={modalRef}
        className="relative mx-auto mt-10 w-full max-w-screen-lg px-4 md:mt-16"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Barra de búsqueda */}
        <div className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 shadow-xl">
          <div className="h-9 w-9 flex items-center justify-center rounded-lg border border-white/10 opacity-90 transition hover:opacity-100">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={onInput}
            placeholder="Busca un titulo…"
            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/50"
          />
          {query && (
            <button onClick={clearInput} className="px-3 py-1 border border-white/10 rounded-lg opacity-80 hover:opacity-100">
              Clear
            </button>
          )}
        </div>

        {/* Resultados */}
        <div className="mt-6">
          {loading && <div className="opacity-70">Buscando…</div>}
          {!loading && error && <div className="opacity-70">Error: {error}</div>}
          {!loading && !error && results.length === 0 && <div className="opacity-60 mt-4">No se encontraron resultados</div>}
          {!loading && !error && results.length > 0 && (
            <div className="flex flex-wrap gap-8 justify-center mt-4">
              {results.map((item) => (
                <div key={item._id} className="group relative aspect-[2/3] overflow-hidden rounded-lg bg-[#141414] h-60 w-40 rounded-md md:h-84 md:w-64">
                  <div
                    className="absolute inset-0 bg-center bg-cover"
                    style={{
                      backgroundImage: item.posterUrl ? `url(${item.posterUrl})` : "linear-gradient(180deg,#222,#111)",
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0">
                    <div className="h-24 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="px-2 pb-2 bg-gray-900">
                      <div className="line-clamp-1 text-sm opacity-95 text-white">{item.title}</div>
                      <div className="text-[11px] opacity-60 text-white">{item.type}</div>
                      <div className="text-[11px] opacity-60 text-white">{item.author}</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 scale-100 transition-transform duration-200 group-hover:scale-[1.04]"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
