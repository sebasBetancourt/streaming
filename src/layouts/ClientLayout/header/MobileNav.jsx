import { Link } from "react-router-dom";

export default function MobileNav({ navigate }) {
  return (
    <nav className="flex flex-col p-4 space-y-4 text-gray-300">
      <a href="#Explore" className="hover:text-gray-400">Explorar</a>
      <a href="#Ranking" className="hover:text-gray-400">Clasificaciones</a>

      <Link to="/categories" className="hover:text-gray-400">
        Categorías
      </Link>

      <Link to="/favorites" className="hover:text-gray-400">
        Favoritos
      </Link>

      <Link to="/list" className="hover:text-gray-400">
        Mi Lista
      </Link>
    </nav>
  );
}
