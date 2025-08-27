import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

const TMDB_IMG = "https://image.tmdb.org/t/p/w342";
const TMDB_KEY = import.meta.env?.VITE_TMDB_KEY || ""; // si no existe, cae a TVMaze

export default function NetflixSearch({ onClose }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [recent, setRecent] = useState([
    "Dexter",
    "El increíble Mundo de Gumball",
    "The Walking Dead",
  ]);
  const [items, setItems] = useState([]);       // resultados finales con posters
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef(null);
  const modalRef = useRef(null);

  // Debounce básico
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 220);
    return () => clearTimeout(t);
  }, [query]);

  // Buscar en TMDb (si hay key) o TVMaze (sin key)
  useEffect(() => {
    let abort = false;
    const run = async () => {
      setError("");
      if (!debounced) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        if (TMDB_KEY) {
          // TMDb - películas y series, con pósters
          const url =
            `https://api.themoviedb.org/3/search/multi` +
            `?query=${encodeURIComponent(debounced)}` +
            `&include_adult=false&language=es-ES&page=1&api_key=${TMDB_KEY}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("TMDb error " + res.status);
          const json = await res.json();
          const mapped =
            json.results?.filter(
              (it) => it && (it.media_type === "movie" || it.media_type === "tv")
            ).map((it) => ({
              id: `${it.media_type}-${it.id}`,
              title: it.title || it.name || "Untitled",
              genre: it.media_type === "movie" ? "Movie" : "TV",
              poster: it.poster_path ? `${TMDB_IMG}${it.poster_path}` : null,
            })) || [];
          if (!abort) setItems(mapped);
        } else {
          // TVMaze - sin clave (series)
          const res = await fetch(
            `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(debounced)}`
          );
          if (!res.ok) throw new Error("TVMaze error " + res.status);
          const json = await res.json();
          const mapped =
            json?.map(({ show }) => ({
              id: `tvmaze-${show.id}`,
              title: show.name,
              genre: show.type || "TV",
              poster: show.image?.original || show.image?.medium || null,
            })) || [];
          if (!abort) setItems(mapped);
        }
      } catch (e) {
        if (!abort) {
          setItems([]);
          setError(e?.message || "Error fetching data");
        }
      } finally {
        if (!abort) setLoading(false);
      }
    };
    run();
    return () => {
      abort = true;
    };
  }, [debounced]);

  // chips de tendencia
  const trending = ["Romance", "Thriller", "Comedy", "Acción", "Fantasía", "Horror"];

  // manejar input contentEditable
  const onInput = (e) => {
    const text = e.currentTarget.textContent || "";
    setQuery(text);
  };

  const clearInput = () => {
    setQuery("");
    if (inputRef.current) inputRef.current.textContent = "";
  };

  const onKeyDown = (e) => {
    // Evitar salto de línea
    if (e.key === "Enter") {
      e.preventDefault();
      setDebounced((inputRef.current?.textContent || "").trim().toLowerCase());
      const q = (inputRef.current?.textContent || "").trim();
      if (q && !recent.includes(q)) setRecent((r) => [q, ...r].slice(0, 8));
    }
    if (e.key === "Escape") {
      e.preventDefault();
      if (onClose) onClose();
    }
  };

  const pickSuggestion = (text) => {
    setQuery(text);
    if (inputRef.current) inputRef.current.textContent = text;
  };

  const pickResult = (title) => {
    if (title && !recent.includes(title)) setRecent((r) => [title, ...r].slice(0, 8));
  };

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
      {/* Fondo oscuro con blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-label="Cerrar búsqueda"></div>

      {/* Contenido */}
      <div
        ref={modalRef}
        className="relative mx-auto mt-10 w-full max-w-screen-lg px-4 md:mt-16"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Barra de búsqueda */}
        <div
          className="mx-auto flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 shadow-xl"
          style={{ backdropFilter: "blur(6px)" }}
        >
          {/* Icono search */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.focus()}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-white/10 opacity-90 transition hover:opacity-100"
          >
            <Search className="w-5 h-5" />
          </div>

          {/* Input (div contentEditable) */}
          <div className="relative flex-1">
            {!query && (
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center opacity-50">
                <div className="text-sm md:text-base">Busca por título, género, persona…</div>
              </div>
            )}
            <div
              ref={inputRef}
              role="textbox"
              aria-label="Search"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              onInput={onInput}
              onKeyDown={onKeyDown}
              className="min-h-[28px] outline-none md:min-h-[32px]"
              style={{ color: "hsl(var(--foreground))" }}
            ></div>
          </div>

          {/* Limpiar */}
          {query && (
            <div
              onClick={clearInput}
              role="button"
              tabIndex={0}
              className="select-none rounded-lg border border-white/10 px-3 py-1 text-sm opacity-80 transition hover:opacity-100"
            >
              Clear
            </div>
          )}
        </div>

        {/* Sugerencias rápidas */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {trending.map((t) => (
              <div
                key={t}
                role="button"
                tabIndex={0}
                onClick={() => pickSuggestion(t)}
                className="select-none rounded-full border border-white/15 px-3 py-1 text-xs opacity-90 transition hover:opacity-100"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                {t}
              </div>
            ))}
          </div>

          {recent.length > 0 && (
            <div className="mt-3">
              <div className="mb-2 text-xs opacity-60">Búsquedas recientes</div>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <div
                    key={r}
                    role="button"
                    tabIndex={0}
                    onClick={() => pickSuggestion(r)}
                    className="select-none rounded-md border border-white/10 px-2 py-1 text-xs opacity-80 transition hover:opacity-100"
                  >
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="mt-6">
          {loading && <div className="opacity-70">Buscando…</div>}
          {!loading && error && <div className="opacity-70">Error: {error}</div>}

          {!loading && !error && debounced ? (
            results.length ? (
              <div>
                <div className="mb-3 text-sm opacity-60">
                  Mostrando {results.length} resultado{results.length !== 1 ? "s" : ""} para “{query}”
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                  {results.map((item) => (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => pickResult(item.title)}
                      className="group relative aspect-[2/3] overflow-hidden rounded-lg"
                      style={{ backgroundColor: "#141414" }}
                    >
                      {/* Poster como bg en DIV (sin <img>) */}
                      <div
                        className="absolute inset-0 bg-center"
                        style={{
                          backgroundImage: item.poster
                            ? `url(${item.poster})`
                            : "linear-gradient(180deg,#222,#111)",
                          backgroundSize: "cover",
                        }}
                      ></div>

                      {/* Overlay inferior con título */}
                      <div className="absolute inset-x-0 bottom-0">
                        <div className="h-24 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="px-2 pb-2">
                          <div className="line-clamp-1 text-sm opacity-95">{item.title}</div>
                          <div className="text-[11px] opacity-60">{item.genre}</div>
                        </div>
                      </div>

                      {/* Hover scale */}
                      <div className="absolute inset-0 scale-100 transition-transform duration-200 group-hover:scale-[1.04]"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center opacity-70">No se encontraron resultados.</div>
            )
          ) : (
            !loading && !error && <div className="mt-10 text-center opacity-60">Escribe algo para buscar…</div>
          )}
        </div>
      </div>
    </div>
  );
}
