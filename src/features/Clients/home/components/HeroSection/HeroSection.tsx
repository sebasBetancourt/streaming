import { useRef, useState } from "react";
import { Info, Play } from "lucide-react";
import ItemDialog from "@/shared/components/ItemDialog";
import NetflixPlayerModal from "@/shared/components/NetflixPlayer";
import { Button } from "@/shared/components/ui/button";
import { useHeroItem } from "../../hooks/useHeroItem";
import { HeroAudioToggle } from "./HeroAudioToggle";
import { HeroContent } from "./HeroContent";

export function HeroSection() {
  const { item } = useHeroItem();
  const [open, setOpen] = useState(false);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    // El texto va abajo y las filas se montan sobre el borde inferior (HomeRows usa margen negativo), sin hueco entre ambos.
    <div className="relative flex h-[70svh] max-h-[860px] min-h-[460px] w-full items-end overflow-hidden pb-24 pt-20 sm:h-[75svh] md:h-[85svh] md:pb-36">
      <div className="absolute inset-0">
        {item?.backdrop && <img src={item.backdrop} alt="" className="h-full w-full object-cover object-[70%_center] md:object-center" />}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/40" />
      </div>

      <audio ref={audioRef} src="/sounds/strager-things-theme.mp3" autoPlay loop muted />
      <HeroAudioToggle isMuted={isMuted} onToggle={toggleMute} />

      {item && (
        <>
          <HeroContent
            item={item}
            actions={
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => (item.embedUrl ? setPlayerUrl(item.embedUrl) : setOpen(true))}
                  size="lg"
                  className="flex h-11 items-center gap-2 rounded-md bg-white px-5 text-base font-semibold text-black transition-all duration-200 hover:scale-105 hover:bg-gray-200 sm:h-12 sm:px-8 sm:text-lg"
                >
                  <Play className="h-5 w-5 fill-current sm:h-6 sm:w-6" />
                  Ver
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  className="flex h-11 items-center gap-2 rounded-md border border-gray-500 bg-gray-600/70 px-5 text-base font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-gray-600 sm:h-12 sm:px-8 sm:text-lg"
                  onClick={() => setOpen(true)}
                >
                  <Info className="h-5 w-5 sm:h-6 sm:w-6" />
                  Más información
                </Button>
              </div>
            }
          />
          <ItemDialog open={open} onClose={() => setOpen(false)} item={item} />
        </>
      )}

      {playerUrl && <NetflixPlayerModal url={playerUrl} onClose={() => setPlayerUrl(null)} />}
    </div>
  );
}
