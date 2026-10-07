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
    <div className="relative mb-20 min-h-screen w-full overflow-hidden pt-20" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div className="absolute inset-0">
        {item?.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      <audio ref={audioRef} src="/sounds/strager-things-theme.mp3" autoPlay loop muted />
      <HeroAudioToggle isMuted={isMuted} onToggle={toggleMute} />

      {item && (
        <>
          <HeroContent
            item={item}
            actions={
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  onClick={() => (item.embedUrl ? setPlayerUrl(item.embedUrl) : setOpen(true))}
                  size="lg"
                  className="flex items-center gap-3 rounded-md bg-white px-8 py-4 text-lg font-semibold text-black transition-all duration-200 hover:scale-105 hover:bg-gray-200"
                >
                  <Play className="h-6 w-6 fill-current" />
                  Ver
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  className="flex items-center gap-3 rounded-md border border-gray-500 bg-gray-600/70 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-gray-600"
                  onClick={() => setOpen(true)}
                >
                  <Info className="h-6 w-6" />
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
