import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";
import { getMe } from "@/shared/api/me";
import { Footer } from "@/shared/components/Footer";
import { useAsync } from "@/shared/hooks/useAsync";
import { AvatarSection } from "../components/AvatarSection";
import { DataPortability } from "../components/DataPortability";
import { DeleteAccountDialog } from "../components/DeleteAccountDialog";
import { PasswordForm } from "../components/PasswordForm";
import { ProfileForm } from "../components/ProfileForm";

export default function AccountPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const { data: profile, loading, error, reload } = useAsync(() => getMe(), []);
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);

  const currentAvatar = avatarUrl === undefined ? (profile?.avatarUrl ?? null) : avatarUrl;
  const name = user?.name ?? profile?.name ?? "";

  return (
    <div className="netflix-container min-h-screen pt-20">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-4 md:px-12">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-busy="true">
            <div className="shimmer h-64 rounded-xl" />
            <div className="shimmer h-64 rounded-xl" />
            <div className="shimmer h-64 rounded-xl" />
          </div>
        ) : error || !profile ? (
          <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            No se pudo cargar tu perfil: {error?.message}{" "}
            <button onClick={reload} className="ml-2 underline">Reintentar</button>
          </div>
        ) : (
          <>
            <section aria-labelledby="sec-data" className="mb-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4 md:p-6">
              <h2 id="sec-data" className="mb-4 text-lg font-semibold">Datos personales</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <AvatarSection
                  name={name}
                  avatarUrl={currentAvatar}
                  onChange={(url) => {
                    setAvatarUrl(url);
                    updateUser({ avatarUrl: url }); // el header cambia al instante
                  }}
                />
                <ProfileForm profile={profile} onSaved={(patch) => updateUser(patch)} />
              </div>
            </section>

            <section aria-labelledby="sec-sec" className="mb-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4 md:p-6">
              <h2 id="sec-sec" className="mb-4 text-lg font-semibold">Seguridad</h2>
              <PasswordForm />
            </section>

            <section aria-labelledby="sec-priv" className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 md:p-6">
              <h2 id="sec-priv" className="mb-4 text-lg font-semibold">Portabilidad y eliminación de datos</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DataPortability />
                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-300">
                    <Trash2 size={16} aria-hidden /> Eliminar mi cuenta
                  </div>
                  <p className="mb-3 text-xs opacity-70">Esta acción es irreversible: se borran tus datos, reseñas y listas.</p>
                  <button
                    onClick={() => setDeleting(true)}
                    className="min-h-11 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500"
                  >
                    Eliminar cuenta
                  </button>
                </div>
              </div>
              <p className="mt-4 text-xs opacity-70">
                ¿Dudas sobre privacidad? Contáctanos. Respetamos tus derechos de acceso, rectificación, cancelación y oposición.
              </p>
            </section>
          </>
        )}
      </main>

      <DeleteAccountDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onDeleted={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      />
      <Footer className="bg-black" />
    </div>
  );
}
