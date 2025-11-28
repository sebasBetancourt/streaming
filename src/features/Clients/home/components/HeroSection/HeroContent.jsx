export function HeroContent({ item, onOpen }) {
  return (
    <div className="relative z-10 flex flex-col justify-center h-full px-4 md:px-12 max-w-4xl">
      <div className="mb-4">
        <div className="inline-flex items-center space-x-3">
          <div className="bg-red-600 text-white w-8 h-8 flex items-center justify-center font-bold text-lg">
            P
          </div>
          <span className="text-white/80 font-medium tracking-widest uppercase text-sm 2xl:text-lg">
            PelixFlix
          </span>
        </div>
      </div>

      <h1 className="text-7xl md:text-7xl lg:text-8xl 2xl:text-9xl font-bold text-white mb-4 leading-tight">
        {item.title}
      </h1>

      <div className="mb-4">
        <div className="inline-flex items-center bg-red-600 text-white px-3 py-1 rounded text-sm 2xl:text-lg font-bold">
          #1 en Clasificación de Series
        </div>
      </div>

      <p className="text-lg md:text-xl 2xl:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed">
        {item.description}
      </p>

      {/* Buttons */}
      {onOpen}
    </div>
  );
}
