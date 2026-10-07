import type { TitleEntity } from "@/entities/titles";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { ContentCard } from "./ContentCard";

interface Props {
  id?: string;
  title: string;
  items: TitleEntity[];
  showRank?: boolean;
}

export function ContentRow({ id, title, items, showRank = false }: Props) {
  return (
    <div id={id} className="mb-8 scroll-mt-24">
      <h2 className="px-4 py-4 text-xl font-semibold text-white md:px-12 md:text-2xl">{title}</h2>

      <div className="px-4 md:px-12">
        <ScrollArea className="w-full">
          <div className="flex space-x-4 pb-4">
            {items.map((item) => (
              <div key={item.id} className="w-72 flex-none px-1 md:w-80">
                <ContentCard item={item} showRank={showRank} />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
