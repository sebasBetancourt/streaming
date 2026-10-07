// @vitest-environment jsdom
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import { afterEach, describe, expect, it } from "vitest";
import { getVimeusSyncStatus, startVimeusSync } from "../src/shared/api/admin";
import { ApiError, http } from "../src/shared/api/client";

const seen: { method?: string; url?: string }[] = [];
const reply =
  (data: unknown, status = 200): AxiosAdapter =>
  async (config: InternalAxiosRequestConfig) => {
    seen.push({ method: config.method, url: config.url });
    const response = { data, status, statusText: "", headers: {}, config };
    if (status >= 400) throw new AxiosError("fallo", undefined, config, {}, response as never);
    return response as never;
  };

const originalAdapter = http.defaults.adapter;
afterEach(() => {
  http.defaults.adapter = originalAdapter;
  seen.length = 0;
});

describe("API de sincronización con Vimeus", () => {
  it("startVimeusSync hace POST y devuelve el id de la corrida", async () => {
    http.defaults.adapter = reply({ runId: "r1" }, 202);
    await expect(startVimeusSync()).resolves.toEqual({ runId: "r1" });
    expect(seen).toEqual([{ method: "post", url: "/admin/vimeus/sync" }]);
  });

  it("una corrida en curso llega como ApiError 409 con el mensaje del backend", async () => {
    http.defaults.adapter = reply({ message: "Ya hay una sincronización con Vimeus en curso." }, 409);
    const err = await startVimeusSync().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409, message: "Ya hay una sincronización con Vimeus en curso." });
  });

  it("getVimeusSyncStatus devuelve el estado tal cual", async () => {
    const status = { configured: true, scheduled: false, running: false, last: null };
    http.defaults.adapter = reply(status);
    await expect(getVimeusSyncStatus()).resolves.toEqual(status);
    expect(seen).toEqual([{ method: "get", url: "/admin/vimeus/sync" }]);
  });
});
