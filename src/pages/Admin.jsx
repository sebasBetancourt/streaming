import React, { useEffect, useMemo, useState } from "react";
import {
  Search as SearchIcon,
  Filter,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Shield,
  UserCog,
  Ban,
  Undo2,
  Image as ImageIcon,
  Upload as UploadIcon,
  Star,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import NetflixSearch from "../components/Search";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
// ====================== Helpers ======================
function useAuthToken() {
  return (typeof window !== "undefined" && localStorage.getItem("access_token")) || "";
}
async function api(path, { method = "GET", token = "", headers = {}, body } = {}) {
  const res = await fetch(path, {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}
const TYPES = [
  { label: "Película", value: "movie" },
  { label: "Serie", value: "tv" },
  { label: "Anime", value: "anime" },
];
const GENRES = {
  movie: ["Acción", "Comedia", "Drama", "Romance", "Terror", "Fantasía", "Ciencia ficción", "Aventura"],
  tv: ["Acción", "Comedia", "Drama", "Misterio", "Ciencia ficción", "Documental", "Familia", "Crimen"],
  anime: ["Acción", "Aventura", "Comedia", "Drama", "Fantasía", "Terror", "Romance", "Ciencia ficción", "Thriller"],
};

// Mapea respuestas comunes a una forma uniforme
function mapTitle(raw) {
  return {
    id: raw._id || raw.id,
    type: raw.type || "movie",
    title: raw.title || raw.name || "Sin título",
    year: raw.year || raw.releaseYear || "",
    genres: raw.genres || raw.categories || [],
    description: raw.description || "",
    poster:
      raw.posterUrl ||
      raw.poster ||
      raw.image ||
      raw.cover ||
      null,
    status: raw.status || "approved", // "pending" | "approved" | "rejected"
    rating: Number(raw.rating || 0),
    likes: Number(raw.likes || 0),
    dislikes: Number(raw.dislikes || 0),
    author: raw.author || "",
    createdAt: raw.createdAt,
  };
}

// ====================== Admin Page ======================
export default function AdminPage() {
  const token = useAuthToken();
  const [tab, setTab] = useState("overview"); // overview | titles | reviews | categories | users
  const [showSearch, setShowSearch] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  // ---- Overview (métricas) ----
  const [metrics, setMetrics] = useState({ users: 0, titles: 0, reviews: 0, pending: 0 });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // ---- Titles (aprobación / edición / creación) ----
  const [tFilter, setTFilter] = useState({ type: "movie", status: "pending" }); // pending por defecto
  const [titles, setTitles] = useState([]);
  const [tLoading, setTLoading] = useState(true);
  const [busyTitleId, setBusyTitleId] = useState(null);

  // Crear/editar título
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // objeto título o null
  const [form, setForm] = useState({
    type: "movie",
    title: "",
    description: "",
    author: "",
    year: "",
    genre: "",
    imageUrl: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  // ---- Reviews ----
  const [rFilter, setRFilter] = useState({ status: "all" }); // all | reported | low-score
  const [reviews, setReviews] = useState([]);
  const [rLoading, setRLoading] = useState(true);

  // ---- Categories ----
  const [categories, setCategories] = useState([]); // { _id, name, slug }
  const [cLoading, setCLoading] = useState(true);
  const [newCat, setNewCat] = useState("");
  const [editingCat, setEditingCat] = useState(null);
  const [catName, setCatName] = useState("");

  // ---- Users ----
  const [uFilter, setUFilter] = useState({ role: "all", q: "" });
  const [users, setUsers] = useState([]);
  const [uLoading, setULoading] = useState(true);

  // ====================== Fetchers ======================
  async function fetchMetrics() {
    try {
      setLoadingMetrics(true);
      const json = await api("/api/v1/admin/metrics", { token });
      setMetrics({
        users: json?.data?.users ?? 0,
        titles: json?.data?.titles ?? 0,
        reviews: json?.data?.reviews ?? 0,
        pending: json?.data?.pending ?? 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMetrics(false);
    }
  }

  async function fetchTitles() {
    try {
      setTLoading(true);
      const params = new URLSearchParams({
        type: tFilter.type,
        status: tFilter.status,
        limit: "24",
        offset: "0",
      });
      const json = await api(`/api/v1/titles?${params.toString()}`, { token });
      const list = (json?.data?.items || json?.items || []).map(mapTitle);
      setTitles(list);
    } catch (e) {
      console.error(e);
      setTitles([]);
    } finally {
      setTLoading(false);
    }
  }

  async function fetchReviews() {
    try {
      setRLoading(true);
      const params = new URLSearchParams({
        status: rFilter.status, // si implementas "reported/low-score"
        limit: "20",
        offset: "0",
      });
      const json = await api(`/api/v1/reviews?${params}`, { token });
      setReviews(json?.data?.items || json?.items || []);
    } catch (e) {
      console.error(e);
      setReviews([]);
    } finally {
      setRLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      setCLoading(true);
      const json = await api(`/api/v1/categories`, { token });
      setCategories(json?.data?.items || json?.items || []);
    } catch (e) {
      console.error(e);
      setCategories([]);
    } finally {
      setCLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      setULoading(true);
      const params = new URLSearchParams({
        role: uFilter.role,
        q: uFilter.q,
        limit: "20",
        offset: "0",
      });
      const json = await api(`/api/v1/users?${params}`, { token });
      setUsers(json?.data?.items || json?.items || []);
    } catch (e) {
      console.error(e);
      setUsers([]);
    } finally {
      setULoading(false);
    }
  }

  // Initial + tab specific loads
  useEffect(() => { fetchMetrics(); }, []); // eslint-disable-line
  useEffect(() => { if (tab === "titles") fetchTitles(); }, [tab, tFilter]); // eslint-disable-line
  useEffect(() => { if (tab === "reviews") fetchReviews(); }, [tab, rFilter]); // eslint-disable-line
  useEffect(() => { if (tab === "categories") fetchCategories(); }, [tab]); // eslint-disable-line
  useEffect(() => { if (tab === "users") fetchUsers(); }, [tab, uFilter]); // eslint-disable-line

  // ====================== Actions ======================
  // Titles approve/reject/delete
  async function approveTitle(it) {
    try {
      setBusyTitleId(it.id);
      await api(`/api/v1/titles/${encodeURIComponent(it.id)}/approve`, { method: "POST", token });
      setTitles((arr) => arr.map((x) => (x.id === it.id ? { ...x, status: "approved" } : x)));
    } catch (e) { console.error(e); } finally { setBusyTitleId(null); }
  }
  async function rejectTitle(it) {
    try {
      setBusyTitleId(it.id);
      await api(`/api/v1/titles/${encodeURIComponent(it.id)}/reject`, { method: "POST", token });
      setTitles((arr) => arr.map((x) => (x.id === it.id ? { ...x, status: "rejected" } : x)));
    } catch (e) { console.error(e); } finally { setBusyTitleId(null); }
  }
  async function deleteTitle(it) {
    if (!confirm("¿Eliminar este título?")) return;
    try {
      setBusyTitleId(it.id);
      await api(`/api/v1/titles/${encodeURIComponent(it.id)}`, { method: "DELETE", token });
      setTitles((arr) => arr.filter((x) => x.id !== it.id));
    } catch (e) { console.error(e); } finally { setBusyTitleId(null); }
  }

  // Title form helpers
  function openCreateTitle() {
    setEditing(null);
    setForm({ type: "movie", title: "", description: "", author: "", year: "", genre: "", imageUrl: "" });
    setFile(null); setPreview(""); setTitleModalOpen(true);
  }
  function openEditTitle(it) {
    setEditing(it);
    setForm({
      type: it.type,
      title: it.title,
      description: it.description || "",
      author: it.author || "",
      year: it.year || "",
      genre: it.genres?.[0] || "",
      imageUrl: it.poster || "",
    });
    setFile(null);
    setPreview(it.poster || "");
    setTitleModalOpen(true);
  }
  function onTitleInput(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }
  function onTitleType(t) {
    setForm((s) => ({ ...s, type: t }));
  }
  function onFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : "");
  }
  function onImageUrlBlur() {
    if (form.imageUrl) { setPreview(form.imageUrl); setFile(null); }
  }
  async function submitTitle(e) {
    e.preventDefault();
    if (!form.title.trim()) return alert("El título es requerido");
    if (!form.genre) return alert("Selecciona un género");
    try {
      const path = editing ? `/api/v1/titles/${encodeURIComponent(editing.id)}` : "/api/v1/titles";
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
        res = await api(path, { method: editing ? "PATCH" : "POST", token, body: fd });
      } else {
        const payload = {
          type: form.type,
          title: form.title,
          description: form.description,
          author: form.author,
          year: form.year ? Number(form.year) : undefined,
          genres: [form.genre],
          imageUrl: form.imageUrl || undefined,
        };
        res = await api(path, { method: editing ? "PATCH" : "POST", token, body: payload });
      }
      // Refresh
      setTitleModalOpen(false);
      fetchTitles();
    } catch (e2) {
      console.error(e2);
      alert("Error al guardar título.");
    }
  }

  // Reviews moderation
  async function deleteReview(id) {
    if (!confirm("¿Eliminar esta reseña?")) return;
    try {
      await api(`/api/v1/reviews/${encodeURIComponent(id)}`, { method: "DELETE", token });
      setReviews((arr) => arr.filter((r) => r._id !== id && r.id !== id));
    } catch (e) { console.error(e); }
  }

  // Categories CRUD
  async function createCategory() {
    if (!newCat.trim()) return;
    try {
      const json = await api(`/api/v1/categories`, { method: "POST", token, body: { name: newCat } });
      setCategories((arr) => [json?.data || json, ...arr]);
      setNewCat("");
    } catch (e) { console.error(e); }
  }
  function startEditCat(cat) {
    setEditingCat(cat);
    setCatName(cat.name);
  }
  async function saveEditCat() {
    try {
      const id = editingCat._id || editingCat.id;
      await api(`/api/v1/categories/${encodeURIComponent(id)}`, { method: "PATCH", token, body: { name: catName } });
      setCategories((arr) => arr.map((c) => ( (c._id||c.id) === id ? { ...c, name: catName } : c )));
      setEditingCat(null); setCatName("");
    } catch (e) { console.error(e); }
  }
  async function deleteCategory(cat) {
    if (!confirm("¿Eliminar categoría?")) return;
    try {
      const id = cat._id || cat.id;
      await api(`/api/v1/categories/${encodeURIComponent(id)}`, { method: "DELETE", token });
      setCategories((arr) => arr.filter((c) => (c._id||c.id) !== id));
    } catch (e) { console.error(e); }
  }

  // Users mgmt
  async function setRole(user, role) {
    try {
      const id = user._id || user.id;
      await api(`/api/v1/users/${encodeURIComponent(id)}/role`, { method: "PATCH", token, body: { role } });
      setUsers((arr) => arr.map((u) => ((u._id||u.id) === id ? { ...u, role } : u)));
    } catch (e) { console.error(e); }
  }
  async function suspend(user, suspend = true) {
    try {
      const id = user._id || user.id;
      await api(`/api/v1/users/${encodeURIComponent(id)}/status`, { method: "PATCH", token, body: { suspended: suspend } });
      setUsers((arr) => arr.map((u) => ((u._id||u.id) === id ? { ...u, suspended: suspend } : u)));
    } catch (e) { console.error(e); }
  }
  async function deleteUser(user) {
    if (!confirm("¿Eliminar usuario?")) return;
    try {
      const id = user._id || user.id;
      await api(`/api/v1/users/${encodeURIComponent(id)}`, { method: "DELETE", token });
      setUsers((arr) => arr.filter((u) => (u._id||u.id) !== id));
    } catch (e) { console.error(e); }
  }

  // ====================== UI ======================
  return (
    <div className="min-h-screen netflix-container pt-4">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/70 backdrop-blur px-4 py-3 md:px-12">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <a href="/home" className="text-xl font-semibold text-3xl md:text-4xl text-red-600">
              PixelFlix
            </a>
            <a href="/admin" className="text-sm opacity-80 hover:text-gray-300">Admin</a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className="rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-sm opacity-90 transition hover:bg-white/10"
              title="Buscar"
            >
              <div className="flex items-center gap-2">
                <SearchIcon className="w-4 h-4" /> 
              </div>
            </button>
            <button
              onClick={() => setShowSearch(true)}
              className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm opacity-90 transition hover:bg-white/10"
              title="Salir"
            >

              <div className="flex items-center gap-2">
                <a 
                  href="#" 
                  onClick={() => {
                      logout();
                      navigate("/login");
                    }}>
                  <X className="h-4 w-4"></X>
                </a>
              </div>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {[
            ["overview", "Resumen"],
            ["titles", "Títulos"],
            ["reviews", "Reseñas"],
            ["categories", "Categorías"],
            ["users", "Usuarios"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-md px-3 py-1.5 ${tab === key ? "border border-white/60 bg-white/10" : "border border-white/15 bg-white/5 hover:bg-white/10"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <main className="px-4 pb-16 pt-4 md:px-12">
        {/* ---------- OVERVIEW ---------- */}
        {tab === "overview" && (
          <div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {loadingMetrics
                ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-lg shimmer" />)
                : (
                  <>
                    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                      <div className="text-xs opacity-70">Usuarios</div>
                      <div className="mt-1 text-2xl font-semibold">{metrics.users}</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                      <div className="text-xs opacity-70">Títulos</div>
                      <div className="mt-1 text-2xl font-semibold">{metrics.titles}</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                      <div className="text-xs opacity-70">Reseñas</div>
                      <div className="mt-1 text-2xl font-semibold">{metrics.reviews}</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                      <div className="text-xs opacity-70">Pendientes</div>
                      <div className="mt-1 text-2xl font-semibold">{metrics.pending}</div>
                    </div>
                  </>
                )}
            </div>

            <div className="mt-8 text-sm opacity-70">
              Aquí puedes monitorear el estado general. Usa las pestañas para moderar contenido, aprobar títulos y gestionar usuarios/categorías.
            </div>
          </div>
        )}

        {/* ---------- TITLES ---------- */}
        {tab === "titles" && (
          <div className="space-y-4">
            {/* Filtros y acciones */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1 rounded-md border border-white/15 bg-white/5 p-1">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTFilter((s) => ({ ...s, type: t.value }))}
                    className={`px-3 py-1.5 rounded ${tFilter.type === t.value ? "bg-white/20" : "hover:bg-white/10"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {["pending", "approved", "rejected"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTFilter((s) => ({ ...s, status: st }))}
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      tFilter.status === st ? "border-white/70 bg-white/20" : "border-white/15 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {st === "pending" ? "Pendientes" : st === "approved" ? "Aprobados" : "Rechazados"}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={openCreateTitle}
                  className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm transition hover:bg-white/10"
                >
                  <div className="flex items-center gap-2"><Plus className="w-4 h-4" /> Nuevo título</div>
                </button>
              </div>
            </div>

            {/* Grid de títulos */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
              {tLoading
                ? Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="relative aspect-[2/3] overflow-hidden rounded-lg shimmer" />
                  ))
                : titles.map((it) => (
                    <div key={it.id} className="group relative aspect-[2/3] overflow-hidden rounded-lg" style={{ backgroundColor: "#141414" }}>
                      <div
                        className="absolute inset-0 bg-center"
                        style={{
                          backgroundImage: it.poster ? `url(${it.poster})` : "linear-gradient(180deg,#222,#111)",
                          backgroundSize: "cover",
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0">
                        <div className="h-20 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="px-2 pb-2">
                          <div className="line-clamp-1 text-sm">{it.title}</div>
                          <div className="text-[11px] opacity-60">
                            {it.year ? `${it.year} · ` : ""}{(it.genres || [])[0] || it.type}
                          </div>
                        </div>
                      </div>

                      {/* Ficha hover */}
                      <div className="pointer-events-none absolute inset-0 flex items-end bg-black/0 opacity-0 transition-opacity duration-200 group-hover:bg-black/20 group-hover:opacity-100">
                        <div className="w-full p-3">
                          <div className="rounded-lg border border-white/15 bg-black/70 p-3 backdrop-blur">
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold line-clamp-1">{it.title}</div>
                              <div className="text-xs opacity-70 capitalize">{it.status}</div>
                            </div>
                            <div className="mb-2 text-[11px] opacity-70 line-clamp-2">
                              {it.description || "Descripción de ejemplo. Conecta a tu BD para mostrar la sinopsis real."}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditTitle(it)}
                                className="pointer-events-auto rounded-full border border-white/20 bg-white/10 p-2 transition hover:bg-white/20"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              {it.status !== "approved" && (
                                <button
                                  onClick={() => approveTitle(it)}
                                  disabled={busyTitleId === it.id}
                                  className="pointer-events-auto rounded-full border border-white/20 bg-green-600/20 p-2 transition hover:bg-green-600/30"
                                  title="Aprobar"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {it.status !== "rejected" && (
                                <button
                                  onClick={() => rejectTitle(it)}
                                  disabled={busyTitleId === it.id}
                                  className="pointer-events-auto rounded-full border border-white/20 bg-red-600/20 p-2 transition hover:bg-red-600/30"
                                  title="Rechazar"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteTitle(it)}
                                className="pointer-events-auto ml-auto rounded-full border border-white/20 bg-white/10 p-2 transition hover:bg-white/20"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            {!tLoading && titles.length === 0 && (
              <div className="mt-12 text-center opacity-70">No hay elementos con este filtro.</div>
            )}
          </div>
        )}

        {/* ---------- REVIEWS ---------- */}
        {tab === "reviews" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 opacity-70" />
              <select
                value={rFilter.status}
                onChange={(e) => setRFilter({ status: e.target.value })}
                className="rounded-md border border-white/15 bg-white/5 px-2 py-1 outline-none"
              >
                <option className="bg-black" value="all">Todas</option>
                <option className="bg-black" value="reported">Reportadas</option>
                <option className="bg-black" value="low-score">Baja puntuación</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {rLoading
                ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 rounded-lg shimmer" />)
                : reviews.map((r) => (
                    <div key={r._id || r.id} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="text-sm font-semibold line-clamp-1">{r.title || "Reseña"}</div>
                        <div className="text-xs opacity-60">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</div>
                      </div>
                      <div className="text-xs opacity-80 line-clamp-2">{r.comment || "Comentario..."}</div>
                      <div className="mt-2 flex items-center gap-3 text-xs opacity-80">
                        <div className="flex items-center gap-1"><Star className="w-3 h-3" /> {r.score ?? 0}/10</div>
                        <div className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {r.likes ?? 0}</div>
                        <div className="flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> {r.dislikes ?? 0}</div>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            onClick={() => deleteReview(r._id || r.id)}
                            className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            {!rLoading && reviews.length === 0 && (
              <div className="mt-12 text-center opacity-70">No hay reseñas con este filtro.</div>
            )}
          </div>
        )}

        {/* ---------- CATEGORIES ---------- */}
        {tab === "categories" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <input
                placeholder="Nueva categoría..."
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="h-10 rounded-md border border-white/20 bg-white/10 px-3 outline-none transition focus:border-[#e50914]"
              />
              <button
                onClick={createCategory}
                className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
              >
                <Plus className="inline-block w-4 h-4 mr-1" />
                Crear
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {cLoading
                ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-lg shimmer" />)
                : categories.map((c) => (
                    <div key={c._id || c.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] p-3">
                      {editingCat && (editingCat._id||editingCat.id) === (c._id||c.id) ? (
                        <input
                          value={catName}
                          onChange={(e) => setCatName(e.target.value)}
                          className="h-10 flex-1 rounded-md border border-white/20 bg-white/10 px-3 outline-none transition focus:border-[#e50914]"
                        />
                      ) : (
                        <div className="text-sm">{c.name}</div>
                      )}

                      <div className="flex items-center gap-2">
                        {editingCat && (editingCat._id||editingCat.id) === (c._id||c.id) ? (
                          <>
                            <button onClick={saveEditCat} className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20">
                              Guardar
                            </button>
                            <button onClick={() => { setEditingCat(null); setCatName(""); }} className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20">
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditCat(c)} className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteCategory(c)} className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
            </div>

            {!cLoading && categories.length === 0 && (
              <div className="mt-12 text-center opacity-70">Sin categorías.</div>
            )}
          </div>
        )}

        {/* ---------- USERS ---------- */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={uFilter.role}
                onChange={(e) => setUFilter((s) => ({ ...s, role: e.target.value }))}
                className="rounded-md border border-white/15 bg-white/5 px-2 py-2 outline-none"
              >
                <option className="bg-black" value="all">Todos</option>
                <option className="bg-black" value="user">Usuarios</option>
                <option className="bg-black" value="admin">Admins</option>
              </select>
              <input
                placeholder="Buscar por email/nombre..."
                value={uFilter.q}
                onChange={(e) => setUFilter((s) => ({ ...s, q: e.target.value }))}
                className="h-10 w-64 rounded-md border border-white/20 bg-white/10 px-3 outline-none transition focus:border-[#e50914]"
              />
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {uLoading
                ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 rounded-lg shimmer" />)
                : users.map((u) => (
                    <div key={u._id || u.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] p-3">
                      <div>
                        <div className="text-sm font-medium">{u.name || u.email}</div>
                        <div className="text-xs opacity-70">
                          Rol: <span className="capitalize">{u.role}</span>
                          {u.suspended ? " · Suspendido" : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRole(u, u.role === "admin" ? "user" : "admin")}
                          className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20"
                          title="Cambiar rol"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        {u.suspended ? (
                          <button
                            onClick={() => suspend(u, false)}
                            className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20"
                            title="Reactivar"
                          >
                            <Undo2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => suspend(u, true)}
                            className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20"
                            title="Suspender"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteUser(u)}
                          className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20"
                          title="Configurar"
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
            </div>

            {!uLoading && users.length === 0 && (
              <div className="mt-12 text-center opacity-70">No hay usuarios que coincidan.</div>
            )}
          </div>
        )}
      </main>

      {/* ----- Modal Crear/Editar Título ----- */}
      {titleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70"
            style={{ animation: "overlayIn 220ms ease both" }}
            onClick={() => setTitleModalOpen(false)}
          />
          <div
            className="relative w-[22rem] md:w-[36rem] rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-md"
            style={{ animation: "modalIn 220ms ease both" }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="font-semibold">{editing ? "Editar título" : "Crear título"}</div>
              <button
                onClick={() => setTitleModalOpen(false)}
                className="h-9 w-9 rounded-full border border-white/20 text-xl leading-none opacity-80 transition hover:opacity-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitTitle} className="px-6 py-5">
              {/* Tipo */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-sm opacity-80 mr-2">Tipo:</span>
                {TYPES.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => onTitleType(t.value)}
                    className={`rounded-md px-3 py-1.5 text-sm ${
                      form.type === t.value ? "border border-white/60 bg-white/10" : "border border-white/15 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {t.label}
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
                    onChange={onTitleInput}
                    required
                    className="w-full h-11 rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                  />
                </div>
                <div>
                  <input
                    name="author"
                    placeholder="Autor / Director"
                    value={form.author}
                    onChange={onTitleInput}
                    className="w-full h-11 rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                  />
                </div>
                <div>
                  <input
                    name="year"
                    type="number"
                    placeholder="Año"
                    value={form.year}
                    onChange={onTitleInput}
                    className="w-full h-11 rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                  />
                </div>
                <div>
                  <select
                    name="genre"
                    value={form.genre}
                    onChange={onTitleInput}
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
                    onChange={onTitleInput}
                    rows={4}
                    className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                  />
                </div>

                {/* Imagen: archivo o URL */}
                <div className="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="flex cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed border-white/25 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0];
                      setFile(f || null);
                      setPreview(f ? URL.createObjectURL(f) : "");
                    }} />
                    <UploadIcon className="w-5 h-5" />
                    <span className="text-sm">Subir imagen (archivo)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 opacity-70" />
                    <input
                      name="imageUrl"
                      placeholder="o pega URL de la imagen"
                      value={form.imageUrl}
                      onChange={onTitleInput}
                      onBlur={() => { if (form.imageUrl) { setPreview(form.imageUrl); setFile(null); } }}
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

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTitleModalOpen(false)}
                  className="rounded-md border border-white/20 bg-white/5 px-4 py-2 transition hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#e50914] px-5 py-2 font-semibold transition hover:bg-[#f6121d] hover:shadow-[0_8px_24px_rgba(229,9,20,0.35)]"
                >
                  {editing ? "Guardar cambios" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buscador reutilizable */}
      {showSearch && <NetflixSearch onClose={() => setShowSearch(false)} />}
    </div>
  );
}
