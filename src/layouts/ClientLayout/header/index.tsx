import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import Avatar from "@/shared/components/Avatar";
import type { TitleEntity } from "@/entities/titles";
import ItemDialog from "@/shared/components/ItemDialog";
import NetflixSearch from "@/shared/components/Search/Search";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import ProfileMenu from "./ProfileMenu";
import { useHeader } from "./useHeader";

export function Header() {
  const { isScrolled, isMobileMenuOpen, setIsMobileMenuOpen, searchRef, showSearch, setShowSearch, navigate, user, logout, categories } =
    useHeader();
  const [selectedItem, setSelectedItem] = useState<TitleEntity | null>(null);

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-black" : "bg-gradient-to-b from-black/80 to-transparent"}`}
      >
        <div className="flex items-center justify-between px-4 py-4 md:px-12">
          <div className="space-x-15 flex items-center">
            <Link to="/home" className="text-4xl font-bold text-red-600">PixelFlix</Link>

            <DesktopNav navigate={navigate} categories={categories} />

            <button className="text-white lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menú">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          <div className="flex items-center space-x-4" ref={searchRef}>
            <Search size={20} onClick={() => setShowSearch(true)} className="cursor-pointer text-white" />

            <div className="group relative">
              <Link to="/profile" aria-label="Mi cuenta" className="block rounded focus-visible:outline-2 focus-visible:outline-white">
                <Avatar src={user?.avatarUrl} name={user?.name ?? "Usuario"} size={32} />
              </Link>
              <ProfileMenu user={user} logout={logout} navigate={navigate} />
            </div>
          </div>
        </div>

        {isMobileMenuOpen && <MobileNav />}
      </header>

      {showSearch && (
        <NetflixSearch
          onClose={() => setShowSearch(false)}
          onSelect={(item) => {
            setShowSearch(false);
            setSelectedItem(item);
          }}
        />
      )}

      {selectedItem && <ItemDialog open item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </>
  );
}
