import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft } from "lucide-react";
import type { TitleEntity } from "@/entities/titles";
import { useHomePage } from "@/features/Clients/home/hooks/useHomePage";
import { ContentPlayer } from "./ContentPlayer";
import ItemDialog from "./ItemDialog";

interface Props {
  url: string;
  onClose: () => void;
}

/** Modal con el reproductor embebido y un carrusel de "Mira más contenido". */
export default function NetflixPlayerModal({ url, onClose }: Props) {
  const { movies, series, animes } = useHomePage();
  const [selected, setSelected] = useState<TitleEntity | null>(null);

  return createPortal(
    <>
      {!selected && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-start overflow-y-auto bg-black/50 p-4 pt-20 backdrop-blur-sm md:p-8 md:pt-24 lg:pt-16">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full px-3 py-3 text-white transition hover:text-gray-300"
            aria-label="Volver"
          >
            <ArrowLeft size={35} />
          </button>

          <div className="flex w-full justify-center">
            <iframe
              src={url}
              title="Reproductor"
              className="h-[40vh] w-full max-w-[1080px] rounded-md shadow-lg sm:h-[50vh] md:h-[60vh] lg:h-[80vh] 2xl:h-[60vh]"
              allow="encrypted-media"
              allowFullScreen
            />
          </div>

          <div className="mt-4 w-full flex-1 px-2 sm:px-4 md:px-8">
            <ContentPlayer
              id="Explore"
              title="Mira más contenido"
              items={[...movies, ...series, ...animes]}
              onItemClick={setSelected}
            />
          </div>
        </div>
      )}

      {selected && <ItemDialog open onClose={() => setSelected(null)} item={selected} />}
    </>,
    document.body,
  );
}
