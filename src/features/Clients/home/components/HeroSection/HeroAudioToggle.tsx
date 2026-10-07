import { Volume2, VolumeX } from "lucide-react";

interface Props {
  isMuted: boolean;
  onToggle: () => void;
}

export function HeroAudioToggle({ isMuted, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="absolute top-24 right-8 z-20 rounded-full border border-gray-600 bg-black/50 p-3 text-white transition-colors hover:bg-black/70 md:top-32 md:right-16"
      aria-label={isMuted ? "Activar sonido" : "Silenciar"}
    >
      {isMuted ? <VolumeX /> : <Volume2 />}
    </button>
  );
}
