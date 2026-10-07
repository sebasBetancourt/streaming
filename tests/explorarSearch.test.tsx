// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TitleDto } from "../src/entities/titles";
import Pagination, { pageItems } from "../src/shared/components/Pagination";
import SearchInput from "../src/shared/components/SearchInput";

vi.mock("@/app/providers/ShelfContext", () => ({
  useShelfItem: () => ({ inList: false, isFav: false, toggleList: vi.fn(), toggleFav: vi.fn() }),
}));
const listTitles = vi.hoisted(() => vi.fn());
vi.mock("@/shared/api/titles", () => ({ listTitles }));

import CategoryResults from "../src/features/Clients/categories/components/CategoryResults";

const dto = (id: string): TitleDto => ({
  id, type: "movie", title: `Peli ${id}`, description: "", author: null, year: 2020, seasons: null, episodes: null,
  posterUrl: null, images: [], status: "approved", tmdbId: null, imdbId: null, embedUrl: null,
  backdropUrl: null, quality: null, ratingAvg: 0, ratingCount: 0, likes: 0, dislikes: 0, createdById: null,
  createdAt: "2025-01-01", categories: [], creator: null,
});

beforeEach(() => vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  listTitles.mockReset();
});

describe("pageItems", () => {
  it("muestra todas las páginas si caben y colapsa el resto con saltos", () => {
    expect(pageItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageItems(2, 40)).toEqual([1, 2, 3, 4, 5, "gap", 40]);
    expect(pageItems(20, 40)).toEqual([1, "gap", 19, 20, 21, "gap", 40]);
    expect(pageItems(39, 40)).toEqual([1, "gap", 36, 37, 38, 39, 40]);
  });
});

describe("Pagination", () => {
  it("marca la página actual, navega y desactiva los extremos", () => {
    const onChange = vi.fn();
    render(<Pagination page={1} totalPages={3} onChange={onChange} />);
    expect(screen.getByRole("button", { name: "Página 1" }).getAttribute("aria-current")).toBe("page");
    expect((screen.getByRole("button", { name: "Página anterior" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
    fireEvent.click(screen.getByRole("button", { name: "Página 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Página 1" })); // la actual no hace nada
    expect(onChange.mock.calls).toEqual([[2], [3]]);
  });

  it("no se muestra con una sola página", () => {
    const { container } = render(<Pagination page={1} totalPages={1} onChange={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("SearchInput", () => {
  it("espera a que se deje de escribir, recorta espacios y Escape/✕ borran al instante", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} label="Buscar por nombre" />);
    const input = screen.getByRole("searchbox", { name: "Buscar por nombre" });
    fireEvent.change(input, { target: { value: "nar" } });
    fireEvent.change(input, { target: { value: " naruto " } });
    act(() => void vi.advanceTimersByTime(299));
    expect(onChange).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(1));
    expect(onChange).toHaveBeenCalledExactlyOnceWith("naruto");

    fireEvent.keyDown(input, { key: "Escape" });
    expect(onChange).toHaveBeenLastCalledWith("");
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("refleja cambios que llegan desde fuera (Atrás, Quitar filtro)", () => {
    const { rerender } = render(<SearchInput value="one" onChange={vi.fn()} />);
    rerender(<SearchInput value="piece" onChange={vi.fn()} />);
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("piece");
  });
});

describe("CategoryResults", () => {
  const props = { title: "Todas las series", type: "tv" as const, sort: "popular" as const, onClear: vi.fn(), onSelectItem: vi.fn() };

  it("pide al backend la página de la URL con la búsqueda y muestra el total y los controles", async () => {
    listTitles.mockResolvedValue({ items: [dto("a"), dto("b")], total: 50 });
    const onPageChange = vi.fn();
    render(<CategoryResults {...props} search="loki" page={2} onPageChange={onPageChange} />);

    expect(await screen.findByText("50 títulos para “loki” · página 2 de 3")).toBeTruthy();
    expect(listTitles).toHaveBeenCalledWith(
      { type: "tv", categoryId: undefined, sort: "popular", search: "loki", skip: 24, limit: 24 },
      expect.anything(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Página 3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("sin coincidencias lo dice con la búsqueda", async () => {
    listTitles.mockResolvedValue({ items: [], total: 0 });
    render(<CategoryResults {...props} search="zzz" page={1} onPageChange={vi.fn()} />);
    expect(await screen.findByText("No hay resultados para “zzz”")).toBeTruthy();
    expect(screen.queryByRole("navigation", { name: "Paginación" })).toBeNull();
  });

  it("una página que ya no existe lleva a la última", async () => {
    listTitles.mockResolvedValue({ items: [], total: 30 });
    const onPageChange = vi.fn();
    render(<CategoryResults {...props} search="" page={9} onPageChange={onPageChange} />);
    await vi.waitFor(() => expect(onPageChange).toHaveBeenCalledWith(2));
  });
});
