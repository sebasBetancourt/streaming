import { Link } from "react-router-dom";
import type { Role } from "@/entities/users";

interface Props {
  role?: Role;
  logout: () => void;
  navigate: (to: string) => void;
}

export default function ProfileMenu({ role, logout, navigate }: Props) {
  return (
    <div className="invisible absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-700 bg-black/95 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
      <div className="p-2">
        <Link to="/profile" className="block rounded px-3 py-2 text-sm text-white hover:bg-gray-800">Cuenta</Link>
        {role === "admin" && (
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
