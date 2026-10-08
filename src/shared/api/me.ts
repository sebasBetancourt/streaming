import type { UserPreferences, UserProfile } from "@/entities/users";
import { http } from "./client";

export const getMe = () => http.get<UserProfile>("/me").then((r) => r.data);

export const updateMe = (input: { name?: string; phone?: string | null; country?: string | null }) =>
  http.patch<UserProfile>("/me", input).then((r) => r.data);

export const updatePreferences = (input: UserPreferences) =>
  http.patch<UserProfile>("/me/preferences", input).then((r) => r.data);

export const changePassword = (input: { currentPassword: string; newPassword: string }) =>
  http.patch("/me/password", input).then(() => undefined);

export const deleteAccount = (password: string) =>
  http.delete("/me", { data: { password } }).then(() => undefined);

/** Descarga mis datos como JSON. */
export async function exportMyData() {
  const { data } = await http.get<unknown>("/me/export");
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mis-datos.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ---- foto de perfil (el backend la valida y la re-procesa a 256×256 WebP)
interface AvatarResponse {
  avatarUrl: string | null;
}

export const uploadAvatar = (file: File, onProgress?: (percent: number) => void) => {
  const form = new FormData();
  form.append("file", file);
  return http
    .put<AvatarResponse>("/me/avatar", form, {
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
    })
    .then((r) => r.data.avatarUrl);
};

export const setAvatarFromUrl = (url: string) =>
  http.put<AvatarResponse>("/me/avatar/url", { url }).then((r) => r.data.avatarUrl);

export const removeAvatar = () => http.delete<AvatarResponse>("/me/avatar").then(() => null);
