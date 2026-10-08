// @vitest-environment jsdom
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, http, SESSION_EXPIRED_EVENT } from "../src/shared/api/client";
import { storage } from "../src/shared/lib/storage";

const reply =
  (status: number, data: unknown): AxiosAdapter =>
  async (config: InternalAxiosRequestConfig) => {
    const response = { data, status, statusText: "", headers: {}, config };
    if (status >= 400) throw new AxiosError("fail", String(status), config, null, response as never);
    return response as never;
  };

beforeEach(() => localStorage.clear());

describe("cliente HTTP", () => {
  it("envía el token guardado como Bearer", async () => {
    storage.setSession({ id: "1", email: "a@b.c", name: "A", role: "user", avatarUrl: null }, "tok123");
    let auth: unknown;
    await http.get("/x", {
      adapter: async (config) => {
        auth = config.headers.Authorization;
        return reply(200, {})(config);
      },
    });
    expect(auth).toBe("Bearer tok123");
  });

  it("convierte errores del backend en ApiError con su mensaje", async () => {
    const err = await http.get("/x", { adapter: reply(409, { message: "El usuario ya existe" }) }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ message: "El usuario ya existe", status: 409 });
  });

  it("avisa de sesión expirada solo si había token", async () => {
    const onExpired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    await http.get("/x", { adapter: reply(401, { message: "Token inválido" }) }).catch(() => undefined);
    expect(onExpired).not.toHaveBeenCalled(); // login fallido: no hay sesión que cerrar

    storage.setSession({ id: "1", email: "a@b.c", name: "A", role: "user", avatarUrl: null }, "tok");
    await http.get("/x", { adapter: reply(401, { message: "Token inválido" }) }).catch(() => undefined);
    expect(onExpired).toHaveBeenCalledTimes(1);
    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  });

  it("descarta sesiones guardadas por la versión anterior (sin id)", () => {
    localStorage.setItem("token", "old");
    localStorage.setItem("user", JSON.stringify({ _id: "x", email: "a@b.c", role: "user" }));
    expect(storage.getUser()).toBeNull();
  });
});
