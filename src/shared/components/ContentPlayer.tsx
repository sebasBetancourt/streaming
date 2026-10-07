import { ContentCard } from "@/features/Clients/home/components/ContentCard";
import type { TitleEntity } from "@/entities/titles";

interface Props {
  id?: string;
  title: string;
  items: TitleEntity[];
  showRank?: boolean;
  onItemClick?: (item: TitleEntity) => void;
}

export function ContentPlayer({ id, title, items, showRank = false }: Props) {
  return (
    <div id={id} className="mb-8 scroll-mt-24 px-4 sm:px-6 md:px-12 lg:px-24">
      <h2 className="py-4 text-xl font-semibold text-white md:text-2xl">{title}</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="w-full">
            <ContentCard item={item} showRank={showRank} />
          </div>
        ))}
      </div>
    </div>
  );
}
