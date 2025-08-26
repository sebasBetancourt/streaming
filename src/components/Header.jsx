import { Search, User, Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false); // Cierra el input si haces clic fuera
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header id="Header" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="flex items-center justify-between px-4 py-4 md:px-12">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-15">
          <a href="#" className="text-red-600 font-bold text-3xl md:text-5xl tracking-tight">PixelFlix</a>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#Explore" className="text-gray-300 hover:text-gray-400 transition-colors font-medium text-lg">Explore</a>
            <a href="#Ranking" className="text-gray-300 hover:text-gray-400 transition-colors text-lg">Rakings</a>
            {/* Dropdown Categories */}
            <div className="relative group">
              <a href="#" className="text-gray-300 hover:text-gray-400 transition-colors text-lg">
                Categories
              </a>

              {/* Dropdown Menu */}
              <div className="absolute left-0 top-full mt-2 w-56 bg-black/95 border border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 rounded shadow-lg">
                <div className="p-3 space-y-3">

                  {/* Películas */}
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">Películas</h4>
                    <a href="#" className="block px-3 py-1 text-gray-300 hover:bg-gray-800 rounded text-sm">Acción</a>
                    <a href="#" className="block px-3 py-1 text-gray-300 hover:bg-gray-800 rounded text-sm">Comedia</a>
                    <a href="#" className="block px-3 py-1 text-gray-300 hover:bg-gray-800 rounded text-sm">Drama</a>
                    <a href="#" className="block px-3 py-1 text-gray-300 hover:bg-gray-800 rounded text-sm">Terror</a>
                    <hr className="border-gray-700 mt-2" />
                  </div>

                  {/* Series */}
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">Series</h4>
                    <a href="#" className="block px-3 py-1 text-gray-300 hover:bg-gray-800 rounded text-sm">Ciencia Ficción</a>
                    <a href="#" className="block px-3 py-1 text-gray-300 hover:bg-gray-800 rounded text-sm">Misterio</a>
                    <a href="#" className="block px-3 py-1 text-gray-300 hover:bg-gray-800 rounded text-sm">Thriller</a>
                    <a href="#" className="block px-3 py-1 text-gray-300 hover:bg-gray-800 rounded text-sm">Documentales</a>
                    <hr className="border-gray-700 mt-2" />
                  </div>

                  {/* Anime */}
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">Anime</h4>
                    <a href="#" className="block px-3 py-1 text-gray-300 hover:bg-gray-800 rounded text-sm">Shonen</a>
                    <a href="#" className="block px-3 py-1 text-gray-300 hover:bg-gray-800 rounded text-sm">Shojo</a>
                    <a href="#" className="block px-3 py-1 text-gray-300 hover:bg-gray-800 rounded text-sm">Seinen</a>
                    <a href="#" className="block px-3 py-1 text-gray-300 hover:bg-gray-800 rounded text-sm">Isekai</a>
                  </div>

                </div>
              </div>
            </div>

            <a href="#" className="text-gray-300 hover:text-gray-400 transition-colors text-lg">Favorites</a>
            <a href="#" className="text-gray-300 hover:text-gray-400 transition-colors text-lg">My List</a>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center" ref={searchRef}>
            <Search
              className="text-white w-5 h-5 cursor-pointer hover:text-gray-300 transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)} // Alterna el estado del input
            />
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isSearchOpen ? "w-64 ml-3" : "w-0"
              }`}
            >
              {isSearchOpen && (
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-black/90 text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 w-full"
                />
              )}
            </div>
          </div>

          
          {/* Profile Dropdown */}
          <div className="relative group">
            <div className="w-8 h-8 bg-blue-600 rounded cursor-pointer flex items-center justify-center hover:bg-blue-700 transition-colors">
              <User className="text-white w-4 h-4" />
            </div>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-black/95 border border-gray-700 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="p-2">
                <a href="#" className="block px-3 py-2 text-white hover:bg-gray-800 rounded text-sm">Account</a>
                <hr className="border-gray-700 my-2" />
                <a href="#" className="block px-3 py-2 text-white hover:bg-gray-800 rounded text-sm">Sign out of PelixFlix</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-black/95 border-t border-gray-700">
          <nav className="flex flex-col p-4 space-y-4">
            <a
              href="#"
              className="text-gray-300 hover:text-gray-400 transition-colors font-medium"
            >
              Explore
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-gray-400 transition-colors"
            >
              Rankings
            </a>
        
            {/* Categories with Dropdown */}
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="flex items-center justify-between text-white hover:text-gray-300 transition-colors"
            >
              <span className="text-gray-300 hover:text-gray-400">Categories</span>
              {isCategoriesOpen ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
            
            {/* Submenu Categories */}
            {isCategoriesOpen && (
              <div className="ml-4 mt-2 space-y-4 text-sm">
                {/* Películas */}
                <div>
                  <p className="text-gray-400 font-medium">Películas</p>
                  <div className="ml-2 mt-1 space-y-1">
                    <a href="#" className="block text-white hover:text-gray-300">
                      Acción
                    </a>
                    <a href="#" className="block text-white hover:text-gray-300">
                      Comedia
                    </a>
                    <a href="#" className="block text-white hover:text-gray-300">
                      Drama
                    </a>
                  </div>
                </div>
            
                <hr className="border-gray-700" />
            
                {/* Series */}
                <div>
                  <p className="text-gray-400 font-medium">Series</p>
                  <div className="ml-2 mt-1 space-y-1">
                    <a href="#" className="block text-white hover:text-gray-300">
                      Thriller
                    </a>
                    <a href="#" className="block text-white hover:text-gray-300">
                      Romance
                    </a>
                    <a href="#" className="block text-white hover:text-gray-300">
                      Ciencia Ficción
                    </a>
                  </div>
                </div>
            
                <hr className="border-gray-700" />
            
                {/* Anime */}
                <div>
                  <p className="text-gray-400 font-medium">Anime</p>
                  <div className="ml-2 mt-1 space-y-1">
                    <a href="#" className="block text-white hover:text-gray-300">
                      Shonen
                    </a>
                    <a href="#" className="block text-white hover:text-gray-300">
                      Seinen
                    </a>
                    <a href="#" className="block text-white hover:text-gray-300">
                      Isekai
                    </a>
                  </div>
                </div>
              </div>
            )}
  
            <a
              href="#"
              className="text-gray-300 hover:text-gray-400 transition-colors"
            >
              Favorites
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-gray-400 transition-colors"
            >
              My List
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}