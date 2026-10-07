import { Link } from "react-router-dom";

export default function MobileNav() {
  return (
    <nav className="flex flex-col space-y-4 p-4 text-gray-300">
      <a href="/home#Explore" className="hover:text-gray-400">Explorar</a>
      <a href="/home#Ranking" className="hover:text-gray-400">Clasificaciones</a>
      <Link to="/categories" className="hover:text-gray-400">Categorías</Link>
      <Link to="/favorites" className="hover:text-gray-400">Favoritos</Link>
      <Link to="/list" className="hover:text-gray-400">Mi Lista</Link>
    </nav>
  );
}
