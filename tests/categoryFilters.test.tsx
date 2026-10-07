// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import {
  filtersToParams,
  parseFilters,
  useCategoryFilters,
} from "../src/features/Clients/categories/hooks/useCategoryFilters";

const ID = "64b0000000000000000000aa";

afterEach(cleanup);

describe("parseFilters / filtersToParams", () => {
  it("lee tipo, categoría y orden de la URL", () => {
    expect(parseFilters(new URLSearchParams(`type=tv&category=${ID}&sort=rating`))).toEqual({
      type: "tv",
      categoryId: ID,
      sort: "rating",
    });
  });

  it("acepta 'all' como categoría (todos los títulos del tipo)", () => {
    expect(parseFilters(new URLSearchParams("type=anime&category=all")).categoryId).toBe("all");
  });

  it("ignora valores desconocidos y usa 'popular' por defecto", () => {
    expect(parseFilters(new URLSearchParams("type=documental&category=abc&sort=azar"))).toEqual({
      type: undefined,
      categoryId: undefined,
      sort: "popular",
    });
  });

  it("solo escribe lo que difiere del valor por defecto", () => {
    expect(filtersToParams({ sort: "popular" }).toString()).toBe("");
    expect(filtersToParams({ type: "anime", categoryId: ID, sort: "recent" }).toString()).toBe(
      `type=anime&category=${ID}&sort=recent`,
    );
  });

  it("ida y vuelta conserva los filtros", () => {
    const f = { type: "movie" as const, categoryId: ID, sort: "rating" as const };
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
    expect(result.current.filters).toEqual({ type: "tv", categoryId: ID, sort: "recent" });
  });

  it("'Todo' y 'Quitar filtro' limpian sus parámetros", () => {
    const { result } = setup(`/categories?type=tv&category=${ID}`);
    act(() => result.current.setType(undefined));
    act(() => result.current.setCategory(undefined));
    expect(result.current.location.search).toBe("");
  });
});
