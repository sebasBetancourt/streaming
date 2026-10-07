import { useState } from "react";
import type { TitleEntity, TitleType } from "@/entities/titles";
import { listCategories } from "@/shared/api/categories";
import CategorySection from "@/shared/components/CategorySection";
import { Footer } from "@/shared/components/Footer";
import ItemDialog from "@/shared/components/ItemDialog";
import { useAsync } from "@/shared/hooks/useAsync";

const SECTIONS: { type: TitleType; title: string }[] = [
  { type: "movie", title: "Películas" },
  { type: "tv", title: "Series" },
  { type: "anime", title: "Anime" },
];

export default function CategoriesPage() {
  const { data: categories = [], error } = useAsync(() => listCategories({ limit: 100 }), []);
  const [selected, setSelected] = useState<TitleEntity | null>(null);

  return (
    <div className="netflix-container min-h-screen p-7 pt-20">
      {error && <p className="mb-4 text-sm text-red-400">No se pudieron cargar las categorías: {error.message}</p>}

      <main className="space-y-2">
        {SECTIONS.map((s) => (
          <CategorySection key={s.type} type={s.type} title={s.title} categories={categories} onSelectItem={setSelected} />
        ))}
      </main>

      <Footer className="bg-black" />

      <ItemDialog open={!!selected} onClose={() => setSelected(null)} item={selected} />
    </div>
  );
}
