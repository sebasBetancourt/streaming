// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "../src/app/providers/AuthContext";
import {
  validateAvatarFile,
  validateAvatarUrl,
  validateNewPassword,
  validateProfile,
} from "../src/features/Clients/profile/validation";
import { removeAvatar, setAvatarFromUrl, uploadAvatar } from "../src/shared/api/me";
import { http } from "../src/shared/api/client";
import Avatar, { colorFor, initials } from "../src/shared/components/Avatar";
import { assetUrl } from "../src/shared/lib/assetUrl";
import { storage } from "../src/shared/lib/storage";

const requests: { method?: string; url?: string; data: unknown; headers: Record<string, unknown> }[] = [];
const reply =
  (status: number, data: unknown): AxiosAdapter =>
  async (config: InternalAxiosRequestConfig) => {
    requests.push({ method: config.method, url: config.url, data: config.data, headers: { ...config.headers } });
    const response = { data, status, statusText: "", headers: {}, config };
    if (status >= 400) throw new AxiosError("fail", String(status), config, null, response as never);
    return response as never;
  };

const originalAdapter = http.defaults.adapter;
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  http.defaults.adapter = originalAdapter;
  requests.length = 0;
});

describe("Avatar", () => {
  it("sin foto muestra las iniciales con un color estable", () => {
    render(<Avatar name="Ana María Pérez" size={40} />);
    const el = screen.getByRole("img", { name: "Ana María Pérez" });
    expect(el.textContent).toBe("AM");
    expect(el.className).toContain(colorFor("Ana María Pérez"));
    expect(initials("sebas")).toBe("S");
    expect(initials("  ")).toBe("?");
    expect(colorFor("Ana")).toBe(colorFor("Ana"));
  });

  it("con foto resuelve la ruta de la API y cae a iniciales si la imagen falla", () => {
    render(<Avatar name="Sebas" src="/api/v1/avatars/abc?v=1" />);
    const img = screen.getByRole("img", { name: "Sebas" }) as HTMLImageElement;
    expect(img.tagName).toBe("IMG");
    expect(img.src).toBe("http://localhost:3000/api/v1/avatars/abc?v=1");
    fireEvent.error(img);
    expect(screen.getByRole("img", { name: "Sebas" }).textContent).toBe("S");
  });

  it("assetUrl deja intactas las URLs absolutas y blob", () => {
    expect(assetUrl(null)).toBeNull();
    expect(assetUrl("https://x.test/a.png")).toBe("https://x.test/a.png");
    expect(assetUrl("blob:http://localhost/1")).toBe("blob:http://localhost/1");
    expect(assetUrl("/api/v1/avatars/a")).toBe("http://localhost:3000/api/v1/avatars/a");
  });
});

describe("AuthContext.updateUser", () => {
  function Probe() {
    const { user, login, updateUser } = useAuth();
    return (
      <div>
        <span data-testid="who">{user ? `${user.name}|${user.avatarUrl}` : "nadie"}</span>
        <button onClick={() => login({ id: "1", email: "a@b.c", name: "Ana", role: "user", avatarUrl: null }, "tok")}>entrar</button>
        <button onClick={() => updateUser({ name: "Ana M", avatarUrl: "/api/v1/avatars/1?v=a" })}>cambiar</button>
      </div>
    );
  }

  it("actualiza nombre y foto en el estado y en localStorage sin tocar el token", () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    fireEvent.click(screen.getByText("entrar"));
    fireEvent.click(screen.getByText("cambiar"));
    expect(screen.getByTestId("who").textContent).toBe("Ana M|/api/v1/avatars/1?v=a");
    expect(storage.getUser()).toMatchObject({ name: "Ana M", avatarUrl: "/api/v1/avatars/1?v=a" });
    expect(storage.getToken()).toBe("tok");
  });

  it("al arrancar refresca nombre y foto desde /auth/verify", async () => {
    storage.setSession({ id: "1", email: "a@b.c", name: "Viejo", role: "user", avatarUrl: null }, "tok");
    http.defaults.adapter = reply(200, {
      valid: true,
      user: { id: "1", email: "a@b.c", name: "Nuevo", role: "user", avatarUrl: "/api/v1/avatars/1?v=z" },
    });
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("who").textContent).toBe("Nuevo|/api/v1/avatars/1?v=z"));
  });

  it("cierra la sesión si el backend dice que ya no es válida", async () => {
    storage.setSession({ id: "1", email: "a@b.c", name: "Ana", role: "user", avatarUrl: null }, "tok");
    http.defaults.adapter = reply(200, { valid: false, user: null });
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("who").textContent).toBe("nadie"));
    expect(storage.getToken()).toBeNull();
  });
});

