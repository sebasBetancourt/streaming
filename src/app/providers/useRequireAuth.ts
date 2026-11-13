import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

/** Estado que recibe /login: aviso a mostrar y ruta a la que volver después de entrar. */
export interface LoginRedirectState {
  notice?: string;
  from?: string;
}

/**
 * Ejecuta una acción solo si hay sesión; si no, lleva a /login con un aviso
 * y la ruta actual para volver después de iniciar sesión o registrarse.
 */
export function useRequireAuth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    <T,>(notice: string, action: () => T): T | undefined => {
      if (user) return action();
      const state: LoginRedirectState = { notice, from: location.pathname + location.search };
      navigate("/login", { state });
      return undefined;
    },
    [user, navigate, location.pathname, location.search],
  );
}
