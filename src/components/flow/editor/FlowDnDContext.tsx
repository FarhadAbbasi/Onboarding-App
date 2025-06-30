import React, { createContext, useContext, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export interface DnDBlock {
  id: string;
  type: string;
  content: string;
  styles?: React.CSSProperties;
}

interface FlowDnDContextValue {
  blocks: DnDBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<DnDBlock[]>>;
  handleDragEnd: (event: DragEndEvent) => void;
}

const FlowDnDContext = createContext<FlowDnDContextValue | undefined>(undefined);

export const useFlowDnD = () => {
  const ctx = useContext(FlowDnDContext);
  if (!ctx) throw new Error('useFlowDnD must be used within FlowDnDProvider');
  return ctx;
};

export const FlowDnDProvider: React.FC<{ initialBlocks: DnDBlock[]; children: React.ReactNode }> = ({ initialBlocks, children }) => {
  const [blocks, setBlocks] = useState<DnDBlock[]>(initialBlocks);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);
    setBlocks(arrayMove(blocks, oldIndex, newIndex));
  };

  return (
    <FlowDnDContext.Provider value={{ blocks, setBlocks, handleDragEnd }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </DndContext>
    </FlowDnDContext.Provider>
  );
}; 