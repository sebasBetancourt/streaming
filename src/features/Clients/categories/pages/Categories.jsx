import React, { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Footer } from "@/shared/components/Footer.jsx";
import NetflixSearch from "@/shared/components/Search";
import ItemDialog from "@/shared/components/ItemDialog.jsx";
import CategorySection from "@/shared/components/CategorySection.jsx";

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
    <div className="min-h-screen netflix-container p-7 pt-20">
      

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
