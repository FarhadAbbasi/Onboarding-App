import React, { useState } from 'react'
import { Plus, GripVertical, Edit, Trash2, Type, Zap, MessageSquare, Users } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import type { Database } from '../../lib/supabase'

type ContentBlock = Database['public']['Tables']['content_blocks']['Row']

interface BlockEditorProps {
  blocks: ContentBlock[]
  onBlockUpdate: (blockId: string, updates: Partial<ContentBlock>) => void
  onBlockReorder: (newBlocks: ContentBlock[]) => void
  onAddBlock: (type: ContentBlock['type'], content: string) => void
  onDeleteBlock: (blockId: string) => void
}

function DragHandle() {
  return (
    <div className="cursor-grab hover:text-gray-600 p-1 touch-none">
      <GripVertical size={16} />
    </div>
  )
}

interface SortableBlockProps {
  block: ContentBlock
  onUpdate: (updates: Partial<ContentBlock>) => void
  onDelete: () => void
}

function SortableBlock({ block, onUpdate, onDelete }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <EditableBlock
        block={block}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

interface EditableBlockProps {
  block: ContentBlock
  onUpdate: (updates: Partial<ContentBlock>) => void
  onDelete: () => void
  dragHandleProps?: any
}

function EditableBlock({ block, onUpdate, onDelete, dragHandleProps }: EditableBlockProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(block.content)

  const handleSave = () => {
    onUpdate({ content })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setContent(block.content)
    setIsEditing(false)
  }

  const getBlockIcon = (type: ContentBlock['type']) => {
    switch (type) {
      case 'headline': return <Type size={16} />
      case 'subheadline': return <Type size={16} />
      case 'feature': return <Zap size={16} />
      case 'cta': return <MessageSquare size={16} />
      case 'testimonial': return <Users size={16} />
      default: return <Type size={16} />
    }
  }

  const getBlockLabel = (type: ContentBlock['type']) => {
    switch (type) {
      case 'headline': return 'Headline'
      case 'subheadline': return 'Subheadline'
      case 'feature': return 'Feature'
      case 'cta': return 'Call to Action'
      case 'testimonial': return 'Testimonial'
      default: return 'Content'
    }
  }

  const parseTestimonial = (content: string) => {
    try {
      return JSON.parse(content)
    } catch {
      return { text: content, author: '', role: '', company: '' }
    }
  }

  const renderContent = () => {
    if (block.type === 'testimonial') {
      const testimonial = parseTestimonial(block.content)
      return `"${testimonial.text}" - ${testimonial.author}, ${testimonial.role} at ${testimonial.company}`
    }
    return block.content
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div {...dragHandleProps}>
            <DragHandle />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {getBlockIcon(block.type)}
            <span className="font-medium">{getBlockLabel(block.type)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          {block.type === 'testimonial' ? (
            <TestimonialEditor
              value={parseTestimonial(block.content)}
              onChange={(testimonial) => setContent(JSON.stringify(testimonial))}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md resize-none"
              rows={block.type === 'feature' ? 2 : 3}
              placeholder={`Enter ${getBlockLabel(block.type).toLowerCase()} content...`}
            />
          )}
          
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary text-sm">
              Save
            </button>
            <button onClick={handleCancel} className="btn-secondary text-sm">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-700 cursor-pointer" onClick={() => setIsEditing(true)}>
          {renderContent() || 'Click to edit...'}
        </div>
      )}
    </div>
  )
}

interface TestimonialEditorProps {
  value: any
  onChange: (testimonial: any) => void
}

function TestimonialEditor({ value, onChange }: TestimonialEditorProps) {
  return (
    <div className="space-y-2">
      <textarea
        value={value.text || ''}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md resize-none"
        rows={3}
        placeholder="Testimonial text..."
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="text"
          value={value.author || ''}
          onChange={(e) => onChange({ ...value, author: e.target.value })}
          className="input-field"
          placeholder="Author name"
        />
        <input
          type="text"
          value={value.role || ''}
          onChange={(e) => onChange({ ...value, role: e.target.value })}
          className="input-field"
          placeholder="Role"
        />
        <input
          type="text"
          value={value.company || ''}
          onChange={(e) => onChange({ ...value, company: e.target.value })}
          className="input-field"
          placeholder="Company"
        />
      </div>
    </div>
  )
}

