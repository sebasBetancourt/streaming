import { Search, Bell, User, Menu, X, Gift } from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="flex items-center justify-between px-4 py-4 md:px-12">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <div className="text-red-600 font-bold text-2xl md:text-3xl tracking-tight">PixelFlix</div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <a href="#" className="text-white hover:text-gray-300 transition-colors font-medium">Home</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">TV Shows</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Movies</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">New & Popular</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">My List</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Browse by Languages</a>
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
          <Search className="text-white w-5 h-5 cursor-pointer hover:text-gray-300 transition-colors" />
          <span className="hidden md:block text-white text-sm cursor-pointer hover:text-gray-300 transition-colors">Kids</span>
          <Gift className="text-white w-5 h-5 cursor-pointer hover:text-gray-300 transition-colors" />
          <Bell className="text-white w-5 h-5 cursor-pointer hover:text-gray-300 transition-colors" />
          
          {/* Profile Dropdown */}
          <div className="relative group">
            <div className="w-8 h-8 bg-blue-600 rounded cursor-pointer flex items-center justify-center hover:bg-blue-700 transition-colors">
              <User className="text-white w-4 h-4" />
            </div>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-black/95 border border-gray-700 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="p-2">
                <a href="#" className="block px-3 py-2 text-white hover:bg-gray-800 rounded text-sm">Manage Profiles</a>
                <a href="#" className="block px-3 py-2 text-white hover:bg-gray-800 rounded text-sm">Account</a>
                <a href="#" className="block px-3 py-2 text-white hover:bg-gray-800 rounded text-sm">Help Center</a>
                <hr className="border-gray-700 my-2" />
                <a href="#" className="block px-3 py-2 text-white hover:bg-gray-800 rounded text-sm">Sign out of Netflix</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-black/95 border-t border-gray-700">
          <nav className="flex flex-col p-4 space-y-4">
            <a href="#" className="text-white hover:text-gray-300 transition-colors font-medium">Home</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">TV Shows</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Movies</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">New & Popular</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">My List</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Browse by Languages</a>
          </nav>
        </div>
      )}
    </header>
  );
}