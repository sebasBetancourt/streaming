import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Footer } from "../components/Footer";
import NetflixSearch from "../components/Search";

// --- Config / Fuentes de datos ---
const TMDB_KEY = import.meta.env?.VITE_TMDB_KEY || "";
const TMDB_IMG = "https://image.tmdb.org/t/p/w342";







// Géneros por categoría (ids por API)
const GENRES = {
  movie: {
    "Acción": 28, "Comedia": 35, "Drama": 18, "Romance": 10749, "Terror": 27,
    "Fantasía": 14, "Ciencia ficción": 878, "Aventura": 12, "Animación": 16, "Thriller": 53,
  },
  tv: {
    "Acción": 10759, "Comedia": 35, "Drama": 18, "Misterio": 9648,
    "Ciencia ficción": 10765, "Documental": 99, "Familia": 10751, "Crimen": 80,
    // Romance no existe como género TV en TMDb; puedes mapearlo a "Drama"
  },
  anime: {
    // Jikan IDs: https://docs.api.jikan.moe/
    "Acción": 1, "Aventura": 2, "Comedia": 4, "Drama": 8, "Fantasía": 10,
    "Terror": 14, "Romance": 22, "Ciencia ficción": 24, "Thriller": 41,
  },
};

// Fallback genres para YTS (películas) y TVMaze (series)
const YTS_GENRES = ["action", "adventure", "animation", "comedy", "drama", "fantasy", "horror", "romance", "sci-fi", "thriller"];

