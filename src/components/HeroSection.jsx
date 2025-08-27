import { Play, Info, Volume2, VolumeX } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useRef } from "react";
import ItemDialog from "./ItemDialog";

export function HeroSection() {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // 👇 Estado para el diálogo
  const [open, setOpen] = useState(false);

  // 👇 Item del Hero (mismo shape que las cards)
  const heroItem = {
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
      "Dexter Morgan un experto en salpicaduras de sangre que reside en Miami, no resuelve solamente casos de asesinato sino que también los comete. Es una forma de justicia única en la cual el encantador Dexter se siente ávido de llevarla a cabo."
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false;
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.muted = true;
      }
    }
    setIsMuted(!isMuted);
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ minHeight: "calc(100vh - 64px)", paddingTop: "84px" }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroItem.image}
          alt="Dexter Background"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
      </div>

      {/* Audio hidden */}
      <audio
        ref={audioRef}
        src="/sounds/dexter-theme.mp3"
        autoPlay
        loop
        muted={isMuted}
      />

      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className="absolute top-24 right-8 md:top-32 md:right-16 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors border border-gray-600"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-4 md:px-12 max-w-4xl">
        {/* Netflix Series Badge */}
        <div className="mb-4">
          <div className="inline-flex items-center space-x-3">
            <div className="bg-red-600 text-white w-8 h-8 flex items-center justify-center font-bold text-lg">
              P
            </div>
            <span className="text-white/80 font-medium tracking-widest uppercase text-sm">Streaming</span>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 leading-tight tracking-wide">
            {heroItem.title}
          </h1>

          {/* Badge */}
          <div className="mb-4">
            <div className="inline-flex items-center bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">
              #1 en Clasificacion de Series
            </div>
          </div>

          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
            {heroItem.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="bg-white text-black hover:bg-gray-200 flex items-center gap-3 px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105 rounded-md"
          >
            <Play className="w-6 h-6 fill-current" />
            Ver
          </Button>

          {/* 👉 Abre el diálogo sin tocar el resto del layout */}
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
      </div>

      {/* Bottom fade for smooth transition to content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
      <div className="mb-68"></div>

      {/* Dialogo con el MISMO item del Hero */}
      <ItemDialog open={open} onClose={() => setOpen(false)} item={heroItem} />
    </div>
  );
}
