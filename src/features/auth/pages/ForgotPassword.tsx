import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "@/shared/api/auth";
import {
  AuthAlert,
  AuthLayout,
  authCardClass,
  authInputClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
} from "../components/AuthLayout";

const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  /** Correo al que se pidió el enlace; con valor se muestra la pantalla de confirmación. */
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const send = async (address: string) => {
    setSending(true);
    setError("");
    setNotice("");
    try {
      await forgotPassword(address);
      setSentTo(address);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la solicitud. Inténtalo de nuevo.");
      return false;
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(email.trim());
  };

  const handleResend = async () => {
    if (sentTo && (await send(sentTo))) setNotice("Si el correo está registrado, te enviamos un enlace nuevo.");
  };

  const changeEmail = () => {
    setSentTo(null);
    setError("");
    setNotice("");
  };

  if (sentTo) {
    return (
      <AuthLayout>
        <div className={authCardClass}>
          <h2 className="text-3xl font-bold mb-6 text-center">Revisa tu correo</h2>

          {notice && <AuthAlert tone="success">{notice}</AuthAlert>}
          {error && <AuthAlert tone="error">{error}</AuthAlert>}

          <p className="mb-3 text-sm leading-relaxed opacity-90">
            Si <span className="font-semibold break-all">{sentTo}</span> está registrado, te enviamos un enlace para
            crear una contraseña nueva.
          </p>
          <p className="mb-6 text-xs leading-relaxed opacity-70">
            El enlace caduca en unos minutos y solo puede usarse una vez. Si no lo ves, revisa la carpeta de spam.
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={sending || cooldown > 0}
            className={authSecondaryButtonClass}
          >
            {sending ? "Enviando..." : cooldown > 0 ? `Reenviar en ${cooldown} s` : "Reenviar"}
          </button>
          <Link to="/login" className={`${authPrimaryButtonClass} mt-3`}>
            Volver a iniciar sesión
          </Link>
          <button
            type="button"
            onClick={changeEmail}
            className="mt-4 w-full text-center text-sm opacity-80 hover:underline"
          >
            Usar otro correo
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className={authCardClass}>
        <h2 className="text-3xl font-bold mb-3 text-center">¿Olvidaste tu contraseña?</h2>
        <p className="mb-6 text-center text-sm leading-relaxed opacity-80">
          Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva.
        </p>

        {error && <AuthAlert tone="error">{error}</AuthAlert>}

        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className={authInputClass}
          />
        </div>

        <button type="submit" disabled={sending} className={authPrimaryButtonClass}>
          {sending ? "Enviando..." : "Enviar enlace"}
        </button>

        <Link to="/login" className="mt-5 block text-center text-sm opacity-80 hover:underline">
          Volver a iniciar sesión
        </Link>
      </form>
    </AuthLayout>
  );
}