// --- Utils UI ---
function ArrowButton({ dir = "left", onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-full p-2 opacity-0 ring-1 ring-white/20 backdrop-blur transition group-hover:opacity-100 ${dir === "left" ? "left-2" : "right-2"}`}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      aria-label={dir === "left" ? "Scroll left" : "Scroll right"}
    >
      {dir === "left" ? <ChevronLeft /> : <ChevronRight />}
    </div>
  );
}

function Row({ title, items, loading }) {
  const trackRef = useRef(null);

  const scrollAmt = () => {
    const el = trackRef.current;
    if (!el) return 0;
    return Math.round(el.clientWidth * 0.9);
  };

  const left = () => trackRef.current?.scrollBy({ left: -scrollAmt(), behavior: "smooth" });
  const right = () => trackRef.current?.scrollBy({ left: scrollAmt(), behavior: "smooth" });

  return (
    <section className="content-section">
      <h2 className="mb-6  text-xl font-semibold">{title}</h2>

      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <ArrowButton dir="left" onClick={left} />
        <ArrowButton dir="right" onClick={right} />

        <div
          ref={trackRef}
          className="scrollbar-hide netflix-section-padding flex gap-3 overflow-x-auto "
        >
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="relative h-74 w-32 flex-shrink-0 overflow-hidden rounded-md md:h-74 md:w-84 shimmer" />
              ))
            : items.map((it) => (
                <div
                  key={it.id}
                  role="button"
                  tabIndex={0}
                  className="group relative h-44 w-32 flex-shrink-0 overflow-hidden rounded-md md:h-84 md:w-54"
                  style={{ backgroundColor: "#141414" }}
                  title={it.title}
                >
                  <div
                    className="absolute inset-0 bg-center"
                    style={{
                      backgroundImage: it.poster
                        ? `url(${it.poster})`
                        : "linear-gradient(180deg,#222,#111)",
                      backgroundSize: "cover",
                    }}
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

// --- Fetchers ---
async function fetchTMDb({ type, genreId, page = 1 }) {
  const base = "https://api.themoviedb.org/3";
  const url =
    `${base}/discover/${type}` +
    `?with_genres=${genreId}` +
    `&language=es-ES&sort_by=popularity.desc&page=${page}&include_adult=false&api_key=${TMDB_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("TMDb " + res.status);
  const json = await res.json();
  const items = (json.results || []).map((it) => ({
    id: `${type}-${it.id}`,
    title: it.title || it.name || "Sin título",
    poster: it.poster_path ? `${TMDB_IMG}${it.poster_path}` : null,
    tag: type === "movie" ? "Película" : "Serie",
  }));
  return items;
}

async function fetchYTSMovies({ genre = "action", page = 1 }) {
  const url = `https://yts.mx/api/v2/list_movies.json?limit=24&page=${page}&genre=${genre}&sort_by=download_count`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("YTS " + res.status);
  const json = await res.json();
  const movies = json?.data?.movies || [];
  return movies.map((m) => ({
    id: `yts-${m.id}`,
    title: m.title,
    poster: m.large_cover_image || m.medium_cover_image || null,
    tag: "Película",
  }));
}

async function fetchTVMaze({ query = "drama" }) {
  const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("TVMaze " + res.status);
  const json = await res.json();
  return (json || []).map(({ show }) => ({
    id: `tvmaze-${show.id}`,
    title: show.name,
    poster: show.image?.original || show.image?.medium || null,
    tag: "Serie",
  }));
}

async function fetchJikanAnime({ genreId = 1, page = 1 }) {
  const url = `https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=score&sort=desc&sfw=true&limit=24&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Jikan " + res.status);
  const json = await res.json();
  return (json?.data || []).map((a) => ({
    id: `jikan-${a.mal_id}`,
    title: a.title,
    poster:
      a.images?.jpg?.large_image_url ||
      a.images?.jpg?.image_url ||
      a.images?.webp?.large_image_url ||
      null,
    tag: "Anime",
  }));
}

// mapeo texto->yts genre
function mapToYTS(genreTxt) {
  const g = genreTxt.toLowerCase();
  // picks first match; fallback to action
  const found = YTS_GENRES.find((x) => x === g || x.replace("-", " ") === g);
  return found || "action";
}

function GenreChips({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-7">
      {options.map((g) => (
        <div
          key={g}
          role="button"
          tabIndex={0}
          onClick={() => onChange(g)}
          className={`select-none h-8 content-center rounded-full border px-3 py-1 text-sm transition ${
            value === g ? "border-white/70 bg-white/20" : "border-white/15 bg-white/5 hover:bg-white/10"
          }`}
        >
          {g}
        </div>
      ))}
    </div>
  );
}

function CategorySection({ type, title }) {
  const [genre, setGenre] = useState(Object.keys(GENRES[type])[0] || "Acción");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lista de géneros visibles por sección
  const genreOptions = useMemo(() => Object.keys(GENRES[type]), [type]);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      setLoading(true);
      try {
        let data = [];
        if (type === "anime") {
          const gid = GENRES.anime[genre] ?? 1;
          data = await fetchJikanAnime({ genreId: gid });
        } else if (TMDB_KEY) {
          const t = type === "movie" ? "movie" : "tv";
          const gid = GENRES[type][genre];
          data = await fetchTMDb({ type: t, genreId: gid });
        } else {
          // fallbacks sin key
          if (type === "movie") {
            data = await fetchYTSMovies({ genre: mapToYTS(genre) });
          } else {
            // tv
            // Intento de búsqueda por género como texto
            data = await fetchTVMaze({ query: genre.toLowerCase() });
          }
        }
        if (!cancel) setItems(data);
      } catch (e) {
        if (!cancel) setItems([]);
        console.error(e);
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    return () => {
      cancel = true;
    };
  }, [type, genre]);

  return (
    <div className="mb-10 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>

      <GenreChips options={genreOptions} value={genre} onChange={setGenre} />

      <Row title={`Explora ${title} De ${genre}`} items={items} loading={loading} />
    </div>
  );
}

export default function CategoriesPage() {

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen netflix-container p-4">
      {/* Header simple */}
      <div className="sticky top-0 z-30 bg-black/70 backdrop-blur py-5">
        <div className="flex items-center gap-6">
          <a href="/home" className="text-xl font-semibold text-3xl md:text-4xl text-red-600">
            PixelFlix
          </a>
          <div className="flex space-x-1">
            <a href="/home" className="text-sm opacity-80 hover:text-gray-300">Home </a>
            <span className="text-sm opacity-80"> / </span>
            <a href="/categorias" className="text-sm opacity-80 hover:text-gray-300">Categorías</a>
          </div>
          <div className="relative flex items-center ml-280" ref={searchRef}>
              <Search
                className="text-white w-5 h-5 cursor-pointer hover:text-gray-300 transition-colors"
                onClick={() => setShowSearch(true)}
              />
          </div>
        </div>
      </div>

      {/* Secciones */}
      <main className="space-y-2">
        <CategorySection type="movie" title="Películas" />
        <CategorySection type="tv" title="Series" />
        <CategorySection type="anime" title="Anime" />
      </main>

      {/* Footer sutil */}
      <Footer className="bg-black" />
      {/* Buscador modal */}
      {showSearch && (
        <NetflixSearch onClose={() => setShowSearch(false)} />
      )}
    </div>
    
  );
}