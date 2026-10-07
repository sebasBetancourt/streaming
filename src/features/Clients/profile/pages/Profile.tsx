import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  User, Mail, Phone, MapPin, Image as ImageIcon,
  Eye, EyeOff, Lock, Download, Trash2, Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";
import type { UserPreferences } from "@/entities/users";
import { changePassword as changePasswordApi, deleteAccount as deleteAccountApi, exportMyData, getMe, updateMe, updatePreferences } from "@/shared/api/me";
import { Footer } from "@/shared/components/Footer";

type PrefKey = "marketingEmails" | "personalizedRecs" | "shareAnonymized";
const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

export default function AccountPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [profile, setProfile] = useState({ email: "", name: "", phone: "", country: "", avatar: "", createdAt: "" });

  // Avatar: solo URL (la subida de archivos no está soportada por el backend)
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [preview, setPreview] = useState("");

  // ----- Preferencias (tratamiento de datos) -----
  const [prefs, setPrefs] = useState<Required<UserPreferences>>({
    marketingEmails: false,
    personalizedRecs: true,
    shareAnonymized: false,
    dataRetentionMonths: 12,
  });

  // ----- Seguridad -----
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [secBusy, setSecBusy] = useState(false);

  // ----- Estado irreversible (export/delete) -----
  const [hardBusy, setHardBusy] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  // ==================== LOAD ====================
  useEffect(() => {
    let mounted = true;
    getMe()
      .then((me) => {
        if (!mounted) return;
        setProfile({
          email: me.email,
          name: me.name,
          phone: me.phone ?? "",
          country: me.country ?? "",
          avatar: me.avatarUrl ?? "",
          createdAt: me.createdAt,
        });
        setPrefs({
          marketingEmails: me.preferences.marketingEmails ?? false,
          personalizedRecs: me.preferences.personalizedRecs !== false,
          shareAnonymized: me.preferences.shareAnonymized ?? false,
          dataRetentionMonths: Number(me.preferences.dataRetentionMonths || 12),
        });
        setPreview(me.avatarUrl ?? "");
      })
      .catch((e) => mounted && setErr(errMsg(e)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // ==================== HANDLERS ====================
  function onProfileInput(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setProfile((s) => ({ ...s, [name]: value }));
  }

  function onAvatarUrlBlur() {
    if (avatarUrlInput.trim()) setPreview(avatarUrlInput.trim());
  }

  function onPrefToggle(key: PrefKey) {
    setPrefs((s) => ({ ...s, [key]: !s[key] }));
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      setSaving(true);
      await updateMe({
        name: profile.name.trim(),
        phone: profile.phone.trim() || null,
        country: profile.country.trim() || null,
        ...(avatarUrlInput.trim() && { avatarUrl: avatarUrlInput.trim() }),
      });
      await updatePreferences(prefs);
      setMsg("Cambios guardados correctamente.");
    } catch (e2) {
      setErr(errMsg(e2));
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    if (pw.next.length < 6 || pw.next !== pw.confirm) {
      setErr("La nueva contraseña debe tener al menos 6 caracteres y coincidir con su confirmación.");
      return;
    }
    try {
      setSecBusy(true);
      await changePasswordApi({ currentPassword: pw.current, newPassword: pw.next });
      setPw({ current: "", next: "", confirm: "" });
      setMsg("Contraseña actualizada.");
    } catch (e2) {
      setErr(errMsg(e2));
    } finally {
      setSecBusy(false);
    }
  }

  async function exportData() {
    setMsg("");
    setErr("");
    try {
      setHardBusy(true);
      await exportMyData();
      setMsg("Se descargó un archivo con tus datos.");
    } catch (e2) {
      setErr(errMsg(e2));
    } finally {
      setHardBusy(false);
    }
  }

  async function deleteAccount() {
    setMsg("");
    setErr("");
    if (deleteConfirm !== "ELIMINAR") {
      setErr('Escribe "ELIMINAR" en el campo de confirmación para continuar.');
      return;
    }
    if (!deletePassword) {
      setErr("Escribe tu contraseña para confirmar.");
      return;
    }
    if (!confirm("Esta acción es irreversible. ¿Eliminar tu cuenta?")) return;
    try {
      setHardBusy(true);
      await deleteAccountApi(deletePassword);
      logout();
      navigate("/login", { replace: true });
    } catch (e2) {
      setErr(errMsg(e2));
      setHardBusy(false);
    }
  }

  // ==================== UI ====================
  return (
    <div className="min-h-screen netflix-container pt-20">
      {/* Header */}

      
        


      <main className="px-4 pb-16 pt-4 md:px-12">
        {/* Mensajes */}
        {(msg || err) && (
          <div className={`mb-4 rounded-md border px-3 py-2 ${err ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
            {err || msg}
          </div>
        )}

        {/* Loader */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="h-64 rounded-xl shimmer" />
            <div className="h-64 rounded-xl shimmer" />
            <div className="h-64 rounded-xl shimmer" />
          </div>
        ) : (
          <>
            {/* PERFIL */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 md:p-6 mb-6">
              <h2 className="mb-4 text-lg font-semibold">Datos personales</h2>

              <form onSubmit={saveProfile} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Avatar */}
                <div className="md:col-span-1">
                  <div className="text-xs mb-2 opacity-70">Avatar</div>
                  <div
                    className="relative aspect-square w-32 overflow-hidden rounded-lg border border-white/15 bg-center"
                    style={{ backgroundImage: `url(${preview || profile.avatar || ""})`, backgroundSize: "cover" }}
                  />
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 opacity-70" />
                      <input
                        placeholder="URL de imagen (https://…)"
                        value={avatarUrlInput}
                        onChange={(e) => setAvatarUrlInput(e.target.value)}
                        onBlur={onAvatarUrlBlur}
                        className="h-10 w-full rounded-md border border-white/20 bg-white/10 px-3 outline-none transition focus:border-[#e50914]"
                      />
                    </div>
                  </div>
                </div>

                {/* Campos */}
                <div className="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs opacity-70">Nombre</label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={16} />
                      <input
                        name="name"
                        placeholder="Tu nombre"
                        value={profile.name}
                        onChange={onProfileInput}
                        className="h-11 w-full rounded-md border border-white/20 bg-white/10 pl-9 pr-3 outline-none transition focus:border-[#e50914]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs opacity-70">Email</label>
                    <div className="relative opacity-80">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={16} />
                      <input
                        disabled
                        value={profile.email }
                        className="h-11 w-full cursor-not-allowed rounded-md border border-white/20 bg-white/10 pl-9 pr-3 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs opacity-70">Teléfono</label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={16} />
                      <input
                        name="phone"
                        placeholder="+57 300 000 0000"
                        value={profile.phone}
                        onChange={onProfileInput}
                        className="h-11 w-full rounded-md border border-white/20 bg-white/10 pl-9 pr-3 outline-none transition focus:border-[#e50914]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs opacity-70">País</label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={16} />
                      <input
                        name="country"
                        placeholder="Colombia"
                        value={profile.country}
                        onChange={onProfileInput}
                        className="h-11 w-full rounded-md border border-white/20 bg-white/10 pl-9 pr-3 outline-none transition focus:border-[#e50914]"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 text-xs opacity-70">
                    Cuenta creada: {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
                  </div>
                </div>

                {/* Preferencias / Tratamiento de datos */}
                <div className="md:col-span-3 mt-2 rounded-xl border border-white/10 bg-black/40 p-4">
                  <h3 className="mb-3 text-sm font-semibold">Tratamiento de datos y preferencias</h3>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={prefs.marketingEmails}
                        onChange={() => onPrefToggle("marketingEmails")}
                        className="h-4 w-4"
                      />
                      <span className="text-sm"><Bell className="inline mb-1 mr-1" size={14} /> Recibir correos informativos y de novedades</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={prefs.personalizedRecs}
                        onChange={() => onPrefToggle("personalizedRecs")}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Permitir recomendaciones personalizadas (tokens y actividad)</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={prefs.shareAnonymized}
                        onChange={() => onPrefToggle("shareAnonymized")}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Compartir datos anonimizados para mejorar el servicio</span>
                    </label>

                    
                  </div>

                  <p className="mt-3 text-xs opacity-70">
                    Protegemos tu sesión con <strong>tokens firmados y de corta duración</strong>. Puedes cambiar o retirar tu consentimiento en cualquier momento.
                  </p>
                </div>

                {/* Guardar */}
                <div className="md:col-span-3 flex justify-end">
                  <button
                    disabled={saving}
                    className="rounded-md bg-[#e50914] px-5 py-2 font-semibold transition hover:bg-[#f6121d] hover:shadow-[0_8px_24px_rgba(229,9,20,0.35)]"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </section>

            {/* SEGURIDAD */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 md:p-6 mb-6">
              <h2 className="mb-4 text-lg font-semibold">Seguridad</h2>
              <form onSubmit={changePassword} className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="relative">
                  <label className="mb-1 block text-xs opacity-70">Contraseña actual</label>
                  <Lock className="pointer-events-none absolute left-3 top-[38px] opacity-60" size={16} />
                  <input
                    type={show.current ? "text" : "password"}
                    value={pw.current}
                    onChange={(e) => setPw((s) => ({ ...s, current: e.target.value }))}
                    className="h-11 w-full rounded-md border border-white/20 bg-white/10 pl-9 pr-10 outline-none transition focus:border-[#e50914]"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[38px] opacity-80"
                    onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
                    aria-label="Ver/Ocultar"
                  >
                    {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative">
                  <label className="mb-1 block text-xs opacity-70">Nueva contraseña</label>
                  <Lock className="pointer-events-none absolute left-3 top-[38px] opacity-60" size={16} />
                  <input
                    type={show.next ? "text" : "password"}
                    value={pw.next}
                    onChange={(e) => setPw((s) => ({ ...s, next: e.target.value }))}
                    className="h-11 w-full rounded-md border border-white/20 bg-white/10 pl-9 pr-10 outline-none transition focus:border-[#e50914]"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[38px] opacity-80"
                    onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
                    aria-label="Ver/Ocultar"
                  >
                    {show.next ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative">
                  <label className="mb-1 block text-xs opacity-70">Confirmar contraseña</label>
                  <Lock className="pointer-events-none absolute left-3 top-[38px] opacity-60" size={16} />
                  <input
                    type={show.confirm ? "text" : "password"}
                    value={pw.confirm}
                    onChange={(e) => setPw((s) => ({ ...s, confirm: e.target.value }))}
                    className="h-11 w-full rounded-md border border-white/20 bg-white/10 pl-9 pr-10 outline-none transition focus:border-[#e50914]"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[38px] opacity-80"
                    onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                    aria-label="Ver/Ocultar"
                  >
                    {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="md:col-span-3 flex flex-wrap items-center gap-2">
                  <button
                    disabled={secBusy}
                    className="rounded-md border border-white/15 bg-white/5 px-4 py-2 transition hover:bg-white/10"
                  >
                    {secBusy ? "Actualizando..." : "Actualizar contraseña"}
                  </button>
                  
                  <div className="ml-auto text-xs opacity-70">
                    Recomendación: habilita contraseñas largas y únicas. Tokens con **rotación** periódica.
                  </div>
                </div>
              </form>
            </section>

            {/* PORTABILIDAD / ELIMINACIÓN */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 md:p-6">
              <h2 className="mb-4 text-lg font-semibold">Portabilidad y eliminación de datos</h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Download size={16} /> Descargar mis datos
                  </div>
                  <p className="text-xs opacity-70 mb-3">
                    Descarga un archivo JSON con tus datos (perfil, listas y reseñas).
                  </p>
                  <button
                    onClick={() => void exportData()}
                    disabled={hardBusy}
                    className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
                  >
                    {hardBusy ? "Preparando..." : "Descargar mis datos"}
                  </button>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-300">
                    <Trash2 size={16} /> Eliminar mi cuenta
                  </div>
                  <p className="text-xs opacity-70">
                    Esta acción es irreversible. Escribe <strong>ELIMINAR</strong> para confirmar.
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Tu contraseña"
                      className="h-10 w-48 rounded-md border border-white/20 bg-white/10 px-3 outline-none transition focus:border-[#e50914]"
                    />
                    <input
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder='Escribe "ELIMINAR"'
                      className="h-10 w-48 rounded-md border border-white/20 bg-white/10 px-3 outline-none transition focus:border-[#e50914]"
                    />
                    <button
                      onClick={() => void deleteAccount()}
                      disabled={hardBusy}
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500"
                    >
                      {hardBusy ? "Procesando..." : "Eliminar cuenta"}
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs opacity-70">
                ¿Dudas sobre privacidad? Contáctanos. Respetamos tus derechos de acceso, rectificación, cancelación y oposición.
              </p>
            </section>
          </>
        )}
      </main>
      <Footer className="bg-black" />
    </div>
  );
}
