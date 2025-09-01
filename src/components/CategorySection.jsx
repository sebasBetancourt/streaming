import { useEffect, useMemo, useState } from "react";
import Row from "./Row";
import GenreChips from "./ui/GenreChips";

const BACKEND_URL = "http://localhost:3000";

export default function CategorySection({ type, title, categories, onSelectItem }) {
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

      const filteredItems = json.filter((it) =>
        it.categoriesIds.includes(genreId)
      );

      const newItems = filteredItems.map((it) => ({
        id: it._id,
        title: it.title,
        poster: it.posterUrl,
        tag: it.type,
        year: it.year,
        rating: it.ratingAvg,
        author: it.author,
        description: it.description,
        creator: it.creator,
        genres: it.categories,
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

      <Row
        title={`Explora ${title} de ${genre}`}
        items={items}
        loading={loading}
        onSelectItem={onSelectItem}
      />

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
