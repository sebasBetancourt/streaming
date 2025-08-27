import React, { useEffect, useMemo, useState } from "react";
import { Heart, Check, Plus, X, Filter, SortAsc } from "lucide-react";
// Si usas un AuthContext propio, descomenta y úsalo:
// import { useAuth } from "../context/AuthContext";

/**
 * FAVORITES PAGE
 * - Lista los favoritos del usuario (películas/series/anime)
 * - Filtros por tipo y género
 * - Orden por ranking/popularidad/fecha
 * - Quitar de favoritos
 *
 * BACKEND ESPERADO (ajusta según tu implementación):
 *   GET    /api/v1/favorites?type=movie|tv|anime&genre=Acción&sort=ranking&limit=24&offset=0
 *   POST   /api/v1/favorites           { itemId, type }
 *   DELETE /api/v1/favorites/:favoriteId   (o /api/v1/favorites?itemId=xxx)
 *
 * RESPUESTA GET (ejemplo):
 * {
 *   data: {
 *     items: [{ _id, itemId, type, title, year, posterUrl, genres: ["Acción"], rating, likes, dislikes }],
 *     total: 15
 *   },
 *   error: null
 * }
 */

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
  // const { token } = useAuth() || {};
  const tokenFromLS = typeof window !== "undefined" ? localStorage.getItem("access_token") : "";
  // return token || tokenFromLS || "";
  return tokenFromLS || "";
}

function mapItem(raw) {
  // Mapea lo que venga del backend a un shape uniforme para la UI
  return {
    id: raw._id || raw.id || raw.itemId || String(Math.random()),
    itemId: raw.itemId || raw._id || raw.id,
    type: raw.type || "movie",
    title: raw.title || raw.name || "Sin título",
    year: raw.year || raw.releaseYear || "",
    poster:
      raw.posterUrl ||
      raw.poster ||
      raw.image ||
      raw.cover ||
      null,
    genres: raw.genres || raw.categories || [],
    rating: Number(raw.rating || 0),
    likes: Number(raw.likes || 0),
    dislikes: Number(raw.dislikes || 0),
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

  const genreOptions = useMemo(() => GENRES[type] || [], [type]);

  async function fetchFavorites() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type,
        genre,
        sort,
        limit: "24",
        offset: "0",
      });
      const res = await fetch(`/api/v1/favorites?${params.toString()}`, {
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
      // Si tu backend borra por itemId en query, cambia la URL a `/api/v1/favorites?itemId=${it.itemId}`
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
      // opcional: muestra toast
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen netflix-container">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/70 backdrop-blur px-4 py-3 md:px-12">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="text-xl font-semibold" style={{ color: "#e50914" }}>PixelFlix</div>
            <div className="text-sm opacity-80">Favoritos</div>
          </div>
          <div className="flex items-center gap-2 text-xs opacity-70">
            <Filter className="w-4 h-4" /><span>Filtros</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-4 py-4 md:px-12 md:py-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-md border border-white/15 bg-white/5 p-1">
            {["movie", "tv", "anime"].map((t) => (
              <button
                key={t}
                onClick={() => { setType(t); setGenre((GENRES[t] || [])[0]); }}
                className={`px-3 py-1.5 rounded ${type === t ? "bg-white/20" : "hover:bg-white/10"}`}
              >
                {t === "movie" ? "Películas" : t === "tv" ? "Series" : "Anime"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {genreOptions.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  genre === g ? "border-white/70 bg-white/20" : "border-white/15 bg-white/5 hover:bg-white/10"
                }`}
              >
                {g}
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
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
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
                <div key={it.id} className="group relative aspect-[2/3] overflow-hidden rounded-lg" style={{ backgroundColor: "#141414" }}>
                  <div
                    className="absolute inset-0 bg-center"
                    style={{
                      backgroundImage: it.poster ? `url(${it.poster})` : "linear-gradient(180deg,#222,#111)",
                      backgroundSize: "cover",
                    }}
                  />
                  {/* Overlay info */}
                  <div className="absolute inset-x-0 bottom-0">
                    <div className="h-20 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="px-2 pb-2">
                      <div className="line-clamp-1 text-sm">{it.title}</div>
                      <div className="text-[11px] opacity-60">
                        {it.year ? `${it.year} · ` : ""}{(it.genres || [])[0] || it.type}
                      </div>
                    </div>
                  </div>

                  {/* Rating chip */}
                  <div className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs">
                    ★ {it.rating?.toFixed ? it.rating.toFixed(1) : Number(it.rating || 0).toFixed(1)}
                  </div>

                  {/* Quitar de favoritos */}
                  <button
                    onClick={() => removeFavorite(it)}
                    disabled={busyId === it.id}
                    title="Quitar de favoritos"
                    className="absolute right-2 top-2 rounded-full border border-white/20 bg-black/60 p-2 opacity-90 transition hover:scale-105"
                  >
                    {busyId === it.id ? <X className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                  </button>
                </div>
              ))}
        </div>

        {!loading && items.length === 0 && (
          <div className="mt-16 text-center opacity-70">No tienes favoritos en esta categoría.</div>
        )}
      </main>
    </div>
  );
}
