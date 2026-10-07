import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  /** Botones de salida: reintentar, quitar filtro, sugerencias... */
  children?: ReactNode;
  tone?: "info" | "error";
}

export default function EmptyState({ title, description, children, tone = "info" }: Props) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className="mx-auto my-12 max-w-lg rounded-xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="mt-2 text-sm text-white/75">{description}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

export const emptyStateButtonClass =
  "h-11 rounded-full bg-white/10 px-5 text-sm font-medium transition hover:bg-white/20";
export const emptyStatePrimaryButtonClass =
  "h-11 rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/85";
