import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { ContentRow } from "../components/ContentRow";
import { Footer } from "../components/Footer";
import { useState, useEffect } from "react";
import ItemDialog from "../components/ItemDialog";

export default function Home() {
  const [titles, setTitles] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const res = await fetch("http://localhost:3000/titles/list");
        const data = await res.json();

        const mapped = data.map((t, i) => ({
          id: t._id,
          title: t.title,
          image: t.posterUrl,
          posterUrl: t.posterUrl,
          year: t.year,
          ratingAvg: t.ratingAvg?.toFixed(1) || "0.0",
          duration:
            t.type === "tv" || t.type === "anime"
              ? `${t.temps || 1} Temp / ${t.eps || 1} eps`
              : "Película",
          description: t.description,
          type: t.type,
          categories: t.categories || [],
          rank: i + 1,
          creator: t.creator || "Desconocido",
        }));

        setTitles(mapped);
      } catch (err) {
        console.error("Error cargando títulos:", err);
      }
    };

    fetchTitles();
  }, []);

  const movies = titles.filter((t) => t.type === "movie");
  const series = titles.filter((t) => t.type === "tv");
  const animes = titles.filter((t) => t.type === "anime");

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <HeroSection />

      <div className="relative z-10 -mt-32 pb-20">
        <ContentRow
          id="Explore"
          title="Explorar"
          items={movies}
          onItemClick={setSelected}
        />
        <ContentRow
          id="Ranking"
          title="Tendencia Ahora"
          items={series}
          onItemClick={setSelected}
        />
        <ContentRow
          id="Popular"
          title="Popular en PelisFlix"
          items={animes}
          onItemClick={setSelected}
        />
        <ContentRow
          title="Clasificación Películas"
          items={movies}
          onItemClick={setSelected}
          showRank
        />
        <ContentRow
          title="Clasificación Series"
          items={series}
          onItemClick={setSelected}
        />
        <ContentRow
          title="Clasificación Anime"
          items={animes}
          onItemClick={setSelected}
        />
      </div>

      <Footer />

      <ItemDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        item={selected}
      />
    </div>
  );
}
