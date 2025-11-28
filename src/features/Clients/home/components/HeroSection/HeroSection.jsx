import { useState, useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import ItemDialog from "@/shared/components/ItemDialog";

import { Play, Info } from "lucide-react";

import { HeroAudioToggle } from "./HeroAudioToggle";
import { HeroContent } from "./HeroContent";

import { useHeroItem } from "../../hooks/useHeroItem";

export function HeroSection() {
  const { item } = useHeroItem();
  const [open, setOpen] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden pt-20 mb-20" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Background */}
      <div className="absolute inset-0">
        <img src={item.image} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      {/* Audio */}
      <audio ref={audioRef} src="/sounds/strager-things-theme.mp3" autoPlay loop muted />

      {/* Mute Button */}
      <HeroAudioToggle isMuted={isMuted} onToggle={toggleMute} />

      {/* Content */}
      <HeroContent
        item={item}
        onOpen={
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 flex items-center gap-3 px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105 rounded-md"
              >
                <Play className="w-6 h-6 fill-current" />
                Ver
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="bg-gray-600/70 text-white hover:bg-gray-600 flex items-center gap-3 px-8 py-4 text-lg font-semibold transition-all duración-200 hover:scale-105 rounded-md border border-gray-500"
                onClick={() => setOpen(true)}
              >
                <Info className="w-6 h-6" />
                Mas Informacion
              </Button>
            </div>
        }
      />

      {/* Dialog */}
      <ItemDialog open={open} onClose={() => setOpen(false)} item={item} />
    </div>
  );
}
