import React, { useEffect, useMemo, useState } from "react";
import { Plus, Check, Filter, Search as SearchIcon, Image as ImageIcon, Upload as UploadIcon, Plus as Add } from "lucide-react";
import NetflixSearch from "../components/Search"; // 

const GENRES = {
  movie: ["Acción", "Comedia", "Drama", "Romance", "Terror", "Fantasía", "Ciencia ficción", "Aventura"],
  tv: ["Acción", "Comedia", "Drama", "Misterio", "Ciencia ficción", "Documental", "Familia", "Crimen"],
  anime: ["Acción", "Aventura", "Comedia", "Drama", "Fantasía", "Terror", "Romance", "Ciencia ficción", "Thriller"],
};

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
  };
}

// Ajusta a tu endpoint real de creación (admins aprueban luego en backend)
const CREATE_ENDPOINT = "/api/v1/titles"; // POST { type, title, description, author, year, genres[], image | imageUrl }

export default function MyListPage() {
  const token = useAuthToken();

  const [type, setType] = useState("movie");
  const [genre, setGenre] = useState(GENRES.movie[0]);
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);


  const add = <div className="flex items-center gap-2">
    <p className="opacity-80 hover:text-gray-300 text-sl">Crear</p> <Add className="w-4 h-4"></Add>
  </div>;

  // Crear nuevo
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    type: "movie",
    title: "",
    description: "",
    author: "",
    year: "",
    genre: "",
    imageUrl: "",
    temp: "",
    eps: ""
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const genreOptions = useMemo(() => GENRES[type] || [], [type]);

  // fetch list
  async function fetchList() {
    try {
      setLoading(true);
      const params = new URLSearchParams({ type, genre, limit: "24", offset: "0" });
      const res = await fetch(`/api/v1/list?${params}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      const list = (json?.data?.items || json?.items || []).map(mapItem);
      setItems(list);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, genre]);

  // add / remove (Mi Lista)
  async function addToList(it) {
    try {
      setBusyId(it.id || it.itemId);
      const res = await fetch(`/api/v1/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ itemId: it.itemId || it.id, type: it.type }),
      });
      if (!res.ok) throw new Error(`Add failed: ${res.status}`);
      // opcional: refetch
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  }

  async function removeFromList(it) {
    try {
      setBusyId(it.id);
      const res = await fetch(`/api/v1/list/${encodeURIComponent(it.id)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setItems((arr) => arr.filter((x) => x.id !== it.id));
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  }

  // Crear nuevo: handlers
  function onInput(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }
  function onTypeChange(newType) {
    setForm((s) => ({ ...s, type: newType }));
  }
  function onFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : "");
  }
  function onImageUrlBlur() {
    if (form.imageUrl) {
      setPreview(form.imageUrl);
      setFile(null); // si hay URL, ignoramos archivo
    }
  }

  async function submitCreate(e) {
    e.preventDefault();
    // Validación simple
    if (!form.title.trim()) return alert("El título es requerido.");
    if (!form.genre) return alert("Selecciona un género.");
    try {
      // FormData si hay archivo, JSON si solo URL
      let res;
      if (file) {
        const fd = new FormData();
        fd.append("type", form.type);
        fd.append("title", form.title);
        fd.append("description", form.description);
        fd.append("author", form.author);
        if (form.year) fd.append("year", String(form.year));
        fd.append("genres[]", form.genre);
        fd.append("image", file);
        res = await fetch(CREATE_ENDPOINT, {
          method: "POST",
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: fd,
        });
      } else {
        res = await fetch(CREATE_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            type: form.type,
            title: form.title,
            description: form.description,
            author: form.author,
            year: form.year ? Number(form.year) : undefined,
            genres: [form.genre],
            imageUrl: form.imageUrl || undefined,
          }),
        });
      }
      if (!res.ok) throw new Error(`Create failed: ${res.status}`);
      const created = await res.json();

      // Opcional: añadir a Mi Lista inmediatamente (si tu backend lo permite o lo haces en el controller)
      const createdItem = mapItem(created?.data || created);
      await addToList({ ...createdItem, type: form.type });

      // Reset form
      setForm({ type: "movie", title: "", description: "", author: "", year: "", genre: "", imageUrl: "" });
      setFile(null);
      setPreview("");
      setCreateOpen(false);
      // Refrescar lista
      fetchList();
    } catch (e) {
      console.error(e);
      alert("Error al crear. Revisa consola.");
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
              <a href="/list" className="text-sm opacity-80 hover:text-gray-300">Mi Lista</a>
            </div>
          </div>
          <div className="flex items-center gap-5">
              <SearchIcon onClick={() => setShowSearch(true)} className="w-5 h-5 opacity-70" />
          </div>
        </div>
      </div>

      {/* Crear nuevo */}
      <section className="px-4 pt-4 md:px-12">
        <button
          onClick={() => setCreateOpen((v) => !v)}
          className="mb-3 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sl transition hover:bg-white/10"
        >
          {createOpen ? "Cerrar" : add}
        </button>

        {createOpen && (
          <form onSubmit={submitCreate} className="rounded-2xl border border-white/10 bg-black/60 p-4 md:p-6 shadow-2xl backdrop-blur-md">
            {/* Tipo */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm opacity-80 mr-2">Tipo:</span>
              {["movie", "tv", "anime"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => onTypeChange(t)}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    form.type === t ? "border border-white/60 bg-white/10" : "border border-white/15 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {t === "movie" ? "Película" : t === "tv" ? "Serie" : "Anime"}
                </button>
              ))}
            </div>

            {/* Campos */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <input
                  name="title"
                  placeholder="Título *"
                  value={form.title}
                  onChange={onInput}
                  required
                  className="w-full h-11 rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                />
              </div>
              <div>
                <input
                  name="author"
                  placeholder="Autor / Director"
                  value={form.author}
                  onChange={onInput}
                  required
                  className="w-full h-11 rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                />
              </div>
              <div>
                <input
                  name="year"
                  type="number"
                  placeholder="Año"
                  required
                  min="1000"
                  value={form.year}
                  onChange={onInput}
                  className="w-full h-11 rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                />
              </div>
              <div>
                <input
                  name="temporadas"
                  type="number"
                  placeholder="Temporadas"
                  min="1"
                  required
                  value={form.temp}
                  onChange={onInput}
                  className="w-full h-11 rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                />
              </div>
              <div>
                <input
                  name="episodios"
                  type="number"
                  placeholder="Episodios"
                  min="1"
                  required
                  value={form.eps}
                  onChange={onInput}
                  className="w-full h-11 rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                />
              </div>
              <div>
                <select
                  name="genre"
                  value={form.genre}
                  onChange={onInput}
                  required
                  className="w-full h-11 rounded-md border border-white/20 bg-white/10 px-3 text-white outline-none transition focus:border-[#e50914]"
                >
                  <option className="bg-black" value="">Selecciona género</option>
                  {(GENRES[form.type] || []).map((g) => (
                    <option className="bg-black" key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <textarea
                  name="description"
                  placeholder="Descripción / Sinopsis"
                  value={form.description}
                  onChange={onInput}
                  rows={4}
                  required
                  className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                />
              </div>

              {/* Imagen: archivo o URL */}
              <div className="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="flex cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed border-white/25 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]">
                  <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                  <UploadIcon className="w-5 h-5" />
                  <span className="text-sm">Subir imagen (archivo)</span>
                </label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 opacity-70" />
                  <input
                    name="imageUrl"
                    placeholder="o pega URL de la imagen"
                    value={form.imageUrl}
                    onChange={onInput}
                    onBlur={onImageUrlBlur}
                    className="w-full h-11 rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                  />
                </div>
              </div>

              {/* Preview */}
              {preview && (
                <div className="md:col-span-2">
                  <div className="text-xs mb-2 opacity-70">Preview</div>
                  <div
                    className="relative aspect-[2/3] w-40 overflow-hidden rounded-md border border-white/15 bg-center"
                    style={{ backgroundImage: `url(${preview})`, backgroundSize: "cover" }}
                  />
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-md border border-white/20 bg-white/5 px-4 py-2 transition hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-[#e50914] px-5 py-2 font-semibold transition hover:bg-[#f6121d] hover:shadow-[0_8px_24px_rgba(229,9,20,0.35)]"
              >
                Crear
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Filtros */}
      <div className="px-4 py-4 md:px-12 md:py-5 mb-4">
        <div className="flex flex-wrap items-center mb-6">
          <div className="flex gap-1">
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

          <div className="ml-auto flex items-center gap-2 text-xs opacity-70">
            <Filter className="w-4 h-4" /><span>Filtros</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
            {genreOptions.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`select-none h-8 content-center rounded-full border px-3 py-1 text-sm transition ${
                  genre === g ? "border-white/70 bg-white/20" : "border-white/15 bg-white/5 hover:bg-white/10"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
      </div>

      {/* Grid */}
      <main className="px-4 pb-12 md:px-12">
        <div className="mb-3 text-sm opacity-60">
          {loading ? "Cargando..." : `Total: ${items.length}`}
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

                  {/* HOVER: ficha (solo UI) */}
                  <div className="pointer-events-none absolute inset-0 flex items-end bg-black/0 opacity-0 transition-opacity duration-200 group-hover:bg-black/20 group-hover:opacity-100">
                    <div className="w-full p-3">
                      <div className="rounded-lg border border-white/15 bg-black/70 p-3 backdrop-blur">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <div className="text-sm font-semibold line-clamp-1">{it.title}</div>
                          <div className="text-xs opacity-70">{it.year || "2024"}</div>
                        </div>
                        <div className="mb-2 text-[11px] opacity-70 line-clamp-2">
                          Descripción de ejemplo para hover. Aquí irá la sinopsis real de tu BD.
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => addToList(it)}
                            disabled={busyId === it.id}
                            title="Añadir / mantener en Mi Lista"
                            className="pointer-events-auto rounded-full border border-white/20 bg-white/10 p-2 transition hover:bg-white/20"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromList(it)}
                            disabled={busyId === it.id}
                            title="Quitar de Mi Lista"
                            className="pointer-events-auto rounded-full border border-white/20 bg-white/10 p-2 transition hover:bg-white/20"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {!loading && items.length === 0 && (
          <div className="mt-16 text-center opacity-70">Tu lista está vacía en esta categoría.</div>
        )}
      </main>

      {/* Buscador reutilizable */}
      {showSearch && <NetflixSearch onClose={() => setShowSearch(false)} />}
    </div>
  );
}
