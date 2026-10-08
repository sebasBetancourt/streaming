export type Role = "user" | "admin";

/** Usuario de la sesión (lo que devuelve /auth/login). */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  /** Ruta relativa a la API (`/api/v1/avatars/…`) o `null` si no hay foto. */
  avatarUrl: string | null;
}

export interface UserPreferences {
  marketingEmails?: boolean;
  personalizedRecs?: boolean;
  shareAnonymized?: boolean;
  dataRetentionMonths?: number;
}

/** Perfil completo (/me) y filas del panel admin (/admin/users). */
export interface UserProfile extends SessionUser {
  phone: string | null;
  country: string | null;
  banned: boolean;
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt: string | null;
}
