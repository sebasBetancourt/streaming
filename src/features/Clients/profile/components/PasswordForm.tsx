import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { changePassword } from "@/shared/api/me";
import { validateNewPassword } from "../validation";
import { StatusMessage } from "./StatusMessage";
import { useStatus } from "./useStatus";

type Key = "current" | "next" | "confirm";
const FIELDS: { key: Key; label: string; autoComplete: string }[] = [
  { key: "current", label: "Contraseña actual", autoComplete: "current-password" },
  { key: "next", label: "Nueva contraseña", autoComplete: "new-password" },
  { key: "confirm", label: "Confirmar contraseña", autoComplete: "new-password" },
];

export function PasswordForm() {
  const [values, setValues] = useState<Record<Key, string>>({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState<Record<Key, boolean>>({ current: false, next: false, confirm: false });
  const [busy, setBusy] = useState(false);
  const { status, success, fail, clear } = useStatus();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = validateNewPassword(values.current, values.next, values.confirm);
    if (problem) return fail(new Error(problem));
    setBusy(true);
    clear();
    try {
      await changePassword({ currentPassword: values.current, newPassword: values.next });
      setValues({ current: "", next: "", confirm: "" });
      success("Contraseña actualizada");
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {FIELDS.map(({ key, label, autoComplete }) => (
        <div key={key}>
          <label htmlFor={`pw-${key}`} className="mb-1 block text-xs opacity-70">{label}</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={16} />
            <input
              id={`pw-${key}`}
              type={show[key] ? "text" : "password"}
              autoComplete={autoComplete}
              value={values[key]}
              onChange={(e) => {
                clear();
                setValues((v) => ({ ...v, [key]: e.target.value }));
              }}
              className="h-11 w-full rounded-md border border-white/20 bg-white/10 pl-9 pr-10 outline-none transition focus:border-[#e50914]"
            />
            <button
              type="button"
              onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
              aria-label={show[key] ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center opacity-70 hover:opacity-100"
            >
              {show[key] ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-4 md:col-span-3">
        <button
          type="submit"
          disabled={busy || !values.current || !values.next}
          className="min-h-11 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Actualizando…" : "Actualizar contraseña"}
        </button>
        <StatusMessage status={status} />
        <p className="ml-auto text-xs opacity-70">Usa una contraseña larga y única (mínimo 6 caracteres).</p>
      </div>
    </form>
  );
}
