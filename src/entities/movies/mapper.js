export function mapMovie(raw, index) {
  const rating = Number(raw.ratingAvg);

  return {
    id: raw._id,
    title: raw.title,
    description: raw.description,
    image: raw.posterUrl,
    posterUrl: raw.posterUrl,
    year: raw.year,
    ratingAvg: isNaN(rating) ? "0.0" : rating.toFixed(1),
    duration:
      raw.type === "tv" || raw.type === "anime"
        ? `${raw.temps || 1} Temp / ${raw.eps || 1} eps`
        : "Película",
    type: raw.type,
    categories: raw.categories || [],
    rank: index + 1,
    creator: raw.creator || "Desconocido",
  };
}
