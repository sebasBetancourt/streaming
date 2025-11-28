import { HeroSection } from "@/shared/components/HeroSection";
import { Footer } from "@/shared/components/Footer";
import ItemDialog from "@/shared/components/ItemDialog";

import { useHomePage } from "../hooks/useHomePage";
import { HomeRows } from "../components/HomeRows";

export default function Home() {
  const { movies, series, animes, selected, setSelected } = useHomePage();

  return (
    <div className="min-h-screen bg-black">
      <HeroSection />

      <HomeRows
        movies={movies}
        series={series}
        animes={animes}
        setSelected={setSelected}
      />

      <Footer />

      <ItemDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        item={selected}
      />
    </div>
  );
}
