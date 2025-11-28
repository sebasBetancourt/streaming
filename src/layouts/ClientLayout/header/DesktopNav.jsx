 import { Link } from "react-router-dom"; 
 import CategoriesDropdown from "./CategoriesDropdown"; 
 
 export default function DesktopNav({ navigate, categories }) {
  return ( 
  <nav className="hidden lg:flex items-center space-x-8"> 
    <a href="/home#Explore" className="text-gray-300 hover:text-gray-400 text-lg"> 
    Explorar 
    </a> 
    <a href="/home#Ranking" className="text-gray-300 hover:text-gray-400 text-lg">
     Clasificaciones 
    </a> 

    <CategoriesDropdown categories={categories} navigate={navigate} /> 

    <Link to="/favorites" className="text-gray-300 hover:text-gray-400 text-lg">
      Favoritos 
    </Link> 
    <Link to="/list" className="text-gray-300 hover:text-gray-400 text-lg">
      Mi Lista 
    </Link> 

    </nav> 
); }