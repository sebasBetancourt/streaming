import { Play, Plus, ThumbsUp, ChevronDown } from "lucide-react";
import { useState } from "react";

export function ContentCard({ title, image, year, rating, duration, rank, description }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fallback image if the main image fails to load
  const fallbackImage = "https://via.placeholder.com/400x225/141414/ffffff?text=" + encodeURIComponent(title);

  return (
    <div 
      className="group relative cursor-pointer transition-all duration-300 hover:scale-105 hover:z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full rounded-md overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {/* Netflix Logo Overlay */}
        <div className="absolute top-2 left-2 z-20">
          <div className="bg-red-600 text-white w-6 h-6 flex items-center justify-center font-bold text-sm rounded-sm">
            N
          </div>
        </div>

        {/* Rank Badge */}
        {rank && (
          <div className="absolute top-2 right-2 z-20">
            <div className="bg-black/80 text-white font-bold text-lg px-2 py-1 rounded-sm border border-gray-600">
              #{rank}
            </div>
          </div>
        )}
        
        <img
          src={imageError ? fallbackImage : image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Hover Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="mb-3">
            <h3 className="text-white font-semibold mb-2 text-lg leading-tight">{title}</h3>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2 mb-3">
              <button className="bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-colors">
                <Play className="w-4 h-4 fill-current" />
              </button>
              <button className="bg-gray-800/80 text-white rounded-full p-2 hover:bg-gray-700 transition-colors border border-gray-600">
                <Plus className="w-4 h-4" />
              </button>
              <button className="bg-gray-800/80 text-white rounded-full p-2 hover:bg-gray-700 transition-colors border border-gray-600">
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button className="bg-gray-800/80 text-white rounded-full p-2 hover:bg-gray-700 transition-colors ml-auto border border-gray-600">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            {/* Info Row */}
            <div className="flex items-center space-x-3 text-sm text-gray-300 mb-2">
              {rating && (
                <span className="text-green-400 font-semibold">
                  {Math.round(parseFloat(rating) * 10)}% Match
                </span>
              )}
              {year && <span className="border border-gray-600 px-1 text-xs">{year}</span>}
              {duration && <span>{duration}</span>}
            </div>
            
            {/* Description */}
            {description && (
              <p className="text-white text-sm leading-relaxed line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}