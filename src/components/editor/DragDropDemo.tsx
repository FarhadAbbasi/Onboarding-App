import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

function Draggable() {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: 'draggable' });
  return (
    <button ref={setNodeRef} {...listeners} {...attributes} style={{ padding: 20, background: 'lightblue', margin: 10 }}>
      Drag me
    </button>
  );
}

function Droppable({ onDrop, children }: { onDrop: () => void; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'droppable' });
  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 100,
        minWidth: 200,
        background: isOver ? 'lightgreen' : 'lightgray',
        margin: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
}

export default function MinimalDndDemo() {
  const [dropped, setDropped] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over && event.over.id === 'droppable') {
      setDropped(true);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Draggable />
      <Droppable onDrop={() => {}}>
        {dropped ? 'Dropped!' : 'Drop here'}
      </Droppable>
    </DndContext>
  );
}



// import React, { useState } from 'react';
// import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
// import type { DragEndEvent } from '@dnd-kit/core';

// const COMPONENTS = [
//   { id: 'headline', label: 'Headline' },
//   { id: 'subheadline', label: 'Subheadline' },
//   { id: 'feature', label: 'Feature' },
//   { id: 'cta', label: 'Call to Action' },
//   { id: 'testimonial', label: 'Testimonial' },
// ];

// function DraggableItem({ id, label }: { id: string; label: string }) {
//   const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
//   return (
//     <div
//       ref={setNodeRef}
//       {...listeners}
//       {...attributes}
//       className={`cursor-pointer px-3 py-2 rounded bg-white border hover:bg-blue-50 transition ${isDragging ? 'opacity-50' : ''}`}
//       style={{ opacity: isDragging ? 0.5 : 1 }}
//     >
//       {label}
//     </div>
//   );
// }

// function DropArea({ onDrop, children }: { onDrop: (id: string) => void; children: React.ReactNode }) {
//   const { setNodeRef, isOver } = useDroppable({ id: 'drop-area' });
//   return (
//     <div
//       ref={setNodeRef}
//       className={`flex-1 min-h-[400px] bg-gray-50 border-2 border-dashed rounded-lg p-4 ml-4 transition ${isOver ? 'bg-blue-50 border-blue-400' : 'border-gray-300'}`}
//     >
//       {children}
//     </div>
//   );
// }

// export default function DragDropDemo() {
//   const [dropped, setDropped] = useState<string[]>([]);

//   const handleDragEnd = (event: DragEndEvent) => {
//     const { over, active } = event;
//     if (over && over.id === 'drop-area') {
//       setDropped((prev) => [...prev, active.id as string]);
//     }
//   };

//   return (
//     <div className="flex h-[60vh] w-full bg-white rounded shadow overflow-hidden">
//       <aside className="w-56 bg-gray-50 border-r h-full p-4 overflow-y-auto">
//         <h2 className="text-lg font-bold mb-4">Component Library</h2>
//         <div className="flex flex-col gap-2">
//           {COMPONENTS.map((item) => (
//             <DraggableItem key={item.id} id={item.id} label={item.label} />
//           ))}
//         </div>
//       </aside>
//       <DndContext onDragEnd={handleDragEnd}>
//         <DropArea onDrop={() => {}}>
//           {dropped.length === 0 ? (
//             <div className="text-gray-400 text-center mt-16">Drag components here</div>
//           ) : (
//             dropped.map((id, idx) => (
//               <div key={idx} className="p-3 my-2 bg-blue-100 rounded text-center font-semibold">{COMPONENTS.find(c => c.id === id)?.label}</div>
//             ))
//           )}
//         </DropArea>
//       </DndContext>
//     </div>
//   );
// } 