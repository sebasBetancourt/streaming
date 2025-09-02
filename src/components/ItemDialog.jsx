import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Play,
  Plus,
  Check,
  Heart,
  X,
  Star,
  Users,
  ThumbsUp,
  ThumbsDown,
  HeartOff,
} from "lucide-react";
import axios from "axios";
import { useShelfItem } from "../hooks/useLocalShelf";
import { useBodyScrollLock } from "../hooks/useScrollLock";

export default function ItemDialog({
  user,
  open,
  onClose,
  item,
  suggestions = [],
}) {
  useBodyScrollLock(!!open);

  const [starRating, setStarRating] = useState(0);

  const StarRating = ({ starRating, setStarRating }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              starRating >= star
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-400"
            }`}
            onClick={() => setStarRating(star)}
            onMouseEnter={(e) =>
              e.currentTarget.classList.add("text-yellow-300")
            }
            onMouseLeave={(e) =>
              e.currentTarget.classList.remove("text-yellow-300")
            }
          />
        ))}
      </div>
    );
  };

  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [titulo, setTitulo] = useState("");
  const [fullItem, setFullItem] = useState(item);
  const [ranking, setRanking] = useState(0);

  // función para cargar comentarios
  const fetchComments = async (titleId) => {
    try {
      const { data } = await axios.get(
        `http://localhost:3000/reviews/list?titleId=${titleId}`
      );
      setComments(data || []);
    } catch (err) {
      console.error("Error cargando comentarios:", err);
    }
  };

  useEffect(() => {
    if (!open || !item) return;

    const fetchFullItem = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3000/titles/${item.id}`
        );
        setFullItem({
          ...data,
          id: data._id,
          image: data.posterUrl,
          posterUrl: data.posterUrl,
          rating: data.ratingAvg?.toFixed(1) || "0.0",
          duration:
            data.type === "tv" || data.type === "anime"
              ? `${data.temps || 1} Temp / ${data.eps || 1} eps`
              : "Película",
          genres: data.categories || [],
          author: data.author || "Desconocido",
        });
      } catch (err) {
        console.error("Error cargando item completo:", err);
      }
    };
    fetchFullItem();

    fetchComments(item.id);

    const fetchRanking = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3000/reviews/ranking/${item.id}`
        );
        setRanking(data.ranking || 0);
      } catch (err) {
        console.error("Error cargando ranking:", err);
      }
    };
    fetchRanking();
  }, [open, item]);

  const handleAddComment = async () => {
    if (titulo.trim() && comment.trim() && starRating > 0) {
      const newComment = {
        title: titulo,
        username: user?.nombre || "Usuario",
        comment,
        score: starRating,
        titleId: item.id,
      };
      try {
        await axios.post("http://localhost:3000/reviews/create", newComment);
        fetchComments(item.id);
        setTitulo("");
        setComment("");
        setStarRating(0);
      } catch (err) {
        console.error("Error añadiendo comentario:", err, newComment);
      }
    }
  };

  const handleLike = async (id) => {
    try {
      await axios.put(`http://localhost:3000/reviews/like/${id}`);
      fetchComments(item.id);
    } catch (err) {
      console.error("Error dando like:", err);
    }
  };

  const handleDislike = async (id) => {
    try {
      await axios.put(`http://localhost:3000/reviews/dislike/${id}`);
      fetchComments(item.id);
    } catch (err) {
      console.error("Error dando dislike:", err);
    }
  };

  const boxRef = useRef(null);
  const closeBtnRef = useRef(null);
  const { inList, isFav, toggleList, toggleFav } = useShelfItem(fullItem || {});

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

  const isTV = (fullItem?.type || "").toLowerCase() === "tv";
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
    [isTV, fullItem?.image]
  );

  const totalLikes = useMemo(
    () => comments.reduce((sum, c) => sum + (c.likes || 0), 0),
    [comments]
  );
  const totalDislikes = useMemo(
    () => comments.reduce((sum, c) => sum + (c.dislikes || 0), 0),
    [comments]
  );

  if (!open || !fullItem) return null;

  const {
    title,
    image,
    year,
    rating,
    duration,
    description,
    type,
    genres = [],
    creator,
    author,
  } = fullItem;
  const match = rating ? `${Math.round(parseFloat(rating) * 10)}% Match` : null;

  const modal = (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        ref={boxRef}
        className="relative mx-auto mt-12 w-[94vw] max-w-5xl max-h-[86vh] grid grid-rows-[auto_1fr] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalles de ${title}`}
      >
        <div className="relative h-56 w-full md:h-80">
          <div className="absolute inset-0 bg-center" style={{ backgroundImage: `url(${fullItem.posterUrl})`, backgroundSize: "cover" }} />
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
                className={`rounded-full border transition ${inList ? "border-gray-600 bg-green-600 p-2 text-white transition-colors hover:bg-gray-700" : "border-gray-600 bg-gray-800/80 p-2 text-white transition-colors hover:bg-gray-700"} text-white`}
                title={inList ? "Quitar de Mi Lista" : "Añadir a Mi Lista"}
              >
                {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
              <button
                onClick={toggleFav}
                className={`rounded-full border p-2 transition ${isFav ? "border-red-500/60 bg-red-600 hover:bg-red-600/40" : "border-gray-600 bg-gray-800/80 hover:bg-gray-700"}`}
                title={isFav ? "Quitar de Favoritos" : "Añadir a Favoritos"}
              >
                <Heart className="h-4 w-4" />
              </button>
              <button
                onClick={toggleFav}
                className={`rounded-full border p-2 transition ${isFav ? "border-blue-500/60 bg-blue-800 hover:bg-blue-600/40" : "border-white/25 bg-white/10 hover:bg-white/20"}`}
              >
                <HeartOff className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cuerpo scrollable (fila 2) */}
        <div className="overflow-y-auto p-5 md:p-7">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Columna principal */}
            <div className="md:col-span-2">
              <div className="flex">
                <h3 className="mb-2 text-sm font-semibold opacity-90 mr-2">Usuario/Creador:</h3>
                <span className="text-sm opacity-70">{creator}</span>
              </div>
              <div className="flex items-center space-x-1">
                <h3 className="mb-2 text-sm font-semibold opacity-90 mr-2">Calificación:</h3>

                <div className="p-4">
                  <StarRating starRating={starRating} setStarRating={setStarRating} />
                </div>
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
                  <div className="mt-1 text-lg font-semibold">{ranking.toFixed(1)}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-xs opacity-70">Likes / Dislikes</div>
                  <div className="mt-1 text-lg font-semibold">{totalLikes} / {totalDislikes}</div>
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
                {author && <li><span className="opacity-60">Autor:</span> {author}</li>}
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

            <div className="w-200 pr-4 bg-neutral-900 text-white mt-10">
              <div className="flex mb-3 items-center space-x-2">
                <h3 className="text-lg font-semibold">Comentarios</h3>
                <Users className="mr-8 h-5 w-5"></Users>
                <StarRating starRating={starRating} setStarRating={setStarRating} />
              </div>

              <div className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Escribe el titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-80 mt-4 p-2 rounded bg-neutral-800 border border-neutral-700"
                  />

                <textarea
                  placeholder="Escribe tu comentario..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-80 mb-1 p-2 rounded bg-neutral-800 border border-neutral-700"
                />

                <button
                  onClick={handleAddComment}
                  className="w-80 mt-3 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white"
                >
                  Enviar
                </button>
              </div>

              {/* Mostrar comentarios */}
              <div className="flex flex-wrap w-full mt-2 gap-4">
                {comments.map((c) => (
                  <div
                    key={c._id}
                    className="flex flex-col p-3 bg-neutral-800 rounded-lg border border-neutral-700 mt-5 max-w-[300px] w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.5rem)] lg:w-[600px]"
                  >
                    <h2 className="font-semibold text-lg">{c.titulo}</h2>
                    <span className=" text-sm italic">{c.username}</span>
                    
                    <div className="flex justify-between items-center w-full mt-1">
                      {/* Estrellas a la izquierda */}
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              c.starRating >= star
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-500"
                            }`}
                          />
                        ))}
                      </div>
                      
                      {/* Pulgares a la derecha */}
                      <div className="flex gap-1">
                        <button onClick={() => handleLike(c._id)} className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4 text-gray-300" />
                        </button>
                        <button onClick={() => handleDislike(c._id)} className="flex items-center gap-1">
                          <ThumbsDown className="w-4 h-4 text-gray-300" />
                        </button>
                      </div>
                    </div>
                      
                    <p className="mt-2 text-sm opacity-80 break-words">{c.comment}</p>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}