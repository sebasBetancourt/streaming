import { Link } from "react-router-dom";

export default function CategoriesDropdown({ categories, navigate }) {
  return (
    <div className="relative group">
      <button
        onClick={() => navigate("/categories")}
        className="text-gray-300 hover:text-gray-400 text-lg"
      >
        Categorías
      </button>

      <div className="absolute left-0 top-full mt-2 w-[600px] bg-black/95 border border-gray-800 
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                      transition-all duration-200 rounded shadow-lg">
        <div className="p-3">
          <h4 className="text-white font-semibold text-sm mb-2">Categorías</h4>
          <hr className="border-gray-700 mb-2" />

          <div className="grid grid-cols-3 gap-2">
            {categories?.map((c) => (
              <Link
                key={c._id}
                to={`/categories/${c.slug}`}
                className="block px-3 py-1 text-gray-300 hover:bg-gray-800 rounded text-sm"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
