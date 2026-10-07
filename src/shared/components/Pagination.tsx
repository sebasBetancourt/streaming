import { ChevronLeft, ChevronRight } from "lucide-react";

const MAX_SLOTS = 7;

/** Números de página a mostrar (como mucho 7 huecos); `"gap"` es un salto "…". Siempre incluye la primera y la última. */
export function pageItems(page: number, totalPages: number): (number | "gap")[] {
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (totalPages <= MAX_SLOTS) return range(1, totalPages);
  if (page <= 4) return [...range(1, 5), "gap", totalPages];
  if (page >= totalPages - 3) return [1, "gap", ...range(totalPages - 4, totalPages)];
  return [1, "gap", page - 1, page, page + 1, "gap", totalPages];
}

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}

const base =
  "flex h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40";

export default function Pagination({ page, totalPages, onChange, disabled = false }: Props) {
  if (totalPages <= 1) return null;
  const go = (p: number) => p !== page && onChange(p);

  return (
    <nav aria-label="Paginación" className="mt-8 flex flex-wrap items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={disabled || page <= 1}
        aria-label="Página anterior"
        className={`${base} bg-white/10 hover:bg-white/20`}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>
      {pageItems(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} aria-hidden className="px-1 text-white/50">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            disabled={disabled}
            aria-label={`Página ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={`${base} ${p === page ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={disabled || page >= totalPages}
        aria-label="Página siguiente"
        className={`${base} bg-white/10 hover:bg-white/20`}
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  );
}
