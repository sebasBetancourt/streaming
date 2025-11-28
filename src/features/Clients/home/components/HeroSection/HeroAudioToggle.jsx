import { Volume2, VolumeX } from "lucide-react";

export function HeroAudioToggle({ isMuted, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="absolute top-24 right-8 md:top-32 md:right-16 z-20 bg-black/50 
      hover:bg-black/70 text-white rounded-full p-3 transition-colors 
      border border-gray-600"
    >
      {isMuted ? <VolumeX /> : <Volume2 />}
    </button>
  );
}
