import React, { useEffect, useMemo, useState } from "react";
import { Heart, Filter, SortAsc, Search as SearchIcon, Info } from "lucide-react";
import NetflixSearch from "../components/Search"; 

// Géneros por tipo
const GENRES = {
  movie: ["Acción", "Comedia", "Drama", "Romance", "Terror", "Fantasía", "Ciencia ficción", "Aventura"],
  tv: ["Acción", "Comedia", "Drama", "Misterio", "Ciencia ficción", "Documental", "Familia", "Crimen"],
  anime: ["Acción", "Aventura", "Comedia", "Drama", "Fantasía", "Terror", "Romance", "Ciencia ficción", "Thriller"],
};

const SORTS = [
  { label: "Ranking", value: "ranking" },
  { label: "Popularidad", value: "popularity" },
  { label: "Más recientes", value: "date" },
];

function useAuthToken() {
  return (typeof window !== "undefined" && localStorage.getItem("access_token")) || "";
}

function mapItem(raw) {
  return {
    id: raw._id || raw.id || raw.itemId || String(Math.random()),
    itemId: raw.itemId || raw._id || raw.id,
    type: raw.type || "movie",
    title: raw.title || raw.name || "Sin título",
    year: raw.year || raw.releaseYear || "",
    poster: raw.posterUrl || raw.poster || raw.image || raw.cover || null,
    genres: raw.genres || raw.categories || [],
    rating: Number(raw.rating || 0),
  };
}

export default function FavoritesPage() {
  const token = useAuthToken();

  const [type, setType] = useState("movie");
  const [genre, setGenre] = useState(GENRES.movie[0]);
  const [sort, setSort] = useState("ranking");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  const genreOptions = useMemo(() => GENRES[type] || [], [type]);

  async function fetchFavorites() {
    try {
      setLoading(true);
      const params = new URLSearchParams({ type, genre, sort, limit: "24", offset: "0" });
      const res = await fetch(`/api/v1/favorites?${params}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      const list = (json?.data?.items || json?.items || []).map(mapItem);
      setItems(list);
      setTotal(json?.data?.total ?? list.length);
    } catch (e) {
      console.error(e);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, genre, sort]);

  async function removeFavorite(it) {
    try {
      setBusyId(it.id);
      const res = await fetch(`/api/v1/favorites/${encodeURIComponent(it.id)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setItems((arr) => arr.filter((x) => x.id !== it.id));
      setTotal((n) => Math.max(0, n - 1));
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen netflix-container">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/70 backdrop-blur px-4 py-6 md:px-12">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <a href="/home" className="text-xl font-semibold text-3xl md:text-4xl text-red-600">
              PixelFlix
            </a>
            <div className="flex space-x-1">
              <a href="/home" className="text-sm opacity-80 hover:text-gray-300">Home </a>
              <span className="text-sm opacity-80"> / </span>
              <a href="/favorites" className="text-sm opacity-80 hover:text-gray-300">Favoritos</a>
            </div>
          </div>
          <div className="flex items-center gap-5">
              <SearchIcon onClick={() => setShowSearch(true)} className="w-5 h-5 opacity-70" />
            <div className="flex items-center gap-2 text-xs opacity-70">
              <Filter className="w-4 h-4" /><span>Filtros</span>
            </div>
          </div>
        </div>
      </div>
      {/* Filtros */}
      <div className="px-4 py-4 md:px-12 md:py-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 ">
            {["movie", "tv", "anime"].map((t) => (
              <button
                key={t}
                onClick={() => { setType(t); setGenre((GENRES[t] || [])[0]); }}
                className={`px-3 py-1.5 ${type === t ? "border-b-3 border-red-800 inline-block pb-1" : "hover:bg-white/10"}`}
              >
                {t === "movie" ? "Películas" : t === "tv" ? "Series" : "Anime"}
              </button>
            ))}
          </div>

          

          <div className="ml-auto flex items-center gap-2 text-sm">
            <SortAsc className="w-4 h-4 opacity-70" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-md border border-white/15 bg-white/5 px-2 py-1 outline-none"
            >
              {SORTS.map((s) => (
                <option className="bg-black" key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-4 py-1 md:px-12 md:py-2 mb-6">
        {genreOptions.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`select-none h-8 content-center rounded-full border px-3 py-1 text-sm transition  ${
              genre === g ? "border-white/70 bg-white/20" : "border-white/15 bg-white/5 hover:bg-white/10"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Grid */}
      <main className="px-4 pb-12 md:px-12">
        <div className="mb-3 text-sm opacity-60">
          {loading ? "Cargando..." : `Mostrando ${items.length} de ${total}`}
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="relative aspect-[2/3] overflow-hidden rounded-lg shimmer" />
              ))
            : items.map((it) => (
                <div
                  key={it.id}
                  className="group relative aspect-[2/3] overflow-hidden rounded-lg"
                  style={{ backgroundColor: "#141414" }}
                >
                  {/* Poster */}
                  <div
                    className="absolute inset-0 bg-center"
                    style={{
                      backgroundImage: it.poster ? `url(${it.poster})` : "linear-gradient(180deg,#222,#111)",
                      backgroundSize: "cover",
                    }}
                  />

                  {/* Overlay inferior mínimo */}
                  <div className="absolute inset-x-0 bottom-0">
                    <div className="h-20 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="px-2 pb-2">
                      <div className="line-clamp-1 text-sm">{it.title}</div>
                      <div className="text-[11px] opacity-60">
                        {it.year ? `${it.year} · ` : ""}{(it.genres || [])[0] || it.type}
                      </div>
                    </div>
                  </div>

                  {/* HOVER: ficha estilo Netflix (solo UI) */}
                  <div className="pointer-events-none absolute inset-0 flex items-end bg-black/0 opacity-0 transition-opacity duration-200 group-hover:bg-black/20 group-hover:opacity-100">
                    <div className="w-full p-3">
                      <div className="rounded-lg border border-white/15 bg-black/70 p-3 backdrop-blur">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <div className="text-sm font-semibold line-clamp-1">{it.title}</div>
                          <div className="text-xs opacity-70">{it.year || "2024"}</div>
                        </div>
                        <div className="mb-2 text-[11px] opacity-70 line-clamp-2">
                          Sinopsis breve de ejemplo para mostrar el hover. Conecta aquí la descripción real.
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            title="Más info"
                            className="pointer-events-auto rounded-full border border-white/20 bg-white/10 p-2 transition hover:bg-white/20"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFavorite(it)}
                            disabled={busyId === it.id}
                            title="Quitar de favoritos"
                            className="pointer-events-auto rounded-full border border-white/20 bg-white/10 p-2 transition hover:bg-white/20"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          <div className="ml-auto rounded-md bg-black/60 px-2 py-1 text-xs">★ {Number(it.rating || 0).toFixed(1)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {!loading && items.length === 0 && (
          <div className="mt-16 text-center opacity-70">No tienes favoritos en esta categoría.</div>
        )}
      </main>

      {/* Buscador reutilizable */}
      {showSearch && <NetflixSearch onClose={() => setShowSearch(false)} />}
    </div>
  );
}
