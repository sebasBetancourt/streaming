import type { SessionUser } from "@/entities/users";

const TOKEN_KEY = "token";
const USER_KEY = "user";

const safe = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const storage = {
  getToken: () => safe(() => localStorage.getItem(TOKEN_KEY), null),
  getUser(): SessionUser | null {
    return safe(() => {
      const raw = localStorage.getItem(USER_KEY);
      const u = raw ? (JSON.parse(raw) as Partial<SessionUser>) : null;
      // sesiones guardadas por la versión anterior (`_id`) ya no sirven: obligan a iniciar sesión de nuevo
      return u && u.id && u.role ? (u as SessionUser) : null;
    }, null);
  },
  setSession(user: SessionUser, token: string) {
    safe(() => {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);
    }, undefined);
  },
  clear() {
    safe(() => {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }, undefined);
  },
};
