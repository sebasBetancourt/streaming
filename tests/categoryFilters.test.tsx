// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import {
  type CategoryFilters,
  filtersToParams,
  parseFilters,
  useCategoryFilters,
} from "../src/features/Clients/categories/hooks/useCategoryFilters";

const ID = "64b0000000000000000000aa";
const defaults: CategoryFilters = { sort: "popular", search: "", page: 1 };

afterEach(cleanup);

describe("parseFilters / filtersToParams", () => {
  it("lee tipo, categoría, orden, búsqueda y página de la URL", () => {
    expect(parseFilters(new URLSearchParams(`type=tv&category=${ID}&sort=rating&q=%20breaking%20&page=3`))).toEqual({
      type: "tv",
      categoryId: ID,
      sort: "rating",
      search: "breaking",
      page: 3,
    });
  });

  it("acepta 'all' como categoría (todos los títulos del tipo)", () => {
    expect(parseFilters(new URLSearchParams("type=anime&category=all")).categoryId).toBe("all");
  });

  it("ignora valores desconocidos y usa 'popular' y la página 1 por defecto", () => {
    expect(parseFilters(new URLSearchParams("type=documental&category=abc&sort=azar&page=-2"))).toEqual({
      ...defaults,
      type: undefined,
      categoryId: undefined,
    });
    for (const page of ["0", "1.5", "dos", ""]) {
      expect(parseFilters(new URLSearchParams(`page=${page}`)).page).toBe(1);
    }
  });

  it("recorta búsquedas demasiado largas", () => {
    expect(parseFilters(new URLSearchParams(`q=${"a".repeat(150)}`)).search).toHaveLength(100);
  });

  it("solo escribe lo que difiere del valor por defecto", () => {
    expect(filtersToParams(defaults).toString()).toBe("");
    expect(filtersToParams({ type: "anime", categoryId: ID, sort: "recent", search: "naruto", page: 2 }).toString()).toBe(
      `type=anime&category=${ID}&sort=recent&q=naruto&page=2`,
    );
  });

  it("ida y vuelta conserva los filtros", () => {
    const f: CategoryFilters = { type: "movie", categoryId: ID, sort: "rating", search: "el padrino", page: 4 };
    expect(parseFilters(filtersToParams(f))).toEqual(f);
  });
});

describe("useCategoryFilters", () => {
  const setup = (url: string) => {
    const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>;
    return renderHook(() => ({ ...useCategoryFilters(), location: useLocation() }), { wrapper });
  };

  it("cambiar la categoría conserva tipo y orden en la URL", () => {
    const { result } = setup("/categories?type=tv&sort=recent");
    act(() => result.current.setCategory(ID));
    expect(result.current.location.search).toBe(`?type=tv&category=${ID}&sort=recent`);
    expect(result.current.filters).toEqual({ type: "tv", categoryId: ID, sort: "recent", search: "", page: 1 });
  });

  it("'Todo' y 'Quitar filtro' limpian sus parámetros", () => {
    const { result } = setup(`/categories?type=tv&category=${ID}`);
    act(() => result.current.setType(undefined));
    act(() => result.current.setCategory(undefined));
    expect(result.current.location.search).toBe("");
  });

  it("cambiar de página conserva los filtros; cambiar un filtro vuelve a la página 1", () => {
    const { result } = setup(`/categories?type=anime&q=one`);
    act(() => result.current.setPage(3));
    expect(result.current.location.search).toBe("?type=anime&q=one&page=3");
    act(() => result.current.setSort("rating"));
    expect(result.current.filters).toMatchObject({ sort: "rating", search: "one", page: 1 });
    act(() => result.current.setPage(2));
    act(() => result.current.setSearch("  piece  "));
    expect(result.current.location.search).toBe("?type=anime&sort=rating&q=piece");
  });
});
