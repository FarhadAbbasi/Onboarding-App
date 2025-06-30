import React from 'react';

interface DragBlockProps {
  id: string;
  type: string;
  content: string;
  styles?: React.CSSProperties;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

const blockLabels: Record<string, string> = {
  headline: 'Headline',
  subheadline: 'Subheadline',
  feature: 'Feature',
  cta: 'Call to Action',
  testimonial: 'Testimonial',
};

export const DragBlock: React.FC<DragBlockProps> = ({
  id,
  type,
  content,
  styles = {},
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  dragHandleProps,
}) => {
  return (
    <div
      className={`relative group rounded-lg transition-all mb-4 bg-white p-4 shadow border ${selected ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
      style={{ cursor: 'pointer', ...styles }}
      onClick={() => onSelect && onSelect(id)}
    >
      {/* Drag handle */}
      <div {...dragHandleProps} className="absolute left-0 top-0 p-1 cursor-grab z-10">
        <span className="text-gray-400">⋮⋮</span>
      </div>
      {/* Block label */}
      <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">
        {blockLabels[type] || type}
      </div>
      {/* Block content */}
      <div className="text-base text-gray-900">
        {type === 'testimonial' ? (
          (() => {
            try {
              const t = JSON.parse(content);
              return <span>"{t.text}" - {t.author}, {t.role} at {t.company}</span>;
            } catch {
              return content;
            }
          })()
        ) : (
          content
        )}
      </div>
      {/* Edit/Delete controls */}
      {selected && (
        <div className="absolute right-2 top-2 flex gap-1 z-20">
          <button
            className="p-1 text-gray-400 hover:text-blue-600"
            onClick={e => { e.stopPropagation(); onEdit && onEdit(id); }}
            title="Edit"
          >
            ✎
          </button>
          <button
            className="p-1 text-gray-400 hover:text-red-600"
            onClick={e => { e.stopPropagation(); onDelete && onDelete(id); }}
            title="Delete"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}; 