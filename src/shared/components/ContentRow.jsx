import { ContentCard } from "./ContentCard";
import { ScrollArea } from "./ui/scroll-area";

export function ContentRow({ id, title, items, showRank = false }) {
  return (
    <div id={id} className="mb-8 scroll-mt-24">
      <h2 className="px-4 text-xl font-semibold text-white md:px-12 md:text-2xl">{title}</h2>

      <div className="px-4 md:px-12">
        <ScrollArea className="w-full">
          <div className="flex space-x-4 pb-4">
            {items.map((item) => (
              <div key={item.id} className="w-72 flex-none px-1 md:w-80">
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
        </ScrollArea>
      </div>
    </div>
  );
}