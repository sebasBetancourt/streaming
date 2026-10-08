import type { TitleEntity } from "@/entities/titles";
import { ContentRow } from "./ContentRow";

interface Props {
  movies: TitleEntity[];
  series: TitleEntity[];
  animes: TitleEntity[];
}

export function HomeRows({ movies, series, animes }: Props) {
  return (
    <div className="relative z-10 -mt-16 pb-20 md:-mt-24">
      <ContentRow id="Explore" title="Explorar" items={movies} />
      <ContentRow id="Ranking" title="Tendencia Ahora" items={series} />
      <ContentRow id="Popular" title="Popular en PelisFlix" items={animes} />
      <ContentRow title="Clasificación Películas" items={movies} showRank />
      <ContentRow title="Clasificación Series" items={series} />
      <ContentRow title="Clasificación Anime" items={animes} />
    </div>
  );
}
