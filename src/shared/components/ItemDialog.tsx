import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Heart, HeartOff, Play, Plus, Star, ThumbsDown, ThumbsUp, Users, X } from "lucide-react";
import { useShelfItem } from "@/app/providers/ShelfContext";
import { mapTitle, type TitleEntity } from "@/entities/titles";
import type { Review } from "@/entities/reviews";
import { createReview, dislikeReview, getRanking, likeReview, listReviews } from "@/shared/api/reviews";
import { getTitle } from "@/shared/api/titles";
import { useBodyScrollLock } from "@/shared/hooks/useScrollLock";
import NetflixPlayerModal from "./NetflixPlayer";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 cursor-pointer transition-colors ${value >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  item: TitleEntity | null;
  suggestions?: TitleEntity[];
}

export default function ItemDialog({ open, onClose, item, suggestions = [] }: Props) {
  useBodyScrollLock(open);

  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [starRating, setStarRating] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [formError, setFormError] = useState("");
  const [fullItem, setFullItem] = useState<TitleEntity | null>(item);
  const [ranking, setRanking] = useState(0);

  const boxRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const { inList, isFav, toggleList, toggleFav } = useShelfItem(fullItem?.id);

  const itemId = item?.id;

  const loadReviews = async (id: string) => {
    try {
      setReviews(await listReviews({ titleId: id, limit: 50 }));
    } catch (err) {
      console.error("Error cargando comentarios:", err);
    }
  };

  // Al abrir: trae el título completo, sus reseñas y el ranking ponderado.
  useEffect(() => {
    if (!open || !itemId) return;
    let cancelled = false;
    setFullItem(item);
    setFormError("");

    getTitle(itemId)
      .then((t) => !cancelled && setFullItem(mapTitle(t)))
      .catch((err) => console.error("Error cargando item completo:", err));
    listReviews({ titleId: itemId, limit: 50 })
      .then((r) => !cancelled && setReviews(r))
      .catch((err) => console.error("Error cargando comentarios:", err));
    getRanking(itemId)
      .then((r) => !cancelled && setRanking(r))
      .catch((err) => console.error("Error cargando ranking:", err));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, itemId]);

  const handleAddComment = async () => {
    if (!fullItem) return;
    if (!reviewTitle.trim() || !comment.trim() || starRating === 0) {
      setFormError("Escribe un título, un comentario y elige una calificación.");
      return;
    }
    try {
      await createReview({ title: reviewTitle.trim(), comment: comment.trim(), score: starRating, titleId: fullItem.id });
      setComment("");
      setReviewTitle("");
      setStarRating(0);
      setFormError("");
      await loadReviews(fullItem.id);
      getRanking(fullItem.id).then(setRanking).catch(() => undefined);
      getTitle(fullItem.id).then((t) => setFullItem(mapTitle(t))).catch(() => undefined);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo enviar el comentario");
    }
  };

  const react = async (reviewId: string, kind: "like" | "dislike") => {
    try {
      const updated = await (kind === "like" ? likeReview(reviewId) : dislikeReview(reviewId));
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, likesCount: updated.likesCount, dislikesCount: updated.dislikesCount } : r)),
      );
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo registrar tu reacción");
    }
  };

  // Escape para cerrar y trampa de foco con Tab
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusables = boxRef.current?.querySelectorAll<HTMLElement>(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
        );
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const isTV = fullItem?.type === "tv";
  const episodes = useMemo(
    () =>
      isTV
        ? Array.from({ length: 6 }).map((_, i) => ({
            id: `ep-${i + 1}`,
            title: `Episodio ${i + 1}`,
            length: ["42m", "50m", "47m"][i % 3],
            thumb: fullItem?.image,
          }))
        : [],
    [isTV, fullItem?.image],
  );

  if (!open || !fullItem) return null;

  const { title, backdrop, year, ratingAvg, duration, description, type, categories, creator, author, likes, dislikes, embedUrl, quality } = fullItem;
  const rating = parseFloat(ratingAvg);
  const match = rating > 0 ? `${Math.round(rating * 10)}% Match` : null;

  const modal = (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        ref={boxRef}
        className="relative mx-auto mt-12 grid max-h-[86vh] w-[94vw] max-w-5xl grid-rows-[auto_1fr] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalles de ${title}`}
      >
        <div className="relative h-56 w-full md:h-80">
          <div className="absolute inset-0 bg-center" style={{ backgroundImage: backdrop ? `url(${backdrop})` : undefined, backgroundSize: "cover" }} />
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
              <span className="rounded border border-white/20 px-1 capitalize">{type}</span>
              {quality && <span className="rounded border border-white/20 px-1">{quality}</span>}
              {categories.length > 0 && <span className="opacity-70">· {categories.slice(0, 3).join(", ")}</span>}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => embedUrl && setPlayerUrl(embedUrl)}
                disabled={!embedUrl}
                className="rounded-md bg-white px-4 py-2 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <Play className="h-4 w-4" /> {embedUrl ? "Reproducir" : "No disponible"}
                </span>
              </button>
              <button
                onClick={() => void toggleList()}
                className={`rounded-full border border-gray-600 p-2 text-white transition-colors hover:bg-gray-700 ${inList ? "bg-green-600" : "bg-gray-800/80"}`}
                title={inList ? "Quitar de Mi Lista" : "Añadir a Mi Lista"}
              >
                {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
              <button
                onClick={() => void toggleFav()}
                className={`rounded-full border p-2 transition ${isFav ? "border-red-500/60 bg-red-600 hover:bg-red-600/40" : "border-gray-600 bg-gray-800/80 hover:bg-gray-700"}`}
                title={isFav ? "Quitar de Favoritos" : "Añadir a Favoritos"}
              >
                {isFav ? <Heart className="h-4 w-4 fill-current" /> : <HeartOff className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto p-5 md:p-7">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="flex">
                <h3 className="mb-2 mr-2 text-sm font-semibold opacity-90">Usuario/Creador:</h3>
                <span className="text-sm opacity-70">{creator}</span>
              </div>
              <h4 className="mb-2 text-sm font-semibold opacity-90">Descripción</h4>
              <p className="text-sm opacity-80">{description || "Sin descripción disponible."}</p>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-xs opacity-70">Puntuación media</div>
                  <div className="mt-1 text-lg font-semibold">{rating > 0 ? ratingAvg : "—"}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-xs opacity-70">Ranking ponderado</div>
                  <div className="mt-1 text-lg font-semibold">{ranking.toFixed(1)}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-xs opacity-70">Likes / Dislikes</div>
                  <div className="mt-1 text-lg font-semibold">
                    {likes} / {dislikes}
                  </div>
                </div>
              </div>

              {isTV && (
                <div className="mt-6">
                  <h4 className="mb-2 text-sm font-semibold opacity-90">Episodios</h4>
                  <ul className="space-y-2">
                    {episodes.map((ep) => (
                      <li key={ep.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-2">
                        <div className="h-14 w-24 flex-none overflow-hidden rounded bg-center" style={{ backgroundImage: ep.thumb ? `url(${ep.thumb})` : undefined, backgroundSize: "cover" }} />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{ep.title}</div>
                          <div className="text-xs opacity-70">{ep.length}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold opacity-90">Detalles</h4>
              <ul className="space-y-1 text-sm opacity-80">
                <li><span className="opacity-60">Título:</span> {title}</li>
                {year && <li><span className="opacity-60">Año:</span> {year}</li>}
                <li><span className="opacity-60">Tipo:</span> {type}</li>
                {categories.length > 0 && <li><span className="opacity-60">Géneros:</span> {categories.join(", ")}</li>}
                <li><span className="opacity-60">Autor:</span> {author}</li>
              </ul>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => void toggleList()} className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20">
                  {inList ? "En Mi Lista" : "Añadir a Mi Lista"}
                </button>
                <button onClick={() => void toggleFav()} className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20">
                  {isFav ? "En Favoritos" : "Añadir a Favoritos"}
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-2 text-sm font-semibold opacity-90">Más como esto</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestions.slice(0, 4).map((s) => (
                      <div key={s.id} className="overflow-hidden rounded border border-white/10 bg-white/[0.04]">
                        <div className="h-20 w-full bg-center" style={{ backgroundImage: s.image ? `url(${s.image})` : undefined, backgroundSize: "cover" }} />
                        <div className="p-2 text-xs">
                          <div className="line-clamp-1 font-medium">{s.title}</div>
                          <div className="opacity-70">{s.year ?? s.duration}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 bg-neutral-900 pr-4 text-white md:col-span-3">
              <div className="mb-3 flex items-center space-x-2">
                <h3 className="text-lg font-semibold">Comentarios</h3>
                <Users className="mr-8 h-5 w-5" />
                <StarRating value={starRating} onChange={setStarRating} />
              </div>

              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Escribe el título"
                  value={reviewTitle}
                  maxLength={100}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="mt-4 w-80 max-w-full rounded border border-neutral-700 bg-neutral-800 p-2"
                />
                <textarea
                  placeholder="Escribe tu comentario..."
                  value={comment}
                  maxLength={500}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-1 w-80 max-w-full rounded border border-neutral-700 bg-neutral-800 p-2"
                />
                {formError && <p className="text-sm text-red-400">{formError}</p>}
                <button
                  onClick={() => void handleAddComment()}
                  className="mt-1 w-80 max-w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Enviar
                </button>
              </div>

              <div className="mt-2 flex w-full flex-wrap gap-4">
                {reviews.length === 0 && <p className="mt-4 text-sm opacity-60">Aún no hay comentarios. ¡Sé el primero!</p>}
                {reviews.map((c) => (
                  <div
                    key={c.id}
                    className="mt-5 flex w-full max-w-[300px] flex-col rounded-lg border border-neutral-700 bg-neutral-800 p-3 sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.5rem)] lg:w-[600px]"
                  >
                    <h2 className="text-lg font-semibold">{c.title}</h2>
                    <span className="text-sm italic">{c.user.name}</span>

                    <div className="mt-1 flex w-full items-center justify-between">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-4 w-4 ${c.score >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-500"}`} />
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => void react(c.id, "like")} className="flex items-center gap-1" aria-label="Me gusta">
                          <ThumbsUp className="h-4 w-4 cursor-pointer text-gray-300" />
                          <span className="text-xs">{c.likesCount}</span>
                        </button>
                        <button onClick={() => void react(c.id, "dislike")} className="flex items-center gap-1" aria-label="No me gusta">
                          <ThumbsDown className="h-4 w-4 cursor-pointer text-gray-300" />
                          <span className="text-xs">{c.dislikesCount}</span>
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 break-words text-sm opacity-80">{c.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {playerUrl && <NetflixPlayerModal url={playerUrl} onClose={() => setPlayerUrl(null)} />}
    </div>
  );

  return createPortal(modal, document.body);
}