const COMPONENT_LIBRARY = [
  { id: 'headline', type: 'headline', label: 'Headline' },
  { id: 'subheadline', type: 'subheadline', label: 'Subheadline' },
  { id: 'feature', type: 'feature', label: 'Feature' },
  { id: 'cta', type: 'cta', label: 'Call to Action' },
  { id: 'testimonial', type: 'testimonial', label: 'Testimonial' },
  // { id: 'permissions', type: 'permissions', label: 'Permissions' },
  // { id: 'profile-setup', type: 'profile-setup', label: 'Profile Setup' },
];

function DraggableLibraryItem({ item }: { item: { id: string; type: string; label: string } }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id, data: { type: item.type, label: item.label } });

  // Realistic preview for each type
  let preview: React.ReactNode = null;
  switch (item.type) {
    case 'headline':
      preview = <h1 className="text-xl font-bold text-gray-900">Headline Example</h1>;
      break;
    case 'subheadline':
      preview = <h2 className="text-base text-gray-600">Subheadline Example</h2>;
      break;
    case 'feature':
      preview = <div className="bg-blue-50 rounded p-2 text-blue-800 font-medium">Feature Example</div>;
      break;
    case 'cta':
      preview = <button className="bg-blue-600 text-white px-4 py-2 rounded shadow">Call to Action</button>;
      break;
    case 'testimonial':
      preview = <blockquote className="italic text-gray-700 border-l-4 border-blue-400 pl-2">“Testimonial Example”</blockquote>;
      break;
    default:
      preview = <div>{item.label}</div>;
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm cursor-grab hover:shadow-md transition-all flex items-center gap-4 ${isDragging ? 'opacity-50 ring-2 ring-blue-400' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      title={`Drag to add a ${item.label}`}
    >
      <div className="flex-1">{preview}</div>
      <span className="text-xs text-gray-400 group-hover:text-blue-500 transition">Drag</span>
          </div>
  );
}

function BlockEditorSidebar() {
  return (
    <aside className="w-full h-full bg-gradient-to-b from-gray-50 to-white p-8 flex flex-col justify-start overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-900">Component Library</h2>
      <div className="flex flex-col gap-4">
        {COMPONENT_LIBRARY.map((item) => (
          <DraggableLibraryItem key={item.id} item={item} />
              ))}
      </div>
      <div className="mt-8 text-xs text-gray-400 text-center">Drag a component to the preview panel →</div>
    </aside>
  );
}

function renderBlockPreview(block: ContentBlock) {
  if (!block) return null;

  switch (block.type) {
    case 'headline':
      return (
        <h1 className="text-3xl font-bold my-2">{block.content || 'Welcome to Your App!'}</h1>
      );
    case 'subheadline':
      return (
        <h2 className="text-xl text-gray-600 my-2">{block.content || 'Start building your onboarding experience.'}</h2>
      );
    case 'feature':
      return (
        <section className="bg-white border rounded-lg p-6 my-2">
          <h2 className="text-xl font-bold mb-4">Feature</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="p-3 bg-blue-100 rounded">Feature One</li>
            <li className="p-3 bg-blue-100 rounded">Feature Two</li>
          </ul>
        </section>
      );
    case 'cta':
      return (
        <section className="bg-blue-600 text-white rounded-lg p-6 text-center my-2">
          <h2 className="text-2xl font-bold mb-2">{block.content || 'Ready to get started?'}</h2>
          <button className="btn-secondary">Join Now</button>
        </section>
      );
    case 'testimonial':
      return (
        <blockquote className="bg-gray-50 border-l-4 border-blue-400 p-4 my-2 rounded">
          <p className="italic mb-2">{block.content || '“This app made onboarding a breeze!”'}</p>
          <footer className="text-sm text-gray-600">- Happy User, CEO</footer>
        </blockquote>
      );
    default:
      return <div className="my-2">{block.content}</div>;
  }
}

export function BlockEditor() {
  // Only render the sidebar (no drop area or preview here)
  return (
    <div className="h-full w-full flex flex-col">
      <BlockEditorSidebar />
    </div>
  );
} 
