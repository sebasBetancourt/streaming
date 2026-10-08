export const NAME_MAX = 100;
export const COUNTRY_MAX = 60;
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Misma regla que el backend: dígitos con +, espacios, guiones o paréntesis. */
const PHONE_RE = /^\+?[0-9 ()-]{6,20}$/;

export interface ProfileFields {
  name: string;
  phone: string;
  country: string;
}

export type ProfileErrors = Partial<Record<keyof ProfileFields, string>>;

export function validateProfile({ name, phone, country }: ProfileFields): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!name.trim()) errors.name = "Escribe tu nombre";
  else if (name.trim().length > NAME_MAX) errors.name = `Máximo ${NAME_MAX} caracteres`;
  if (phone.trim() && !PHONE_RE.test(phone.trim())) errors.phone = "Teléfono no válido (ej. +57 300 000 0000)";
  if (country.trim().length > COUNTRY_MAX) errors.country = `Máximo ${COUNTRY_MAX} caracteres`;
  return errors;
}

export function validateAvatarFile(file: Pick<File, "type" | "size">): string | null {
  if (!AVATAR_TYPES.includes(file.type)) return "Usa una imagen JPG, PNG o WebP";
  if (file.size > MAX_AVATAR_BYTES) return "La imagen supera los 2 MB";
  if (file.size === 0) return "El archivo está vacío";
  return null;
}

export function validateAvatarUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    return url.protocol === "https:" ? null : "La URL debe empezar por https://";
  } catch {
    return "Escribe una URL válida (https://…)";
  }
}

export function validateNewPassword(current: string, next: string, confirm: string): string | null {
  if (!current) return "Escribe tu contraseña actual";
  if (next.length < MIN_PASSWORD_LENGTH) return `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
  if (next === current) return "La nueva contraseña debe ser distinta a la actual";
  if (next !== confirm) return "La confirmación no coincide con la nueva contraseña";
  return null;
}
