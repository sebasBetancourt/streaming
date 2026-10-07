import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Search as SearchIcon,
  Filter,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Shield,
  Ban,
  Undo2,
  Image as ImageIcon,
  Star,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";
import type { Category } from "@/entities/categories";
import type { Review } from "@/entities/reviews";
import { mapTitle, type TitleEntity, type TitleStatus, type TitleType } from "@/entities/titles";
import type { Role, UserProfile } from "@/entities/users";
import { getMetrics, deleteUser as deleteUserApi, listUsers, setUserBanned, setUserRole, type Metrics } from "@/shared/api/admin";
import { createCategory as createCategoryApi, deleteCategory as deleteCategoryApi, listCategories, renameCategory } from "@/shared/api/categories";
import { deleteReview as deleteReviewApi, listReviews } from "@/shared/api/reviews";
import { adminListTitles, approveTitle as approveTitleApi, createTitle, deleteTitle as deleteTitleApi, rejectTitle as rejectTitleApi, setTitleEmbed, updateTitle } from "@/shared/api/titles";
import NetflixSearch from "@/shared/components/Search/Search";
import CatalogSyncPanel from "../components/CatalogSyncPanel";
import { useDebounce } from "@/shared/hooks/useDebounce";

type Tab = "overview" | "titles" | "catalog" | "reviews" | "categories" | "users";

const TABS: [Tab, string][] = [
  ["overview", "Resumen"],
  ["titles", "Títulos"],
  ["catalog", "Catálogo"],
  ["reviews", "Reseñas"],
  ["categories", "Categorías"],
  ["users", "Usuarios"],
];

const TYPES: { label: string; value: TitleType }[] = [
  { label: "Película", value: "movie" },
  { label: "Serie", value: "tv" },
  { label: "Anime", value: "anime" },
];

const STATUSES: TitleStatus[] = ["pending", "approved", "rejected"];

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

interface TitleForm {
  type: TitleType;
  title: string;
  description: string;
  author: string;
  year: string;
  categoryId: string;
  seasons: string;
  episodes: string;
  imageUrl: string;
  embedUrl: string;
}

const emptyForm: TitleForm = {
  type: "movie", title: "", description: "", author: "", year: "", categoryId: "", seasons: "", episodes: "", imageUrl: "", embedUrl: "",
};

