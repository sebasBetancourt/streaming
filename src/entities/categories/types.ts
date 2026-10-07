export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

/** Categoría con títulos aprobados (`/categories/summary`): cuántos y el póster del mejor valorado. */
export interface CategorySummary {
  id: string;
  name: string;
  count: number;
  posterUrl: string | null;
}
