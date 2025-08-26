import { Play, Info, Volume2, VolumeX } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

export function HeroSection() {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format"
          alt="Kingdom Background"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
      </div>

      {/* Mute/Unmute Button */}
      <button 
        className="absolute top-24 right-8 md:top-32 md:right-16 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors border border-gray-600"
        onClick={() => setIsMuted(!isMuted)}
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
            <span className="text-white/80 font-medium tracking-widest uppercase text-sm">Series</span>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 leading-tight tracking-wide">
            KINGDOM
          </h1>
          
          {/* Badge */}
          <div className="mb-4">
            <div className="inline-flex items-center bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">
              #1 in TV Shows Today
            </div>
          </div>

          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
            Determined to protect a young patient who escaped a mysterious cult, a psychiatrist takes the girl in, putting her own family — and life — in danger.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            size="lg" 
            className="bg-white text-black hover:bg-gray-200 flex items-center gap-3 px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105 rounded-md"
          >
            <Play className="w-6 h-6 fill-current" />
            Play
          </Button>
          
          <Button 
            size="lg" 
            variant="secondary" 
            className="bg-gray-600/70 text-white hover:bg-gray-600 flex items-center gap-3 px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105 rounded-md border border-gray-500"
          >
            <Info className="w-6 h-6" />
            More Info
          </Button>
        </div>
      </div>

      {/* Bottom fade for smooth transition to content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
    </div>
  );
}