import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Category } from "@/entities/categories";
import { mapTitle, type TitleEntity, type TitleType } from "@/entities/titles";
import { listTitles } from "@/shared/api/titles";
import Row from "./Row";
import GenreChips from "./ui/GenreChips";

const PAGE_SIZE = 21;

interface Props {
  type: TitleType;
  title: string;
  categories: Category[];
  onSelectItem: (item: TitleEntity) => void;
}

export default function CategorySection({ type, title, categories, onSelectItem }: Props) {
  const genreOptions = useMemo(() => categories.map((c) => c.name), [categories]);
  const [genre, setGenre] = useState("");
  const [items, setItems] = useState<TitleEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const requestId = useRef(0);

  // Mantiene un género válido cuando llegan o cambian las categorías.
  useEffect(() => {
    if (genreOptions.length && !genreOptions.includes(genre)) setGenre(genreOptions[0]);
  }, [genreOptions, genre]);

  const loadItems = useCallback(
    async (p: number) => {
      const category = categories.find((c) => c.name === genre);
      if (!category) return;
      const id = ++requestId.current;
      setLoading(true);
      try {
        const data = await listTitles({ type, categoryId: category.id, skip: (p - 1) * PAGE_SIZE, limit: PAGE_SIZE });
        if (id !== requestId.current) return; // respuesta obsoleta
        const mapped = data.map(mapTitle);
        setItems((prev) => (p === 1 ? mapped : [...prev, ...mapped]));
        setHasMore(mapped.length === PAGE_SIZE);
      } catch (e) {
        if (id !== requestId.current) return;
        console.error(e);
        setItems([]);
        setHasMore(false);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [categories, genre, type],
  );

  useEffect(() => {
    if (!genre) return;
    setPage(1);
    setItems([]);
    setHasMore(true);
    void loadItems(1);
  }, [genre, loadItems]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    void loadItems(next);
  };

  return (
    <div className="mb-10 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>

      <GenreChips options={genreOptions} value={genre} onChange={setGenre} />

      <Row title={`Explora ${title} de ${genre}`} items={items} loading={loading} onSelectItem={onSelectItem} />

      {!loading && hasMore && items.length > 0 && (
        <button
          onClick={loadMore}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
        >
          Ver más
        </button>
      )}
      {!loading && items.length === 0 && genre && (
        <p className="text-sm opacity-60">No hay {title.toLowerCase()} en esta categoría todavía.</p>
      )}
    </div>
  );
}
