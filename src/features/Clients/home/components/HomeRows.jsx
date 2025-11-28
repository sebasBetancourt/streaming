import { ContentRow } from "./ContentRow";

export function HomeRows({ movies, series, animes, setSelected }) {
  return (
    <div className="relative z-10 -mt-32 pb-20">
      <ContentRow
        id="Explore"
        title="Explorar"
        items={movies}
        onItemClick={setSelected}
      />

      <ContentRow
        id="Ranking"
        title="Tendencia Ahora"
        items={series}
        onItemClick={setSelected}
      />

      <ContentRow
        id="Popular"
        title="Popular en PelisFlix"
        items={animes}
        onItemClick={setSelected}
      />

      <ContentRow
        title="Clasificación Películas"
        items={movies}
        showRank
        onItemClick={setSelected}
      />

      <ContentRow
        title="Clasificación Series"
        items={series}
        onItemClick={setSelected}
      />

      <ContentRow
        title="Clasificación Anime"
        items={animes}
        onItemClick={setSelected}
      />
    </div>
  );
}
