import { useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";
import { deleteAccount } from "@/shared/api/me";
import { useDialogA11y } from "@/shared/hooks/useDialogA11y";

export const DELETE_WORD = "ELIMINAR";

interface Props {
  open: boolean;
  onClose: () => void;
  /** La cuenta ya se borró en el backend: cerrar sesión y salir. */
  onDeleted: () => void;
}

export function DeleteAccountDialog({ open, onClose, onDeleted }: Props) {
  const [word, setWord] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  useDialogA11y(open, onClose, boxRef, !busy);

  if (!open) return null;
  const ready = word === DELETE_WORD && password.length > 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError("");
    try {
      await deleteAccount(password);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la cuenta");
      setBusy(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={() => !busy && onClose()} />
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="del-title"
        aria-describedby="del-desc"
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
      >
        <h2 id="del-title" className="mb-2 flex items-center gap-2 text-lg font-semibold text-red-300">
          <Trash2 size={18} aria-hidden /> Eliminar mi cuenta
        </h2>
        <p id="del-desc" className="mb-4 text-sm opacity-80">
          Se borrarán tu perfil, tu foto, tus reseñas y tus listas. Esta acción es irreversible.
        </p>
        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <div>
            <label htmlFor="del-pass" className="mb-1 block text-xs opacity-70">Tu contraseña</label>
            <input
              id="del-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-md border border-white/20 bg-white/10 px-3 outline-none focus:border-[#e50914]"
            />
          </div>
          <div>
            <label htmlFor="del-word" className="mb-1 block text-xs opacity-70">
              Escribe <strong>{DELETE_WORD}</strong> para confirmar
            </label>
            <input
              id="del-word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              autoComplete="off"
              className="h-11 w-full rounded-md border border-white/20 bg-white/10 px-3 outline-none focus:border-[#e50914]"
            />
          </div>
          <p role="alert" className="min-h-5 text-sm text-red-400">{error}</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="min-h-11 rounded-md border border-white/20 bg-white/5 px-4 py-2 transition hover:bg-white/10 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!ready || busy}
              className="min-h-11 rounded-md bg-red-600 px-4 py-2 font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Eliminando…" : "Eliminar cuenta"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
