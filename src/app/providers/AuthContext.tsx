import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { SessionUser } from "@/entities/users";
import { SESSION_EXPIRED_EVENT } from "@/shared/api/client";
import { verifySession } from "@/shared/api/auth";
import { storage } from "@/shared/lib/storage";

interface AuthContextValue {
  user: SessionUser | null;
  /** `true` mientras se valida con el backend la sesión guardada. */
  validating: boolean;
  login: (user: SessionUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => (storage.getToken() ? storage.getUser() : null));
  const [validating, setValidating] = useState<boolean>(() => !!(storage.getToken() && storage.getUser()));

  const logout = useCallback(() => {
    storage.clear();
    setUser(null);
  }, []);

  const login = useCallback((u: SessionUser, token: string) => {
    storage.setSession(u, token);
    setUser(u);
  }, []);

  // Valida una sola vez, al arrancar, la sesión guardada.
  useEffect(() => {
    if (!validating) return;
    let cancelled = false;
    verifySession()
      .then((valid) => !valid && !cancelled && logout())
      .catch(() => !cancelled && logout())
      .finally(() => !cancelled && setValidating(false));
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // El cliente HTTP avisa cuando el backend rechaza el token en cualquier llamada.
  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, logout);
  }, [logout]);

  const value = useMemo(() => ({ user, validating, login, logout }), [user, validating, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
}
