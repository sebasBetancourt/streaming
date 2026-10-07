import { Footer } from "@/shared/components/Footer";
import ItemDialog from "@/shared/components/ItemDialog";
import { HeroSection } from "../components/HeroSection/HeroSection";
import { HomeRows } from "../components/HomeRows";
import { useHomePage } from "../hooks/useHomePage";

export default function Home() {
  const { movies, series, animes, selected, setSelected } = useHomePage();

  return (
    <div className="min-h-screen bg-black">
      <HeroSection />
      <HomeRows movies={movies} series={series} animes={animes} />
      <Footer />
      <ItemDialog open={!!selected} onClose={() => setSelected(null)} item={selected} />
    </div>
  );
}
