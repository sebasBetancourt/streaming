// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mapTitle, type TitleDto } from "../src/entities/titles";

vi.mock("@/app/providers/ShelfContext", () => ({
  useShelfItem: () => ({ inList: false, isFav: false, toggleList: vi.fn(), toggleFav: vi.fn() }),
}));
const listTitles = vi.hoisted(() => vi.fn());
vi.mock("@/shared/api/titles", () => ({ listTitles }));

import CategoryCard from "../src/features/Clients/categories/components/CategoryCard";
import GenreRows from "../src/features/Clients/categories/components/GenreRows";
import TitleGrid from "../src/features/Clients/categories/components/TitleGrid";

const dto = (id: string, extra: Partial<TitleDto> = {}): TitleDto => ({
  id, type: "movie", title: `Peli ${id}`, description: "", author: null, year: 2020, seasons: null, episodes: null,
  posterUrl: `https://img/${id}.jpg`, images: [], status: "approved", tmdbId: null, imdbId: null, embedUrl: null,
  backdropUrl: null, quality: null, ratingAvg: 0, ratingCount: 0, likes: 0, dislikes: 0, createdById: null, createdAt: "2025-01-01", categories: [],
  creator: null, ...extra,
});

let observers: { cb: IntersectionObserverCallback }[] = [];
beforeEach(() => {
  observers = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: IntersectionObserverCallback) {
        observers.push({ cb });
      }
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("CategoryCard", () => {
  const category = { id: "c1", name: "Acción", count: 12, posterUrl: "https://img/p.jpg" };

  it("es un botón con nombre, conteo y estado de selección", () => {
    const onSelect = vi.fn();
    render(<CategoryCard category={category} selected onSelect={onSelect} />);
    const btn = screen.getByRole("button", { name: /Acción\s*12 títulos/ });
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalledWith("c1");
  });

  it("usa singular con un solo título", () => {
    render(<CategoryCard category={{ ...category, count: 1 }} selected={false} onSelect={vi.fn()} />);
    expect(screen.getByText("1 título")).toBeTruthy();
  });
});

describe("GenreRows", () => {
  it("empieza con una fila de todos los títulos del tipo, también los que no tienen género", async () => {
    listTitles.mockImplementation(async ({ categoryId }: { categoryId?: string }) => ({
      items: [dto(categoryId ?? "sin-genero")], total: 1,
    }));
    const onSeeAll = vi.fn();
    const category = { id: "c1", name: "Acción", count: 1, posterUrl: null };
    render(<GenreRows categories={[category]} type="tv" sort="popular" onSeeAll={onSeeAll} onSelectItem={vi.fn()} />);
    for (const o of observers) o.cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);

    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(["Todas las series", "Acción"]);
    expect(await screen.findByRole("button", { name: /^Peli sin-genero/ })).toBeTruthy();
    expect(listTitles).toHaveBeenCalledWith(expect.objectContaining({ type: "tv", categoryId: undefined }), expect.anything());

    fireEvent.click(screen.getByRole("button", { name: "Ver todas las series" }));
    expect(onSeeAll).toHaveBeenCalledWith("all");
    fireEvent.click(screen.getByRole("button", { name: "Ver todos los títulos de Acción" }));
    expect(onSeeAll).toHaveBeenLastCalledWith("c1");
  });
});

describe("TitleGrid", () => {
  const props = {
    loading: false, error: null, hasMore: false,
    onLoadMore: vi.fn(), onRetry: vi.fn(), onSelect: vi.fn(),
  };

  it("muestra un póster por título y abre el detalle al hacer click", () => {
    const items = [dto("a", { ratingAvg: 4.5 }), dto("b", { year: 0 })].map((d) => mapTitle(d));
    const onSelect = vi.fn();
    const { container } = render(<TitleGrid {...props} items={items} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: /Peli a.*★ 4\.5 · 2020/ }));
    expect(onSelect).toHaveBeenCalledWith(items[0]);
    expect(screen.getByRole("button", { name: "Añadir Peli b a Mi Lista" })).toBeTruthy();
    expect(container.textContent).not.toMatch(/0\.0|· 0/); // sin valoración ni año vacíos
  });

  it("pide la siguiente página cuando el final entra en la vista", () => {
    const onLoadMore = vi.fn();
    render(<TitleGrid {...props} items={[mapTitle(dto("a"))]} hasMore onLoadMore={onLoadMore} />);
    observers.at(-1)!.cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("no observa ni ofrece más mientras carga o tras un error, y permite reintentar", () => {
    const onRetry = vi.fn();
    const { rerender } = render(<TitleGrid {...props} items={[]} loading hasMore />);
    expect(observers).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Cargar más" })).toBeNull();

    rerender(<TitleGrid {...props} items={[]} hasMore error={new Error("caído")} onRetry={onRetry} />);
    expect(screen.getByRole("alert").textContent).toContain("caído");
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onRetry).toHaveBeenCalled();
    expect(observers).toHaveLength(0);
  });
});
