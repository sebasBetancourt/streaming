import { ContentCard } from "@/features/Clients/home/components/ContentCard";

export function ContentPlayer({ id, title, items, showRank = false }) {
  return (
    <div id={id} className="mb-8 scroll-mt-24 px-4 sm:px-6 md:px-12 lg:px-24">
      <h2 className="py-4 text-xl font-semibold text-white md:text-2xl">{title}</h2>

      <div className="">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4 sm:gap-6 md:gap-8">
          {items.map((item) => (
            <div key={item.id} className="w-full">
              <ContentCard
                id={item.id}
                title={item.title}
                image={item.image}
                year={item.year}
                rating={item.ratingAvg}
                rank={showRank ? item.rank : undefined}
                description={item.description}
                type={item.type}          
                genres={item.categories}
                creator={item.creator}
                createdBy={item.createdBy}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
