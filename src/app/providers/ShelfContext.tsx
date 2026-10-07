import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { addToShelf, getShelfIds, removeFromShelf, type ShelfName } from "@/shared/api/favorites";
import { useAuth } from "./AuthContext";

type Shelves = Record<ShelfName, Set<string>>;
const empty = (): Shelves => ({ favorites: new Set(), watchlist: new Set() });

interface ShelfContextValue {
  has: (list: ShelfName, titleId: string) => boolean;
  /** Alterna el título en la lista; devuelve `true` si el backend aceptó el cambio. */
  toggle: (list: ShelfName, titleId: string) => Promise<boolean>;
}

const ShelfContext = createContext<ShelfContextValue | null>(null);

/** Favoritos y "Mi Lista" del usuario, guardados en el backend, con actualización optimista. */
export function ShelfProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [shelves, setShelves] = useState<Shelves>(empty);

  useEffect(() => {
    if (!user) {
      setShelves(empty());
      return;
    }
    let cancelled = false;
    getShelfIds()
      .then((ids) => !cancelled && setShelves({ favorites: new Set(ids.favorites), watchlist: new Set(ids.watchlist) }))
      .catch((e) => console.error("No se pudieron cargar favoritos:", e));
    return () => {
      cancelled = true;
    };
  }, [user]);

  const setMember = useCallback((list: ShelfName, id: string, present: boolean) => {
    setShelves((prev) => {
      const next = new Set(prev[list]);
      if (present) next.add(id);
      else next.delete(id);
      return { ...prev, [list]: next };
    });
  }, []);

  const toggle = useCallback(
    async (list: ShelfName, id: string) => {
      const present = shelves[list].has(id);
      setMember(list, id, !present);
      try {
        await (present ? removeFromShelf(id, list) : addToShelf(id, list));
        return true;
      } catch (e) {
        setMember(list, id, present); // revierte si el backend falla
        console.error("No se pudo actualizar la lista:", e);
        return false;
      }
    },
    [shelves, setMember],
  );

  const value = useMemo<ShelfContextValue>(
    () => ({ has: (list, id) => shelves[list].has(id), toggle }),
    [shelves, toggle],
  );
  return <ShelfContext.Provider value={value}>{children}</ShelfContext.Provider>;
}

export function useShelf(): ShelfContextValue {
  const ctx = useContext(ShelfContext);
  if (!ctx) throw new Error("useShelf debe usarse dentro de un ShelfProvider");
  return ctx;
}

/** Estado y acciones de un título en "Mi Lista" y "Favoritos". */
export function useShelfItem(titleId: string | undefined) {
  const ctx = useShelf();
  const id = titleId ?? "";
  return {
    inList: !!id && ctx.has("watchlist", id),
    isFav: !!id && ctx.has("favorites", id),
    toggleList: () => (id ? ctx.toggle("watchlist", id) : Promise.resolve(false)),
    toggleFav: () => (id ? ctx.toggle("favorites", id) : Promise.resolve(false)),
  };
}
