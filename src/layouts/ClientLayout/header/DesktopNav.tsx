import { Link } from "react-router-dom";
import type { Category } from "@/entities/categories";
import CategoriesDropdown from "./CategoriesDropdown";

interface Props {
  navigate: (to: string) => void;
  categories: Category[];
}

export default function DesktopNav({ navigate, categories }: Props) {
  return (
    <nav className="hidden items-center space-x-8 lg:flex">
      <a href="/home#Explore" className="text-lg text-gray-300 hover:text-gray-400">Explorar</a>
      <a href="/home#Ranking" className="text-lg text-gray-300 hover:text-gray-400">Clasificaciones</a>

      <CategoriesDropdown categories={categories} navigate={navigate} />

      <Link to="/favorites" className="text-lg text-gray-300 hover:text-gray-400">Favoritos</Link>
      <Link to="/list" className="text-lg text-gray-300 hover:text-gray-400">Mi Lista</Link>
    </nav>
  );
}
