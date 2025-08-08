import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export type SidebarItem = {
  id: string;
  type: string;
  label: string;
};

const COMPONENT_CATEGORIES = [
  {
    name: 'Assets',
    items: [
      { id: 'asset-image', type: 'image', label: 'Image' },
      { id: 'asset-video', type: 'video', label: 'Video' },
      { id: 'asset-icon', type: 'icon', label: 'Icon' },
    ],
  },
  {
    name: 'Elements',
    items: [
      { id: 'element-button', type: 'button', label: 'Button' },
      { id: 'element-switch', type: 'switch', label: 'Switch' },
      { id: 'element-heading', type: 'heading', label: 'Heading' },
      { id: 'element-paragraph', type: 'paragraph', label: 'Paragraph' },
      { id: 'element-list', type: 'list', label: 'List' },
    ],
  },
  {
    name: 'Features',
    items: [
      { id: 'feature-navbar', type: 'navbar', label: 'Navbar' },
      { id: 'feature-section', type: 'section', label: 'Section' },
      { id: 'feature-card', type: 'card', label: 'Card' },
      { id: 'feature-footer', type: 'footer', label: 'Footer' },
      { id: 'feature-testimonial', type: 'testimonial', label: 'Testimonial' },
    ],
  },
];

function DraggableSidebarItem({ item }: { item: SidebarItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { type: item.type, label: item.label },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-pointer px-3 py-2 rounded bg-white border hover:bg-blue-50 transition ${isDragging ? 'opacity-50' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {item.label}
    </div>
  );
}

const ContentEditorSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-50 border-r h-full p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Component Library</h2>
      {COMPONENT_CATEGORIES.map((category) => (
        <div key={category.name} className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">{category.name}</h3>
          <div className="flex flex-col gap-2">
            {category.items.map((item) => (
              <DraggableSidebarItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
};

export default ContentEditorSidebar; 