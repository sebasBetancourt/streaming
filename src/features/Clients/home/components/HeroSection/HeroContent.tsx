import type { ReactNode } from "react";
import type { TitleEntity } from "@/entities/titles";

interface Props {
  item: TitleEntity;
  actions: ReactNode;
}

export function HeroContent({ item, actions }: Props) {
  return (
    <div className="relative z-10 flex h-full max-w-4xl flex-col justify-center px-4 md:px-12">
      <div className="mb-4">
        <div className="inline-flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center bg-red-600 text-lg font-bold text-white">P</div>
          <span className="text-sm font-medium uppercase tracking-widest text-white/80 2xl:text-lg">PelixFlix</span>
        </div>
      </div>

      <h1 className="mb-4 text-7xl font-bold leading-tight text-white md:text-7xl lg:text-8xl 2xl:text-9xl">{item.title}</h1>

      <div className="mb-4">
        <div className="inline-flex items-center rounded bg-red-600 px-3 py-1 text-sm font-bold text-white 2xl:text-lg">
          #1 en Clasificación de Series
        </div>
      </div>

      <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl 2xl:text-2xl">{item.description}</p>

      {actions}
    </div>
  );
}
