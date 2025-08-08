import React from 'react';
import { useFlowDnD } from './FlowDnDContext';
import { DragBlock } from './DragBlock';

interface BlocksRendererProps {
  onEditBlock?: (id: string) => void;
  onDeleteBlock?: (id: string) => void;
}

const BlocksRenderer: React.FC<BlocksRendererProps> = ({ onEditBlock, onDeleteBlock }) => {
  const { blocks } = useFlowDnD();

  return (
    <div>
      {blocks.map((block) => (
        <DragBlock
          key={block.id}
          {...block}
          onEdit={onEditBlock}
          onDelete={onDeleteBlock}
        />
      ))}
    </div>
  );
};

export default BlocksRenderer; 