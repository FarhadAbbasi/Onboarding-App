import React, { useState } from 'react'
import { Plus, GripVertical, Edit, Trash2, Type, Zap, MessageSquare, Users, Shield, Settings, ListChecks } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import type { Block } from '../../lib/schemas'

interface FlowBlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
  disabled?: boolean
}

function DragHandle() {
  return (
    <div className="cursor-grab hover:text-gray-600 p-1 touch-none">
      <GripVertical size={16} />
    </div>
  )
}

interface SortableBlockProps {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
  onDelete: () => void
  disabled?: boolean
}

function SortableBlock({ block, onUpdate, onDelete, disabled = false }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    disabled,
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
        disabled={disabled}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

interface EditableBlockProps {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
  onDelete: () => void
  disabled?: boolean
  dragHandleProps?: any
}

function EditableBlock({ block, onUpdate, onDelete, disabled = false, dragHandleProps }: EditableBlockProps) {
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

  const getBlockIcon = (type: Block['type']) => {
    switch (type) {
      case 'hero': return <Type size={16} />
      case 'feature-list': return <Zap size={16} />
      case 'form': return <ListChecks size={16} />
      case 'cta': return <MessageSquare size={16} />
      case 'testimonial': return <Users size={16} />
      case 'permissions': return <Shield size={16} />
      case 'profile-setup': return <Settings size={16} />
      default: return <Type size={16} />
    }
  }

  const getBlockLabel = (type: Block['type']) => {
    switch (type) {
      case 'hero': return 'Hero Section'
      case 'feature-list': return 'Feature List'
      case 'form': return 'Form'
      case 'cta': return 'Call to Action'
      case 'testimonial': return 'Testimonial'
      case 'permissions': return 'Permissions'
      case 'profile-setup': return 'Profile Setup'
      default: return 'Block'
    }
  }

  const renderContent = () => {
    switch (block.type) {
      case 'hero':
        return `${content.headline || 'Hero Headline'} | ${content.subheadline || 'Subheadline'}`
      case 'feature-list':
        return `${content.title || 'Features'} (${content.features?.length || 0} items)`
      case 'form':
        return `${content.title || 'Form'} (${content.fields?.length || 0} fields)`
      case 'cta':
        return `${content.headline || 'CTA'}: ${content.button_text || 'Button'}`
      case 'testimonial':
        return `"${content.quote || 'Testimonial'}" - ${content.author || 'Author'}`
      case 'permissions':
        return `${content.title || 'Permissions'} (${content.permissions?.length || 0} items)`
      case 'profile-setup':
        return `${content.title || 'Profile Setup'} (${content.fields?.length || 0} fields)`
      default:
        return JSON.stringify(content, null, 2)
    }
  }

  const renderEditor = () => {
    switch (block.type) {
      case 'hero':
        return <HeroEditor value={content} onChange={setContent} />
      case 'feature-list':
        return <FeatureListEditor value={content} onChange={setContent} />
      case 'form':
        return <FormEditor value={content} onChange={setContent} />
      case 'cta':
        return <CTAEditor value={content} onChange={setContent} />
      case 'testimonial':
        return <TestimonialEditor value={content} onChange={setContent} />
      case 'permissions':
        return <PermissionsEditor value={content} onChange={setContent} />
      case 'profile-setup':
        return <ProfileSetupEditor value={content} onChange={setContent} />
      default:
        return (
          <textarea
            value={JSON.stringify(content, null, 2)}
            onChange={(e) => {
              try {
                setContent(JSON.parse(e.target.value))
              } catch {
                // Invalid JSON, ignore
              }
            }}
            className="w-full p-2 border border-gray-300 rounded-md resize-none font-mono text-sm"
            rows={6}
          />
        )
    }
  }

  return (
    <div className={`border border-gray-200 rounded-lg p-4 bg-white ${disabled ? 'opacity-50' : ''}`}>
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
        
        {!disabled && (
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
        )}
      </div>

      {isEditing && !disabled ? (
        <div className="space-y-3">
          {renderEditor()}
          
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
        <div 
          className={`text-gray-700 ${!disabled ? 'cursor-pointer' : ''}`} 
          onClick={() => !disabled && setIsEditing(true)}
        >
          {renderContent() || 'Click to edit...'}
        </div>
      )}
    </div>
  )
}

// Content editors for each block type
function HeroEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={value.headline || ''}
        onChange={(e) => onChange({ ...value, headline: e.target.value })}
        className="input-field"
        placeholder="Hero headline..."
      />
      <input
        type="text"
        value={value.subheadline || ''}
        onChange={(e) => onChange({ ...value, subheadline: e.target.value })}
        className="input-field"
        placeholder="Hero subheadline..."
      />
      <input
        type="text"
        value={value.cta_text || ''}
        onChange={(e) => onChange({ ...value, cta_text: e.target.value })}
        className="input-field"
        placeholder="CTA button text..."
      />
    </div>
  )
}

function FeatureListEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const features = value.features || []

  const addFeature = () => {
    onChange({
      ...value,
      features: [...features, { title: '', description: '', icon: '' }]
    })
  }

  const updateFeature = (index: number, updates: any) => {
    const newFeatures = [...features]
    newFeatures[index] = { ...newFeatures[index], ...updates }
    onChange({ ...value, features: newFeatures })
  }

  const removeFeature = (index: number) => {
    onChange({
      ...value,
      features: features.filter((_: any, i: number) => i !== index)
    })
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={value.title || ''}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        className="input-field"
        placeholder="Feature list title..."
      />
      
      <div className="space-y-2">
        {features.map((feature: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded p-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={feature.title || ''}
                onChange={(e) => updateFeature(index, { title: e.target.value })}
                className="input-field flex-1"
                placeholder="Feature title..."
              />
              <button
                onClick={() => removeFeature(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <textarea
              value={feature.description || ''}
              onChange={(e) => updateFeature(index, { description: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="Feature description..."
            />
          </div>
        ))}
        
        <button onClick={addFeature} className="btn-secondary text-sm w-full">
          Add Feature
        </button>
      </div>
    </div>
  )
}

function FormEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={value.title || ''}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        className="input-field"
        placeholder="Form title..."
      />
      <p className="text-sm text-gray-600">Form fields will be generated based on the page context.</p>
    </div>
  )
}

function CTAEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={value.headline || ''}
        onChange={(e) => onChange({ ...value, headline: e.target.value })}
        className="input-field"
        placeholder="CTA headline..."
      />
      <textarea
        value={value.description || ''}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        className="input-field"
        rows={2}
        placeholder="CTA description..."
      />
      <input
        type="text"
        value={value.button_text || ''}
        onChange={(e) => onChange({ ...value, button_text: e.target.value })}
        className="input-field"
        placeholder="Button text..."
      />
    </div>
  )
}

function TestimonialEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  return (
    <div className="space-y-3">
      <textarea
        value={value.quote || ''}
        onChange={(e) => onChange({ ...value, quote: e.target.value })}
        className="input-field"
        rows={3}
        placeholder="Testimonial quote..."
      />
      <div className="grid grid-cols-2 gap-2">
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
      </div>
      <input
        type="text"
        value={value.company || ''}
        onChange={(e) => onChange({ ...value, company: e.target.value })}
        className="input-field"
        placeholder="Company"
      />
    </div>
  )
}

function PermissionsEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={value.title || ''}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        className="input-field"
        placeholder="Permissions title..."
      />
      <textarea
        value={value.description || ''}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        className="input-field"
        rows={2}
        placeholder="Permissions description..."
      />
      <p className="text-sm text-gray-600">Permission items will be generated based on your app category.</p>
    </div>
  )
}

function ProfileSetupEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={value.title || ''}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        className="input-field"
        placeholder="Profile setup title..."
      />
      <textarea
        value={value.description || ''}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        className="input-field"
        rows={2}
        placeholder="Profile setup description..."
      />
      <p className="text-sm text-gray-600">Profile fields will be generated based on your app category.</p>
    </div>
  )
}

export function FlowBlockEditor({ blocks, onChange, disabled = false }: FlowBlockEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id && !disabled) {
      const oldIndex = blocks.findIndex(block => block.id === active.id)
      const newIndex = blocks.findIndex(block => block.id === over?.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
          ...block,
          order_index: index
        }))
        
        onChange(reorderedBlocks)
      }
    }

    setActiveId(null)
  }

  const handleBlockUpdate = (blockId: string, updates: Partial<Block>) => {
    onChange(blocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ))
  }

  const handleDeleteBlock = (blockId: string) => {
    if (!disabled) {
      onChange(blocks.filter(block => block.id !== blockId))
    }
  }

  const handleAddBlock = (type: Block['type']) => {
    if (!disabled) {
      const newBlock: Block = {
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        content: {},
        order_index: blocks.length
      }
      onChange([...blocks, newBlock])
      setShowAddMenu(false)
    }
  }

  const blockTypes: Array<{ type: Block['type']; label: string; icon: any }> = [
    { type: 'hero', label: 'Hero Section', icon: Type },
    { type: 'feature-list', label: 'Feature List', icon: Zap },
    { type: 'form', label: 'Form', icon: ListChecks },
    { type: 'cta', label: 'Call to Action', icon: MessageSquare },
    { type: 'testimonial', label: 'Testimonial', icon: Users },
    { type: 'permissions', label: 'Permissions', icon: Shield },
    { type: 'profile-setup', label: 'Profile Setup', icon: Settings }
  ]

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks.map(block => block.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                onUpdate={(updates) => handleBlockUpdate(block.id, updates)}
                onDelete={() => handleDeleteBlock(block.id)}
                disabled={disabled}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="opacity-90">
              <EditableBlock
                block={blocks.find(b => b.id === activeId)!}
                onUpdate={() => {}}
                onDelete={() => {}}
                disabled={true}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {blocks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Type size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No content blocks yet. {disabled ? 'Content will be generated automatically.' : 'Add your first block below!'}</p>
        </div>
      )}

      {!disabled && (
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="btn-secondary flex items-center gap-2 w-full justify-center"
          >
            <Plus size={16} />
            Add Block
          </button>

          {showAddMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-2">
                {blockTypes.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => handleAddBlock(type)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Icon size={16} className="text-gray-400" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 