import { Volume2, VolumeX } from "lucide-react";

interface Props {
  isMuted: boolean;
  onToggle: () => void;
}

export function HeroAudioToggle({ isMuted, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="absolute right-4 top-20 z-20 rounded-full border border-gray-600 bg-black/50 p-2.5 text-white transition-colors hover:bg-black/70 md:right-12 md:top-28 md:p-3"
      aria-label={isMuted ? "Activar sonido" : "Silenciar"}
    >
      {isMuted ? <VolumeX /> : <Volume2 />}
    </button>
  );
}
