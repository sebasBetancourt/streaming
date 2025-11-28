import { Link } from "react-router-dom";

export default function MobileNav({ navigate }) {
  return (
    <nav className="flex flex-col p-4 space-y-4 text-gray-300">
      <a href="#Explore" className="hover:text-gray-400">Explorar</a>
      <a href="#Ranking" className="hover:text-gray-400">Clasificaciones</a>

      <button onClick={() => navigate("/categories")} className="hover:text-gray-400">
        Categorías
      </button>

      <button onClick={() => navigate("/favorites")} className="hover:text-gray-400">
        Favoritos
      </button>

      <button onClick={() => navigate("/list")} className="hover:text-gray-400">
        Mi Lista
      </button>
    </nav>
  );
}
