import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Bell, Mail, MapPin, Phone, User } from "lucide-react";
import type { UserPreferences, UserProfile } from "@/entities/users";
import { updateMe, updatePreferences } from "@/shared/api/me";
import { validateProfile, type ProfileFields } from "../validation";
import { StatusMessage } from "./StatusMessage";
import { useStatus } from "./useStatus";

type PrefKey = "marketingEmails" | "personalizedRecs" | "shareAnonymized";

const PREF_LABELS: { key: PrefKey; label: string; icon?: boolean }[] = [
  { key: "marketingEmails", label: "Recibir correos informativos y de novedades", icon: true },
  { key: "personalizedRecs", label: "Permitir recomendaciones personalizadas según tu actividad" },
  { key: "shareAnonymized", label: "Compartir datos anonimizados para mejorar el servicio" },
];

const inputCls = "h-11 w-full rounded-md border bg-white/10 pl-9 pr-3 outline-none transition focus:border-[#e50914]";

const initialPrefs = (p: UserPreferences): Record<PrefKey, boolean> => ({
  marketingEmails: p.marketingEmails ?? false,
  personalizedRecs: p.personalizedRecs !== false,
  shareAnonymized: p.shareAnonymized ?? false,
});

interface Props {
  profile: UserProfile;
  /** El backend ya guardó: la sesión (header) actualiza el nombre. */
  onSaved: (patch: { name: string }) => void;
}

export function ProfileForm({ profile, onSaved }: Props) {
  const [saved, setSaved] = useState<ProfileFields & { prefs: Record<PrefKey, boolean> }>(() => ({
    name: profile.name,
    phone: profile.phone ?? "",
    country: profile.country ?? "",
    prefs: initialPrefs(profile.preferences),
  }));
  const [fields, setFields] = useState<ProfileFields>({ name: saved.name, phone: saved.phone, country: saved.country });
  const [prefs, setPrefs] = useState(saved.prefs);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const { status, success, fail, clear } = useStatus();

  const errors = useMemo(() => validateProfile(fields), [fields]);
  const fieldsChanged = (["name", "phone", "country"] as const).filter((k) => fields[k].trim() !== saved[k].trim());
  const prefsChanged = PREF_LABELS.map((p) => p.key).filter((k) => prefs[k] !== saved.prefs[k]);
  const dirty = fieldsChanged.length > 0 || prefsChanged.length > 0;
  const invalid = Object.keys(errors).length > 0;

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    clear();
    setFields((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (invalid || !dirty) return;
    setSaving(true);
    clear();
    try {
      if (fieldsChanged.length > 0) {
        await updateMe({
          ...(fieldsChanged.includes("name") && { name: fields.name.trim() }),
          ...(fieldsChanged.includes("phone") && { phone: fields.phone.trim() || null }),
          ...(fieldsChanged.includes("country") && { country: fields.country.trim() || null }),
        });
        if (fieldsChanged.includes("name")) onSaved({ name: fields.name.trim() });
      }
      if (prefsChanged.length > 0) {
        await updatePreferences(Object.fromEntries(prefsChanged.map((k) => [k, prefs[k]])));
      }
      setSaved({ name: fields.name.trim(), phone: fields.phone.trim(), country: fields.country.trim(), prefs });
      success("Cambios guardados");
    } catch (err) {
      fail(err);
    } finally {
      setSaving(false);
    }
  }

  const err = (k: keyof ProfileFields) => (touched ? errors[k] : undefined);
  const border = (k: keyof ProfileFields) => (err(k) ? "border-red-500/70" : "border-white/20");

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-2">
      <div>
        <label htmlFor="pf-name" className="mb-1 block text-xs opacity-70">Nombre</label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={16} />
          <input
            id="pf-name"
            name="name"
            placeholder="Tu nombre"
            value={fields.name}
            onChange={onInput}
            maxLength={120}
            aria-invalid={!!err("name")}
            aria-describedby={err("name") ? "pf-name-err" : undefined}
            className={`${inputCls} ${border("name")}`}
          />
        </div>
        {err("name") && <p id="pf-name-err" className="mt-1 text-xs text-red-400">{err("name")}</p>}
      </div>

      <div>
        <label htmlFor="pf-email" className="mb-1 block text-xs opacity-70">Email</label>
        <div className="relative opacity-80">
          <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={16} />
          <input id="pf-email" disabled value={profile.email} aria-describedby="pf-email-help" className={`${inputCls} cursor-not-allowed border-white/20`} />
        </div>
        <p id="pf-email-help" className="mt-1 text-[11px] opacity-60">El correo identifica tu cuenta y no se puede cambiar.</p>
      </div>

      <div>
        <label htmlFor="pf-phone" className="mb-1 block text-xs opacity-70">Teléfono</label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={16} />
          <input
            id="pf-phone"
            name="phone"
            type="tel"
            placeholder="+57 300 000 0000"
            value={fields.phone}
            onChange={onInput}
            aria-invalid={!!err("phone")}
            aria-describedby={err("phone") ? "pf-phone-err" : undefined}
            className={`${inputCls} ${border("phone")}`}
          />
        </div>
        {err("phone") && <p id="pf-phone-err" className="mt-1 text-xs text-red-400">{err("phone")}</p>}
      </div>

      <div>
        <label htmlFor="pf-country" className="mb-1 block text-xs opacity-70">País</label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={16} />
          <input
            id="pf-country"
            name="country"
            placeholder="Colombia"
            value={fields.country}
            onChange={onInput}
            aria-invalid={!!err("country")}
            aria-describedby={err("country") ? "pf-country-err" : undefined}
            className={`${inputCls} ${border("country")}`}
          />
        </div>
        {err("country") && <p id="pf-country-err" className="mt-1 text-xs text-red-400">{err("country")}</p>}
      </div>

      <p className="text-xs opacity-60 md:col-span-2">Cuenta creada: {new Date(profile.createdAt).toLocaleDateString()}</p>

      <fieldset className="rounded-xl border border-white/10 bg-black/40 p-4 md:col-span-2">
        <legend className="px-1 text-sm font-semibold">Tratamiento de datos y preferencias</legend>
        <div className="mt-1 grid grid-cols-1 gap-3 md:grid-cols-2">
          {PREF_LABELS.map(({ key, label, icon }) => (
            <label key={key} className="flex min-h-8 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={() => {
                  clear();
                  setPrefs((p) => ({ ...p, [key]: !p[key] }));
                }}
                className="h-4 w-4 accent-[#e50914]"
              />
              {icon && <Bell size={14} className="opacity-70" aria-hidden />}
              {label}
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs opacity-70">
          Tu sesión se protege con un token firmado que caduca a las 24 horas. Puedes cambiar o retirar tu consentimiento en cualquier momento.
        </p>
      </fieldset>

      <div className="flex items-center justify-end gap-4 md:col-span-2">
        <StatusMessage status={status} />
        <button
          type="submit"
          disabled={saving || !dirty || (touched && invalid)}
          className="min-h-11 rounded-md bg-[#e50914] px-5 py-2 font-semibold transition hover:bg-[#f6121d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
