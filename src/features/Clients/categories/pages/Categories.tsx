import { useState } from "react";
import type { TitleEntity } from "@/entities/titles";
import { getCategorySummary } from "@/shared/api/categories";
import { Footer } from "@/shared/components/Footer";
import ItemDialog from "@/shared/components/ItemDialog";
import SearchInput from "@/shared/components/SearchInput";
import { useAsync } from "@/shared/hooks/useAsync";
import CategoryCardsRow from "../components/CategoryCardsRow";
import CategoryResults from "../components/CategoryResults";
import EmptyState, { emptyStateButtonClass, emptyStatePrimaryButtonClass } from "../components/EmptyState";
import GenreRows from "../components/GenreRows";
import SortSelect from "../components/SortSelect";
import TypeTabs, { TYPE_OPTIONS, allTitlesLabel } from "../components/TypeTabs";
import { ALL_CATEGORY, MAX_SEARCH, useCategoryFilters } from "../hooks/useCategoryFilters";

const SUGGESTIONS = 4;

export default function CategoriesPage() {
  const { filters, setType, setCategory, setSort, setSearch, setPage } = useCategoryFilters();
  const { type, categoryId, sort, search, page } = filters;
  const summary = useAsync((signal) => getCategorySummary(type, signal), [type]);
  const categories = summary.data ?? [];
  const category = categories.find((c) => c.id === categoryId);
  const typeLabel = TYPE_OPTIONS.find((o) => o.value === type)?.label.toLowerCase() ?? "títulos";
  const [selected, setSelected] = useState<TitleEntity | null>(null);

  const toggleCategory = (id: string) => setCategory(id === categoryId ? undefined : id);
  const suggestionButtons = categories.slice(0, SUGGESTIONS).map((c) => (
    <button key={c.id} type="button" onClick={() => setCategory(c.id)} className={emptyStateButtonClass}>
      {c.name}
    </button>
  ));

  const resultsProps = { type, sort, search, page, onPageChange: setPage, onSelectItem: setSelected };

  const searchOnly = !!search && !categoryId;

  let content;
  if (categoryId === ALL_CATEGORY || searchOnly) {
    // No depende del resumen de géneros: buscar funciona aunque ese resumen falle.
    content = (
      <CategoryResults
        title={searchOnly ? `Resultados en ${allTitlesLabel(type).toLowerCase()}` : allTitlesLabel(type)}
        {...resultsProps}
        onClear={() => (searchOnly ? setSearch("") : setCategory(undefined))}
      />
    );
  } else if (summary.error) {
    content = (
      <EmptyState tone="error" title="No se pudieron cargar las categorías" description={summary.error.message}>
        <button type="button" onClick={summary.reload} className={emptyStatePrimaryButtonClass}>
          Reintentar
        </button>
      </EmptyState>
    );
  } else if (categoryId && (summary.loading || category)) {
    content = (
      <CategoryResults
        categoryId={categoryId}
        title={category?.name ?? "Categoría"}
        {...resultsProps}
        onClear={() => setCategory(undefined)}
      />
    );
  } else if (categoryId) {
    content = (
      <EmptyState title={`No hay ${typeLabel} en esta categoría`} description="Prueba con otra categoría:">
        {suggestionButtons}
        <button type="button" onClick={() => setCategory(undefined)} className={emptyStatePrimaryButtonClass}>
          Quitar filtro
        </button>
      </EmptyState>
    );
  } else if (!summary.loading) {
    content = (
      <GenreRows categories={categories} type={type} sort={sort} onSeeAll={setCategory} onSelectItem={setSelected} />
    );
  }

  return (
    <div className="netflix-container min-h-screen pt-20">
      <header className="px-4 pb-2 pt-4 md:px-12">
        <h1 className="text-3xl font-bold md:text-4xl">Explorar</h1>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <TypeTabs value={type} onChange={setType} />
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <SearchInput
              value={search}
              onChange={setSearch}
              label="Buscar por nombre"
              placeholder="Buscar por nombre…"
              maxLength={MAX_SEARCH}
            />
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>
      </header>

      {!summary.error && (categories.length > 0 || summary.loading) && (
        <nav aria-label="Géneros" className="mt-4">
          <CategoryCardsRow
            categories={categories}
            loading={summary.loading && !summary.data}
            selectedId={categoryId}
            onSelect={toggleCategory}
          />
        </nav>
      )}

      <div className="px-4 pb-16 pt-6 md:px-12">{content}</div>

      <Footer className="bg-black" />

      <ItemDialog open={!!selected} onClose={() => setSelected(null)} item={selected} />
    </div>
  );
}