describe("validaciones del perfil", () => {
  it("nombre, teléfono y país", () => {
    expect(validateProfile({ name: "Ana", phone: "+57 300 123 4567", country: "Colombia" })).toEqual({});
    expect(validateProfile({ name: "  ", phone: "", country: "" })).toEqual({ name: "Escribe tu nombre" });
    expect(validateProfile({ name: "Ana", phone: "abc", country: "" }).phone).toMatch(/no válido/);
    expect(validateProfile({ name: "x".repeat(101), phone: "", country: "y".repeat(61) })).toMatchObject({
      name: expect.stringContaining("100"), country: expect.stringContaining("60"),
    });
  });

  it("archivo de foto: tipo, tamaño y vacío", () => {
    expect(validateAvatarFile({ type: "image/png", size: 1000 })).toBeNull();
    expect(validateAvatarFile({ type: "image/svg+xml", size: 1000 })).toMatch(/JPG, PNG o WebP/);
    expect(validateAvatarFile({ type: "image/gif", size: 1000 })).not.toBeNull();
    expect(validateAvatarFile({ type: "image/jpeg", size: 2 * 1024 * 1024 + 1 })).toMatch(/2 MB/);
    expect(validateAvatarFile({ type: "image/webp", size: 0 })).toMatch(/vacío/);
  });

  it("URL de foto: solo https", () => {
    expect(validateAvatarUrl("https://example.com/a.png")).toBeNull();
    expect(validateAvatarUrl("http://example.com/a.png")).toMatch(/https/);
    expect(validateAvatarUrl("nada")).toMatch(/URL válida/);
  });

  it("contraseña nueva: obligatoria, longitud, distinta y confirmada", () => {
    expect(validateNewPassword("", "nueva-clave", "nueva-clave")).toMatch(/actual/);
    expect(validateNewPassword("vieja", "12345", "12345")).toMatch(/al menos 6/);
    expect(validateNewPassword("igual-1", "igual-1", "igual-1")).toMatch(/distinta/);
    expect(validateNewPassword("vieja-1", "nueva-1", "otra-1")).toMatch(/no coincide/);
    expect(validateNewPassword("vieja-1", "nueva-1", "nueva-1")).toBeNull();
  });
});

describe("API de foto de perfil", () => {
  it("uploadAvatar envía multipart con el archivo en el campo `file`", async () => {
    http.defaults.adapter = reply(200, { avatarUrl: "/api/v1/avatars/1?v=a" });
    const file = new File([new Uint8Array([1, 2, 3])], "foto.png", { type: "image/png" });
    await expect(uploadAvatar(file)).resolves.toBe("/api/v1/avatars/1?v=a");
    expect(requests[0]).toMatchObject({ method: "put", url: "/me/avatar" });
    expect(requests[0].data).toBeInstanceOf(FormData);
    expect((requests[0].data as FormData).get("file")).toBeInstanceOf(File);
  });

  it("setAvatarFromUrl y removeAvatar usan sus rutas", async () => {
    http.defaults.adapter = reply(200, { avatarUrl: "/api/v1/avatars/1?v=b" });
    await expect(setAvatarFromUrl("https://example.com/a.png")).resolves.toBe("/api/v1/avatars/1?v=b");
    await expect(removeAvatar()).resolves.toBeNull();
    expect(requests.map((r) => `${r.method} ${r.url}`)).toEqual(["put /me/avatar/url", "delete /me/avatar"]);
    expect(JSON.parse(requests[0].data as string)).toEqual({ url: "https://example.com/a.png" });
  });

  it("propaga el mensaje del backend (p. ej. formato no permitido)", async () => {
    http.defaults.adapter = reply(400, { message: "Formato no permitido: usa JPG, PNG o WebP" });
    await expect(setAvatarFromUrl("https://example.com/a.svg")).rejects.toThrow("Formato no permitido");
  });
});

