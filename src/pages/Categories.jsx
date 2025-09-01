import React, { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Footer } from "../components/Footer";
import NetflixSearch from "../components/Search";
import ItemDialog from "../components/ItemDialog";
import CategorySection from "../components/CategorySection";

const BACKEND_URL = "http://localhost:3000";

export default function CategoriesPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);

  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/categories/list?limit=100`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        setCategories(json);
      } catch (e) {
        console.error("Error fetching categories:", e);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen netflix-container p-7">
      {/* Header simple */}
      <div className="sticky top-0 z-30 bg-black/70 backdrop-blur py-4 mb-5">
        <div className="flex items-center gap-6">
          <a
            href="/home"
            className="text-xl font-semibold text-3xl md:text-4xl text-red-600"
          >
            PixelFlix
          </a>
          <div className="flex space-x-1">
            <a href="/home" className="text-sm opacity-80 hover:text-gray-300">
              Home
            </a>
            <span className="text-sm opacity-80"> / </span>
            <a
              href="/categorias"
              className="text-sm opacity-80 hover:text-gray-300"
            >
              Categorías
            </a>
          </div>
          <div className="flex flex-1 justify-end items-center" ref={searchRef}>
            <Search
              className="text-white w-5 h-5 cursor-pointer hover:text-gray-300 transition-colors"
              onClick={() => setShowSearch(true)}
            />
          </div>
        </div>
      </div>

      {/* Secciones */}
      <main className="space-y-2">
        <CategorySection
          type="movie"
          title="Películas"
          categories={categories}
          onSelectItem={(it) => {
            setSelectedItem(it);
            setOpen(true);
          }}
        />
        <CategorySection
          type="tv"
          title="Series"
          categories={categories}
          onSelectItem={(it) => {
            setSelectedItem(it);
            setOpen(true);
          }}
        />
        <CategorySection
          type="anime"
          title="Anime"
          categories={categories}
          onSelectItem={(it) => {
            setSelectedItem(it);
            setOpen(true);
          }}
        />
      </main>

      <Footer className="bg-black" />

      {showSearch && <NetflixSearch onClose={() => setShowSearch(false)} />}

      <ItemDialog open={open} onClose={() => setOpen(false)} item={selectedItem} />
    </div>
  );
}
