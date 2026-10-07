// @vitest-environment jsdom
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import { afterEach, describe, expect, it } from "vitest";
import { forgotPassword, resetPassword, validateResetToken } from "../src/shared/api/auth";
import { ApiError, http } from "../src/shared/api/client";

const requests: { method?: string; url?: string; body: unknown }[] = [];

const reply =
  (status: number, data: unknown): AxiosAdapter =>
  async (config: InternalAxiosRequestConfig) => {
    requests.push({ method: config.method, url: config.url, body: JSON.parse(config.data ?? "null") });
    const response = { data, status, statusText: "", headers: {}, config };
    if (status >= 400) throw new AxiosError("fail", String(status), config, null, response as never);
    return response as never;
  };

const originalAdapter = http.defaults.adapter;
afterEach(() => {
  http.defaults.adapter = originalAdapter;
  requests.length = 0;
});

describe("API de recuperación de contraseña", () => {
  it("forgotPassword envía solo el correo", async () => {
    http.defaults.adapter = reply(200, { message: "ok" });
    await expect(forgotPassword("a@b.c")).resolves.toEqual({ message: "ok" });
    expect(requests).toEqual([{ method: "post", url: "/auth/forgot-password", body: { email: "a@b.c" } }]);
  });

  it("validateResetToken envía el token en el body, no en la URL", async () => {
    http.defaults.adapter = reply(200, { valid: true });
    await expect(validateResetToken("tok")).resolves.toEqual({ valid: true });
    expect(requests).toEqual([{ method: "post", url: "/auth/reset-password/validate", body: { token: "tok" } }]);
  });

  it("resetPassword envía token y contraseña", async () => {
    http.defaults.adapter = reply(200, { message: "Contraseña actualizada" });
    await resetPassword("tok", "nueva123");
    expect(requests).toEqual([
      { method: "post", url: "/auth/reset-password", body: { token: "tok", password: "nueva123" } },
    ]);
  });

  it("un enlace inválido llega como ApiError 400 con el mensaje del backend", async () => {
    http.defaults.adapter = reply(400, { message: "El enlace no es válido o ha caducado" });
    const err = await validateResetToken("tok").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 400, message: "El enlace no es válido o ha caducado" });
  });
});
