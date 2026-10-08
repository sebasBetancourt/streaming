import { Link } from "react-router-dom";
import type { SessionUser } from "@/entities/users";
import Avatar from "@/shared/components/Avatar";

interface Props {
  user: SessionUser | null;
  logout: () => void;
  navigate: (to: string) => void;
}

export default function ProfileMenu({ user, logout, navigate }: Props) {
  return (
    <div className="invisible absolute right-0 top-full mt-2 w-56 rounded-lg border border-gray-700 bg-black/95 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
      <div className="p-2">
        {user && (
          <div className="mb-1 flex items-center gap-3 px-3 py-2">
            <Avatar src={user.avatarUrl} name={user.name} size={36} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{user.name}</div>
              <div className="truncate text-xs text-gray-400">{user.email}</div>
            </div>
          </div>
        )}
        <hr className="mb-2 border-gray-700" />
        <Link to="/profile" className="block rounded px-3 py-2 text-sm text-white hover:bg-gray-800">Cuenta</Link>
        {user?.role === "admin" && (
          <Link to="/admin" className="block rounded px-3 py-2 text-sm text-white hover:bg-gray-800">Panel admin</Link>
        )}

        <hr className="my-2 border-gray-700" />

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="block w-full rounded px-3 py-2 text-left text-sm text-white hover:bg-gray-800"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
