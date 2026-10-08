import { useEffect, useState } from "react";
import { assetUrl } from "@/shared/lib/assetUrl";
import { cn } from "@/shared/lib/cn";

const COLORS = ["bg-blue-600", "bg-emerald-600", "bg-purple-600", "bg-amber-600", "bg-rose-600", "bg-cyan-600", "bg-indigo-600", "bg-teal-600"];

/** Iniciales (máx. 2) del nombre: "Ana María Pérez" → "AM". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[1][0] : "")).toUpperCase();
}

/** Color estable: el mismo nombre siempre da el mismo color. */
export function colorFor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[hash % COLORS.length];
}

interface Props {
  src?: string | null;
  name: string;
  /** Lado en píxeles. */
  size?: number;
  className?: string;
  rounded?: "md" | "full";
}

/** Foto de perfil con respaldo: si no hay foto o falla la carga, muestra las iniciales. */
export default function Avatar({ src, name, size = 32, className, rounded = "md" }: Props) {
  const url = assetUrl(src);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);

  const shape = rounded === "full" ? "rounded-full" : "rounded";
  const box = { width: size, height: size };

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        style={box}
        className={cn("flex-none bg-zinc-800 object-cover", shape, className)}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={name}
      style={{ ...box, fontSize: Math.max(10, Math.round(size * 0.4)) }}
      className={cn("flex flex-none select-none items-center justify-center font-semibold text-white", shape, colorFor(name), className)}
    >
      {initials(name)}
    </span>
  );
}
