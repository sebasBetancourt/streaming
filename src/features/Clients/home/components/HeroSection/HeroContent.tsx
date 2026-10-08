import type { ReactNode } from "react";
import type { TitleEntity } from "@/entities/titles";

interface Props {
  item: TitleEntity;
  actions: ReactNode;
}

export function HeroContent({ item, actions }: Props) {
  return (
    <div className="relative z-10 flex w-full max-w-3xl flex-col px-4 md:px-12 2xl:max-w-4xl">
      <div className="mb-3 inline-flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center bg-red-600 text-base font-bold text-white md:h-8 md:w-8 md:text-lg">P</div>
        <span className="text-xs font-medium uppercase tracking-widest text-white/80 md:text-sm 2xl:text-lg">PelixFlix</span>
      </div>

      <h1 className="mb-3 line-clamp-2 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl">
        {item.title}
      </h1>

      <div className="mb-3">
        <div className="inline-flex items-center rounded bg-red-600 px-2.5 py-1 text-xs font-bold text-white md:text-sm 2xl:text-lg">
          #1 en Clasificación de Series
        </div>
      </div>

      {item.description && (
        <p className="mb-5 line-clamp-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base md:mb-6 md:line-clamp-4 md:text-lg 2xl:text-2xl">
          {item.description}
        </p>
      )}

      {actions}
    </div>
  );
}
