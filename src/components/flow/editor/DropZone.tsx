import React from 'react';

interface DropZoneProps {
  isOver?: boolean;
  onDrop?: () => void;
  children?: React.ReactNode;
}

export const DropZone: React.FC<DropZoneProps> = ({ isOver = false, onDrop, children }) => {
  return (
    <div
      className={`transition-all h-4 my-2 rounded ${isOver ? 'bg-blue-200' : 'bg-transparent'}`}
      style={{ minHeight: 8, cursor: 'pointer' }}
      onClick={onDrop}
    >
      {children}
    </div>
  );
}; 