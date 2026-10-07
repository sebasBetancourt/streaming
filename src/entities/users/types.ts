export type Role = "user" | "admin";

/** Usuario de la sesión (lo que devuelve /auth/login). */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
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
  avatarUrl: string | null;
  banned: boolean;
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt: string | null;
}
