import { useState } from "react";
import { Download } from "lucide-react";
import { exportMyData } from "@/shared/api/me";
import { StatusMessage } from "./StatusMessage";
import { useStatus } from "./useStatus";

export function DataPortability() {
  const [busy, setBusy] = useState(false);
  const { status, success, fail, clear } = useStatus();

  async function download() {
    setBusy(true);
    clear();
    try {
      await exportMyData();
      success("Se descargó un archivo con tus datos");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Download size={16} aria-hidden /> Descargar mis datos
      </div>
      <p className="mb-3 text-xs opacity-70">Descarga un archivo JSON con tus datos (perfil, preferencias, reseñas y listas).</p>
      <button
        onClick={() => void download()}
        disabled={busy}
        className="min-h-11 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10 disabled:opacity-50"
      >
        {busy ? "Preparando…" : "Descargar mis datos"}
      </button>
      <StatusMessage status={status} className="mt-2" />
    </div>
  );
}
