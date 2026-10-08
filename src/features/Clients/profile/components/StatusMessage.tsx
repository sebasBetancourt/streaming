import type { Status } from "./useStatus";

/** Región `aria-live`: el lector de pantalla anuncia los cambios sin mover el foco. */
export function StatusMessage({ status, className = "" }: { status: Status | null; className?: string }) {
  return (
    <p
      role={status?.kind === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`min-h-5 text-sm ${status?.kind === "error" ? "text-red-400" : "text-emerald-400"} ${className}`}
    >
      {status?.text ?? ""}
    </p>
  );
}
