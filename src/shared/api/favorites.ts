import type { Page, TitleDto, TitleType } from "@/entities/titles";
import { http } from "./client";

/** `favorites` = corazón; `watchlist` = "Mi Lista". */
export type ShelfName = "favorites" | "watchlist";

export const getShelfIds = () =>
  http.get<Record<ShelfName, string[]>>("/favorites/ids").then((r) => r.data);

export const listShelf = (params: { list: ShelfName; type?: TitleType; skip?: number; limit?: number }) =>
  http.get<Page<TitleDto>>("/favorites", { params }).then((r) => r.data);

export const addToShelf = (titleId: string, list: ShelfName) =>
  http.put(`/favorites/${titleId}`, undefined, { params: { list } }).then(() => undefined);

export const removeFromShelf = (titleId: string, list: ShelfName) =>
  http.delete(`/favorites/${titleId}`, { params: { list } }).then(() => undefined);
