import type { Category } from "@/entities/categories";

interface Props {
  categories: Category[];
  navigate: (to: string) => void;
}

export default function CategoriesDropdown({ categories, navigate }: Props) {
  return (
    <div className="group relative">
      <button onClick={() => navigate("/categories")} className="text-lg text-gray-300 hover:text-gray-400">
        Categorías
      </button>

      <div className="invisible absolute left-0 top-full mt-2 w-[600px] rounded border border-gray-800 bg-black/95 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="p-3">
          <h4 className="mb-2 text-sm font-semibold text-white">Categorías</h4>
          <hr className="mb-2 border-gray-700" />

          <div className="grid grid-cols-3 gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/categories?category=${c.id}`)}
                className="block rounded px-3 py-1 text-left text-sm text-gray-300 hover:bg-gray-800"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
