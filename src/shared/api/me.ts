import type { UserPreferences, UserProfile } from "@/entities/users";
import { http } from "./client";

export const getMe = () => http.get<UserProfile>("/me").then((r) => r.data);

export const updateMe = (input: { name?: string; phone?: string | null; country?: string | null; avatarUrl?: string | null }) =>
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
