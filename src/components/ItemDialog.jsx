import React, { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Play, Plus, Check, Heart, X } from "lucide-react";
import { useShelfItem } from "../hooks/useLocalShelf";
import { useBodyScrollLock } from "../hooks/useScrollLock";

export default function ItemDialog({ user ,open, onClose, item, suggestions = [] }) {
  // bloquear fondo (sin tocar tu layout)
  useBodyScrollLock(!!open);

  const usuarioData = {
    "nombre": "Santiago Bernabeu",
     "ranking": 5.0,
     "comentarios": [
      "Me parece una buen Series muy entretenida 100% recomendada",
      "Muy buena calidad 10/10  "
     ]
  }


  // hooks estables
  const boxRef = useRef(null);
  const closeBtnRef = useRef(null);
  const { inList, isFav, toggleList, toggleFav } = useShelfItem(item || {});

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Tab") {
        const fEls = boxRef.current?.querySelectorAll(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
        );
        if (!fEls?.length) return;
        const list = Array.from(fEls);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    };
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);
    document.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); document.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  const isTV = (item?.type || "").toLowerCase() === "tv";
  const episodes = useMemo(
    () => (isTV
      ? Array.from({ length: 6 }).map((_, i) => ({
          id: `ep-${i + 1}`,
          title: `Episodio ${i + 1}`,
          length: ["42m", "50m", "47m"][i % 3],
          thumb: item?.image
        }))
      : []),
    [isTV, item?.image]
  );

  if (!open || !item) return null;

  const { title, image, year, rating, duration, description, type, genres = [] } = item;
  const match = rating ? `${Math.round(parseFloat(rating) * 10)}% Match` : null;

  const modal = (
    <div className="fixed inset-0 z-[100]">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      {/* caja modal */}
      <div
        ref={boxRef}
        className="relative mx-auto mt-12 w-[94vw] max-w-5xl max-h-[86vh] grid grid-rows-[auto_1fr] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalles de ${title}`}
      >
        {/* Header con imagen (fila 1) */}
        <div className="relative h-56 w-full md:h-80">
          <div className="absolute inset-0 bg-center" style={{ backgroundImage: `url(${image})`, backgroundSize: "cover" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/55 p-2 opacity-90 outline-none transition hover:bg-black/75 focus-visible:ring-2"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-semibold md:text-2xl">{title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs md:text-sm">
              {match && <span className="font-semibold text-emerald-400">{match}</span>}
              {year && <span className="rounded border border-white/20 px-1">{year}</span>}
              {duration && <span className="opacity-80">{duration}</span>}
              {type && <span className="rounded border border-white/20 px-1 capitalize">{type}</span>}
              {!!genres.length && <span className="opacity-70">· {genres.slice(0, 3).join(", ")}</span>}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button className="rounded-md bg-white px-4 py-2 font-semibold text-black transition hover:bg-gray-200">
                <span className="flex items-center gap-2"><Play className="h-4 w-4" /> Reproducir</span>
              </button>
              <button
                onClick={toggleList}
                className="rounded-full border border-white/25 bg-white/10 p-2 transition hover:bg-white/20"
                title={inList ? "Quitar de Mi Lista" : "Añadir a Mi Lista"}
              >
                {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
              <button
                onClick={toggleFav}
                className={`rounded-full border p-2 transition ${isFav ? "border-red-500/60 bg-red-600/30 hover:bg-red-600/40" : "border-white/25 bg-white/10 hover:bg-white/20"}`}
                title={isFav ? "Quitar de Favoritos" : "Añadir a Favoritos"}
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cuerpo scrollable (fila 2) */}
        <div className="overflow-y-auto p-5 md:p-7">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Columna principal */}
            <div className="md:col-span-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold opacity-90">User</h3>
              </div>
              <h4 className="mb-2 text-sm font-semibold opacity-90">Descripción</h4>
              <p className="text-sm opacity-80">
                {description || "Sinopsis de ejemplo. Conecta tu backend para traer la descripción real."}
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-xs opacity-70">Puntuación media</div>
                  <div className="mt-1 text-lg font-semibold">{rating || "—"}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-xs opacity-70">Ranking ponderado</div>
                  <div className="mt-1 text-lg font-semibold">—</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-xs opacity-70">Likes / Dislikes</div>
                  <div className="mt-1 text-lg font-semibold">—</div>
                </div>
              </div>

              {isTV && (
                <div className="mt-6">
                  <h4 className="mb-2 text-sm font-semibold opacity-90">Episodios</h4>
                  <ul className="space-y-2">
                    {episodes.map((ep) => (
                      <li key={ep.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-2">
                        <div className="h-14 w-24 flex-none overflow-hidden rounded bg-center" style={{ backgroundImage: `url(${ep.thumb})`, backgroundSize: "cover" }} />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{ep.title}</div>
                          <div className="text-xs opacity-70">{ep.length}</div>
                        </div>
                        <button className="ml-auto rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs transition hover:bg-white/20">
                          Reproducir
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <h4 className="mb-2 text-sm font-semibold opacity-90">Detalles</h4>
              <ul className="space-y-1 text-sm opacity-80">
                <li><span className="opacity-60">Título:</span> {title}</li>
                {year && <li><span className="opacity-60">Año:</span> {year}</li>}
                {type && <li><span className="opacity-60">Tipo:</span> {type}</li>}
                {!!genres.length && <li><span className="opacity-60">Géneros:</span> {genres.join(", ")}</li>}
              </ul>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={toggleList} className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20">
                  {inList ? "En Mi Lista" : "Añadir a Mi Lista"}
                </button>
                <button onClick={toggleFav} className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20">
                  {isFav ? "En Favoritos" : "Añadir a Favoritos"}
                </button>
              </div>

              {suggestions?.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-2 text-sm font-semibold opacity-90">Más como esto</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestions.slice(0, 4).map((s) => (
                      <div key={s.id} className="overflow-hidden rounded border border-white/10 bg-white/[0.04]">
                        <div className="h-20 w-full bg-center" style={{ backgroundImage: `url(${s.image})`, backgroundSize: "cover" }} />
                        <div className="p-2 text-xs">
                          <div className="line-clamp-1 font-medium">{s.title}</div>
                          <div className="opacity-70">{s.year || s.duration || ""}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
