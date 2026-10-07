import { useMemo, useState } from "react";
import { Heart, Info, SortAsc } from "lucide-react";
import { useShelf } from "@/app/providers/ShelfContext";
import { mapTitle, type TitleEntity, type TitleType } from "@/entities/titles";
import { listShelf } from "@/shared/api/favorites";
import ItemDialog from "@/shared/components/ItemDialog";
import { useAsync } from "@/shared/hooks/useAsync";

const TYPES: { value: TitleType; label: string }[] = [
  { value: "movie", label: "Películas" },
  { value: "tv", label: "Series" },
  { value: "anime", label: "Anime" },
];

type SortKey = "ranking" | "popularity" | "date";
const SORTS: { label: string; value: SortKey }[] = [
  { label: "Ranking", value: "ranking" },
  { label: "Popularidad", value: "popularity" },
  { label: "Más recientes", value: "date" },
];

const ALL = "Todos";

const sorters: Record<SortKey, (a: TitleEntity, b: TitleEntity) => number> = {
  ranking: (a, b) => parseFloat(b.ratingAvg) - parseFloat(a.ratingAvg),
  popularity: (a, b) => b.likes - a.likes,
  date: (a, b) => b.createdAt.localeCompare(a.createdAt),
};

export default function FavoritesPage() {
  const { toggle } = useShelf();
  const [type, setType] = useState<TitleType>("movie");
  const [genre, setGenre] = useState(ALL);
  const [sort, setSort] = useState<SortKey>("ranking");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<TitleEntity | null>(null);

  const { data, loading, error } = useAsync(
    async () => {
      const page = await listShelf({ list: "favorites", type, limit: 100 });
      return { total: page.total, items: page.items.map(mapTitle) };
    },
    [type],
  );

  const items = useMemo(() => (data?.items ?? []).filter((it) => !removed.has(it.id)), [data, removed]);
  const genreOptions = useMemo(() => [ALL, ...new Set(items.flatMap((it) => it.categories))], [items]);
  const visible = useMemo(
    () => items.filter((it) => genre === ALL || it.categories.includes(genre)).sort(sorters[sort]),
    [items, genre, sort],
  );

  async function removeFavorite(it: TitleEntity) {
    setBusyId(it.id);
    if (await toggle("favorites", it.id)) setRemoved((prev) => new Set(prev).add(it.id));
    setBusyId(null);
  }

  return (
    <div className="netflix-container min-h-screen pt-20">
      <div className="px-4 py-4 md:px-12 md:py-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setType(t.value);
                  setGenre(ALL);
                }}
                className={`px-3 py-1.5 ${type === t.value ? "inline-block border-b-3 border-red-800 pb-1" : "hover:bg-white/10"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 text-sm">
            <SortAsc className="h-4 w-4 opacity-70" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-md border border-white/15 bg-white/5 px-2 py-1 outline-none"
            >
              {SORTS.map((s) => (
                <option className="bg-black" key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 px-4 py-1 md:px-12 md:py-2">
        {genreOptions.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`h-8 select-none content-center rounded-full border px-3 py-1 text-sm transition ${
              genre === g ? "border-white/70 bg-white/20" : "border-white/15 bg-white/5 hover:bg-white/10"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <main className="px-4 pb-12 md:px-12">
        <div className="mb-3 text-sm opacity-60">
          {loading ? "Cargando..." : error ? `Error: ${error.message}` : `Mostrando ${visible.length} de ${items.length}`}
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="shimmer relative aspect-[2/3] overflow-hidden rounded-lg" />
              ))
            : visible.map((it) => (
                <div key={it.id} className="group relative aspect-[2/3] overflow-hidden rounded-lg" style={{ backgroundColor: "#141414" }}>
                  <div
                    className="absolute inset-0 bg-center"
                    style={{ backgroundImage: it.image ? `url(${it.image})` : "linear-gradient(180deg,#222,#111)", backgroundSize: "cover" }}
                  />

                  <div className="absolute inset-x-0 bottom-0">
                    <div className="h-20 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="px-2 pb-2">
                      <div className="line-clamp-1 text-sm">{it.title}</div>
                      <div className="text-[11px] opacity-60">
                        {it.year ? `${it.year} · ` : ""}
                        {it.categories[0] ?? it.type}
                      </div>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-0 flex items-end bg-black/0 opacity-0 transition-opacity duration-200 group-hover:bg-black/20 group-hover:opacity-100">
                    <div className="w-full p-3">
                      <div className="rounded-lg border border-white/15 bg-black/70 p-3 backdrop-blur">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <div className="line-clamp-1 text-sm font-semibold">{it.title}</div>
                          <div className="text-xs opacity-70">{it.year ?? ""}</div>
                        </div>
                        <div className="mb-2 line-clamp-2 text-[11px] opacity-70">{it.description}</div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelected(it)}
                            title="Más info"
                            className="pointer-events-auto rounded-full border border-white/20 bg-white/10 p-2 transition hover:bg-white/20"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => void removeFavorite(it)}
                            disabled={busyId === it.id}
                            title="Quitar de favoritos"
                            className="pointer-events-auto rounded-full border border-white/20 bg-white/10 p-2 transition hover:bg-white/20 disabled:opacity-50"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </button>
                          <div className="ml-auto rounded-md bg-black/60 px-2 py-1 text-xs">★ {it.ratingAvg}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {!loading && !error && visible.length === 0 && (
          <div className="mt-16 text-center opacity-70">No tienes favoritos en esta categoría.</div>
        )}
      </main>

      <ItemDialog open={!!selected} onClose={() => setSelected(null)} item={selected} />
    </div>
  );
}
