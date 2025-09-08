import React, { useEffect, useMemo, useState } from "react";
import { Plus, Check, Filter, Image as ImageIcon, Upload as UploadIcon, Plus as Add, X } from "lucide-react";
import ItemDialog from "../components/ItemDialog";
import { useFetch } from "../hooks/useFetch";
import { createTitle, getTitles, getTitlesList } from "../api/titles";
import { getCategories } from "../api/categories";

const GENRES = {
  movie: ["Acción", "Comedia", "Drama", "Romance", "Terror", "Fantasía", "Ciencia ficción", "Aventura"],
  tv: ["Acción", "Comedia", "Drama", "Misterio", "Ciencia ficción", "Documental", "Familia", "Crimen"],
  anime: ["Acción", "Aventura", "Comedia", "Drama", "Fantasía", "Terror", "Romance", "Ciencia ficción", "Thriller"],
};

export default function MyListPage() {
  const [type, setType] = useState("movie");
  const [genre, setGenre] = useState(GENRES.movie[0]);
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);


  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // CREAR TÍTULO
  const [form, setForm] = useState({
    type: "movie",
    title: "",
    author: "",
    year: "",
    temps: "",
    eps: "",
    categoriesIds: [],
    description: "",
    posterUrl: ""
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createdItem, setCreatedItem] = useState(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const onInput = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const onTypeChange = (t) => setForm(prev => ({ ...prev, type: t }));


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("El archivo debe ser una imagen");
      return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setForm(prev => ({ ...prev, posterUrl: url }));
    setPreview(url); 
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setOpen(true);
  };



  const submitCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      const dataToSend = {
        ...form,
        year: Number(form.year), 
        temps: form.type !== "movie" ? Number(form.temps) || 0 : undefined,
        eps: form.type !== "movie" ? Number(form.eps) || 0 : undefined,
      };

      // Filtrar campos vacíos o indefinidos
      const cleanData = Object.fromEntries(
        Object.entries(dataToSend).filter(([_, v]) => v !== undefined && v !== "")
      );

      // Llamada a la función reciclable
      console.log("Data enviada al backend:", cleanData);
      const result = await createTitle(cleanData);

      setCreatedItem(result);

      // Reset form
      setForm({
        type: "movie",
        title: "",
        author: "",
        year: 1000,
        temps: "",
        eps: "",
        categoriesIds: [],
        description: "",
        posterUrl: ""
      });
      setPreview("");

    } catch (err) {
      console.error("Error al crear título:", err.message);
      setCreateError(err);
    } finally {
      setCreating(false);
    }
  };

  // LISTAR CATEGORÍAS
  const { data: categories = [], loading: catLoading, error: catError } = useFetch(getCategories, { limit: 40 });

  // LISTAR TITULOS
  const { data: titles = [], loading: titlesLoading } = useFetch(getTitles, { limit: 50, categoriesId: [] });

  // LISTAR TITULOS GUARDADOS DEL USUARIO
  const [typeList, setTypeList] = useState("movie"); // tipo seleccionado
  const [titlesList, setTitlesList] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchTitlesList = async () => {
      setLoading(true); // mientras carga
      try {
        const response = await getTitlesList({ type: typeList, limit: 50 });
        setTitlesList(response);
        setItems(response);
      } catch (err) {
        console.error("Error al cargar títulos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTitlesList();

    return () => {
      if (preview && file) URL.revokeObjectURL(preview);
    };
  }, [typeList, preview, file]); // todos los deps van en un solo array


  const genreOptions = useMemo(() => GENRES[type] || [], [type]);

  // Funciones Mi Lista
  async function addToList(it) {
    setBusyId(it.id || it.itemId);
    try {
      await fetch(`/api/v1/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: it.itemId || it.id, type: it.type }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  }

  async function removeFromList(it) {
    setBusyId(it.id);
    try {
      await fetch(`/api/v1/list/${it.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
      setItems(arr => arr.filter(x => x.id !== it.id));
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
        <div className="flex items-center gap-6">
          <a href="/home" className="text-red-600 text-4xl font-bold">PixelFlix</a>
          <div className="flex gap-1 text-sm opacity-80">
            <a href="/home" className="hover:text-gray-300">Home</a> / <span>Mi Lista</span>
          </div>
        </div>
      </div>

      {/* Crear nuevo */}
      <section className="px-4 pt-4 md:px-12">
        <button
          onClick={() => setCreateOpen(v => !v)}
          className="mb-3 rounded-md border border-white/15 bg-white/5 px-4 py-2 flex items-center gap-2 hover:bg-white/10"
        >
          {createOpen ? ( <>Cerrar <X className="w-4 h-4" /></>) : (<>Crear <Add className="w-4 h-4" /></>)} 
        </button>

        {createOpen && (
          <form onSubmit={submitCreate} className="rounded-2xl border border-white/10 bg-black/60 p-4 md:p-6 shadow-2xl backdrop-blur-md">
            {/* Tipo */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm opacity-80 mr-2">Tipo:</span>
              {["movie", "tv", "anime"].map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => onTypeChange(t)}
                  className={`rounded-md px-3 py-1.5 text-sm ${form.type === t ? "border border-white/60 bg-white/10" : "border border-white/15 bg-white/5 hover:bg-white/10"}`}
                >
                  {t === "movie" ? "Película" : t === "tv" ? "Serie" : "Anime"}
                </button>
              ))}
            </div>

            {/* Campos */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input name="title" placeholder="Título *" value={form.title} onChange={onInput} required className="md:col-span-2 h-11 w-full rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none focus:border-[#e50914]" />
              <input name="author" placeholder="Autor / Director" value={form.author} onChange={onInput} required className="h-11 w-full rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none focus:border-[#e50914]" />
              <input name="year" type="number" placeholder="Año" value={form.year} onChange={onInput} required min="1000" className="h-11 w-full rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none focus:border-[#e50914]" />

              {(form.type === "tv" || form.type === "anime") && (
                <>
                  <input name="temps" type="number" placeholder="Temporadas" value={form.temps} onChange={onInput} required min="1" className="h-11 w-full rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none focus:border-[#e50914]" />
                  <input name="eps" type="number" placeholder="Episodios" value={form.eps} onChange={onInput} required min="1" className="h-11 w-full rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none focus:border-[#e50914]" />
                </>
              )}

              <select
                name="genre"
                value={form.categoriesIds[0] || ""}
                onChange={e => setForm(prev => ({ ...prev, categoriesIds: [e.target.value] }))}
                className={`md:col-span-2 h-11 w-100 rounded-md border border-white/20 bg-white/10 px-3 outline-none focus:border-[#e50914] ${
                  form.categoriesIds.length === 0 ? "text-white/50" : "text-white"
                }`}
                required
              >
                <option value="" disabled hidden>Selecciona género</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id} className="bg-black text-white">{c.name}</option>
                ))}
              </select>



              {/* Subir archivo */}
              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed border-white/25 bg-white/[0.04] p-4 hover:bg-white/[0.08]">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <UploadIcon className="w-5 h-5" />
                <span className="text-sm">Subir imagen (archivo)</span>
              </label>

              {/* Pegar URL */}
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 opacity-70" />
                <input
                  name="posterUrl"
                  placeholder="o pega URL de la imagen"
                  value={form.posterUrl}
                  onChange={handleUrlChange}
                  className="h-11 w-full rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none focus:border-[#e50914]"
                />
              </div>

              {/* Preview */}
              {preview && (
                <div
                  className="md:col-span-2 w-40 h-60 bg-center bg-cover rounded-md border border-white/15"
                  style={{ backgroundImage: `url(${preview})` }}
                />
              )}


            </div>

            {/* Botones */}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setCreateOpen(false)} className="rounded-md border border-white/20 bg-white/5 px-4 py-2 hover:bg-white/10">Cancelar</button>
              <button type="submit" disabled={creating} className="rounded-md bg-[#e50914] px-5 py-2 font-semibold hover:bg-[#f6121d] hover:shadow-[0_8px_24px_rgba(229,9,20,0.35)]">
                {creating ? "Creando..." : "Crear"}
              </button>
            </div>

            {createError && <p className="text-red-500 mt-2">{createError.message}</p>}
            {createdItem && <p className="text-green-500 mt-2">Título creado exitosamente {createdItem.title}</p>}
          </form>
        )}
      </section>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pb-4 md:px-12">
        {["movie", "tv", "anime"].map(t => (
          <button
            key={t}
            onClick={() => { setTypeList(t); setGenre(GENRES[t][0]); }}
            className={`px-3 py-1.5 ${typeList === t ? "border-b-3 border-red-800 pb-1" : "hover:bg-white/10"}`}
          >
            {t === "movie" ? "Películas" : t === "tv" ? "Series" : "Anime"}
          </button>
        ))}
      </div>



      {/* Grid */}
      <main className="px-4 pb-12 md:px-12">
        <div className="mb-3 text-sm opacity-60">{items.length} resultados</div>
        <div className="flex flex-wrap gap-10">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="group relative aspect-[2/3] overflow-hidden rounded-lg bg-[#141414] animate-pulse h-44 w-32 rounded-md md:h-84 md:w-54"
                />
              ))
            : titlesList.map((it) => (
                <div
                  key={it._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectItem(it)}
                  className="group/item relative h-90 w-72 flex-shrink-0 overflow-hidden rounded-md md:h-84 md:w-54 cursor-pointer transition hover:scale-105 focus-visible:ring-2"
                  style={{ backgroundColor: "#141414" }}
                  title={it.title}
                >
                  <div
                    className="absolute inset-0 bg-center transition-transform group-hover/item:scale-110"
                    style={{
                      backgroundImage: it.posterUrl
                        ? `url(${it.posterUrl})`
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

          {items.length === 0 && !loading && (
            <div className="mt-16 text-center opacity-70 col-span-full">Tu lista está vacía.</div>
          )}
        </div>


      </main>
      <ItemDialog open={open} onClose={() => setOpen(false)} item={selectedItem} />
    </div>
  );
}
