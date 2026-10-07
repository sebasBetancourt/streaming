import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface Props {
  value: string;
  /** Recibe el texto ya recortado, como mucho una vez cada `delay` ms mientras se escribe. */
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  maxLength?: number;
  delay?: number;
}

/** Campo de búsqueda con debounce: escribir no dispara una petición por tecla. */
export default function SearchInput({
  value, onChange, placeholder = "Buscar…", label = "Buscar", maxLength = 100, delay = 300,
}: Props) {
  const [text, setText] = useState(value);
  const lastSent = useRef(value);
  const debounced = useDebounce(text.trim(), delay);

  // Cambios desde fuera (Atrás/Adelante, "Quitar filtro"): solo si no los originó este campo,
  // para no pisar lo que se sigue escribiendo.
  useEffect(() => {
    if (value === lastSent.current) return;
    lastSent.current = value;
    setText(value);
  }, [value]);

  useEffect(() => {
    if (debounced === lastSent.current) return;
    lastSent.current = debounced;
    onChange(debounced);
  }, [debounced, onChange]);

  const clear = () => {
    setText("");
    lastSent.current = "";
    onChange("");
  };

  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" aria-hidden />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && text && (e.preventDefault(), clear())}
        placeholder={placeholder}
        aria-label={label}
        maxLength={maxLength}
        className="h-11 w-full rounded-md border border-white/20 bg-black pl-9 pr-10 text-sm text-white placeholder:text-white/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={clear}
          aria-label="Borrar búsqueda"
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded text-white/70 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
