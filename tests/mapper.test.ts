import { describe, expect, it } from "vitest";
import { mapTitle, type TitleDto } from "../src/entities/titles";

const dto: TitleDto = {
  id: "68b4f29e718e64204c2260ef", type: "movie", title: "Inception", description: "d", author: null, year: 2010,
  seasons: null, episodes: null, posterUrl: null, images: [], status: "approved", tmdbId: null, imdbId: null,
  embedUrl: "https://example.com/e/1", backdropUrl: null, quality: null, ratingAvg: 4.666, ratingCount: 3, likes: 4, dislikes: 5, createdById: null,
  createdAt: "2025-09-01T01:10:54.622Z", categories: [{ id: "c1", name: "Terror" }], creator: null,
};

describe("mapTitle", () => {
  it("formatea rating, duración de película y valores por defecto", () => {
    const t = mapTitle(dto, 2);
    expect(t).toMatchObject({ ratingAvg: "4.7", duration: "Película", author: "Desconocido", creator: "Desconocido", rank: 3, image: "" });
    expect(t.categories).toEqual(["Terror"]);
    expect(t.categoryIds).toEqual(["c1"]);
    expect(t.embedUrl).toBe("https://example.com/e/1");
  });

  it("usa el backdrop 16:9 si existe y si no cae al póster", () => {
    const withBackdrop = mapTitle({ ...dto, posterUrl: "https://img/p.jpg", backdropUrl: "https://img/b.jpg", quality: "FULL HD" });
    expect(withBackdrop).toMatchObject({ image: "https://img/p.jpg", backdrop: "https://img/b.jpg", quality: "FULL HD" });
    expect(mapTitle({ ...dto, posterUrl: "https://img/p.jpg" }).backdrop).toBe("https://img/p.jpg");
    expect(mapTitle(dto).backdrop).toBe("");
  });

  it("muestra temporadas y episodios en series y anime", () => {
    expect(mapTitle({ ...dto, type: "tv", seasons: 5, episodes: 62 }).duration).toBe("5 Temp / 62 eps");
    expect(mapTitle({ ...dto, type: "anime", seasons: null, episodes: null }).duration).toBe("1 Temp / 1 eps");
  });
});
