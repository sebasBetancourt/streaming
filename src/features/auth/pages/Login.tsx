import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";
import { login, register } from "@/shared/api/auth";
import {
  AuthAlert,
  AuthLayout,
  authCardClass,
  authInputClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
} from "../components/AuthLayout";

/** Estado de navegación con el que otras pantallas (p. ej. restablecer contraseña) dejan un aviso. */
export interface LoginLocationState {
  notice?: string;
}

export default function Login() {
  const { login: authLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(() => (location.state as LoginLocationState | null)?.notice ?? "");
  const [showRegister, setShowRegister] = useState(false);

  const [registerData, setRegisterData] = useState({
    email: "",
    telefono: "",
    pais: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [regError, setRegError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [user, navigate]);

  // El aviso ya está en el estado local; se quita del historial para que no reaparezca al recargar.
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openRegister = () => {
    setRegError("");
    setShowRegister(true);
    setClosing(false);
  };

  const closeRegister = () => {
    setClosing(true);
    setTimeout(() => {
      setShowRegister(false);
      setClosing(false);
    }, 220);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showRegister) closeRegister();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showRegister]);

  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (showRegister && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeRegister();
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showRegister]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    try {
      const response = await login(formData);
      authLogin(response.user, response.token);
      navigate(response.user.role === "admin" ? "/admin" : "/home", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  const handleRegisterChange = (e: ChangeEvent<HTMLInputElement>) =>
    setRegisterData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (registerData.password.length < 6) {
      setRegError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setRegError("Las contraseñas no coinciden.");
      return;
    }
    try {
      await register({
        email: registerData.email.trim(),
        name: registerData.name.trim(),
        password: registerData.password,
        ...(registerData.telefono.trim() && { phone: registerData.telefono.trim() }),
        ...(registerData.pais.trim() && { country: registerData.pais.trim() }),
      });
      closeRegister();
      setRegisterData({
        email: "",
        telefono: "",
        pais: "",
        password: "",
        confirmPassword: "",
        name: "",
      });
      setFormData({ email: registerData.email, password: registerData.password });
      setError("");
      setNotice("Registro exitoso. Por favor, inicia sesión.");
    } catch (err) {
      setRegError(err instanceof Error ? err.message : "Error al registrar usuario. Verifica los datos ingresados.");
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className={authCardClass}>
        <h2 className="text-3xl font-bold mb-6 text-center">Iniciar Sesión</h2>

        {notice && <AuthAlert tone="success">{notice}</AuthAlert>}
        {error && <AuthAlert tone="error">{error}</AuthAlert>}

        <div className="mb-4">
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="email"
            onChange={handleChange}
            value={formData.email}
            required
            className={authInputClass}
          />
        </div>

        <div className="mb-2">
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            onChange={handleChange}
            value={formData.password}
            required
            className={authInputClass}
          />
        </div>

        <div className="mb-4 flex items-center justify-between text-sm opacity-80">
          <label className="flex items-center gap-2">
            <input id="remember" type="checkbox" className="h-4 w-4" />
            <span>Recuérdame</span>
          </label>
          <Link to="/forgot-password" className="hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button type="submit" className={authPrimaryButtonClass}>
          Iniciar Sesión
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/15"></div>
          <div className="text-sm opacity-70">O</div>
          <div className="h-px flex-1 bg-white/15"></div>
        </div>

        <button type="button" className={authSecondaryButtonClass} onClick={openRegister}>
          Regístrate
        </button>

        <div className="mt-6 text-xs opacity-70 leading-relaxed">
          Autenticación basada en tokens (JWT) con expiración y rotación automática.
        </div>
      </form>

      {showRegister && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/70"
            style={{ animation: `${closing ? "overlayOut" : "overlayIn"} 220ms ease both` }}
            onClick={closeRegister}
            aria-hidden="true"
          ></div>

          <div
            ref={modalRef}
            className="relative w-[22rem] md:w-[30rem] rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-md"
            style={{ animation: `${closing ? "modalOut" : "modalIn"} 220ms ease both` }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="font-semibold">Crear cuenta</div>
              <button
                type="button"
                className="h-9 w-9 rounded-full border border-white/20 text-xl leading-none opacity-80 transition hover:opacity-100"
                onClick={closeRegister}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="px-6 py-5">
              <div className="mb-4 text-sm opacity-80">
                Disfruta series, películas y mucho más.
              </div>

              {regError && (
                <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-300">
                  {regError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                    className="w-full h-11 rounded-md border border-white/15 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    required
                    className="w-full h-11 rounded-md border border-white/15 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono"
                    value={registerData.telefono}
                    onChange={handleRegisterChange}
                    className="w-full h-11 rounded-md border border-white/15 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="pais"
                    placeholder="País"
                    value={registerData.pais}
                    onChange={handleRegisterChange}
                    className="w-full h-11 rounded-md border border-white/15 bg-white/10 px-3 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                  />
                </div>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    name="password"
                    placeholder="Contraseña"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                    className="w-full h-11 rounded-md border border-white/15 bg-white/10 px-3 pr-12 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-white/15 px-2 py-1 text-xs opacity-80 transition hover:opacity-100"
                  >
                    {showPw ? "Ocultar" : "Ver"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPw2 ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirmar contraseña"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                    className="w-full h-11 rounded-md border border-white/15 bg-white/10 px-3 pr-12 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw2((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-white/15 px-2 py-1 text-xs opacity-80 transition hover:opacity-100"
                  >
                    {showPw2 ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-xs opacity-70">
                  Al registrarte aceptas nuestros <span className="underline">Términos</span> y{" "}
                  <span className="underline">Privacidad</span>.
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeRegister}
                    className="h-11 rounded-md border border-white/20 bg-white/5 px-4 transition hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="h-11 rounded-md bg-[#e50914] px-5 font-semibold transition hover:bg-[#f6121d] hover:shadow-[0_8px_24px_rgba(229,9,20,0.35)]"
                  >
                    Registrarse
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}