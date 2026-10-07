import { Navigate, Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import type { Role } from "@/entities/users";
import { useAuth } from "../providers/AuthContext";

interface Props {
  /** Roles con acceso; sin definir, cualquier usuario autenticado. */
  roles?: Role[];
  children?: ReactNode;
}

export default function PrivateRoute({ roles, children }: Props) {
  const { user, validating } = useAuth();

  if (validating) return <div className="p-8 text-white">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children ?? <Outlet />}</>;
}
