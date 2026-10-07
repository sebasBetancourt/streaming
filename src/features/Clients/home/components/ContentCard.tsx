import { useState } from "react";
import { Check, ChevronDown, Heart, Play, Plus } from "lucide-react";
import { useShelfItem } from "@/app/providers/ShelfContext";
import type { TitleEntity } from "@/entities/titles";
import ItemDialog from "@/shared/components/ItemDialog";
import NetflixPlayerModal from "@/shared/components/NetflixPlayer";

interface Props {
  item: TitleEntity;
  showRank?: boolean;
}

export function ContentCard({ item, showRank = false }: Props) {
  const { title, image, year, ratingAvg, duration, rank, description, embedUrl } = item;
  const [imageError, setImageError] = useState(false);
  const [open, setOpen] = useState(false);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const { inList, isFav, toggleList, toggleFav } = useShelfItem(item.id);

  const fallbackImage = "https://via.placeholder.com/400x225/141414/ffffff?text=" + encodeURIComponent(title || "Poster");
  const rating = parseFloat(ratingAvg);
  const match = rating > 0 ? `${Math.round(rating)}% Ranking` : null;

  return (
    <>
      <div
        className="group relative cursor-pointer transition-all duration-300 hover:z-50"
        onClick={() => setOpen(true)}
      >
        <div className="relative w-full overflow-hidden rounded-md" style={{ aspectRatio: "16/9" }}>
          <div className="absolute left-2 top-2 z-20">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-red-600 text-sm font-bold text-white">P</div>
          </div>
          {showRank && (
            <div className="absolute right-2 top-2 z-20">
              <div className="rounded-sm border border-gray-600 bg-black/80 px-2 py-1 text-lg font-bold text-white">#{rank}</div>
            </div>
          )}

          <img
            src={imageError || !image ? fallbackImage : image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute inset-0 flex translate-y-2 flex-col justify-end p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="mb-3">
              <h3 className="mb-1 line-clamp-1 text-sm font-semibold leading-tight text-white sm:text-base md:text-lg">{title}</h3>

              <div className="mb-3 flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (embedUrl) setPlayerUrl(embedUrl);
                    else setOpen(true);
                  }}
                  className="rounded-full bg-white p-2 text-black transition-colors hover:bg-gray-200"
                  title={embedUrl ? "Reproducir" : "Sin reproductor disponible"}
                >
                  <Play className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void toggleList();
                  }}
                  className={`rounded-full border border-gray-600 p-2 text-white transition-colors hover:bg-gray-700 ${inList ? "bg-green-600" : "bg-gray-800/80"}`}
                  title={inList ? "Quitar de Mi Lista" : "Añadir a Mi Lista"}
                >
                  {inList ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void toggleFav();
                  }}
                  className={`rounded-full border p-2 text-white transition ${isFav ? "border-red-500/60 bg-red-600 hover:bg-red-600/40" : "border-gray-600 bg-gray-800/80 hover:bg-gray-700"}`}
                  title={isFav ? "Quitar de Favoritos" : "Añadir a Favoritos"}
                >
                  <Heart className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(true);
                  }}
                  className="ml-auto rounded-full border border-gray-600 bg-gray-800/80 p-2 text-white transition-colors hover:bg-gray-700"
                  title="Más detalles"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>

              <div className="mb-1 flex items-center space-x-3 text-sm text-gray-200">
                {match && <span className="font-semibold text-green-500">{match}</span>}
                {year && <span className="px-1 text-xs">{year}</span>}
                {duration && <span>{duration}</span>}
              </div>
              {description && <p className="line-clamp-1 text-xs leading-snug text-white sm:text-sm">{description}</p>}
            </div>
          </div>
        </div>
      </div>

      {playerUrl && <NetflixPlayerModal url={playerUrl} onClose={() => setPlayerUrl(null)} />}
      {!playerUrl && <ItemDialog open={open} onClose={() => setOpen(false)} item={item} />}
    </>
  );
}
