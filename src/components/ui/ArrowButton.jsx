import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ArrowButton({ dir = "left", onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-full p-2 opacity-0 ring-1 ring-white/20 backdrop-blur transition group-hover:opacity-100 ${
        dir === "left" ? "left-2" : "right-2"
      }`}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      aria-label={dir === "left" ? "Scroll left" : "Scroll right"}
    >
      {dir === "left" ? <ChevronLeft /> : <ChevronRight />}
    </div>
  );
}
