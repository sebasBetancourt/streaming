import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPassword, validateResetToken } from "@/shared/api/auth";
import { ApiError } from "@/shared/api/client";
import {
  AuthAlert,
  AuthLayout,
  authCardClass,
  authInputClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
} from "../components/AuthLayout";
import type { LoginLocationState } from "./Login";

/** Misma regla que el registro y el backend. */
const MIN_PASSWORD_LENGTH = 6;
const INVALID_LINK = "Este enlace no es válido o ya caducó. Pide uno nuevo para restablecer tu contraseña.";

type Status = "validating" | "invalid" | "ready";

const linkErrorMessage = (err: unknown) =>
  err instanceof ApiError && err.status !== 400 ? err.message : INVALID_LINK;

function PasswordField(props: {
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative mb-4">
      <input
        {...props}
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        required
        className={`${authInputClass} pr-20`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-white/15 px-2 py-1 text-xs opacity-80 transition hover:opacity-100"
      >
        {visible ? "Ocultar" : "Ver"}
      </button>
    </div>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token] = useState(() => new URLSearchParams(location.search).get("token") ?? "");
  const [status, setStatus] = useState<Status>(token ? "validating" : "invalid");
  const [invalidMessage, setInvalidMessage] = useState(INVALID_LINK);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // El token ya está en el estado: se quita de la URL para que no quede en el historial ni en el referrer.
  useEffect(() => {
    if (location.search) navigate(location.pathname, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    validateResetToken(token)
      .then(() => !cancelled && setStatus("ready"))
      .catch((err) => {
        if (cancelled) return;
        setInvalidMessage(linkErrorMessage(err));
        setStatus("invalid");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, form.password);
      const state: LoginLocationState = { notice: "Contraseña actualizada. Ya puedes iniciar sesión." };
      navigate("/login", { replace: true, state });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setInvalidMessage(INVALID_LINK);
        setStatus("invalid");
      } else {
        setError(err instanceof Error ? err.message : "No se pudo actualizar la contraseña. Inténtalo de nuevo.");
      }
      setSubmitting(false);
    }
  };

  if (status === "validating") {
    return (
      <AuthLayout>
        <div className={`${authCardClass} text-center`} role="status">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#e50914]" />
          Comprobando el enlace...
        </div>
      </AuthLayout>
    );
  }

  if (status === "invalid") {
    return (
      <AuthLayout>
        <div className={authCardClass}>
          <h2 className="text-3xl font-bold mb-6 text-center">Enlace no válido</h2>
          <AuthAlert tone="error">{invalidMessage}</AuthAlert>
          <Link to="/forgot-password" className={authPrimaryButtonClass}>
            Pedir otro enlace
          </Link>
          <Link to="/login" className={`${authSecondaryButtonClass} mt-3`}>
            Volver a iniciar sesión
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className={authCardClass}>
        <h2 className="text-3xl font-bold mb-3 text-center">Nueva contraseña</h2>
        <p className="mb-6 text-center text-sm opacity-80">
          Debe tener al menos {MIN_PASSWORD_LENGTH} caracteres.
        </p>

        {error && <AuthAlert tone="error">{error}</AuthAlert>}

        <PasswordField
          name="password"
          placeholder="Nueva contraseña"
          value={form.password}
          onChange={handleChange}
        />
        <PasswordField
          name="confirmPassword"
          placeholder="Confirmar contraseña"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <button type="submit" disabled={submitting} className={authPrimaryButtonClass}>
          {submitting ? "Guardando..." : "Guardar contraseña"}
        </button>

        <Link to="/login" className="mt-5 block text-center text-sm opacity-80 hover:underline">
          Volver a iniciar sesión
        </Link>
      </form>
    </AuthLayout>
  );
}