// ====================== Admin Page ======================
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [showSearch, setShowSearch] = useState(false);
  const [notice, setNotice] = useState("");

  const { logout } = useAuth();
  const navigate = useNavigate();
  const fail = (e: unknown) => {
    console.error(e);
    setNotice(errMsg(e));
  };

  // ---- Overview (métricas) ----
  const [metrics, setMetrics] = useState<Metrics>({ users: 0, titles: 0, reviews: 0, pending: 0 });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // ---- Titles (aprobación / edición / creación) ----
  const [tFilter, setTFilter] = useState<{ type: TitleType; status: TitleStatus }>({ type: "movie", status: "pending" });
  const [titles, setTitles] = useState<TitleEntity[]>([]);
  const [tLoading, setTLoading] = useState(true);
  const [busyTitleId, setBusyTitleId] = useState<string | null>(null);

  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [editing, setEditing] = useState<TitleEntity | null>(null);
  const [form, setForm] = useState<TitleForm>(emptyForm);
  const [preview, setPreview] = useState("");

  // ---- Reviews ----
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rLoading, setRLoading] = useState(true);

  // ---- Categories ----
  const [categories, setCategories] = useState<Category[]>([]);
  const [cLoading, setCLoading] = useState(true);
  const [newCat, setNewCat] = useState("");
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");

  // ---- Users ----
  const [uFilter, setUFilter] = useState<{ role: "all" | Role; q: string }>({ role: "all", q: "" });
  const debouncedQ = useDebounce(uFilter.q, 300);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [uLoading, setULoading] = useState(true);

  // ====================== Fetchers ======================
  async function fetchMetrics() {
    try {
      setLoadingMetrics(true);
      setMetrics(await getMetrics());
    } catch (e) {
      fail(e);
    } finally {
      setLoadingMetrics(false);
    }
  }

  async function fetchTitles() {
    try {
      setTLoading(true);
      const page = await adminListTitles({ type: tFilter.type, status: tFilter.status, limit: 24 });
      setTitles(page.items.map(mapTitle));
    } catch (e) {
      fail(e);
      setTitles([]);
    } finally {
      setTLoading(false);
    }
  }

  async function fetchReviews() {
    try {
      setRLoading(true);
      setReviews(await listReviews({ limit: 20 }));
    } catch (e) {
      fail(e);
      setReviews([]);
    } finally {
      setRLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      setCLoading(true);
      setCategories(await listCategories({ limit: 100 }));
    } catch (e) {
      fail(e);
      setCategories([]);
    } finally {
      setCLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      setULoading(true);
      const page = await listUsers({ limit: 50, search: debouncedQ || undefined });
      setUsers(page.items);
    } catch (e) {
      fail(e);
      setUsers([]);
    } finally {
      setULoading(false);
    }
  }

  useEffect(() => { void fetchMetrics(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (tab === "titles") void fetchTitles(); }, [tab, tFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (tab === "reviews") void fetchReviews(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (tab === "categories" || (tab === "titles" && categories.length === 0)) void fetchCategories(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (tab === "users") void fetchUsers(); }, [tab, debouncedQ]); // eslint-disable-line react-hooks/exhaustive-deps

  // ====================== Actions ======================
  async function changeStatus(it: TitleEntity, status: "approved" | "rejected") {
    try {
      setBusyTitleId(it.id);
      await (status === "approved" ? approveTitleApi(it.id) : rejectTitleApi(it.id));
      setTitles((arr) => arr.filter((x) => x.id !== it.id)); // ya no cumple el filtro actual
      void fetchMetrics();
    } catch (e) {
      fail(e);
    } finally {
      setBusyTitleId(null);
    }
  }
  const approveTitle = (it: TitleEntity) => changeStatus(it, "approved");
  const rejectTitle = (it: TitleEntity) => changeStatus(it, "rejected");

  async function deleteTitle(it: TitleEntity) {
    if (!confirm("¿Eliminar este título? También se borrarán sus reseñas.")) return;
    try {
      setBusyTitleId(it.id);
      await deleteTitleApi(it.id);
      setTitles((arr) => arr.filter((x) => x.id !== it.id));
      void fetchMetrics();
    } catch (e) {
      fail(e);
    } finally {
      setBusyTitleId(null);
    }
  }

  function openCreateTitle() {
    setEditing(null);
    setForm(emptyForm);
    setPreview("");
    setTitleModalOpen(true);
  }
  function openEditTitle(it: TitleEntity) {
    setEditing(it);
    setForm({
      type: it.type,
      title: it.title,
      description: it.description,
      author: it.author === "Desconocido" ? "" : it.author,
      year: it.year ? String(it.year) : "",
      categoryId: it.categoryIds[0] ?? "",
      seasons: it.seasons ? String(it.seasons) : "",
      episodes: it.episodes ? String(it.episodes) : "",
      imageUrl: it.posterUrl ?? "",
      embedUrl: it.embedUrl ?? "",
    });
    setPreview(it.posterUrl ?? "");
    setTitleModalOpen(true);
  }
  function onTitleInput(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }
  function onTitleType(t: TitleType) {
    setForm((s) => ({ ...s, type: t }));
  }

  async function submitTitle(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return alert("El título es requerido");
    if (!form.categoryId) return alert("Selecciona un género");
    if (!form.year) return alert("El año es requerido");
    const isSeries = form.type !== "movie";
    try {
      if (editing) {
        await updateTitle(editing.id, {
          type: form.type,
          title: form.title.trim(),
          description: form.description.trim() || "Sin descripción",
          author: form.author.trim() || "Desconocido",
          year: Number(form.year),
          categoriesIds: [form.categoryId],
          posterUrl: form.imageUrl.trim() || null,
          seasons: isSeries ? Number(form.seasons) || 1 : null,
          episodes: isSeries ? Number(form.episodes) || 1 : null,
        });
        const embed = form.embedUrl.trim() || null;
        if (embed !== editing.embedUrl) await setTitleEmbed(editing.id, embed);
      } else {
        const created = await createTitle({
          type: form.type,
          title: form.title.trim(),
          description: form.description.trim() || "Sin descripción",
          author: form.author.trim() || "Desconocido",
          year: Number(form.year),
          categoriesIds: [form.categoryId],
          ...(form.imageUrl.trim() && { posterUrl: form.imageUrl.trim() }),
          ...(isSeries && { seasons: Number(form.seasons) || 1, episodes: Number(form.episodes) || 1 }),
        });
        if (form.embedUrl.trim()) await setTitleEmbed(created.id, form.embedUrl.trim());
      }
      setTitleModalOpen(false);
      void fetchTitles();
      void fetchMetrics();
    } catch (e2) {
      fail(e2);
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("¿Eliminar esta reseña?")) return;
    try {
      await deleteReviewApi(id);
      setReviews((arr) => arr.filter((r) => r.id !== id));
      void fetchMetrics();
    } catch (e) {
      fail(e);
    }
  }

  async function createCategory() {
    if (!newCat.trim()) return;
    try {
      const created = await createCategoryApi(newCat.trim());
      setCategories((arr) => [created, ...arr]);
      setNewCat("");
    } catch (e) {
      fail(e);
    }
  }
  function startEditCat(cat: Category) {
    setEditingCat(cat);
    setCatName(cat.name);
  }
  async function saveEditCat() {
    if (!editingCat || !catName.trim()) return;
    try {
      const updated = await renameCategory(editingCat.id, catName.trim());
      setCategories((arr) => arr.map((c) => (c.id === updated.id ? updated : c)));
      setEditingCat(null);
      setCatName("");
    } catch (e) {
      fail(e);
    }
  }
  async function deleteCategory(cat: Category) {
    if (!confirm("¿Eliminar categoría? Se quitará de los títulos que la usan.")) return;
    try {
      await deleteCategoryApi(cat.id);
      setCategories((arr) => arr.filter((c) => c.id !== cat.id));
    } catch (e) {
      fail(e);
    }
  }

  async function setRole(user: UserProfile, role: Role) {
    try {
      const updated = await setUserRole(user.id, role);
      setUsers((arr) => arr.map((u) => (u.id === user.id ? updated : u)));
    } catch (e) {
      fail(e);
    }
  }
  async function suspend(user: UserProfile, banned: boolean) {
    try {
      const updated = await setUserBanned(user.id, banned);
      setUsers((arr) => arr.map((u) => (u.id === user.id ? updated : u)));
    } catch (e) {
      fail(e);
    }
  }
  async function deleteUser(user: UserProfile) {
    if (!confirm("¿Eliminar usuario? También se borrarán sus reseñas.")) return;
    try {
      await deleteUserApi(user.id);
      setUsers((arr) => arr.filter((u) => u.id !== user.id));
      void fetchMetrics();
    } catch (e) {
      fail(e);
    }
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

        {notice && (
          <div className="mt-3 flex items-center justify-between rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Cerrar aviso"><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {TABS.map(([key, label]) => (
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
                {STATUSES.map((st) => (
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
                          backgroundImage: it.image ? `url(${it.image})` : "linear-gradient(180deg,#222,#111)",
                          backgroundSize: "cover",
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0">
                        <div className="h-20 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="px-2 pb-2">
                          <div className="line-clamp-1 text-sm">{it.title}</div>
                          <div className="text-[11px] opacity-60">
                            {it.year ? `${it.year} · ` : ""}{it.categories[0] ?? it.type}
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
                              {it.description}
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
                                  onClick={() => void approveTitle(it)}
                                  disabled={busyTitleId === it.id}
                                  className="pointer-events-auto rounded-full border border-white/20 bg-green-600/20 p-2 transition hover:bg-green-600/30"
                                  title="Aprobar"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {it.status !== "rejected" && (
                                <button
                                  onClick={() => void rejectTitle(it)}
                                  disabled={busyTitleId === it.id}
                                  className="pointer-events-auto rounded-full border border-white/20 bg-red-600/20 p-2 transition hover:bg-red-600/30"
                                  title="Rechazar"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => void deleteTitle(it)}
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

        {tab === "catalog" && <CatalogSyncPanel />}

        {/* ---------- REVIEWS ---------- */}
        {tab === "reviews" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm opacity-70">
              <Filter className="w-4 h-4" /> Últimas reseñas
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {rLoading
                ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 rounded-lg shimmer" />)
                : reviews.map((r) => (
                    <div key={r.id} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="text-sm font-semibold line-clamp-1">{r.title || "Reseña"} <span className="font-normal opacity-60">· {r.titleRef.title}</span></div>
                        <div className="text-xs opacity-60">{new Date(r.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-xs opacity-80 line-clamp-2">{r.comment ?? ""}</div>
                      <div className="mt-2 flex items-center gap-3 text-xs opacity-80">
                        <div className="flex items-center gap-1"><Star className="w-3 h-3" /> {r.score}/5</div>
                        <div className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {r.likesCount}</div>
                        <div className="flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> {r.dislikesCount}</div>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            onClick={() => void deleteReview(r.id)}
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
                onClick={() => void createCategory()}
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
                    <div key={c.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] p-3">
                      {editingCat?.id === c.id ? (
                        <input
                          value={catName}
                          onChange={(e) => setCatName(e.target.value)}
                          className="h-10 flex-1 rounded-md border border-white/20 bg-white/10 px-3 outline-none transition focus:border-[#e50914]"
                        />
                      ) : (
                        <div className="text-sm">{c.name}</div>
                      )}

                      <div className="flex items-center gap-2">
                        {editingCat?.id === c.id ? (
                          <>
                            <button onClick={() => void saveEditCat()} className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20">
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
                            <button onClick={() => void deleteCategory(c)} className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20">
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
                onChange={(e) => setUFilter((s) => ({ ...s, role: e.target.value as "all" | Role }))}
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
                    <div key={u.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] p-3">
                      <div>
                        <div className="text-sm font-medium">{u.name || u.email}</div>
                        <div className="text-xs opacity-70">
                          Rol: <span className="capitalize">{u.role}</span>
                          {u.banned ? " · Bloqueado" : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => void setRole(u, u.role === "admin" ? "user" : "admin")}
                          className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20"
                          title="Cambiar rol"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        {u.banned ? (
                          <button
                            onClick={() => void suspend(u, false)}
                            className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20"
                            title="Reactivar"
                          >
                            <Undo2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => void suspend(u, true)}
                            className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20"
                            title="Suspender"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => void deleteUser(u)}
                          className="rounded-md border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
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

            <form onSubmit={(e) => void submitTitle(e)} className="px-6 py-5">
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
                    name="categoryId"
                    value={form.categoryId}
                    onChange={onTitleInput}
                    className="w-full h-11 rounded-md border border-white/20 bg-white/10 px-3 text-white outline-none transition focus:border-[#e50914]"
                  >
                    <option className="bg-black" value="">Selecciona género</option>
                    {categories.map((c) => (
                      <option className="bg-black" key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {form.type !== "movie" && (
                  <>
                    <input name="seasons" type="number" min={1} placeholder="Temporadas" value={form.seasons} onChange={onTitleInput} className="w-full h-11 rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]" />
                    <input name="episodes" type="number" min={1} placeholder="Episodios" value={form.episodes} onChange={onTitleInput} className="w-full h-11 rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]" />
                  </>
                )}
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

                {/* Imagen por URL */}
                <div className="md:col-span-2 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 opacity-70" />
                  <input
                    name="imageUrl"
                    type="url"
                    placeholder="URL de la imagen (https://…)"
                    value={form.imageUrl}
                    onChange={onTitleInput}
                    onBlur={() => setPreview(form.imageUrl)}
                    className="w-full h-11 rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                  />
                </div>

                {/* URL del reproductor embebido */}
                <div className="md:col-span-2">
                  <input
                    name="embedUrl"
                    type="url"
                    placeholder="URL del reproductor (embed)"
                    value={form.embedUrl}
                    onChange={onTitleInput}
                    className="w-full h-11 rounded-md border border-white/20 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                  />
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
      {showSearch && <NetflixSearch onClose={() => setShowSearch(false)} onSelect={() => setShowSearch(false)} />}
    </div>
  );
}
