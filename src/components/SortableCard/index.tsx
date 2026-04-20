import { useSortable } from "@dnd-kit/react/sortable";
import type { CardMetadata } from "../../types/card";

export function SortableCard({ id, index, group, modal, onDelete, data }: {
  id: string;
  index: number;
  group: string,
  modal: (id: string) => void,
  onDelete: (id: string) => void,
  data?: CardMetadata
}) {
  // Configures the card as a sortable element
  const { ref } = useSortable({
    id,
    index,
    group,
  });

  return (
    <div ref={ref} className="border-2 border-[hsl(231,87%,41%)] cursor-pointer p-[10px] w-full min-h-[100px] bg-white shadow-[2px_2px_10px_rgba(0,0,0,0.6)] transition-all duration-200 ease-in-out relative grid grid-cols-[4fr_1fr] grid-rows-[4fr_1fr]"
    >
      <p
        onClick={(e) => {
          e.stopPropagation();
          modal(id);
        }}
        className="material-symbols-outlined absolute right-4 text-outline hover:text-primary cursor-pointer text-gray-400 z-10 top-3 transition-colors"
      >
        edit
      </p>
      <p
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
        className="material-symbols-outlined absolute right-4 text-outline hover:text-error cursor-pointer text-gray-300 z-10 top-12 transition-colors"
      >
        delete
      </p>
      <div className="flex flex-col gap-1">
        <h4 className="font-headline font-bold text-primary text-sm truncate">{data?.title || 'Sem título'}</h4>
        <p className="text-xs text-on-surface-variant  break-all w-[210px]">{data?.description || ''}</p>
      </div>
    </div>
  );
}