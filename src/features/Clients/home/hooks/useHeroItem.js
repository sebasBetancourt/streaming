import { useState, useEffect } from "react";
import { getHeroItem } from "../services/getHeroItem";
import { mapMovie } from "@/entities/movies/mapper";

const fallbackItem = {
  id: "dexter",
  title: "Dexter",
  image:
    "https://media.gq.com.mx/photos/5f87b31742587331b04fdcc3/16:9/w_2560%2Cc_limit/Postr%2520dexter.jpg",
  year: "2006",
  rating: "8.7",
  duration: "8 Seasons",
  type: "tv",
  genres: ["Crimen", "Drama", "Thriller"],
  description:
    "Dexter Morgan un experto en salpicaduras de sangre...",
};

export function useHeroItem() {
  const [item, setItem] = useState(fallbackItem);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const apiData = await getHeroItem();
        setItem(mapMovie(apiData));
      } catch {
        setItem(fallbackItem);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { item, loading };
}
