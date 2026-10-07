import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getVimeusSyncStatus, startVimeusSync, type SyncRun, type VimeusSyncStatus } from "@/shared/api/admin";
import { ApiError } from "@/shared/api/client";

const POLL_MS = 3000;

const STATUS_LABEL: Record<SyncRun["status"], string> = {
  running: "En curso",
  success: "Completada",
  partial: "Incompleta",
  failed: "Fallida",
};
const STATUS_CLASS: Record<SyncRun["status"], string> = {
  running: "border-sky-400/50 bg-sky-500/15 text-sky-200",
  success: "border-emerald-400/50 bg-emerald-500/15 text-emerald-200",
  partial: "border-amber-400/50 bg-amber-500/15 text-amber-200",
  failed: "border-red-400/50 bg-red-500/15 text-red-200",
};
const TRIGGER_LABEL: Record<SyncRun["trigger"], string> = { admin: "desde el panel", cron: "tarea diaria", cli: "consola" };
const KIND_LABEL = { animes: "Anime", series: "Series", movies: "Películas" } as const;

const formatDate = (iso: string) => new Date(iso).toLocaleString("es", { dateStyle: "medium", timeStyle: "short" });

export default function CatalogSyncPanel() {
  const [status, setStatus] = useState<VimeusSyncStatus | null>(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      setStatus(await getVimeusSyncStatus(signal));
      setError("");
    } catch (e) {
      if (!signal?.aborted) setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    void refresh(ctrl.signal);
    return () => ctrl.abort();
  }, [refresh]);

  const running = !!status?.running;
  useEffect(() => {
    if (!running) return;
    const ctrl = new AbortController();
    const id = setInterval(() => void refresh(ctrl.signal), POLL_MS);
    return () => {
      clearInterval(id);
      ctrl.abort();
    };
  }, [running, refresh]);

  async function start() {
    if (!confirm("¿Sincronizar el catálogo con Vimeus? Puede tardar unos minutos.")) return;
    setStarting(true);
    try {
      await startVimeusSync();
      setError("");
    } catch (e) {
      setError(e instanceof ApiError && e.status === 409 ? "Ya hay una sincronización en curso." : e instanceof Error ? e.message : String(e));
    } finally {
      setStarting(false);
      void refresh();
    }
  }

  const last = status?.last;
  return (
    <section aria-labelledby="catalog-sync-title" className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="catalog-sync-title" className="text-lg font-semibold">Sincronización con Vimeus</h2>
          <p className="text-sm opacity-70">
            Importa y actualiza películas, series y anime con su reproductor.{" "}
            {status && (status.scheduled ? "La tarea diaria está activada." : "La tarea diaria está desactivada.")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void start()}
          disabled={!status?.configured || running || starting}
          className="flex h-11 items-center gap-2 rounded-md bg-[#e50914] px-4 font-semibold transition hover:bg-[#f6121d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${running ? "motion-safe:animate-spin" : ""}`} aria-hidden="true" />
          {running ? "Sincronizando…" : "Sincronizar con Vimeus"}
        </button>
      </div>

      {status && !status.configured && (
        <p className="rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          Falta configurar VIMEUS_API_KEY en el servidor.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div aria-live="polite" className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
        {!status && !error && <div className="h-24 rounded shimmer" />}
        {status && !last && <p className="text-sm opacity-70">Todavía no se ha sincronizado nunca.</p>}
        {last && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[last.status]}`}>
                {STATUS_LABEL[last.status]}
              </span>
              <span className="opacity-80">
                Última corrida: {formatDate(last.startedAt)} · {TRIGGER_LABEL[last.trigger]}
                {last.finishedAt && ` · terminó ${formatDate(last.finishedAt)}`}
              </span>
            </div>
            {last.error && <p className="mt-2 text-sm text-red-300">{last.error}</p>}
            {Object.keys(last.stats).length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs opacity-70">
                    <tr>
                      <th scope="col" className="py-1 pr-3 font-medium">Tipo</th>
                      <th scope="col" className="py-1 pr-3 font-medium">Creados</th>
                      <th scope="col" className="py-1 pr-3 font-medium">Actualizados</th>
                      <th scope="col" className="py-1 pr-3 font-medium">No disponibles</th>
                      <th scope="col" className="py-1 font-medium">Errores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.keys(KIND_LABEL) as (keyof typeof KIND_LABEL)[]).map((kind) => {
                      const s = last.stats[kind];
                      if (!s) return null;
                      return (
                        <tr key={kind} className="border-t border-white/10">
                          <th scope="row" className="py-1.5 pr-3 font-medium">{KIND_LABEL[kind]}</th>
                          <td className="py-1.5 pr-3">{s.created.toLocaleString("es")}</td>
                          <td className="py-1.5 pr-3">{s.updated.toLocaleString("es")}</td>
                          <td className="py-1.5 pr-3">{s.unavailable.toLocaleString("es")}</td>
                          <td className="py-1.5">{(s.invalid + s.collisions).toLocaleString("es")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
