import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  dir?: "left" | "right";
  onClick: () => void;
}

/**
 * Flecha de carrusel solo para ratón: con teclado se recorre la fila tabulando sus elementos
 * (el foco los desplaza a la vista) y en táctil se desliza, así que queda fuera del orden de tabulación.
 */
export default function ArrowButton({ dir = "left", onClick }: Props) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={onClick}
      className={`absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full p-2 opacity-0 ring-1 ring-white/20 backdrop-blur transition group-hover:opacity-100 md:block ${
        dir === "left" ? "left-2" : "right-2"
      }`}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      {dir === "left" ? <ChevronLeft /> : <ChevronRight />}
    </button>
  );
}
