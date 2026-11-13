import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import type { Role } from "@/entities/users";
import { useAuth } from "../providers/AuthContext";
import type { LoginRedirectState } from "../providers/useRequireAuth";

interface Props {
  /** Roles con acceso; sin definir, cualquier usuario autenticado. */
  roles?: Role[];
  children?: ReactNode;
}

export default function PrivateRoute({ roles, children }: Props) {
  const { user, validating } = useAuth();
  const location = useLocation();

  if (validating) return <div className="p-8 text-white">Cargando...</div>;
  if (!user) {
    // Volver aquí después de iniciar sesión o registrarse
    const state: LoginRedirectState = {
      notice: "Inicia sesión o regístrate para ver esta sección.",
      from: location.pathname + location.search,
    };
    return <Navigate to="/login" state={state} replace />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children ?? <Outlet />}</>;
}
