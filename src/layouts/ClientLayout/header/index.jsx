import { Menu, X, Search, User } from "lucide-react";
import NetflixSearch from "@/shared/components/Search";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import ProfileMenu from "./ProfileMenu";
import { useHeader } from "./useHeader";
import { Link } from "react-router-dom";

export function Header() {
  const {
    isScrolled,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    searchRef,
    showSearch,
    setShowSearch,
    navigate,
    logout,
    categories,
  } = useHeader();

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled ? "bg-black" : "bg-gradient-to-b from-black/80 to-transparent"}`}>

        <div className="flex items-center justify-between px-4 py-4 md:px-12">
          <div className="flex items-center space-x-15">

            <Link to="/home" className="text-red-600 font-bold text-4xl">PixelFlix</Link>

            <DesktopNav navigate={navigate} categories={categories} />

            <button
              className="lg:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          <div className="flex items-center space-x-4" ref={searchRef}>
            <Search size={20} onClick={() => setShowSearch(true)} className="text-white cursor-pointer" />

            <div className="relative group">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center cursor-pointer">
                <User size={20}/>
              </div>

              <ProfileMenu logout={logout} navigate={navigate} />
            </div>
          </div>
        </div>

        {isMobileMenuOpen && <MobileNav navigate={navigate} />}
      </header>

      {showSearch && <NetflixSearch onClose={() => setShowSearch(false)} />}
    </>
  );
}
