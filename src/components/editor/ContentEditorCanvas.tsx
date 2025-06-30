import React, { useState } from 'react';
import { DndContext, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { SidebarItem } from './ContentEditorSidebar';

const DroppedComponent: React.FC<{ item: SidebarItem }> = ({ item }) => (
  <div className="p-4 m-2 bg-white border rounded shadow-sm">
    <span className="font-semibold text-blue-600">{item.label}</span> (type: {item.type})
  </div>
);

const ContentEditorCanvas: React.FC = () => {
  const [components, setComponents] = useState<SidebarItem[]>([]);
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-dropzone' });

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    if (over && over.id === 'canvas-dropzone') {
      const { id, type, label } = active.data.current || {};
      if (id && type && label) {
        setComponents((prev) => [...prev, { id: `${id}-${Date.now()}`, type, label }]);
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div
        ref={setNodeRef}
        className={`flex-1 bg-gray-100 min-h-[600px] flex flex-col items-center justify-start border-2 border-dashed border-gray-300 rounded-lg m-4 transition ${isOver ? 'bg-blue-50 border-blue-400' : ''}`}
      >
        {components.length === 0 ? (
          <span className="text-gray-400 text-lg mt-32">Drag components here</span>
        ) : (
          components.map((item, idx) => <DroppedComponent key={item.id} item={item} />)
        )}
      </div>
    </DndContext>
  );
};

export default ContentEditorCanvas; 