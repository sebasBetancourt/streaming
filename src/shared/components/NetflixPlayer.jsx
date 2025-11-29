import { createPortal } from "react-dom";
import { ArrowLeft } from "lucide-react";
import { ContentPlayer } from "./ContentPlayer";
import { useHomePage } from "@/features/Clients/home/hooks/useHomePage";

import ItemDialog from "@/shared/components/ItemDialog";

export default function NetflixPlayerModal({ url, onClose }) {
  const { movies, series, animes, selected, setSelected } = useHomePage();

  // Nuevo estado local: controlar si ItemDialog está abierto
  const isItemDialogOpen = !!selected;

  // Función para abrir el ItemDialog
  const handleItemClick = (item) => {
    setSelected(item);
  };

  // Función para cerrar el ItemDialog
  const handleItemClose = () => {
    setSelected(null);
  };

  return createPortal(
    <>
      {/* Modal principal solo se renderiza si ItemDialog NO está abierto */}
      {!isItemDialogOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto flex flex-col justify-start items-center bg-black/50 backdrop-blur-sm p-4 md:p-8 pt-20 md:pt-24 lg:pt-16">
          {/* Botón Volver */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 flex items-center gap-2 text-white hover:text-gray-300 px-3 py-3 rounded-full transition z-10"
          >
            <ArrowLeft size={35} />
          </button>

          {/* Video */}
          <div className="w-full flex justify-center">
            <iframe
              src={url}
              className="w-full max-w-[1080px] h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[80vh] 2xl:h-[60vh] rounded-md shadow-lg"
              allow="encrypted-media"
              allowFullScreen
            />
          </div>

          {/* ContentPlayer */}
          <div className="w-full mt-4 flex-1 px-2 sm:px-4 md:px-8">
            <ContentPlayer
              id="Explore"
              title="Mira más contenido"
              items={[...movies, ...series, ...animes].flat()}
              onItemClick={handleItemClick} // ahora controlado localmente
            />
          </div>
        </div>
      )}

      {/* ItemDialog */}
      {isItemDialogOpen && (
        <ItemDialog
          open={isItemDialogOpen}
          onClose={handleItemClose}
          item={selected}
        />
      )}
    </>,
    document.body
  );
}
