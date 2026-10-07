import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Image as ImageIcon, Plus, X } from "lucide-react";
import { useShelf } from "@/app/providers/ShelfContext";
import { mapTitle, type TitleEntity, type TitleType } from "@/entities/titles";
import { listCategories } from "@/shared/api/categories";
import { listShelf } from "@/shared/api/favorites";
import { createTitle } from "@/shared/api/titles";
import ItemDialog from "@/shared/components/ItemDialog";
import { useAsync } from "@/shared/hooks/useAsync";

const TYPES: { value: TitleType; label: string; single: string }[] = [
  { value: "movie", label: "Películas", single: "Película" },
  { value: "tv", label: "Series", single: "Serie" },
  { value: "anime", label: "Anime", single: "Anime" },
];

interface FormState {
  type: TitleType;
  title: string;
  author: string;
  year: string;
  seasons: string;
  episodes: string;
  categoryId: string;
  description: string;
  posterUrl: string;
}

const emptyForm: FormState = {
  type: "movie", title: "", author: "", year: "", seasons: "", episodes: "", categoryId: "", description: "", posterUrl: "",
};

const inputCls =
  "h-11 w-full rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none focus:border-[#e50914]";

export default function MyListPage() {
  const { toggle } = useShelf();
  const [typeList, setTypeList] = useState<TitleType>("movie");
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<TitleEntity | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdTitle, setCreatedTitle] = useState<string | null>(null);

  const { data: categories = [] } = useAsync(() => listCategories({ limit: 100 }), []);
  const { data, loading } = useAsync(
    async () => (await listShelf({ list: "watchlist", type: typeList, limit: 100 })).items.map(mapTitle),
    [typeList],
  );
  const items = useMemo(() => (data ?? []).filter((it) => !removed.has(it.id)), [data, removed]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const onInput = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    set(e.target.name as keyof FormState, e.target.value as never);

  async function submitCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreatedTitle(null);
    try {
      const isSeries = form.type !== "movie";
      await createTitle({
        type: form.type,
        title: form.title.trim(),
        author: form.author.trim(),
        description: form.description.trim() || "Sin descripción",
        year: Number(form.year),
        categoriesIds: [form.categoryId],
        ...(form.posterUrl.trim() && { posterUrl: form.posterUrl.trim() }),
        ...(isSeries && { seasons: Number(form.seasons) || 1, episodes: Number(form.episodes) || 1 }),
      });
      setCreatedTitle(form.title.trim());
      setForm(emptyForm);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "No se pudo crear el título");
    } finally {
      setCreating(false);
    }
  }

  async function removeFromList(it: TitleEntity) {
    setBusyId(it.id);
    if (await toggle("watchlist", it.id)) setRemoved((prev) => new Set(prev).add(it.id));
    setBusyId(null);
  }

  return (
    <div className="netflix-container min-h-screen pt-20">
      <section className="px-4 pt-4 md:px-12">
        <button
          onClick={() => setCreateOpen((v) => !v)}
          className="mb-3 flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 hover:bg-white/10"
        >
          {createOpen ? (<>Cerrar <X className="h-4 w-4" /></>) : (<>Crear <Plus className="h-4 w-4" /></>)}
        </button>

        {createOpen && (
          <form onSubmit={submitCreate} className="rounded-2xl border border-white/10 bg-black/60 p-4 shadow-2xl backdrop-blur-md md:p-6">
            <p className="mb-3 text-xs opacity-60">Los títulos nuevos quedan pendientes hasta que un administrador los apruebe.</p>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm opacity-80">Tipo:</span>
              {TYPES.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => set("type", t.value)}
                  className={`rounded-md px-3 py-1.5 text-sm ${form.type === t.value ? "border border-white/60 bg-white/10" : "border border-white/15 bg-white/5 hover:bg-white/10"}`}
                >
                  {t.single}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input name="title" placeholder="Título *" value={form.title} onChange={onInput} required className={`${inputCls} md:col-span-2`} />
              <input name="author" placeholder="Autor / Director *" value={form.author} onChange={onInput} required className={inputCls} />
              <input name="year" type="number" placeholder="Año *" value={form.year} onChange={onInput} required min={1888} max={2100} className={inputCls} />

              {form.type !== "movie" && (
                <>
                  <input name="seasons" type="number" placeholder="Temporadas" value={form.seasons} onChange={onInput} required min={1} className={inputCls} />
                  <input name="episodes" type="number" placeholder="Episodios" value={form.episodes} onChange={onInput} required min={1} className={inputCls} />
                </>
              )}

              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                required
                className={`h-11 w-full rounded-md border border-white/20 bg-white/10 px-3 outline-none focus:border-[#e50914] md:col-span-2 ${form.categoryId ? "text-white" : "text-white/50"}`}
              >
                <option value="" disabled hidden>Selecciona género</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-black text-white">{c.name}</option>
                ))}
              </select>

              <textarea
                name="description"
                placeholder="Descripción"
                value={form.description}
                onChange={onInput}
                className="min-h-24 w-full rounded-md border border-white/20 bg-white/10 p-3 text-white placeholder-white/50 outline-none focus:border-[#e50914] md:col-span-2"
              />

              <div className="flex items-center gap-2 md:col-span-2">
                <ImageIcon className="h-5 w-5 opacity-70" />
                <input name="posterUrl" type="url" placeholder="URL de la imagen (https://…)" value={form.posterUrl} onChange={onInput} className={inputCls} />
              </div>

              {form.posterUrl && (
                <div className="h-60 w-40 rounded-md border border-white/15 bg-cover bg-center md:col-span-2" style={{ backgroundImage: `url(${form.posterUrl})` }} />
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setCreateOpen(false)} className="rounded-md border border-white/20 bg-white/5 px-4 py-2 hover:bg-white/10">Cancelar</button>
              <button type="submit" disabled={creating} className="rounded-md bg-[#e50914] px-5 py-2 font-semibold hover:bg-[#f6121d] disabled:opacity-60">
                {creating ? "Creando..." : "Crear"}
              </button>
            </div>

            {createError && <p className="mt-2 text-red-500">{createError}</p>}
            {createdTitle && <p className="mt-2 text-green-500">Título «{createdTitle}» enviado. Estará visible cuando sea aprobado.</p>}
          </form>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-4 pt-4 md:px-12">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => {
              setTypeList(t.value);
              setRemoved(new Set());
            }}
            className={`px-3 py-1.5 ${typeList === t.value ? "border-b-3 border-red-800 pb-1" : "hover:bg-white/10"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="px-4 pb-12 md:px-12">
        <div className="mb-3 text-sm opacity-60">{items.length} resultados</div>
        <div className="flex flex-wrap gap-10">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-44 w-32 animate-pulse overflow-hidden rounded-md bg-[#141414] md:h-84 md:w-54" />
              ))
            : items.map((it) => (
                <div
                  key={it.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(it)}
                  className="group/item relative h-90 w-72 flex-shrink-0 cursor-pointer overflow-hidden rounded-md transition hover:scale-105 focus-visible:ring-2 md:h-84 md:w-54"
                  style={{ backgroundColor: "#141414" }}
                  title={it.title}
                >
                  <div
                    className="absolute inset-0 bg-center transition-transform group-hover/item:scale-110"
                    style={{ backgroundImage: it.image ? `url(${it.image})` : "linear-gradient(180deg,#222,#111)", backgroundSize: "cover" }}
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-black/70 p-2 text-white opacity-0 transition-opacity group-hover/item:opacity-100">
                    <h3 className="truncate text-sm font-bold">{it.title}</h3>
                    <p className="truncate text-xs opacity-80">{it.author}</p>
                    {it.year && <span className="mt-1 text-xs opacity-70">{it.year}</span>}
                    {it.description && <p className="mt-1 line-clamp-2 text-[11px] opacity-70">{it.description}</p>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void removeFromList(it);
                      }}
                      disabled={busyId === it.id}
                      className="mt-2 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs hover:bg-white/20 disabled:opacity-50"
                    >
                      Quitar de Mi Lista
                    </button>
                  </div>
                </div>
              ))}

          {items.length === 0 && !loading && <div className="col-span-full mt-16 text-center opacity-70">Tu lista está vacía.</div>}
        </div>
      </main>

      <ItemDialog open={!!selected} onClose={() => setSelected(null)} item={selected} />
    </div>
  );
}
