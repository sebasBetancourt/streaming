import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Footer } from "../components/Footer";
import NetflixSearch from "../components/Search";

const BACKEND_URL = "http://localhost:3000";

function ArrowButton({ dir = "left", onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-full p-2 opacity-0 ring-1 ring-white/20 backdrop-blur transition group-hover:opacity-100 ${
        dir === "left" ? "left-2" : "right-2"
      }`}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      aria-label={dir === "left" ? "Scroll left" : "Scroll right"}
    >
      {dir === "left" ? <ChevronLeft /> : <ChevronRight />}
    </div>
  );
}

function Row({ title, items, loading }) {
  const trackRef = useRef(null);

  const scrollAmt = () => {
    const el = trackRef.current;
    if (!el) return 0;
    return Math.round(el.clientWidth * 0.9);
  };

  const left = () =>
    trackRef.current?.scrollBy({ left: -scrollAmt(), behavior: "smooth" });
  const right = () =>
    trackRef.current?.scrollBy({ left: scrollAmt(), behavior: "smooth" });

  return (
    <section className="content-section">
      <h2 className="mb-6 text-xl font-semibold">{title}</h2>

      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <ArrowButton dir="left" onClick={left} />
        <ArrowButton dir="right" onClick={right} />

        <div
          ref={trackRef}
          className="scrollbar-hide netflix-section-padding flex gap-3 overflow-x-auto "
        >
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="relative h-74 w-32 flex-shrink-0 overflow-hidden rounded-md md:h-74 md:w-84 shimmer"
                />
              ))
            : items.map((it) => (
                <div
                  key={it.id}
                  role="button"
                  tabIndex={0}
                  className="group relative h-44 w-32 flex-shrink-0 overflow-hidden rounded-md md:h-84 md:w-54"
                  style={{ backgroundColor: "#141414" }}
                  title={it.title}
                >
                  <div
                    className="absolute inset-0 bg-center"
                    style={{
                      backgroundImage: it.poster
                        ? `url(${it.poster})`
                        : "linear-gradient(180deg,#222,#111)",
                      backgroundSize: "cover",
                    }}
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

function GenreChips({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-7">
      {options.map((g) => (
        <div
          key={g}
          role="button"
          tabIndex={0}
          onClick={() => onChange(g)}
          className={`select-none h-8 content-center rounded-full border px-3 py-1 text-sm transition ${
            value === g
              ? "border-white/70 bg-white/20"
              : "border-white/15 bg-white/5 hover:bg-white/10"
          }`}
        >
          {g}
        </div>
      ))}
    </div>
  );
}

function CategorySection({ type, title, categories }) {
  const genreOptions = useMemo(() => categories.map((c) => c.name), [categories]);
  const [genre, setGenre] = useState(genreOptions[0] || "Acción");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 21;

  useEffect(() => {
    if (!categories.length) return;
    setPage(1);
    setItems([]);
    setHasMore(true);
    loadItems(1);
  }, [type, genre, categories]);

  const loadItems = async (p = 1) => {
    setLoading(true);
    try {
      const selectedCategory = categories.find((c) => c.name === genre);
      if (!selectedCategory) {
        setItems([]);
        setHasMore(false);
        return;
      }

      const genreId = selectedCategory._id;
      const skip = (p - 1) * limit;
      const url = `${BACKEND_URL}/titles/list?type=${type}&categoriesId=${genreId}&skip=${skip}&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();

      // Filtramos títulos para que contengan la categoría seleccionada
      const filteredItems = json.filter((it) =>
        it.categoriesIds.includes(genreId)
      );

      const newItems = filteredItems.map((it) => ({
        id: it._id,
        title: it.title,
        poster: it.posterUrl,
        tag: it.type,
      }));

      setItems((prev) => (p === 1 ? newItems : [...prev, ...newItems]));
      setHasMore(newItems.length === limit);
    } catch (e) {
      console.error(e);
      setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadItems(nextPage);
  };

  return (
    <div className="mb-10 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>

      <GenreChips options={genreOptions} value={genre} onChange={setGenre} />

      <Row title={`Explora ${title} de ${genre}`} items={items} loading={loading} />
      {!loading && hasMore && (
        <button
          onClick={loadMore}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Ver más
        </button>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);

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
            <a
              href="/home"
              className="text-sm opacity-80 hover:text-gray-300"
            >
              Home{" "}
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
        <CategorySection type="movie" title="Películas" categories={categories} />
        <CategorySection type="tv" title="Series" categories={categories} />
        <CategorySection type="anime" title="Anime" categories={categories} />
      </main>

      {/* Footer sutil */}
      <Footer className="bg-black" />

      {/* Buscador modal */}
      {showSearch && <NetflixSearch onClose={() => setShowSearch(false)} />}
    </div>
  );
}
