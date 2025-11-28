import { Link } from "react-router-dom";

export default function ProfileMenu({ logout, navigate }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-48 bg-black/95 border border-gray-700 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
      <div className="p-2">
        <Link to="/profile" className="block px-3 py-2 text-white hover:bg-gray-800 rounded text-sm">
          Cuenta
        </Link>

        <hr className="border-gray-700 my-2" />

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="block w-full text-left px-3 py-2 text-white hover:bg-gray-800 rounded text-sm"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
