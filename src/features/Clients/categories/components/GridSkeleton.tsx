/** Celdas de carga para colocar dentro de la rejilla de posters. */
export default function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} aria-hidden className="shimmer aspect-[2/3] rounded-md" />
      ))}
    </>
  );
}
