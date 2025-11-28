import { useState, useEffect } from "react";
import { getTitles } from "../services/getTitles";

/**
 * @typedef {import("@/entities/movies/types").TitleEntity} TitleEntity
 */

export function useHomePage() {
  /** @type {[TitleEntity[], Function]} */
  const [titles, setTitles] = useState([]);

  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTitles();
        setTitles(data);
      } catch (error) {
        console.error("Error cargando títulos:", error);
      }
    }
  
    load();
  }, []);

  return {
    titles,
    movies: titles.filter(t => t.type === "movie"),
    series: titles.filter(t => t.type === "tv"),
    animes: titles.filter(t => t.type === "anime"),
    selected,
    setSelected,
  };
}
