import { useDroppable } from "@dnd-kit/react";

export function DroppableZone({ id, title, children, horizontal, backgroundColor, headerColor }: { id: string; title: string, children: React.ReactNode, horizontal?: boolean, backgroundColor?: string, headerColor?: string }) {
  // Makes the container react to drops so you can drop back into empty areas
  const { ref } = useDroppable({
    id,
  });

  return (
    <div
      ref={ref}
      className={`border border-[#ccc] flex flex-col items-center box-border rounded-[12px] transition-colors duration-300 ease-in-out overflow-hidden ${horizontal ? 'w-full min-w-[300px] min-h-[80vh] flex-wrap' : 'w-[300px] min-h-[300px] flex-nowrap'
        }`}
      style={{ backgroundColor: backgroundColor || 'transparent' }}
    >
      {/* Header da Coluna */}
      <div
        className="w-full p-[12px] text-center box-border mb-[15px]"
        style={{ backgroundColor: headerColor || '#ccc' }}
      >
        <h3 className="m-0 text-[16px] text-white font-bold uppercase tracking-[1px]">
          {title}
        </h3>
      </div>

      {/* Container de cards para garantir padding interno */}
      <div className="w-full flex flex-col items-center gap-[10px] px-[20px] pb-[20px] pt-0 box-border">
        {children}
      </div>
    </div>
  );
}