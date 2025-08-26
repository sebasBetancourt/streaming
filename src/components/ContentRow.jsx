import { ContentCard } from "./ContentCard";
import { ScrollArea } from "./ui/scroll-area";

export function ContentRow({ title, items, showRank = false }) {
  return (
    <div className="mb-8">
      <h2 className="text-white text-xl md:text-2xl font-semibold mb-4 px-4 md:px-12">
        {title}
      </h2>
      
      <div className="px-4 md:px-12">
        <ScrollArea className="w-full">
          <div className="flex space-x-4 pb-4">
            {items.map((item) => (
              <div key={item.id} className="flex-none w-64 md:w-80">
                <ContentCard
                  title={item.title}
                  image={item.image}
                  year={item.year}
                  rating={item.rating}
                  duration={item.duration}
                  rank={showRank ? item.rank : undefined}
                  description={item.description}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}