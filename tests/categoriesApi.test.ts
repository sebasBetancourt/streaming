// @vitest-environment jsdom
import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";
import { afterEach, describe, expect, it } from "vitest";
import { getCategorySummary } from "../src/shared/api/categories";
import { http } from "../src/shared/api/client";
import { listTitles } from "../src/shared/api/titles";

const seen: { url?: string; params: unknown }[] = [];
const reply =
  (data: unknown): AxiosAdapter =>
  async (config: InternalAxiosRequestConfig) => {
    seen.push({ url: config.url, params: config.params });
    return { data, status: 200, statusText: "", headers: {}, config } as never;
  };

const originalAdapter = http.defaults.adapter;
afterEach(() => {
  http.defaults.adapter = originalAdapter;
  seen.length = 0;
});

describe("API de explorar", () => {
  it("getCategorySummary pide el resumen del tipo y devuelve las categorías tal cual", async () => {
    const summary = [{ id: "c1", name: "Acción", count: 12, posterUrl: "https://img/p.jpg" }];
    http.defaults.adapter = reply(summary);
    await expect(getCategorySummary("tv")).resolves.toEqual(summary);
    expect(seen).toEqual([{ url: "/categories/summary", params: { type: "tv" } }]);
  });

  it("listTitles envía el orden elegido", async () => {
    http.defaults.adapter = reply([]);
    await listTitles({ categoryId: "c1", sort: "rating", skip: 24, limit: 24 });
    expect(seen[0]).toEqual({
      url: "/titles/list",
      params: { categoryId: "c1", sort: "rating", skip: 24, limit: 24 },
    });
  });
});
